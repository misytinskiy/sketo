"use server";

import { Buffer } from "node:buffer";
import sharp from "sharp";
import { validateProductFields } from "@/lib/product-form";
import { validateImageFile, matchesImageSignature } from "@/lib/supabase/media-validation";
import { queueMediaCleanup, processMediaCleanup } from "@/lib/supabase/media-cleanup";
import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { appendAuditLog, createProductRevisionSnapshot, type EditorTransaction } from "@/lib/db/editor";
import {
  mediaAssets,
  productDetails,
  productFeatures,
  productImages,
  productMedia,
  products,
  productTranslations,
  type EquipmentBrand,
  type EquipmentType,
  type ProductStatus,
  type ProductType,
} from "@/lib/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStorageBucketName,
  normalizeStorageObjectPath,
  resolveCoffeeStorageUrl,
  resolveEquipmentStorageUrl,
} from "@/lib/supabase/storage-public";
import type { EditorActionState } from "./action-state";

class ProductConflictError extends Error {}

type EditorIntent = "save_draft" | "publish" | "archive" | "delete" | "restore" | "unpublish";

type DetailInput = {
  label: string;
  value: string;
};

type FeatureInput = {
  title: string;
  description: string;
};

type TranslationInput = {
  name: string;
  description: string;
  size?: string;
  notes?: string;
  category?: string;
  statusLabel?: string;
};

function asNonEmptyString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePrice(priceDisplay: string) {
  const match = priceDisplay.match(/^([A-Z]{3})\s*([\d,]+)/);

  if (!match) {
    return {
      priceDisplay,
      priceAmount: null,
      priceCurrency: "KZT",
    };
  }

  return {
    priceDisplay,
    priceAmount: Number.parseInt(match[2].replace(/,/g, ""), 10),
    priceCurrency: match[1],
  };
}

function parseParallelDetails(
  labels: FormDataEntryValue[],
  values: FormDataEntryValue[],
): DetailInput[] {
  return labels
    .map((label, index) => ({
      label: typeof label === "string" ? label.trim() : "",
      value: typeof values[index] === "string" ? values[index].trim() : "",
    }))
    .filter((item) => item.label && item.value);
}

function parseParallelFeatures(
  titles: FormDataEntryValue[],
  descriptions: FormDataEntryValue[],
): FeatureInput[] {
  return titles
    .map((title, index) => ({
      title: typeof title === "string" ? title.trim() : "",
      description:
        typeof descriptions[index] === "string" ? descriptions[index].trim() : "",
    }))
    .filter((item) => item.title && item.description);
}

