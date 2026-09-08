import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  resolveCoffeeStorageUrl,
  resolveEquipmentStorageUrl,
} from "@/lib/supabase/storage-public";
import {
  auditLogs,
  mediaAssets,
  productDetails,
  productFeatures,
  productImages,
  productMedia,
  productRevisions,
  products,
  productTranslations,
  staffMembers,
  type EditorialState,
  type Locale,
  type ProductType,
} from "@/lib/db/schema";
import type {
  AuditLog,
  MediaAsset,
  Product,
  ProductDetail,
  ProductFeature,
  ProductImage,
  ProductMedium,
  ProductRevision,
  ProductTranslation,
  StaffMember,
} from "@/lib/db/types";

export type EditorProductListItem = Pick<
  Product,
  | "id"
  | "slug"
  | "type"
  | "name"
  | "status"
  | "editorialState"
  | "imageUrl"
  | "priceDisplay"
  | "brand"
  | "equipmentType"
  | "sortOrder"
  | "isPublished"
  | "isFeatured"
  | "updatedAt"
  | "publishedAt"
> & {
  translationCount: number;
  revisionCount: number;
  mediaCount: number;
};

export type EditorProductRecord = Product & {
  translations: ProductTranslation[];
  details: ProductDetail[];
  features: ProductFeature[];
  images: ProductImage[];
  media: Array<
    ProductMedium & {
      asset: MediaAsset | null;
    }
  >;
  revisions: ProductRevision[];
  auditTrail: AuditLog[];
};

export type EditorProductFormRecord = Product & {
  translations: ProductTranslation[];
  details: ProductDetail[];
  features: ProductFeature[];
  images: ProductImage[];
};

export type EditorDashboardStats = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  mediaAssets: number;
  activeStaff: number;
};

export type EditorProductListOptions = {
  type?: ProductType | "all";
  locale?: Locale;
  search?: string;
  state?: EditorialState | "all";
  publishedOnly?: boolean;
};

function normalizeSearch(search?: string) {
  return search?.trim() ? `%${search.trim()}%` : null;
}

function resolveProductImageUrl(type: ProductType, path: string) {
  return type === "coffee"
    ? resolveCoffeeStorageUrl(path)
    : resolveEquipmentStorageUrl(path);
}

export async function getEditorDashboardStats(): Promise<EditorDashboardStats> {
  const [
    totalProductsResult,
    publishedProductsResult,
    draftProductsResult,
    archivedProductsResult,
    mediaAssetsResult,
    activeStaffResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.editorialState, "published")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(inArray(products.editorialState, ["draft", "review"])),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.editorialState, "archived")),
    db.select({ count: sql<number>`count(*)::int` }).from(mediaAssets),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(staffMembers)
      .where(eq(staffMembers.isActive, true)),
  ]);

  return {
    totalProducts: totalProductsResult[0]?.count ?? 0,
    publishedProducts: publishedProductsResult[0]?.count ?? 0,
    draftProducts: draftProductsResult[0]?.count ?? 0,
    archivedProducts: archivedProductsResult[0]?.count ?? 0,
    mediaAssets: mediaAssetsResult[0]?.count ?? 0,
    activeStaff: activeStaffResult[0]?.count ?? 0,
  };
}

export async function listStaffMembers(): Promise<StaffMember[]> {
  return db.select().from(staffMembers).orderBy(asc(staffMembers.displayName));
}

export async function listEditorProducts(
  options: EditorProductListOptions = {},
): Promise<EditorProductListItem[]> {
  const search = normalizeSearch(options.search);
  const conditions = [
    options.type && options.type !== "all" ? eq(products.type, options.type) : undefined,
    options.state && options.state !== "all"
      ? eq(products.editorialState, options.state)
      : undefined,
    options.publishedOnly ? eq(products.isPublished, true) : undefined,
    search
      ? or(
          ilike(products.slug, search),
          ilike(products.name, search),
          ilike(products.subtitle, search),
        )
      : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      type: products.type,
      name: products.name,
      status: products.status,
      editorialState: products.editorialState,
      imageUrl: products.imageUrl,
      priceDisplay: products.priceDisplay,
      brand: products.brand,
      equipmentType: products.equipmentType,
      sortOrder: products.sortOrder,
      isPublished: products.isPublished,
      isFeatured: products.isFeatured,
      updatedAt: products.updatedAt,
      publishedAt: products.publishedAt,
      translationCount: sql<number>`(
        select count(*)::int
        from ${productTranslations}
        where ${productTranslations.productId} = ${products.id}
      )`,
      revisionCount: sql<number>`(
        select count(*)::int
        from ${productRevisions}
        where ${productRevisions.productId} = ${products.id}
      )`,
      mediaCount: sql<number>`(
        select count(*)::int
        from ${productMedia}
        where ${productMedia.productId} = ${products.id}
      )`,
    })
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(products.type), asc(products.sortOrder), asc(products.slug));

  return rows.map((row) => ({
    ...row,
    imageUrl: resolveProductImageUrl(row.type, row.imageUrl),
  }));
}

