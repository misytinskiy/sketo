import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { resolveCoffeeStorageUrl } from "@/lib/supabase/storage-public";
import type { CatalogItem } from "./catalog-data";

export type CoffeeCatalogCardItem = Omit<CatalogItem, "translations"> & {
  translations: Record<"ru" | "en" | "kz", Pick<CatalogItem["translations"]["ru"], "name" | "size" | "notes" | "status">>;
};
const published = and(eq(products.type, "coffee"), eq(products.isPublished, true));
const cacheOptions = { tags: ["products", "coffee-catalog"], revalidate: 300 };

// One SQL statement, with only the fields needed by the listing.
export const coffeeCardQuery = {
  columns: { slug: true, name: true, imageUrl: true, priceDisplay: true, filters: true, status: true },
  where: published,
  orderBy: [asc(products.sortOrder), asc(products.slug)],
  with: { translations: { columns: { locale: true, name: true, size: true, notes: true } } },
} satisfies NonNullable<Parameters<typeof db.query.products.findMany>[0]>;

function mapCard(row: Awaited<ReturnType<typeof loadCards>>[number]): CoffeeCatalogCardItem {
  const translation = (locale: "ru" | "en" | "kz") => {
    const value = row.translations.find((entry) => entry.locale === locale)
      ?? (locale === "kz" ? row.translations.find((entry) => entry.locale === "ru") : undefined);
    const status = {
      ru: { in_stock: "В наличии", out_of_stock: "Нет в наличии", preorder: "Под заказ" },
      en: { in_stock: "In stock", out_of_stock: "Out of stock", preorder: "On request" },
      kz: { in_stock: "Қолда бар", out_of_stock: "Қолда жоқ", preorder: "Тапсырыспен" },
    }[locale][row.status];
    return { name: value?.name ?? row.name ?? row.slug, size: value?.size ?? "", notes: value?.notes ?? "", status };
  };
  return { slug: row.slug, image: resolveCoffeeStorageUrl(row.imageUrl),
    price: row.priceDisplay ?? "", filters: (row.filters ?? []).filter((filter): filter is "profiles" | "decaf" | "microlot" => ["profiles", "decaf", "microlot"].includes(filter)),
    translations: { ru: translation("ru"), en: translation("en"), kz: translation("kz") } };
}
async function loadCards() { return db.query.products.findMany(coffeeCardQuery); }
export const getCoffeeCatalogItems = cache(unstable_cache(
  async () => (await loadCards()).map(mapCard), ["coffee-catalog-cards-v4-status"], cacheOptions,
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
  // Fall back only when the locale is absent; empty saved collections stay empty.
  const detailLocale = (locale: "ru" | "en" | "kz") =>
    locale === "kz" && !row.translations.some((entry) => entry.locale === "kz") ? "ru" : locale;
  const translation = (locale: "ru" | "en" | "kz") => ({
    ...card.translations[locale],
    seoTitle: row.translations.find((entry) => entry.locale === detailLocale(locale))?.seoTitle ?? "",
    seoDescription: row.translations.find((entry) => entry.locale === detailLocale(locale))?.seoDescription ?? "",
    description: row.translations.find((entry) => entry.locale === detailLocale(locale))?.description ?? "",
    details: row.details.filter((entry) => entry.locale === detailLocale(locale) && entry.kind === "detail").map(({ label, value }) => ({ label, value })),

  });

  return { ...card, translations: { ru: translation("ru"), en: translation("en"), kz: translation("kz") } };
}
export const getCoffeeCatalogItemBySlug = cache(unstable_cache(
  (slug: string) => loadDetail(slug), ["coffee-product-detail-v5-status"], cacheOptions,
));
// Preview deliberately bypasses the public cache and publication filter.
export async function getCoffeePreviewItem(slug: string) { return loadDetail(slug, true); }

const getSlugs = cache(unstable_cache(
  () => db.select({ slug: products.slug }).from(products).where(published).orderBy(asc(products.sortOrder), asc(products.slug)),
  ["coffee-catalog-slugs-v3-kz"], cacheOptions,
));
export async function getCoffeeCatalogItemIndex(slug: string) {
  return (await getSlugs()).findIndex((item) => item.slug === slug);
}
export async function getCoffeeCatalogStaticParams() { return getSlugs(); }