function buildPublicImageUrl(type: ProductType, path: string) {
  return type === "coffee"
    ? resolveCoffeeStorageUrl(path)
    : resolveEquipmentStorageUrl(path);
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildStoragePath(type: ProductType, slug: string, fileName: string) {
  const safeName = sanitizeFileName(fileName || "image");
  const stamp = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  return `${type}/${slug}/${stamp}-${safeName}`;
}

function isInlineImage(path: string) {
  return /^data:/i.test(path);
}

async function saveTranslation(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  productId: string,
  locale: "ru" | "en",
  values: TranslationInput,
) {
  const existing = await tx.query.productTranslations.findFirst({
    where: and(
      eq(productTranslations.productId, productId),
      eq(productTranslations.locale, locale),
    ),
  });

  if (existing) {
    await tx
      .update(productTranslations)
      .set(values)
      .where(eq(productTranslations.id, existing.id));

    return;
  }

  await tx.insert(productTranslations).values({
    productId,
    locale,
    ...values,
  });
}

async function replaceDetailsForLocale(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  productId: string,
  locale: "ru" | "en",
  kind: "detail" | "specification",
  details: DetailInput[],
) {
  await tx
    .delete(productDetails)
    .where(
      and(
        eq(productDetails.productId, productId),
        eq(productDetails.locale, locale),
        eq(productDetails.kind, kind),
      ),
    );

  if (details.length === 0) {
    return;
  }

  await tx.insert(productDetails).values(
    details.map((detail, index) => ({
      productId,
      locale,
      kind,
      label: detail.label,
      value: detail.value,
      sortOrder: index,
    })),
  );
}

async function replaceFeaturesForLocale(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  productId: string,
  locale: "ru" | "en",
  features: FeatureInput[],
) {
  await tx
    .delete(productFeatures)
    .where(
      and(
        eq(productFeatures.productId, productId),
        eq(productFeatures.locale, locale),
      ),
    );

  if (features.length === 0) {
    return;
  }

  await tx.insert(productFeatures).values(
    features.map((feature, index) => ({
      productId,
      locale,
      title: feature.title,
      description: feature.description,
      sortOrder: index,
    })),
  );
}

function getStatusLabel(status: ProductStatus, locale: "ru" | "en") {
  const labels = {
    ru: {
      in_stock: "В наличии",
      out_of_stock: "Нет в наличии",
      preorder: "Под заказ",
    },
    en: {
      in_stock: "In stock",
      out_of_stock: "Out of stock",
      preorder: "On request",
    },
  } as const;

  return labels[locale][status];
}

function getRedirectPath(kind: ProductType, slug: string) {
  return `/staff/edit/${kind}/${slug}`;
}

function revalidateProduct(kind: ProductType, slug: string) {
  updateTag("staff-products");
  updateTag(kind === "coffee" ? "coffee-catalog" : "equipment-catalog");
  revalidatePath("/staff", "page");
  revalidatePath(getRedirectPath(kind, slug), "page");
  revalidatePath(kind === "coffee" ? `/catalog/${slug}` : `/equipment/${slug}`, "page");
  revalidatePath(kind === "coffee" ? "/catalog" : "/equipment", "page");
}

export async function retryMediaCleanup(): Promise<EditorActionState> {
  try {
    const pending = await processMediaCleanup();
    return { status: pending ? "error" : "success", message: pending ? "Часть файлов пока не удалось очистить. Повторите позже." : "Проверка очереди очистки завершена. Новые задания доступны через 15 минут." };
  } catch {
    return { status: "error", message: "Очистка недоступна. Повторите позже." };
  }
}

export async function uploadProductMedia(formData: FormData): Promise<EditorActionState> {
  const kind = asNonEmptyString(formData.get("kind")) as ProductType;
  const slug = asNonEmptyString(formData.get("slug"));
  const files = formData.getAll("files");
  if ((kind !== "coffee" && kind !== "equipment") || !slug || files.length !== 1 || !(files[0] instanceof File)) {
    return { status: "error", message: "Передайте одно изображение и корректный товар." };
  }
  const file = files[0];
  const invalid = validateImageFile(file);
  if (invalid) return { status: "error", message: invalid };
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(buffer, file.type)) return { status: "error", message: "Содержимое файла не соответствует формату изображения." };
  try {
    buffer = await sharp(buffer, { limitInputPixels: 25_000_000, failOn: "warning" }).rotate().webp({ quality: 85 }).toBuffer();
  } catch {
    return { status: "error", message: "Изображение повреждено или превышает 25 мегапикселей." };
  }
  const cleanupIds: string[] = [];
  let failureMessage = "Не удалось загрузить изображение. Проверьте соединение и повторите попытку.";
  let committed = false;
  let version: string | undefined;
  try {
    const exists = await db.query.products.findFirst({ where: and(eq(products.type, kind), eq(products.slug, slug)) });
    if (!exists) return { status: "error", message: "Товар не найден." };
    if (formData.get("version") !== exists.updatedAt.toISOString()) return { status: "error", message: "Товар изменён. Сохраните несохранённый текст и перезагрузите страницу." };
    const bucket = getStorageBucketName(kind);
    const path = buildStoragePath(kind, slug, file.name.replace(/\.[^.]+$/, "") + ".webp");
    // Persist compensation before touching Storage, including ambiguous upload failures.
    const job = await queueMediaCleanup(kind, path);
    cleanupIds.push(job.id);
    const { error } = await createAdminClient().storage.from(bucket).upload(path, buffer, { contentType: "image/webp", upsert: false });
    if (error) throw error;
    const uploads = [{ path, publicUrl: buildPublicImageUrl(kind, path), mimeType: "image/webp", sizeBytes: buffer.length }];
    await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(eq(products.id, exists.id)).for("update");
      if (!product) throw new Error("Товар не найден");
      if (formData.get("version") !== product.updatedAt.toISOString()) throw new ProductConflictError("Товар изменён. Сохраните несохранённый текст и перезагрузите страницу.");
      const updatedAt = new Date(Math.max(Date.now(), product.updatedAt.getTime() + 1));
      version = updatedAt.toISOString();
      const existingImages = await tx.select().from(productImages).where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.sortOrder), asc(productImages.id));
      const shouldReplacePlaceholder = existingImages.length === 1 && isInlineImage(existingImages[0].url);
      await createProductRevisionSnapshot({ productId: product.id, note: "Загрузка изображения" }, tx);
      const baseSortOrder = shouldReplacePlaceholder ? 0 : existingImages.length;

      if (shouldReplacePlaceholder) {
        await tx
          .delete(productImages)
          .where(eq(productImages.id, existingImages[0].id));
      }

      const insertedAssets = await tx
        .insert(mediaAssets)
        .values(
          uploads.map((item) => ({
            bucket,
            path: item.path,
            publicUrl: item.publicUrl,
            kind: "image" as const,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
          })),
        )
        .returning();

      await tx.insert(productImages).values(
        uploads.map((item, index) => ({
          productId: product.id,
          url: item.path,
          sortOrder: baseSortOrder + index,
          isPrimary: (shouldReplacePlaceholder || existingImages.length === 0) && index === 0,
        })),
      );

      await tx.insert(productMedia).values(
        insertedAssets.map((asset, index) => ({
          productId: product.id,
          mediaAssetId: asset.id,
          role:
            (shouldReplacePlaceholder || existingImages.length === 0) && index === 0
              ? ("hero" as const)
              : ("gallery" as const),
          sortOrder: baseSortOrder + index,
          isPrimary: (shouldReplacePlaceholder || existingImages.length === 0) && index === 0,
        })),
      );

      {
        const [saved] = await tx
          .update(products)
          .set({
            imageUrl: (shouldReplacePlaceholder || existingImages.length === 0) ? uploads[0].path : product.imageUrl,
            updatedAt,
          })
          .where(eq(products.id, product.id)).returning({ updatedAt: products.updatedAt });
      version = saved.updatedAt.toISOString();
      }
      await appendAuditLog({ entityType: "product", entityId: product.id, action: "upload", summary: `Изображение загружено для ${slug}`, diff: { uploaded: path } }, tx);
    });
    committed = true;
  } catch (error) {
    console.error("Image upload failed", error);
    if (error instanceof ProductConflictError) failureMessage = error.message;
  }
  try { if (cleanupIds.length) await processMediaCleanup(cleanupIds); await processMediaCleanup(); } catch (error) { console.error("Cleanup queued", error); }
  if (!committed) return { status: "error", message: failureMessage };
  revalidateProduct(kind, slug);
  return { status: "success", message: "Изображение загружено.", version };
}

