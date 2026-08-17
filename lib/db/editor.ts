import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
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

export type EditorDashboardStats = {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  reviewProducts: number;
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

export async function getEditorDashboardStats(): Promise<EditorDashboardStats> {
  const [
    totalProductsResult,
    publishedProductsResult,
    draftProductsResult,
    reviewProductsResult,
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
      .where(eq(products.editorialState, "draft")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.editorialState, "review")),
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
    reviewProducts: reviewProductsResult[0]?.count ?? 0,
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

  return rows;
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
    translations,
    details,
    features,
    images,
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

export async function createProductRevisionSnapshot(input: {
  productId: string;
  actorId?: string | null;
  locale?: Locale | null;
  note?: string | null;
}) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, input.productId),
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const [translations, details, features, images] = await Promise.all([
    db
      .select()
      .from(productTranslations)
      .where(
        and(
          eq(productTranslations.productId, input.productId),
          input.locale ? eq(productTranslations.locale, input.locale) : undefined,
        ),
      ),
    db
      .select()
      .from(productDetails)
      .where(
        and(
          eq(productDetails.productId, input.productId),
          input.locale ? eq(productDetails.locale, input.locale) : undefined,
        ),
      ),
    db
      .select()
      .from(productFeatures)
      .where(
        and(
          eq(productFeatures.productId, input.productId),
          input.locale ? eq(productFeatures.locale, input.locale) : undefined,
        ),
      ),
    db.select().from(productImages).where(eq(productImages.productId, input.productId)),
  ]);

  const latestRevision = await db.query.productRevisions.findFirst({
    where: eq(productRevisions.productId, input.productId),
    orderBy: [desc(productRevisions.version)],
  });

  const [revision] = await db
    .insert(productRevisions)
    .values({
      productId: input.productId,
      version: (latestRevision?.version ?? 0) + 1,
      locale: input.locale ?? null,
      note: input.note ?? null,
      payload: {
        product,
        translations,
        details,
        features,
        images,
      },
      createdBy: input.actorId ?? null,
    })
    .returning();

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
}) {
  const [entry] = await db
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
