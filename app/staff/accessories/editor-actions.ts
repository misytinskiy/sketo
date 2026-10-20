"use server";

import { sql } from "drizzle-orm";
import sharp from "sharp";
import { revalidatePath, updateTag } from "next/cache";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { auditLogs } from "@/lib/db/schema";
import { requireStaff } from "@/lib/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchesImageSignature, validateImageFile } from "@/lib/supabase/media-validation";
import { isVisibleAccessoryImage, parseAccessoryInput, type SaveResult } from "./editor-model";
import { getAccessoryEditor } from "./editor-data";

// Save media independently; unsaved product copy/prices must not be published by an upload.
export async function saveAccessoryMedia(_previous: SaveResult, form: FormData): Promise<SaveResult> {
  await requireStaff();
  try {
    const requested = JSON.parse(String(form.get('product') ?? ''));
    if (typeof requested.id !== 'string') throw new Error('Товар не найден.');
    const current = await getAccessoryEditor(requested.id);
    if (!current || current.version !== requested.version) throw new Error('Карточка уже изменена. Обновите страницу перед загрузкой.');
    form.set('product', JSON.stringify({ ...current, version: requested.version, images: requested.images }));
    return await saveAccessory(_previous, form);
  } catch (error) {
    return { status: 'error', message: error instanceof SyntaxError ? 'Не удалось прочитать данные фотографий.' : (error as Error).message };
  }
}

