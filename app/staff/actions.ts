"use server";

import { requireStaff } from "@/lib/staff-auth";

import { and, asc, eq, inArray, like, or, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { appendAuditLog, createProductRevisionSnapshots } from "@/lib/db/editor";
import {
  auditLogs,
  productImages,
  products,
  productTranslations,
  type ProductType,
} from "@/lib/db/schema";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#f2f0eb"/>
      <rect x="120" y="120" width="960" height="660" rx="36" fill="none" stroke="#ce1616" stroke-width="20" stroke-dasharray="28 20"/>
      <path d="M600 340v220M490 450h220" stroke="#ce1616" stroke-width="28" stroke-linecap="round"/>
      <text x="600" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" letter-spacing="8" fill="#2d3134">NEW PRODUCT</text>
    </svg>`,
  );

function getBaseSlug(type: ProductType) {
  return type === "coffee" ? "new-coffee" : "new-equipment";
}

function getDraftName(type: ProductType, locale: "ru" | "en") {
  if (type === "coffee") {
    return locale === "ru" ? "Новый кофе" : "New coffee";
  }

  return locale === "ru" ? "Новое оборудование" : "New equipment";
}

type CreateStaffProductTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function lockProductType(tx: CreateStaffProductTx, type: ProductType) {
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtext(${`staff:create:${type}`}))`,
  );
}