export async function getEditorProductBySlug(
  type: ProductType,
  slug: string,
): Promise<EditorProductRecord | null> {
  const product = await db.query.products.findFirst({
    where: and(eq(products.type, type), eq(products.slug, slug)),
  });

  if (!product) {
    return null;
  }

  const [
    translations,
    details,
    features,
    images,
    mediaRows,
    revisions,
    auditTrail,
  ] = await Promise.all([
    db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, product.id))
      .orderBy(asc(productTranslations.locale)),
    db
      .select()
      .from(productDetails)
      .where(eq(productDetails.productId, product.id))
      .orderBy(
        asc(productDetails.locale),
        asc(productDetails.kind),
        asc(productDetails.sortOrder),
      ),
    db
      .select()
      .from(productFeatures)
      .where(eq(productFeatures.productId, product.id))
      .orderBy(asc(productFeatures.locale), asc(productFeatures.sortOrder)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)),
    db
      .select({
        id: productMedia.id,
        productId: productMedia.productId,
        mediaAssetId: productMedia.mediaAssetId,
        locale: productMedia.locale,
        role: productMedia.role,
        sortOrder: productMedia.sortOrder,
        isPrimary: productMedia.isPrimary,
        assetId: mediaAssets.id,
        assetBucket: mediaAssets.bucket,
        assetPath: mediaAssets.path,
        assetPublicUrl: mediaAssets.publicUrl,
        assetKind: mediaAssets.kind,
        assetAlt: mediaAssets.alt,
        assetMimeType: mediaAssets.mimeType,
        assetWidth: mediaAssets.width,
        assetHeight: mediaAssets.height,
        assetSizeBytes: mediaAssets.sizeBytes,
        assetCreatedBy: mediaAssets.createdBy,
        assetCreatedAt: mediaAssets.createdAt,
        assetUpdatedAt: mediaAssets.updatedAt,
      })
      .from(productMedia)
      .leftJoin(mediaAssets, eq(productMedia.mediaAssetId, mediaAssets.id))
      .where(eq(productMedia.productId, product.id))
      .orderBy(desc(productMedia.isPrimary), asc(productMedia.sortOrder)),
    db
      .select()
      .from(productRevisions)
      .where(eq(productRevisions.productId, product.id))
      .orderBy(desc(productRevisions.version), desc(productRevisions.createdAt)),
    db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, "product"), eq(auditLogs.entityId, product.id)))
      .orderBy(desc(auditLogs.createdAt)),
  ]);

  return {
    ...product,
    imageUrl: resolveProductImageUrl(product.type, product.imageUrl),
    translations,
    details,
    features,
    images: images.map((image) => ({
      ...image,
      url: resolveProductImageUrl(product.type, image.url),
    })),
    media: mediaRows.map((row) => ({
      id: row.id,
      productId: row.productId,
      mediaAssetId: row.mediaAssetId,
      locale: row.locale,
      role: row.role,
      sortOrder: row.sortOrder,
      isPrimary: row.isPrimary,
      asset: row.assetId
        ? ({
            id: row.assetId,
            bucket: row.assetBucket,
            path: row.assetPath,
            publicUrl: row.assetPublicUrl,
            kind: row.assetKind,
            alt: row.assetAlt,
            mimeType: row.assetMimeType,
            width: row.assetWidth,
            height: row.assetHeight,
            sizeBytes: row.assetSizeBytes,
            createdBy: row.assetCreatedBy,
            createdAt: row.assetCreatedAt,
            updatedAt: row.assetUpdatedAt,
          } as MediaAsset)
        : null,
    })),
    revisions,
    auditTrail,
  };
}