export async function saveAccessory(_previous: SaveResult, form: FormData): Promise<SaveResult> {
  const actor = await requireStaff();
  let input: ReturnType<typeof parseAccessoryInput>;
  try { input = parseAccessoryInput(String(form.get("product") ?? "")); }
  catch (error) { return { status: "error", message: error instanceof SyntaxError ? "Проверьте характеристики: некорректный JSON." : (error as Error).message }; }
  const uploaded: { id: string; url: string; path: string; variantId: string | null; volumeId: string | null }[] = [];
  let committed = false;
  try {
    const files = [...form.getAll("photos"), ...form.getAll("photo")].filter((file): file is File => file instanceof File && file.size > 0);
    const primaryRaw = form.get('primaryPhoto');
    const primaryIndex = primaryRaw === null ? -1 : Number(primaryRaw);
    if (!Number.isInteger(primaryIndex) || primaryIndex < -1 || primaryIndex >= files.length) return { status: 'error', message: 'Выберите главное фото заново.' };
    if (files.length > 10 || input.images.length + files.length > 100) return { status: 'error', message: 'До 10 новых фото за сохранение, максимум 100 фото в карточке.' };
    if (files.reduce((sum, file) => sum + file.size, 0) > 5 * 1024 * 1024) return { status: 'error', message: 'Общий размер новых фотографий — до 5 МБ за сохранение.' };
    for (const [index, file] of files.entries()) {
      const invalid = validateImageFile(file);
      if (invalid) return { status: "error", message: invalid };
      const variantId = String(form.get(`photoVariant:${index}`) ?? form.get("photoVariant") ?? "") || null;
      if (variantId && !input.variants.some(v => v.id === variantId)) return { status: 'error', message: 'Выберите цвет для фотографии.' };
      const volumeId = String(form.get(`photoVolume:${index}`) ?? '') || null;
      if (volumeId && !input.volumes.some(v => v.id === volumeId)) return { status: 'error', message: 'Выберите объём для фотографии.' };
    }
    for (const [index, file] of files.entries()) {
      const variantId = String(form.get(`photoVariant:${index}`) ?? form.get("photoVariant") ?? "") || null;
      if (variantId && !input.variants.some((v) => v.id === variantId)) return { status: "error", message: "Выберите цвет для фотографии." };
      const current = await getAccessoryEditor(input.id);
      if (!current || current.version !== input.version) return { status: "error", message: "Карточка уже изменена. Скопируйте несохранённый текст и обновите страницу." };
      const bytes = Buffer.from(await file.arrayBuffer());
      if (!matchesImageSignature(bytes, file.type)) return { status: "error", message: "Содержимое файла не соответствует изображению." };
      const buffer = await sharp(bytes, { limitInputPixels: 25_000_000, failOn: "warning" }).rotate().webp({ quality: 85 }).toBuffer();
      const imageId = crypto.randomUUID();
      const path = `accessories/${input.id}/${imageId}.webp`;
      const storage = createAdminClient().storage.from("catalog");
      // Record the upload before Storage so a failed/ambiguous request remains traceable.
      // This is not a legacy coffee cleanup job: that worker does not own accessory media.
      await withBoundedDatabase("accessory-write", async db => {
        await db.insert(auditLogs).values({ entityType: "media", entityId: imageId, actorId: actor.id, action: "upload",
          summary: "Загрузка фотографии аксессуара", diff: { catalog: "accessories", productId: input.id, bucket: "catalog", path, uploadStarted: true } });
      });
      const { error } = await storage.upload(path, buffer, { contentType: "image/webp", upsert: false });
      if (error) throw new Error("Не удалось загрузить фото. Попробуйте ещё раз.");
      uploaded.push({ id: imageId, path, variantId, volumeId: String(form.get(`photoVolume:${index}`) ?? '') || null, url: storage.getPublicUrl(path).data.publicUrl });
    }
    await withBoundedDatabase("accessory-write", async (tx) => {
      const [member] = await tx.execute(sql`SELECT id FROM staff_members WHERE id=${actor.id}::uuid AND is_active AND role IN ('admin','editor') FOR SHARE`);
      if (!member) throw new Error("Доступ сотрудника отозван.");
      const [previous] = await tx.execute(sql`SELECT *,updated_at::text AS version FROM accessory_products WHERE id=${input.id}::uuid FOR UPDATE`);
      if (!previous) throw new Error("Товар не найден.");
      if (previous.version !== input.version) throw new Error("Карточку изменил другой сотрудник. Скопируйте несохранённый текст и обновите страницу.");
      const oldVariants = await tx.execute(sql`SELECT * FROM accessory_variants WHERE product_id=${input.id}::uuid FOR UPDATE`);
      const oldImages = await tx.execute(sql`SELECT * FROM accessory_images WHERE product_id=${input.id}::uuid FOR UPDATE`);
      const oldTranslations = await tx.execute(sql`SELECT * FROM accessory_translations WHERE product_id=${input.id}::uuid`);
      const removed = oldVariants.filter(v => !input.variants.some(next => next.id === v.id));
      if (removed.some(v => !input.deletedVariantIds.includes(String(v.id)))) throw new Error('Цвет нельзя удалить без подтверждения.');
      if (input.deletedVariantIds.some(id => !removed.some(v => v.id === id))) throw new Error('Удаляемый цвет не принадлежит этой карточке.');
      const removedImportRows = removed.length ? await tx.execute(sql`SELECT * FROM accessory_import_rows WHERE variant_id IN (${sql.join(removed.map(v => sql`${v.id}::uuid`), sql`, `)})`) : [];
      if (input.images.some((i) => !oldImages.some((old) => old.id === i.id))) throw new Error("Изображение не принадлежит этой карточке.");
      for (const photo of input.images) {
        const old = oldImages.find(i => i.id === photo.id);
        if (photo.variantId === null && removed.some(v => v.id === old?.variant_id)) photo.approved = false;
        if (!photo.volumeId && old?.volume_id && !input.volumes.some(v => v.id === old.volume_id)) photo.approved = false;
      }
      const ru = input.translations.find((t) => t.locale === "ru")!;
      if (input.state === "published") {
        const active = input.variants.filter((v) => v.active);
        const missing: string[] = [];
        if (!ru.description) missing.push("заполните описание на русском языке");
        if (!active.length) missing.push("включите хотя бы один вариант");
        if (missing.length) throw new Error(`Для публикации: ${missing.join("; ")}.`);
        const visibleImage = input.images.some(i => isVisibleAccessoryImage(i, input.variants, input.volumes));
        const visibleUpload = uploaded.some(i => isVisibleAccessoryImage({ ...i, approved: true }, input.variants, input.volumes));
        if (!visibleImage && !visibleUpload) throw new Error("Для публикации добавьте видимую фотографию для активного цвета в наличии или общую для всех цветов.");
      }
      for (const [order, v] of input.variants.entries()) {
        if (oldVariants.some((old) => old.id === v.id)) {
          await tx.execute(sql`UPDATE accessory_variants SET sku=${v.sku},color_code=${v.code},color_label=${v.color},color_hex=${v.hex},
            volume_ml=${v.volumeMl}::numeric,retail_price=${v.price}::numeric,currency=${v.currency},availability=${v.availability},is_active=${v.active},sort_order=${order}
            WHERE id=${v.id}::uuid AND product_id=${input.id}::uuid`);
        } else {
          await tx.execute(sql`INSERT INTO accessory_variants(id,product_id,sku,color_code,color_label,color_hex,volume_ml,retail_price,currency,availability,is_active,sort_order)
            VALUES(${v.id}::uuid,${input.id}::uuid,${v.sku},${v.code},${v.color},${v.hex},${v.volumeMl}::numeric,${v.price}::numeric,${v.currency},${v.availability},${v.active},${order})`);
        }
      }
      for (const t of input.translations) {
        await tx.execute(sql`INSERT INTO accessory_translations(product_id,locale,name,description) VALUES(${input.id}::uuid,${t.locale}::locale,${t.name},${t.description})
          ON CONFLICT(product_id,locale) DO UPDATE SET name=excluded.name,description=excluded.description`);
      }
      for (const old of oldImages) {
        if (!input.images.some((i) => i.id === old.id)) await tx.execute(sql`DELETE FROM accessory_images WHERE id=${old.id}::uuid AND product_id=${input.id}::uuid`);
      }
      for (const [order, i] of input.images.entries()) {
        await tx.execute(sql`UPDATE accessory_images SET variant_id=${i.variantId}::uuid,volume_id=${i.volumeId}::uuid,alt=${i.alt},is_approved=${i.approved},sort_order=${order + (primaryIndex >= 0 ? 1 : 0)} WHERE id=${i.id}::uuid AND product_id=${input.id}::uuid`);
      }
      for (const [index, photo] of uploaded.entries()) await tx.execute(sql`INSERT INTO accessory_images(id,product_id,variant_id,volume_id,url,alt,is_approved,sort_order)
        VALUES(${photo.id}::uuid,${input.id}::uuid,${photo.variantId}::uuid,${photo.volumeId}::uuid,${photo.url},${ru.name},true,${index === primaryIndex ? 0 : input.images.length + index + (primaryIndex >= 0 ? 1 : 0)})`);
      // Images have already been detached/reassigned above: do not let ON DELETE CASCADE remove them.
      for (const v of removed) await tx.execute(sql`DELETE FROM accessory_variants WHERE id=${v.id}::uuid AND product_id=${input.id}::uuid`);
      await tx.execute(sql`UPDATE accessory_products SET volume_options=${JSON.stringify(input.volumes)}::jsonb,slug=${input.slug},name=${ru.name},brand=${input.brand},category=${input.category},attributes=${JSON.stringify(input.attributes)}::jsonb,
        editorial_state=${input.state}::editorial_state,sort_order=${input.sortOrder},updated_at=clock_timestamp() WHERE id=${input.id}::uuid`);
      await tx.insert(auditLogs).values({ entityType: "product", entityId: input.id, actorId: actor.id, action: "update", summary: `Сохранён аксессуар ${ru.name}`,
        diff: { catalog: "accessories", before: { product: previous, variants: Array.from(oldVariants), images: Array.from(oldImages), translations: Array.from(oldTranslations), removedImportRows: Array.from(removedImportRows) }, after: input, uploaded } });
    });
    committed = true;
    updateTag('accessories-catalog');
    revalidatePath("/staff");
    revalidatePath("/accessories");
    revalidatePath("/accessories/[slug]", "page");
    revalidatePath(`/staff/accessories/edit/${input.id}`);
    const product = await getAccessoryEditor(input.id);
    return { status: "success", message: "Изменения сохранены.", product: product ?? undefined };
  } catch (error) {
    // Never delete a file on ambiguous commit/network failure: it may be referenced.
    // Detached images are retained in Storage and recorded in the audit snapshot.
    if (committed) return { status: "success", message: "Сохранено. Обновите страницу, чтобы увидеть актуальную карточку." };
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === "23505") return { status: "error", message: "Адрес, артикул или код цвета уже занят. Проверьте повторяющиеся значения." };
    if (code === "42703") return { status: "error", message: "Обновите структуру базы: выполните миграции аксессуаров, включая 20261016010000_accessory_image_volume.sql, затем повторите сохранение." };
    const message = error instanceof Error && !code && !error.message.startsWith("Failed query:") ? error.message : "Не удалось сохранить. Проверьте соединение и обновите карточку перед повторной попыткой.";
    return { status: "error", message };
  }
}