export async function deleteProductMedia(formData: FormData): Promise<EditorActionState> {
  const kind = asNonEmptyString(formData.get("kind")) as ProductType;
  const slug = asNonEmptyString(formData.get("slug"));
  const imageId = asNonEmptyString(formData.get("imageId"));
  if ((kind !== "coffee" && kind !== "equipment") || !slug || !imageId) return { status: "error", message: "Не удалось определить изображение." };
  let cleanupId: string | undefined;
  let version: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(and(eq(products.type, kind), eq(products.slug, slug))).for("update");
      if (!product) throw new Error("Товар не найден.");
      if (formData.get("version") !== product.updatedAt.toISOString()) throw new ProductConflictError("Товар изменён. Сохраните несохранённый текст и перезагрузите страницу.");
      const updatedAt = new Date(Math.max(Date.now(), product.updatedAt.getTime() + 1));
      version = updatedAt.toISOString();
      const images = await tx.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
      const image = images.find((entry) => entry.id === imageId);
      if (!image) throw new Error("Изображение уже удалено. Обновите страницу.");
      if (images.length <= 1) throw new Error("Нельзя удалить последнее изображение товара.");
      await createProductRevisionSnapshot({ productId: product.id, note: "Удаление изображения" }, tx);
      const remaining = images.filter((entry) => entry.id !== imageId);
      const primary = remaining.find((entry) => entry.isPrimary) ?? remaining[0];
      const bucket = getStorageBucketName(kind);
      let path = normalizeStorageObjectPath(kind, image.url);
      if (/^https?:/i.test(image.url)) {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
        const prefix = `${base}/storage/v1/object/public/${bucket}/`;
        path = base && image.url.startsWith(prefix) ? decodeURIComponent(image.url.slice(prefix.length)) : "";
      }
      if (isInlineImage(image.url)) path = "";
      await tx.delete(productImages).where(eq(productImages.id, imageId));
      if (path) {
        const asset = await tx.query.mediaAssets.findFirst({ where: and(eq(mediaAssets.bucket, bucket), eq(mediaAssets.path, path)) });
        if (asset) await tx.delete(productMedia).where(and(eq(productMedia.productId, product.id), eq(productMedia.mediaAssetId, asset.id)));
        cleanupId = (await queueMediaCleanup(kind, path, tx)).id;
      }
      for (const [index, entry] of remaining.entries()) {
        await tx.update(productImages).set({ sortOrder: index, isPrimary: entry.id === primary.id }).where(eq(productImages.id, entry.id));
        const asset = await tx.query.mediaAssets.findFirst({ where: and(eq(mediaAssets.bucket, bucket), eq(mediaAssets.path, normalizeStorageObjectPath(kind, entry.url))) });
        if (asset) await tx.update(productMedia).set({ sortOrder: index, isPrimary: entry.id === primary.id, role: entry.id === primary.id ? "hero" : "gallery" }).where(and(eq(productMedia.productId, product.id), eq(productMedia.mediaAssetId, asset.id)));
      }
      const [saved] = await tx.update(products).set({ imageUrl: primary.url, updatedAt }).where(eq(products.id, product.id)).returning({ updatedAt: products.updatedAt });
      version = saved.updatedAt.toISOString();
      await appendAuditLog({ entityType: "product", entityId: product.id, action: "delete", summary: `Изображение удалено из ${slug}`, diff: { removed: image.url } }, tx);
    });
  } catch (error) {
    console.error("Image deletion failed", error);
    return { status: "error", message: error instanceof ProductConflictError ? error.message : "Не удалось удалить изображение. Обновите страницу и повторите попытку; последнее изображение удалить нельзя." };
  }
  let pending = 0;
  try { if (cleanupId) pending = await processMediaCleanup([cleanupId]); } catch { pending = 1; }
  revalidateProduct(kind, slug);
  return { status: "success", version, message: pending ? "Изображение убрано из товара. Очистка Storage будет повторена из очереди." : "Изображение удалено." };
}