export function editorProductRelations(locale?: Locale | null) {
  return {
    translations: {
      where: locale ? eq(productTranslations.locale, locale) : undefined,
      orderBy: [asc(productTranslations.locale)],
    },
    details: {
      where: locale ? eq(productDetails.locale, locale) : undefined,
      orderBy: [asc(productDetails.locale), asc(productDetails.kind), asc(productDetails.sortOrder), asc(productDetails.id)],
    },
    features: {
      where: locale ? eq(productFeatures.locale, locale) : undefined,
      orderBy: [asc(productFeatures.locale), asc(productFeatures.sortOrder), asc(productFeatures.id)],
    },
    images: { orderBy: [desc(productImages.isPrimary), asc(productImages.sortOrder), asc(productImages.id)] },
  };
}

export async function getEditorProductFormBySlug(
  type: ProductType,
  slug: string,
): Promise<EditorProductFormRecord | null> {
  const product = await db.query.products.findFirst({
    where: and(eq(products.type, type), eq(products.slug, slug)),
    with: editorProductRelations(),
  });
  if (!product) return null;
  return {
    ...product,
    imageUrl: resolveProductImageUrl(product.type, product.imageUrl),
    images: product.images.map((image) => ({ ...image, url: resolveProductImageUrl(product.type, image.url) })),
  };
}

export type EditorTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type RevisionInput = {
  productId: string;
  actorId?: string | null;
  locale?: Locale | null;
  note?: string | null;
};

// Callers hold product row locks for the whole transaction, including the writes below.
export async function createProductRevisionSnapshots(
  input: { productIds: string[]; actorId?: string | null; locale?: Locale | null; note?: string | null },
  tx: EditorTransaction,
) {
  const ids = [...new Set(input.productIds)];
  if (!ids.length) return [];
  const rows = await tx.query.products.findMany({
    where: inArray(products.id, ids),
    with: {
      ...editorProductRelations(input.locale),
      revisions: { columns: { version: true }, orderBy: [desc(productRevisions.version)], limit: 1 },
    },
  });
  if (rows.length !== ids.length) throw new Error("Product not found");
  return tx.insert(productRevisions).values(rows.map((row) => {
    const { translations, details, features, images, revisions, ...product } = row;
    return {
      productId: product.id,
      version: (revisions[0]?.version ?? 0) + 1,
      locale: input.locale ?? null,
      note: input.note ?? null,
      payload: { product, translations, details, features, images },
      createdBy: input.actorId ?? null,
    };
  })).returning();
}

export async function createProductRevisionSnapshot(input: RevisionInput, connection: typeof db | EditorTransaction = db) {
  if (connection === db) {
    return db.transaction(async (tx) => {
      await tx.select({ id: products.id }).from(products).where(eq(products.id, input.productId)).for("update");
      const [revision] = await createProductRevisionSnapshots({ ...input, productIds: [input.productId] }, tx);
      return revision;
    });
  }
  const [revision] = await createProductRevisionSnapshots({ ...input, productIds: [input.productId] }, connection as EditorTransaction);
  return revision;
}

export async function appendAuditLog(input: {
  entityType: "product" | "media" | "staff" | "translation";
  entityId: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "publish"
    | "unpublish"
    | "archive"
    | "restore"
    | "upload";
  summary: string;
  actorId?: string | null;
  diff?: Record<string, unknown>;
}, connection: typeof db | EditorTransaction = db) {
  const [entry] = await connection
    .insert(auditLogs)
    .values({
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      actorId: input.actorId ?? null,
      summary: input.summary,
      diff: input.diff ?? {},
    })
    .returning();

  return entry;
}

export async function listMediaAssets(kind?: "image" | "video" | "document") {
  return db
    .select()
    .from(mediaAssets)
    .where(kind ? eq(mediaAssets.kind, kind) : undefined)
    .orderBy(desc(mediaAssets.createdAt));
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  return db
    .select()
    .from(products)
    .where(inArray(products.id, ids))
    .orderBy(asc(products.sortOrder), asc(products.slug));
}
