import { and, asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  products,
  productTranslations,
  type EditorialState,
} from "@/lib/db/schema";
import {
  resolveCoffeeStorageUrl,
  resolveEquipmentStorageUrl,
} from "@/lib/supabase/storage-public";
import { equipmentBrandLabels } from "../catalog/equipment/equipment-data";

export type StaffProductStatus = "in_stock" | "out_of_stock" | "preorder";
export type StaffProductKind = "coffee" | "equipment";
export type StaffEditorialState = Exclude<EditorialState, "review">;

type ProductRow = {
  id: string;
  slug: string;
  type: StaffProductKind;
  name: string | null;
  status: StaffProductStatus;
  editorialState: EditorialState;
  imageUrl: string;
  priceDisplay: string | null;
  brand:
    | "la-marzocco"
    | "mahlkonig"
    | "anfim"
    | "mazzer"
    | "balenare"
    | "allround"
    | "victoria-arduino"
    | null;
  updatedAt: Date | null;
  sortOrder: number;
};

type TranslationRow = {
  productId: string;
  locale: "ru" | "en";
  name: string | null;
  size: string | null;
  notes: string | null;
  category: string | null;
};

type StaffProductTranslation = {
  name: string;
  meta: string;
  sourceLabel: string;
};

export type StaffProductRecord = {
  slug: string;
  kind: StaffProductKind;
  image: string;
  price?: string;
  status: StaffProductStatus;
  editorialState: StaffEditorialState;
  sortOrder: number;
  updatedAt: string | null;
  hasTranslation: boolean;
  href: string;
  translations: Record<"ru" | "en", StaffProductTranslation>;
};

export type StaffProductMeta = {
  status: StaffProductStatus;
  editorialState: StaffEditorialState;
  hasTranslation: boolean;
  updatedAt: string | null;
};

function normalizeEditorialState(state: EditorialState): StaffEditorialState {
  return state === "review" ? "draft" : state;
}

async function loadProductRows(): Promise<ProductRow[]> {
  return db
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
      updatedAt: products.updatedAt,
      sortOrder: products.sortOrder,
    })
    .from(products)
    .where(inArray(products.type, ["coffee", "equipment"]))
    .orderBy(asc(products.sortOrder), asc(products.slug));
}

async function loadTranslationRows(productIds: string[]): Promise<TranslationRow[]> {
  if (productIds.length === 0) {
    return [];
  }

  return db
    .select({
      productId: productTranslations.productId,
      locale: productTranslations.locale,
      name: productTranslations.name,
      size: productTranslations.size,
      notes: productTranslations.notes,
      category: productTranslations.category,
    })
    .from(productTranslations)
    .where(inArray(productTranslations.productId, productIds));
}

function buildTranslationMap(rows: TranslationRow[]) {
  const map = new Map<string, Partial<Record<"ru" | "en", TranslationRow>>>();

  for (const row of rows) {
    const current = map.get(row.productId) ?? {};
    current[row.locale] = row;
    map.set(row.productId, current);
  }

  return map;
}

function buildCoffeeMeta(locale: "ru" | "en", translation?: TranslationRow) {
  const size = translation?.size?.trim() ?? "";
  const notes = translation?.notes?.trim() ?? "";
  const parts = [size, notes].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  return locale === "ru" ? "Новый лот" : "New lot";
}

function buildEquipmentMeta(
  locale: "ru" | "en",
  brand: ProductRow["brand"],
  translation?: TranslationRow,
) {
  const brandLabel = brand ? equipmentBrandLabels[locale][brand] : "";
  const category = translation?.category?.trim() ?? "";
  const parts = [brandLabel, category].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  return locale === "ru" ? "Новая карточка" : "New item";
}

function buildFallbackName(kind: StaffProductKind, locale: "ru" | "en") {
  if (kind === "coffee") {
    return locale === "ru" ? "Новый кофе" : "New coffee";
  }

  return locale === "ru" ? "Новое оборудование" : "New equipment";
}

function mapProductRecord(
  row: ProductRow,
  translations: Partial<Record<"ru" | "en", TranslationRow>>,
): StaffProductRecord {
  const ruTranslation = translations.ru;
  const enTranslation = translations.en;
  const baseName = row.name?.trim() ?? "";
  const ruName =
    ruTranslation?.name?.trim() || baseName || buildFallbackName(row.type, "ru");
  const enName =
    enTranslation?.name?.trim() || baseName || buildFallbackName(row.type, "en");
  const hasTranslation = Boolean(translations.ru && translations.en);

  return {
    slug: row.slug,
    kind: row.type,
    image:
      row.type === "coffee"
        ? resolveCoffeeStorageUrl(row.imageUrl)
        : resolveEquipmentStorageUrl(row.imageUrl),
    price: row.type === "coffee" ? row.priceDisplay ?? undefined : undefined,
    status: row.status,
    editorialState: normalizeEditorialState(row.editorialState),
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt?.toISOString() ?? null,
    hasTranslation,
    href: row.type === "coffee" ? `/catalog/${row.slug}` : `/equipment/${row.slug}`,
    translations: {
      ru: {
        name: ruName,
        meta:
          row.type === "coffee"
            ? buildCoffeeMeta("ru", ruTranslation)
            : buildEquipmentMeta("ru", row.brand, ruTranslation),
        sourceLabel: row.type === "coffee" ? "Каталог кофе" : "Каталог оборудования",
      },
      en: {
        name: enName,
        meta:
          row.type === "coffee"
            ? buildCoffeeMeta("en", enTranslation)
            : buildEquipmentMeta("en", row.brand, enTranslation),
        sourceLabel: row.type === "coffee" ? "Coffee catalog" : "Equipment catalog",
      },
    },
  };
}

const getCachedStaffProducts = unstable_cache(
  async (): Promise<StaffProductRecord[]> => {
    const rows = await loadProductRows();
    const translations = await loadTranslationRows(rows.map((row) => row.id));
    const translationMap = buildTranslationMap(translations);

    return rows.map((row) => mapProductRecord(row, translationMap.get(row.id) ?? {}));
  },
  ["staff-products"],
  {
    tags: ["staff-products"],
    revalidate: 300,
  },
);

export async function getStaffProducts() {
  return getCachedStaffProducts();
}

export const getStaffProductMeta = unstable_cache(
  async (kind: StaffProductKind, slug: string): Promise<StaffProductMeta | null> => {
    const row = await db
      .select({
        id: products.id,
        status: products.status,
        editorialState: products.editorialState,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.type, kind)))
      .limit(1);

    const product = row[0];

    if (!product) {
      return null;
    }

    const translationRows = await db
      .select({
        locale: productTranslations.locale,
      })
      .from(productTranslations)
      .where(eq(productTranslations.productId, product.id));

    const locales = new Set(translationRows.map((entry) => entry.locale));

    return {
      status: product.status,
      editorialState: normalizeEditorialState(product.editorialState),
      hasTranslation: locales.has("ru") && locales.has("en"),
      updatedAt: product.updatedAt?.toISOString() ?? null,
    };
  },
  ["staff-product-meta"],
  {
    tags: ["staff-products"],
    revalidate: 300,
  },
);