async function generateUniqueSlugTx(tx: CreateStaffProductTx, type: ProductType) {
  const baseSlug = getBaseSlug(type);
  const rows = await tx
    .select({ slug: products.slug })
    .from(products)
    .where(like(products.slug, `${baseSlug}%`))
    .orderBy(asc(products.slug));
  const existing = new Set(rows.map((row) => row.slug));

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  for (let index = 2; index < 10_000; index += 1) {
    const candidate = `${baseSlug}-${index}`;

    if (!existing.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Не удалось подобрать slug для нового товара.");
}

async function getNextSortOrderTx(tx: CreateStaffProductTx, type: ProductType) {
  const [row] = await tx
    .select({
      maxSortOrder: sql<number>`coalesce(max(${products.sortOrder}), -1)`,
    })
    .from(products)
    .where(eq(products.type, type));

  return (row?.maxSortOrder ?? -1) + 1;
}

function revalidateStaffList() {
  updateTag("staff-products");
  revalidatePath("/staff", "page");
}

function revalidateStaffCatalogs(kinds: ProductType[]) {
  revalidateStaffList();
  for (const kind of new Set(kinds)) {
    updateTag(kind === "coffee" ? "coffee-catalog" : "equipment-catalog");
    revalidatePath(kind === "coffee" ? "/catalog" : "/equipment", "page");
  }
}

export async function createStaffProduct(formData: FormData) {
  await requireStaff();
  const kind = formData.get("kind");

  if (kind !== "coffee" && kind !== "equipment") {
    throw new Error("Некорректный тип товара.");
  }

  const requestId = formData.get("requestId");
  if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new Error("Некорректный идентификатор запроса.");
  const now = new Date();
  const { slug } = await db.transaction(async (tx) => {
    await lockProductType(tx, kind);
    const existing = await tx.query.products.findFirst({ where: eq(products.id, requestId) });
    if (existing) {
      if (existing.type !== kind) throw new Error("Тип товара не совпадает.");
      return { product: existing, slug: existing.slug };
    }

    const [slug, sortOrder] = await Promise.all([
      generateUniqueSlugTx(tx, kind),
      getNextSortOrderTx(tx, kind),
    ]);

    const [product] = await tx
      .insert(products)
      .values({
        id: requestId,
        slug,
        type: kind,
        name: getDraftName(kind, "ru"),
        status: "in_stock",
        editorialState: "draft",
        isPublished: false,
        imageUrl: PLACEHOLDER_IMAGE,
        priceDisplay: kind === "coffee" ? "KZT 0" : null,
        priceCurrency: "KZT",
        brand: kind === "equipment" ? "la-marzocco" : null,
        equipmentType: kind === "equipment" ? "espresso-machine" : null,
        sortOrder,
        updatedAt: now,
      })
      .returning();

    await tx.insert(productTranslations).values([
      {
        productId: product.id,
        locale: "kz",
        name: kind === "coffee" ? "Жаңа кофе" : "Жаңа жабдық",
        size: kind === "coffee" ? "250 г" : null,
        notes: kind === "coffee" ? "" : null,
        category: kind === "equipment" ? "Жаңа санат" : null,
        description: "",
        statusLabel: kind === "equipment" ? "Қолда бар" : null,
      },
      {
        productId: product.id,
        locale: "ru",
        name: getDraftName(kind, "ru"),
        size: kind === "coffee" ? "250 г" : null,
        notes: kind === "coffee" ? "" : null,
        category: kind === "equipment" ? "Новая категория" : null,
        description: "",
        statusLabel: kind === "equipment" ? "В наличии" : null,
      },
      {
        productId: product.id,
        locale: "en",
        name: getDraftName(kind, "en"),
        size: kind === "coffee" ? "250 g" : null,
        notes: kind === "coffee" ? "" : null,
        category: kind === "equipment" ? "New category" : null,
        description: "",
        statusLabel: kind === "equipment" ? "In stock" : null,
      },
    ]);

    await tx.insert(productImages).values({
      productId: product.id,
      url: PLACEHOLDER_IMAGE,
      sortOrder: 0,
      isPrimary: true,
    });

    await appendAuditLog({ entityType: "product", entityId: product.id, action: "create",
      summary: `Создан новый товар ${slug}`, diff: { kind, slug, editorialState: "draft" },
    }, tx);
    return { product, slug };
  });

  revalidateStaffList();
  return {
    href: `/staff/edit/${kind}/${slug}`,
  };
}

async function changeSelectedStaffProducts(productIds: string[], versions: Record<string, string | null>, restore: boolean) {
  if (!Array.isArray(productIds) || !productIds.length || productIds.length > 200) {
    return { status: "error" as const, message: "Выберите от 1 до 200 товаров." };
  }
  try {
    const pairs = [...new Set(productIds)].map((value) => {
      const [kind, slug] = typeof value === "string" ? value.split(":") : [];
      if ((kind !== "coffee" && kind !== "equipment") || !slug) throw new Error("Некорректный товар.");
      return { kind, slug };
    });
    const result = await db.transaction(async (tx) => {
      const rows = await tx.select().from(products).where(or(...pairs.map(({ kind, slug }) =>
        and(eq(products.type, kind as ProductType), eq(products.slug, slug)),
      ))).orderBy(asc(products.id)).for("update");
      if (rows.length !== pairs.length || rows.some((row) => versions[`${row.type}:${row.slug}`] !== row.updatedAt.toISOString())) {
        throw new Error("Выбранные товары изменились. Обновите список и выберите их заново.");
      }
      const active = rows.filter((row) => restore ? row.editorialState === "archived" : row.editorialState !== "archived");
      if (active.length) {
        await createProductRevisionSnapshots({ productIds: active.map((product) => product.id), note: restore ? "Восстановление в черновик" : "Перемещение в архив / корзину" }, tx);
        const now = new Date(Math.max(Date.now(), ...active.map((product) => product.updatedAt.getTime() + 1)));
        await tx.update(products).set({ editorialState: restore ? "draft" : "archived", isPublished: false, archivedAt: restore ? null : now, updatedAt: now })
          .where(inArray(products.id, active.map((product) => product.id)));
        await tx.insert(auditLogs).values(active.map((product) => ({
          entityType: "product" as const, entityId: product.id, action: restore ? "restore" as const : "archive" as const,
          summary: restore ? `Товар ${product.slug} восстановлен в черновик` : `Товар ${product.slug} перемещён в архив / корзину`,
        })));
      }
      return { count: active.length, kinds: active.map((product) => product.type) };
    });
    revalidateStaffCatalogs(result.kinds);
    return { status: "success" as const, message: restore ? `Восстановлено в черновики: ${result.count}.` : `Перемещено в архив / корзину: ${result.count}.` };
  } catch (error) {
    console.error("Bulk archive failed", error);
    return { status: "error" as const, message: "Не удалось изменить состояние товаров. Возможно, список изменился: обновите страницу и повторите выбор." };
  }
}

export async function deleteSelectedStaffProducts(productIds: string[], versions: Record<string, string | null>) {
  await requireStaff();
  return archiveSelectedStaffProducts(productIds, versions);
}

export async function archiveSelectedStaffProducts(productIds: string[], versions: Record<string, string | null>) {
  await requireStaff();
  return changeSelectedStaffProducts(productIds, versions, false);
}
export async function restoreSelectedStaffProducts(productIds: string[], versions: Record<string, string | null>) {
  await requireStaff();
  return changeSelectedStaffProducts(productIds, versions, true);
}
