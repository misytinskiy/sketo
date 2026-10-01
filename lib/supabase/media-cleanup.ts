import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, mediaAssets, productImages, productMedia, products, type ProductType } from "@/lib/db/schema";
import { appendAuditLog, type EditorTransaction } from "@/lib/db/editor";
import { createAdminClient } from "./admin";
import { getStorageBucketName, resolveCoffeeStorageUrl, resolveEquipmentStorageUrl } from "./storage-public";

const pendingCleanup = and(
  eq(auditLogs.entityType, "media"),
  sql`${auditLogs.diff}->>'cleanupPending' = 'true'`,
);
const readyForCleanup = sql`(${auditLogs.diff}->>'cleanupFailed' = 'true' or ${auditLogs.createdAt} < now() - interval '15 minutes')`;

// Count files rather than jobs: a file can have more than one queued attempt.
export async function getPendingMediaCleanupCount() {
  const [row] = await db.select({ count: sql<number>`count(distinct (${auditLogs.diff}->>'kind', ${auditLogs.diff}->>'path'))::int` })
    .from(auditLogs).where(and(pendingCleanup, readyForCleanup));
  return Number(row?.count ?? 0);
}

// Durable outbox stored in the existing audit table; no schema migration is required.
export async function queueMediaCleanup(kind: ProductType, path: string, tx: typeof db | EditorTransaction = db) {
  return appendAuditLog({ entityType: "media", entityId: crypto.randomUUID(), action: "delete",
    summary: "Очистка файла Storage", diff: { cleanupPending: true, kind, path },
  }, tx);
}

export async function processMediaCleanup(ids?: string[]) {
  const jobs = await db.select().from(auditLogs).where(and(
    pendingCleanup,
    ids ? inArray(auditLogs.id, ids) : readyForCleanup,
  )).limit(20);
  let pending = 0;
  for (const job of jobs) {
    try {
      const { kind, path } = job.diff as { kind: ProductType; path: string };
      if ((kind !== "coffee" && kind !== "equipment") || !path) continue;
      const bucket = getStorageBucketName(kind);
      const url = kind === "coffee" ? resolveCoffeeStorageUrl(path) : resolveEquipmentStorageUrl(path);
      const legacy = `${kind === "coffee" ? "/photo/catalog/" : "/photo/techCatalog/"}${path}`;
      const aliases = [path, url, legacy, legacy.slice(1)];
      const [images, heroes, links] = await Promise.all([
        db.select({ id: productImages.id }).from(productImages).where(inArray(productImages.url, aliases)).limit(1),
        db.select({ id: products.id }).from(products).where(inArray(products.imageUrl, aliases)).limit(1),
        db.select({ id: productMedia.id }).from(productMedia).innerJoin(mediaAssets, eq(productMedia.mediaAssetId, mediaAssets.id))
          .where(and(eq(mediaAssets.bucket, bucket), eq(mediaAssets.path, path))).limit(1),
      ]);
      if (images.length || heroes.length || links.length) {
        // A committed upload or a shared image must never be removed.
        await db.update(auditLogs).set({ diff: { kind, path, cleanupPending: false, retained: true } }).where(eq(auditLogs.id, job.id));
        continue;
      }
      const admin = createAdminClient();
      let removed = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await admin.storage.from(bucket).remove([path]);
        if (!error) { removed = true; break; }
      }
      if (!removed) {
        pending++;
        await db.update(auditLogs).set({ diff: { kind, path, cleanupPending: true, cleanupFailed: true } }).where(eq(auditLogs.id, job.id));
        continue;
      }
      await db.transaction(async (tx) => {
        await tx.delete(mediaAssets).where(and(eq(mediaAssets.bucket, bucket), eq(mediaAssets.path, path)));
        await tx.update(auditLogs).set({ diff: { kind, path, cleanupPending: false } }).where(eq(auditLogs.id, job.id));
      });
    } catch (error) {
      pending++;
      console.error("Storage cleanup deferred", job.id, error);
      try {
        await db.update(auditLogs).set({ diff: { ...(job.diff as Record<string, unknown>), cleanupFailed: true } }).where(eq(auditLogs.id, job.id));
      } catch { /* Keep the queued job if the database is also unavailable. */ }
    }
  }
  return pending;
}
