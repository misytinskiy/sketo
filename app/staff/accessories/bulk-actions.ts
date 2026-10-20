"use server";

import { sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { requireStaff } from "@/lib/staff-auth";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { auditLogs } from "@/lib/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidPattern } from "./editor-model";

type AccessoryEntry = { id: string; version: string };

function validateEntries(entries: AccessoryEntry[]) {
  if (!Array.isArray(entries) || !entries.length || entries.length > 500 ||
    entries.some(e => !e || typeof e.id !== 'string' || !uuidPattern.test(e.id) || typeof e.version !== 'string' || e.version.length > 100) ||
    new Set(entries.map(e => e.id)).size !== entries.length) throw new Error('Некорректный список товаров.');
}

function accessoryStoragePath(url: unknown, productId: string) {
  if (typeof url !== 'string' || !url.startsWith('https://')) return null;
  try {
    const marker = '/storage/v1/object/public/catalog/';
    const pathname = new URL(url).pathname;
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    const path = decodeURIComponent(pathname.slice(index + marker.length));
    return path.startsWith(`accessories/${productId}/`) ? path : null;
  } catch { return null; }
}

export async function changeAccessoryStates(entries: AccessoryEntry[], restore: boolean) {
  const actor = await requireStaff();
  validateEntries(entries);
  if (typeof restore !== 'boolean') throw new Error('Некорректное действие.');
  await withBoundedDatabase('accessory-write', async tx => {
    const [member] = await tx.execute(sql`SELECT id FROM staff_members WHERE id=${actor.id}::uuid AND is_active AND role IN ('admin','editor') FOR SHARE`);
    if (!member) throw new Error('Доступ сотрудника отозван.');
    const rows = await tx.execute(sql`SELECT id,name,editorial_state,updated_at::text AS version FROM accessory_products
      WHERE id IN (${sql.join(entries.map(e => sql`${e.id}::uuid`), sql`, `)}) ORDER BY id FOR UPDATE`);
    if (rows.length !== entries.length || rows.some(row => row.version !== entries.find(e => e.id === row.id)?.version ||
      (restore ? row.editorial_state !== 'archived' : row.editorial_state === 'archived'))) {
      throw new Error('Карточки уже изменились. Обновите список и повторите действие.');
    }
    const next = restore ? 'draft' : 'archived';
    await tx.execute(sql`UPDATE accessory_products SET editorial_state=${next}::editorial_state,updated_at=clock_timestamp()
      WHERE id IN (${sql.join(entries.map(e => sql`${e.id}::uuid`), sql`, `)})`);
    await tx.insert(auditLogs).values(rows.map(row => ({ entityType: 'product' as const, entityId: String(row.id), actorId: actor.id,
      action: 'update' as const, summary: `${restore ? 'Восстановлен' : 'Архивирован'} аксессуар ${row.name}`,
      diff: { catalog: 'accessories', before: row.editorial_state, after: next } })));
  });
  updateTag('accessories-catalog');
  revalidatePath('/staff');
  revalidatePath('/accessories');
  revalidatePath('/accessories/[slug]', 'page');
  revalidatePath('/staff/accessories/edit/[id]', 'page');
  return { status: 'success' as const, message: restore ? 'Товары восстановлены в черновики.' : 'Товары перемещены в архив.' };
}

export async function permanentlyDeleteAccessories(entries: AccessoryEntry[]) {
  const actor = await requireStaff();
  validateEntries(entries);
  const imageRows: { productId: string; url: string }[] = [];
  await withBoundedDatabase('accessory-write', async tx => {
    const [member] = await tx.execute(sql`SELECT id FROM staff_members WHERE id=${actor.id}::uuid AND is_active AND role IN ('admin','editor') FOR SHARE`);
    if (!member) throw new Error('Доступ сотрудника отозван.');
    const rows = await tx.execute(sql`SELECT id,name,slug,editorial_state,updated_at::text AS version FROM accessory_products
      WHERE id IN (${sql.join(entries.map(e => sql`${e.id}::uuid`), sql`, `)}) ORDER BY id FOR UPDATE`);
    if (rows.length !== entries.length || rows.some(row => row.editorial_state !== 'archived' || row.version !== entries.find(e => e.id === row.id)?.version)) {
      throw new Error('Карточки уже изменились или не находятся в архиве. Обновите список и повторите действие.');
    }
    const images = await tx.execute(sql`SELECT product_id,url FROM accessory_images
      WHERE product_id IN (${sql.join(entries.map(e => sql`${e.id}::uuid`), sql`, `)})`);
    imageRows.push(...images.map(row => ({ productId: String(row.product_id), url: String(row.url) })));
    await tx.execute(sql`DELETE FROM accessory_products WHERE id IN (${sql.join(entries.map(e => sql`${e.id}::uuid`), sql`, `)})`);
    await tx.insert(auditLogs).values(rows.map(row => ({ entityType: 'product' as const, entityId: String(row.id), actorId: actor.id,
      action: 'delete' as const, summary: `Аксессуар ${row.name} удалён навсегда`,
      diff: { catalog: 'accessories', id: row.id, slug: row.slug, name: row.name } })));
  });

  const paths = [...new Set(imageRows.map(row => accessoryStoragePath(row.url, row.productId)).filter((path): path is string => Boolean(path)))];
  let storageCleanupFailed = false;
  try {
    const storage = createAdminClient().storage.from('catalog');
    for (let index = 0; index < paths.length; index += 100) {
      const { error } = await storage.remove(paths.slice(index, index + 100));
      if (error) storageCleanupFailed = true;
    }
  } catch { storageCleanupFailed = paths.length > 0; }

  updateTag('accessories-catalog');
  revalidatePath('/staff');
  revalidatePath('/accessories');
  revalidatePath('/accessories/[slug]', 'page');
  revalidatePath('/staff/accessories/edit/[id]', 'page');
  return {
    status: 'success' as const,
    message: storageCleanupFailed
      ? 'Товары удалены навсегда. Часть файлов не удалось удалить из хранилища.'
      : `Удалено навсегда: ${entries.length}.`,
  };
}
