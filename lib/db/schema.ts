import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("product_type", ["coffee", "equipment"]);
export const productStatusEnum = pgEnum("product_status", [
  "in_stock",
  "out_of_stock",
  "preorder",
]);
export const equipmentBrandEnum = pgEnum("equipment_brand", [
  "la-marzocco",
  "mahlkonig",
  "anfim",
  "mazzer",
  "balenare",
  "allround",
  "victoria-arduino",
]);
export const equipmentTypeEnum = pgEnum("equipment_type", [
  "grinder",
  "espresso-machine",
]);
export const localeEnum = pgEnum("locale", ["ru", "en"]);
export const detailKindEnum = pgEnum("detail_kind", ["detail", "specification"]);
export const editorialRoleEnum = pgEnum("editorial_role", [
  "admin",
  "editor",
  "viewer",
]);
export const editorialStateEnum = pgEnum("editorial_state", [
  "draft",
  "review",
  "published",
  "archived",
]);
export const mediaKindEnum = pgEnum("media_kind", ["image", "video", "document"]);
export const mediaRoleEnum = pgEnum("media_role", [
  "thumbnail",
  "gallery",
  "hero",
  "attachment",
]);
export const auditEntityTypeEnum = pgEnum("audit_entity_type", [
  "product",
  "media",
  "staff",
  "translation",
]);
export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "restore",
  "upload",
]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  type: productTypeEnum("type").notNull(),
  status: productStatusEnum("status").notNull().default("in_stock"),
  editorialState: editorialStateEnum("editorial_state")
    .notNull()
    .default("published"),
  name: text("name"),
  sku: text("sku"),
  subtitle: text("subtitle"),
  excerpt: text("excerpt"),
  priceDisplay: text("price_display"),
  priceAmount: integer("price_amount"),
  priceCurrency: text("price_currency").default("KZT"),
  imageUrl: text("image_url").notNull(),
  brand: equipmentBrandEnum("brand"),
  equipmentType: equipmentTypeEnum("equipment_type"),
  filters: text("filters").array().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productTranslations = pgTable("product_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  name: text("name"),
  size: text("size"),
  notes: text("notes"),
  description: text("description").notNull().default(""),
  category: text("category"),
  statusLabel: text("status_label"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
});

export const productDetails = pgTable("product_details", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  kind: detailKindEnum("kind").notNull().default("detail"),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productFeatures = pgTable("product_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  locale: localeEnum("locale").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const staffMembers = pgTable("staff_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: editorialRoleEnum("role").notNull().default("editor"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  bucket: text("bucket").notNull().default("catalog"),
  path: text("path").notNull().unique(),
  publicUrl: text("public_url").notNull(),
  kind: mediaKindEnum("kind").notNull().default("image"),
  alt: text("alt"),
  mimeType: text("mime_type"),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productMedia = pgTable("product_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  mediaAssetId: uuid("media_asset_id")
    .notNull()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  locale: localeEnum("locale"),
  role: mediaRoleEnum("role").notNull().default("gallery"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const productRevisions = pgTable("product_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  locale: localeEnum("locale"),
  note: text("note"),
  payload: jsonb("payload").notNull().default({}),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: auditEntityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: auditActionEnum("action").notNull(),
  actorId: uuid("actor_id"),
  summary: text("summary").notNull(),
  diff: jsonb("diff").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
export type ProductTranslation = typeof productTranslations.$inferSelect;
export type ProductDetail = typeof productDetails.$inferSelect;
export type ProductFeature = typeof productFeatures.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type StaffMember = typeof staffMembers.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type ProductMedium = typeof productMedia.$inferSelect;
export type ProductRevision = typeof productRevisions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type ProductType = (typeof productTypeEnum.enumValues)[number];
export type ProductStatus = (typeof productStatusEnum.enumValues)[number];
export type Locale = (typeof localeEnum.enumValues)[number];
export type EquipmentBrand = (typeof equipmentBrandEnum.enumValues)[number];
export type EquipmentType = (typeof equipmentTypeEnum.enumValues)[number];
export type DetailKind = (typeof detailKindEnum.enumValues)[number];
export type EditorialRole = (typeof editorialRoleEnum.enumValues)[number];
export type EditorialState = (typeof editorialStateEnum.enumValues)[number];
export type MediaKind = (typeof mediaKindEnum.enumValues)[number];
export type MediaRole = (typeof mediaRoleEnum.enumValues)[number];
export type AuditEntityType = (typeof auditEntityTypeEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