async function submitEditorTransaction(
  formData: FormData,
  tx: EditorTransaction,
): Promise<EditorActionState> {
  const kind = asNonEmptyString(formData.get("kind")) as ProductType;
  const slug = asNonEmptyString(formData.get("slug"));
  const intent = asNonEmptyString(formData.get("intent")) as EditorIntent;

  if ((kind !== "coffee" && kind !== "equipment") || !slug || !["save_draft", "publish", "archive", "delete", "restore", "unpublish"].includes(intent)) {
    return {
      status: "error",
      message: "Не удалось определить товар или действие.",
    };
  }

  const [product] = await tx.select().from(products)
    .where(and(eq(products.type, kind), eq(products.slug, slug))).for("update");

  if (!product) {
    return {
      status: "error",
      message: "Товар не найден.",
    };
  }

  if (formData.get("version") !== product.updatedAt.toISOString()) {
    return { status: "error", message: "Товар изменён в другой вкладке или при обновлении медиа. Скопируйте несохранённый текст и перезагрузите страницу перед повторным сохранением." };
  }

  if (["delete", "archive", "restore", "unpublish"].includes(intent)) {
    const archived = intent === "delete" || intent === "archive";
    await createProductRevisionSnapshot({
      productId: product.id,
      note: archived ? "Перемещение в архив / корзину" : "Возврат в черновик",
    }, tx);
    const updatedAt = new Date(Math.max(Date.now(), product.updatedAt.getTime() + 1));
    const [saved] = await tx.update(products).set({
      editorialState: archived ? "archived" : "draft",
      isPublished: false,
      archivedAt: archived ? new Date() : null,
      updatedAt,
    }).where(eq(products.id, product.id)).returning({ updatedAt: products.updatedAt });
    await appendAuditLog({
      entityType: "product",
      entityId: product.id,
      action: archived ? "archive" : intent === "restore" ? "restore" : "unpublish",
      summary: archived ? `Товар ${slug} перемещён в архив / корзину` : `Товар ${slug} возвращён в черновик`,
    }, tx);
    return { status: "success", version: saved.updatedAt.toISOString(), message: archived ? "Товар в архиве / корзине. Его можно восстановить." : "Товар сохранён как неопубликованный черновик." };
  }

  if (product.editorialState === "archived") {
    return { status: "error", message: "Сначала восстановите товар в черновик." };
  }
  const newSlug = formData.has("newSlug") ? asNonEmptyString(formData.get("newSlug")) : slug;
  const fieldErrors = validateProductFields(formData, kind, intent === "publish" || product.isPublished);
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Проверьте отмеченные поля.", fieldErrors };
  if (newSlug !== slug) {
    const existing = await tx.query.products.findFirst({ where: eq(products.slug, newSlug) });
    if (existing) return { status: "error", message: "Этот адрес уже занят другим товаром.", fieldErrors: { newSlug: "Этот адрес уже занят другим товаром." } };
  }
  const willPublish = intent === "publish" || product.isPublished;
  const status = asNonEmptyString(formData.get("status")) as ProductStatus;
  const priceDisplay = asNonEmptyString(formData.get("price"));
  const titleRu = asNonEmptyString(formData.get("titleRu"));
  const titleEn = asNonEmptyString(formData.get("titleEn"));
  const descriptionRu = asNonEmptyString(formData.get("descriptionRu"));
  const descriptionEn = asNonEmptyString(formData.get("descriptionEn"));

  if (willPublish && (!titleRu || !descriptionRu || !status)) {
    return {
      status: "error",
      message:
        "Заполните обязательные поля русской версии: название, описание и статус.",
    };
  }

  if (status !== "in_stock" && status !== "out_of_stock" && status !== "preorder") {
    return {
      status: "error",
      message: "Передан некорректный статус.",
    };
  }

  const now = new Date(Math.max(Date.now(), product.updatedAt.getTime() + 1));
  const price = parsePrice(priceDisplay);
  let savedVersion: string;

  await createProductRevisionSnapshot({
    productId: product.id,
    note:
      intent === "publish"
        ? "Публикация товара из staff-редактора"
        : willPublish ? "Сохранение опубликованного товара" : "Сохранение черновика из staff-редактора",
  }, tx);

  {
    const [saved] = await tx
      .update(products)
      .set({
        slug: newSlug,
        name: titleRu,
        status,
        priceDisplay: kind === "coffee" ? price.priceDisplay : product.priceDisplay,
        priceAmount: kind === "coffee" ? price.priceAmount : product.priceAmount,
        priceCurrency: kind === "coffee" ? price.priceCurrency : product.priceCurrency,
        imageUrl: product.imageUrl,
        brand:
          kind === "equipment"
            ? (asNonEmptyString(formData.get("brand")) as EquipmentBrand)
            : product.brand,
        equipmentType:
          kind === "equipment"
            ? (asNonEmptyString(formData.get("equipmentType")) as EquipmentType)
            : product.equipmentType,
        editorialState: willPublish ? "published" : "draft",
        isPublished: willPublish,
        publishedAt: intent === "publish" ? now : product.publishedAt,
        archivedAt: null,
        updatedAt: now,
      })
      .where(eq(products.id, product.id)).returning({ updatedAt: products.updatedAt });
    savedVersion = saved.updatedAt.toISOString();

    if (kind === "coffee") {
      const sizeRu = asNonEmptyString(formData.get("sizeRu"));
      const sizeEn = asNonEmptyString(formData.get("sizeEn"));
      const notesRu = asNonEmptyString(formData.get("notesRu"));
      const notesEn = asNonEmptyString(formData.get("notesEn"));
      const detailsRu = parseParallelDetails(
        formData.getAll("coffeeDetailRuLabel"),
        formData.getAll("coffeeDetailRuValue"),
      );
      const detailsEn = parseParallelDetails(
        formData.getAll("coffeeDetailEnLabel"),
        formData.getAll("coffeeDetailEnValue"),
      );

      await saveTranslation(tx, product.id, "ru", {
        name: titleRu,
        size: sizeRu,
        notes: notesRu,
        description: descriptionRu,
      });

      await saveTranslation(tx, product.id, "en", {
        name: titleEn,
        size: sizeEn,
        notes: notesEn,
        description: descriptionEn,
      });

      await replaceDetailsForLocale(tx, product.id, "ru", "detail", detailsRu);
      await replaceDetailsForLocale(tx, product.id, "en", "detail", detailsEn);
    } else {
      const categoryRu = asNonEmptyString(formData.get("categoryRu"));
      const categoryEn = asNonEmptyString(formData.get("categoryEn"));
      const detailsRu = parseParallelDetails(
        formData.getAll("equipmentDetailRuLabel"),
        formData.getAll("equipmentDetailRuValue"),
      );
      const detailsEn = parseParallelDetails(
        formData.getAll("equipmentDetailEnLabel"),
        formData.getAll("equipmentDetailEnValue"),
      );
      const featuresRu = parseParallelFeatures(
        formData.getAll("equipmentFeatureRuTitle"),
        formData.getAll("equipmentFeatureRuDescription"),
      );
      const featuresEn = parseParallelFeatures(
        formData.getAll("equipmentFeatureEnTitle"),
        formData.getAll("equipmentFeatureEnDescription"),
      );
      const specificationsRu = parseParallelDetails(
        formData.getAll("equipmentSpecificationRuLabel"),
        formData.getAll("equipmentSpecificationRuValue"),
      );
      const specificationsEn = parseParallelDetails(
        formData.getAll("equipmentSpecificationEnLabel"),
        formData.getAll("equipmentSpecificationEnValue"),
      );

      await saveTranslation(tx, product.id, "ru", {
        name: titleRu,
        category: categoryRu,
        description: descriptionRu,
        statusLabel: getStatusLabel(status, "ru"),
      });

      await saveTranslation(tx, product.id, "en", {
        name: titleEn,
        category: categoryEn,
        description: descriptionEn,
        statusLabel: getStatusLabel(status, "en"),
      });

      await replaceDetailsForLocale(tx, product.id, "ru", "detail", detailsRu);
      await replaceDetailsForLocale(tx, product.id, "en", "detail", detailsEn);
      await replaceDetailsForLocale(
        tx,
        product.id,
        "ru",
        "specification",
        specificationsRu,
      );
      await replaceDetailsForLocale(
        tx,
        product.id,
        "en",
        "specification",
        specificationsEn,
      );
      await replaceFeaturesForLocale(tx, product.id, "ru", featuresRu);
      await replaceFeaturesForLocale(tx, product.id, "en", featuresEn);
    }
  }

  await appendAuditLog({
    entityType: "product",
    entityId: product.id,
    action: intent === "publish" ? "publish" : "update",
    summary:
      intent === "publish"
        ? `Товар ${product.slug} опубликован`
        : `Товар ${product.slug} сохранён${willPublish ? " и остаётся опубликованным" : " как черновик"}`,
    diff: {
      status,
      editorialState: willPublish ? "published" : "draft",
      imageUrl: product.imageUrl,
    },
  }, tx);


  return {
    status: "success",
    version: savedVersion,
    href: newSlug !== slug ? getRedirectPath(kind, newSlug) : undefined,
    message:
      willPublish
        ? "Изменения сохранены и опубликованы."
        : "Изменения сохранены в черновик.",
  };
}

