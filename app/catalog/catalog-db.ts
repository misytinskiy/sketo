import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { resolveCoffeeStorageUrl } from "@/lib/supabase/storage-public";
import type { CatalogItem } from "./catalog-data";

export type CoffeeCatalogCardItem = Omit<CatalogItem, "translations"> & {
  translations: Record<"ru" | "en", Pick<CatalogItem["translations"]["ru"], "name" | "size" | "notes">>;
};
const published = and(eq(products.type, "coffee"), eq(products.isPublished, true));
const cacheOptions = { tags: ["products", "coffee-catalog"], revalidate: 300 };

// One SQL statement, with only the fields needed by the listing.
export const coffeeCardQuery = {
  columns: { slug: true, name: true, imageUrl: true, priceDisplay: true, filters: true },
  where: published,
  orderBy: [asc(products.sortOrder), asc(products.slug)],
  with: { translations: { columns: { locale: true, name: true, size: true, notes: true } } },
} satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>;

function mapCard(row: Awaited<ReturnType<typeof loadCards>>[number]): CoffeeCatalogCardItem {
  const translation = (locale: "ru" | "en") => {
    const value = row.translations.find((entry) => entry.locale === locale);
    return { name: value?.name ?? row.name ?? row.slug, size: value?.size ?? "", notes: value?.notes ?? "" };
  };
  return { slug: row.slug, image: resolveCoffeeStorageUrl(row.imageUrl),
    price: row.priceDisplay ?? "", filters: (row.filters ?? []).filter((filter): filter is "profiles" | "decaf" | "microlot" => ["profiles", "decaf", "microlot"].includes(filter)),
    translations: { ru: translation("ru"), en: translation("en") } };
}
async function loadCards() { return db.query.products.findMany(coffeeCardQuery); }
export const getCoffeeCatalogItems = cache(unstable_cache(
  async () => (await loadCards()).map(mapCard), ["coffee-catalog-cards-v2"], cacheOptions,
));

export const coffeeDetailRelations = {
  translations: true,
  details: { orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.label)] },
} satisfies NonNullable<Parameters<typeof db.query.products.findFirst>[0]>["with"];

async function loadDetail(slug: string, preview = false): Promise<CatalogItem | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.type, "coffee"), eq(products.slug, slug), preview ? undefined : eq(products.isPublished, true)),
    with: coffeeDetailRelations,
  });
  if (!row) return null;
  const card = mapCard(row);
  const translation = (locale: "ru" | "en") => ({
    ...card.translations[locale],
    description: row.translations.find((entry) => entry.locale === locale)?.description ?? "",
    details: row.details.filter((entry) => entry.locale === locale && entry.kind === "detail").map(({ label, value }) => ({ label, value })),

  });

  return { ...card, translations: { ru: translation("ru"), en: translation("en") } };
}
export const getCoffeeCatalogItemBySlug = cache(unstable_cache(
  (slug: string) => loadDetail(slug), ["coffee-product-detail-v2"], cacheOptions,
));
// Preview deliberately bypasses the public cache and publication filter.
export async function getCoffeePreviewItem(slug: string) { return loadDetail(slug, true); }

const getSlugs = cache(unstable_cache(
  () => db.select({ slug: products.slug }).from(products).where(published).orderBy(asc(products.sortOrder), asc(products.slug)),
  ["coffee-catalog-slugs-v2"], cacheOptions,
));
export async function getCoffeeCatalogItemIndex(slug: string) {
  return (await getSlugs()).findIndex((item) => item.slug === slug);
}
export async function getCoffeeCatalogStaticParams() { return getSlugs(); }
