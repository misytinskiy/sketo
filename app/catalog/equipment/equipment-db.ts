import { and, asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { resolveEquipmentStorageUrl } from "@/lib/supabase/storage-public";
import type { EquipmentItem } from "./equipment-data";

export type EquipmentCatalogCardItem = Omit<EquipmentItem, "translations" | "images"> & {
  translations: Record<"ru" | "en" | "kz", Pick<EquipmentItem["translations"]["ru"], "category" | "status" | "description">>;
};
const published = and(eq(products.type, "equipment"), eq(products.isPublished, true));
const cacheOptions = { tags: ["products", "equipment-catalog"], revalidate: 300 };

// Group machines, grinders, then accessories; preserve editorial order within each brand.
// Cast the brand to text so PostgreSQL uses alphabetical rather than enum declaration order.
const catalogOrder = [
  asc(sql`case coalesce(${products.equipmentType}::text, 'espresso-machine')
    when 'espresso-machine' then 0 when 'grinder' then 1 else 2 end`),
  asc(sql`coalesce(${products.brand}::text, 'la-marzocco')`),
  asc(products.sortOrder),
  asc(products.slug),
];

// One SQL statement for cards. Description is retained for the existing client-side search.
export const equipmentCardQuery = {
  columns: { slug: true, name: true, imageUrl: true, brand: true, equipmentType: true },
  where: published,
  orderBy: catalogOrder,
  with: { translations: { columns: { locale: true, category: true, statusLabel: true, description: true } } },
} satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>;

function mapCard(row: Awaited<ReturnType<typeof loadCards>>[number]): EquipmentCatalogCardItem {
  const translation = (locale: "ru" | "en" | "kz") => {
    const value = row.translations.find((entry) => entry.locale === locale)
      ?? (locale === "kz" ? row.translations.find((entry) => entry.locale === "ru") : undefined);
    return { category: value?.category ?? "", status: value?.statusLabel ?? "", description: value?.description ?? "" };
  };
  return { slug: row.slug, image: resolveEquipmentStorageUrl(row.imageUrl),
    name: row.name ?? row.slug, brand: row.brand ?? "la-marzocco", type: row.equipmentType ?? "espresso-machine",
    translations: { ru: translation("ru"), en: translation("en"), kz: translation("kz") } };
}
async function loadCards() { return db.query.products.findMany(equipmentCardQuery); }
export const getEquipmentCatalogItems = cache(unstable_cache(
  async () => (await loadCards()).map(mapCard), ["equipment-catalog-cards-v4-type-brand"], cacheOptions,
));

export const equipmentDetailRelations = {
  translations: true,
  details: { orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.label)] },
  features: { orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.title)] },
  images: { orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.url)] },
} satisfies NonNullable<Parameters<typeof db.query.products.findFirst>[0]>["with"];

async function loadDetail(slug: string, preview = false): Promise<EquipmentItem | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.type, "equipment"), eq(products.slug, slug), preview ? undefined : eq(products.isPublished, true)),
    with: equipmentDetailRelations,
  });
  if (!row) return null;
  const card = mapCard(row);
  // Fall back only when the locale is absent; empty saved collections stay empty.
  const detailLocale = (locale: "ru" | "en" | "kz") =>
    locale === "kz" && !row.translations.some((entry) => entry.locale === "kz") ? "ru" : locale;
  const translation = (locale: "ru" | "en" | "kz") => ({
    ...card.translations[locale],
    seoTitle: row.translations.find((entry) => entry.locale === detailLocale(locale))?.seoTitle ?? "",
    seoDescription: row.translations.find((entry) => entry.locale === detailLocale(locale))?.seoDescription ?? "",
    description: row.translations.find((entry) => entry.locale === detailLocale(locale))?.description ?? "",
    details: row.details.filter((entry) => entry.locale === detailLocale(locale) && entry.kind === "detail").map(({ label, value }) => ({ label, value })),
    features: row.features.filter((entry) => entry.locale === detailLocale(locale)).map(({ title, description }) => ({ title, description })),
    specifications: row.details.filter((entry) => entry.locale === detailLocale(locale) && entry.kind === "specification").map(({ label, value }) => ({ label, value })),
  });
  const images = [...new Set(row.images.map((image) => resolveEquipmentStorageUrl(image.url)))];
  const primary = row.images.find((image) => image.isPrimary);
  return { ...card, image: primary ? resolveEquipmentStorageUrl(primary.url) : images[0] ?? card.image, images: images.length ? images : card.image ? [card.image] : [], translations: { ru: translation("ru"), en: translation("en"), kz: translation("kz") } };
}
export const getEquipmentItemBySlug = cache(unstable_cache(
  (slug: string) => loadDetail(slug), ["equipment-product-detail-v4-seo"], cacheOptions,
));
// Preview deliberately bypasses the public cache and publication filter.
export async function getEquipmentPreviewItem(slug: string) { return loadDetail(slug, true); }

const getSlugs = cache(unstable_cache(
  () => db.select({ slug: products.slug }).from(products).where(published).orderBy(...catalogOrder),
  ["equipment-catalog-slugs-v4-type-brand"], cacheOptions,
));
export async function getEquipmentItemIndex(slug: string) {
  return (await getSlugs()).findIndex((item) => item.slug === slug);
}
export async function getEquipmentStaticParams() { return getSlugs(); }