export async function submitEditorForm(
  _prevState: EditorActionState,
  formData: FormData,
): Promise<EditorActionState> {
  let result: EditorActionState;
  try {
    result = await db.transaction((tx) => submitEditorTransaction(formData, tx));
  } catch (error) {
    console.error("Staff save failed", error);
    const cause = error as { code?: string; cause?: { code?: string } };
    if (cause.code === "23505" || cause.cause?.code === "23505") return { status: "error", message: "Этот адрес уже занят другим товаром.", fieldErrors: { newSlug: "Этот адрес уже занят другим товаром." } };
    return { status: "error", message: "Не удалось сохранить товар. Проверьте соединение и повторите попытку." };
  }
  if (result.status === "success") {
    revalidateProduct(formData.get("kind") as ProductType, String(formData.get("slug")));
    if (result.href) revalidateProduct(formData.get("kind") as ProductType, String(formData.get("newSlug")).trim());
    if (formData.get("intent") === "delete") result.href = "/staff";
  }
  return result;
}

export async function updateProductMediaOrder(formData: FormData): Promise<EditorActionState> {
  const kind = asNonEmptyString(formData.get("kind")) as ProductType;
  const slug = asNonEmptyString(formData.get("slug"));
  const ids = formData.getAll("imageIds").map((value) => typeof value === "string" ? value : "");
  if ((kind !== "coffee" && kind !== "equipment") || !slug || !ids.length || ids.length > 200 || new Set(ids).size !== ids.length) {
    return { status: "error", message: "Некорректный список изображений." };
  }
  let version: string;
  try {
    version = await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(and(eq(products.type, kind), eq(products.slug, slug))).for("update");
      if (!product || formData.get("version") !== product.updatedAt.toISOString()) throw new ProductConflictError("Товар изменился. Обновите страницу перед изменением порядка фотографий.");
      const images = await tx.select().from(productImages).where(eq(productImages.productId, product.id));
      if (images.length !== ids.length || images.some((image) => !ids.includes(image.id))) throw new ProductConflictError("Список изображений изменился. Обновите страницу.");
      await createProductRevisionSnapshot({ productId: product.id, note: "Изменение порядка изображений и главного фото" }, tx);
      const ordered = ids.map((id) => images.find((image) => image.id === id)!);
      await tx.update(productImages).set({
        sortOrder: sql`case ${productImages.id} ${sql.join(ids.map((id, index) => sql`when ${id}::uuid then ${index}::int`), sql` `)} end`,
        isPrimary: eq(productImages.id, ids[0]),
      }).where(eq(productImages.productId, product.id));
      const assets = await tx.select({ id: mediaAssets.id, path: mediaAssets.path, publicUrl: mediaAssets.publicUrl }).from(mediaAssets)
        .innerJoin(productMedia, eq(productMedia.mediaAssetId, mediaAssets.id)).where(eq(productMedia.productId, product.id));
      for (const [index, image] of ordered.entries()) {
        const asset = assets.find((entry) => entry.path === normalizeStorageObjectPath(kind, image.url) || entry.publicUrl === image.url);
        if (asset) await tx.update(productMedia).set({ sortOrder: index, isPrimary: index === 0, role: index === 0 ? "hero" : "gallery" })
          .where(and(eq(productMedia.productId, product.id), eq(productMedia.mediaAssetId, asset.id)));
      }
      const [saved] = await tx.update(products).set({ imageUrl: ordered[0].url, updatedAt: new Date() })
        .where(eq(products.id, product.id)).returning({ updatedAt: products.updatedAt });
      await appendAuditLog({ entityType: "product", entityId: product.id, action: "update", summary: `Обновлён порядок изображений ${slug}`, diff: { imageIds: ids } }, tx);
      return saved.updatedAt.toISOString();
    });
  } catch (error) {
    console.error("Media order failed", error);
    return { status: "error", message: error instanceof ProductConflictError ? error.message : "Не удалось сохранить порядок. Повторите действие." };
  }
  revalidateProduct(kind, slug);
  return { status: "success", message: "Порядок сохранён. Первое изображение — главное.", version };
}
