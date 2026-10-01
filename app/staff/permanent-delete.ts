"use server";

import { requireStaff } from "@/lib/staff-auth";

import { and, eq } from "drizzle-orm";
import { updateTag, revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, productImages, productTranslations, productMedia, mediaAssets } from "@/lib/db/schema";
import { appendAuditLog } from "@/lib/db/editor";
import { queueMediaCleanup, processMediaCleanup } from "@/lib/supabase/media-cleanup";
import { getStorageBucketName, normalizeStorageObjectPath } from "@/lib/supabase/storage-public";

export async function permanentlyDeleteProduct(data: FormData) {
  await requireStaff();
  const kind = data.get("kind");
  const slug = data.get("slug");
  if ((kind !== "coffee" && kind !== "equipment") || typeof slug !== "string" || !slug) {
    return { status: "error" as const, message: "Некорректный товар." };
  }
  let jobs: string[];
  try {
    jobs = await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(and(eq(products.type, kind), eq(products.slug, slug))).for("update");
      if (!product || product.editorialState !== "archived" || product.isPublished || data.get("version") !== product.updatedAt.toISOString()) {
        throw new Error("Товар изменился или уже удалён. Обновите корзину перед повторной попыткой.");
      }
      const translation = await tx.query.productTranslations.findFirst({ where: and(eq(productTranslations.productId, product.id), eq(productTranslations.locale, "ru")) });
      const name = translation?.name?.trim() || product.name?.trim() || (kind === "coffee" ? "Новый кофе" : "Новое оборудование");
      const images = await tx.select().from(productImages).where(eq(productImages.productId, product.id));
      const assets = await tx.select({ path: mediaAssets.path, bucket: mediaAssets.bucket }).from(productMedia)
        .innerJoin(mediaAssets, eq(productMedia.mediaAssetId, mediaAssets.id)).where(eq(productMedia.productId, product.id));
      const paths = new Map<string, { kind: "coffee" | "equipment"; path: string }>();
      for (const url of [product.imageUrl, ...images.map((image) => image.url)]) {
        if (!url || /^(data:|blob:)/i.test(url)) continue;
        let path = normalizeStorageObjectPath(kind, url);
        if (/^https?:/i.test(url)) {
          const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
          const prefix = `${base}/storage/v1/object/public/${getStorageBucketName(kind)}/`;
          if (!base || !url.startsWith(prefix)) continue;
          path = decodeURIComponent(url.slice(prefix.length));
        }
        if (path) paths.set(`${kind}:${path}`, { kind, path });
      }
      for (const asset of assets) {
        const assetKind = asset.bucket === "catalog" ? "coffee" : asset.bucket === "equipment" ? "equipment" : null;
        if (assetKind) paths.set(`${assetKind}:${asset.path}`, { kind: assetKind, path: asset.path });
      }
      const cleanupIds = [];
      for (const entry of paths.values()) cleanupIds.push((await queueMediaCleanup(entry.kind, entry.path, tx)).id);
      // Foreign-key cascades remove translations, details, images, links and revisions.
      await tx.delete(products).where(eq(products.id, product.id));
      await appendAuditLog({ entityType: "product", entityId: product.id, action: "delete", summary: `Товар ${slug} удалён навсегда`, diff: { kind, slug, name } }, tx);
      return cleanupIds;
    });
  } catch (error) {
    console.error("Permanent product deletion failed", error);
    return { status: "error" as const, message: "Не удалось удалить товар. Обновите корзину: товар мог измениться." };
  }
  let pending = 0;
  try {
    // The worker processes at most 20 jobs per call.
    for (let offset = 0; offset < jobs.length; offset += 20) pending += await processMediaCleanup(jobs.slice(offset, offset + 20));
  } catch { pending = 1; }
  updateTag("staff-products");
  updateTag(kind === "coffee" ? "coffee-catalog" : "equipment-catalog");
  revalidatePath("/staff", "page");
  revalidatePath(`/staff/edit/${kind}/${slug}`, "page");
  revalidatePath(kind === "coffee" ? `/catalog/${slug}` : `/equipment/${slug}`, "page");
  return { status: "success" as const, message: pending ? "Товар удалён навсегда. Очистка оставшихся файлов поставлена в очередь." : "Товар удалён навсегда." };
}
