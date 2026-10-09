import { requireStaff } from "@/lib/staff-auth";
import { createPreviewHref } from "@/lib/staff-preview";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEditorProductFormBySlug } from "@/lib/db/editor";
import type { EquipmentBrand, EquipmentType } from "@/lib/db/schema";
import { getCatalogItemContent } from "../../../../catalog/catalog-data";
import { equipmentBrandLabels } from "../../../../catalog/equipment/equipment-data";
import { EditorVersionProvider } from "./EditorVersionContext";
import EditorMediaManager from "./EditorMediaManager";
import EditorProductForm, { type EditorProductFormData } from "./EditorProductForm";
import styles from "./page.module.css";

type StaffEditKind = "coffee" | "equipment";

type StaffEditPageProps = {
  params: Promise<{
    kind: StaffEditKind;
    slug: string;
  }>;
};

const copy = {
  back: "Назад к кабинету",
  eyebrow: "Редактор",
  labels: {
    coffee: "Кофе",
    equipment: "Оборудование",
    inStock: "В наличии",
    outOfStock: "Нет в наличии",
    onRequest: "Под заказ",
    ruEn: "RU / EN / KZ",
    singleLanguage: "Один язык",
    catalogCoffee: "Каталог кофе",
    catalogEquipment: "Каталог оборудования",
    espressoMachine: "Кофемашина",
    grinder: "Кофемолка",
  },
  sections: {
    media: "Медиа",
  },
  hints: {
    media: "Изображения ниже остаются только для быстрого визуального контроля.",
  },
} as const;

function getEquipmentTypeLabel(type: EquipmentType) {
  const labels: Record<EquipmentType, string> = {
    grinder: copy.labels.grinder,
    "espresso-machine": copy.labels.espressoMachine,
    tamper: "Автотемпер",
    "steam-module": "Паровой модуль",
    accessory: "Аксессуар",
  };
  return labels[type];
}

type EditorFormProduct = NonNullable<
  Awaited<ReturnType<typeof getEditorProductFormBySlug>>
>;

function hasBothTranslations(product: EditorFormProduct) {
  const locales = new Set(product.translations.map((entry) => entry.locale));
  return locales.has("ru") && locales.has("en") && locales.has("kz");
}

function buildCoffeeFormData(
  slug: string,
  product: EditorFormProduct,
): EditorProductFormData {
  const ruTranslation = product.translations.find((entry) => entry.locale === "ru");
  const enTranslation = product.translations.find((entry) => entry.locale === "en");
  const kzTranslation = product.translations.find((entry) => entry.locale === "kz");
  const ruDetails = product.details
    .filter((detail) => detail.locale === "ru" && detail.kind === "detail")
    .map((detail) => ({
      label: detail.label,
      value: detail.value,
    }));
  const enDetails = product.details
    .filter((detail) => detail.locale === "en" && detail.kind === "detail")
    .map((detail) => ({
      label: detail.label,
      value: detail.value,
    }));
  const kzDetails = product.details
    .filter((detail) => detail.locale === "kz" && detail.kind === "detail")
    .map((detail) => ({
      label: detail.label,
      value: detail.value,
    }));
  const fallbackContent = getCatalogItemContent(
    {
      slug: product.slug,
      image: product.imageUrl,
      price: product.priceDisplay ?? "",
      filters: [],
      translations: {
        ru: {
          name: ruTranslation?.name ?? product.name ?? "",
          size: ruTranslation?.size ?? "",
          notes: ruTranslation?.notes ?? "",
          description: ruTranslation?.description ?? "",
          details: ruDetails,
        },
        en: {
          name: enTranslation?.name ?? "",
          size: enTranslation?.size ?? "",
          notes: enTranslation?.notes ?? "",
          description: enTranslation?.description ?? "",
          details: enDetails,
        },
        kz: {
          name: kzTranslation?.name ?? "",
          size: kzTranslation?.size ?? "",
          notes: kzTranslation?.notes ?? "",
          description: kzTranslation?.description ?? "",
          details: kzDetails,
        },
      },
    },
    "ru",
  );

  return {
    kind: "coffee",
    slug,
    title: ruTranslation?.name ?? product.name ?? fallbackContent.name,
    imageUrl: product.imageUrl,
    status: product.status,
    hasTranslation: hasBothTranslations(product),
    version: product.updatedAt.toISOString(),
    isPublished: product.isPublished,
    isArchived: product.editorialState === "archived",
    previewHref: createPreviewHref("coffee", slug),
    price: product.priceDisplay ?? "",
    translations: {
      ru: {
        seoTitle: ruTranslation?.seoTitle ?? "",
        seoDescription: ruTranslation?.seoDescription ?? "",
        title: ruTranslation?.name ?? product.name ?? fallbackContent.name,
        size: ruTranslation?.size ?? fallbackContent.size,
        notes: ruTranslation?.notes ?? fallbackContent.notes,
        description: ruTranslation?.description ?? fallbackContent.description,
        details: ruDetails,
      },
      en: {
        seoTitle: enTranslation?.seoTitle ?? "",
        seoDescription: enTranslation?.seoDescription ?? "",
        title: enTranslation?.name ?? "",
        size: enTranslation?.size ?? "",
        notes: enTranslation?.notes ?? "",
        description: enTranslation?.description ?? "",
        details: enDetails,
      },
      kz: {
        seoTitle: kzTranslation?.seoTitle ?? "",
        seoDescription: kzTranslation?.seoDescription ?? "",
        title: kzTranslation?.name ?? "",
        size: kzTranslation?.size ?? "",
        notes: kzTranslation?.notes ?? "",
        description: kzTranslation?.description ?? "",
        details: kzDetails,
      },
    },
  };
}

function buildEquipmentFormData(
  slug: string,
  product: EditorFormProduct,
): EditorProductFormData {
  const ruTranslation = product.translations.find((entry) => entry.locale === "ru");
  const enTranslation = product.translations.find((entry) => entry.locale === "en");
  const kzTranslation = product.translations.find((entry) => entry.locale === "kz");
  const getDetailsForLocale = (locale: "ru" | "en" | "kz", kind: "detail" | "specification") =>
    product.details
      .filter((detail) => detail.locale === locale && detail.kind === kind)
      .map((detail) => ({
        label: detail.label,
        value: detail.value,
      }));
  const getFeaturesForLocale = (locale: "ru" | "en" | "kz") =>
    product.features
      .filter((feature) => feature.locale === locale)
      .map((feature) => ({
        title: feature.title,
        description: feature.description,
      }));
  const images = product.images.map((image) => image.url);

  return {
    kind: "equipment",
    slug,
    title: ruTranslation?.name ?? product.name ?? "",
    imageUrl: product.imageUrl,
    status: product.status,
    hasTranslation: hasBothTranslations(product),
    version: product.updatedAt.toISOString(),
    isPublished: product.isPublished,
    isArchived: product.editorialState === "archived",
    previewHref: createPreviewHref("equipment", slug),
    brand: (product.brand ?? "la-marzocco") as EquipmentBrand,
    equipmentType: product.equipmentType ?? "grinder",
    translations: {
      ru: {
        seoTitle: ruTranslation?.seoTitle ?? "",
        seoDescription: ruTranslation?.seoDescription ?? "",
        title: ruTranslation?.name ?? product.name ?? "",
        category: ruTranslation?.category ?? "",
        description: ruTranslation?.description ?? "",
        details: getDetailsForLocale("ru", "detail"),
        features: getFeaturesForLocale("ru"),
        specifications: getDetailsForLocale("ru", "specification"),
      },
      en: {
        seoTitle: enTranslation?.seoTitle ?? "",
        seoDescription: enTranslation?.seoDescription ?? "",
        title: enTranslation?.name ?? "",
        category: enTranslation?.category ?? "",
        description: enTranslation?.description ?? "",
        details: getDetailsForLocale("en", "detail"),
        features: getFeaturesForLocale("en"),
        specifications: getDetailsForLocale("en", "specification"),
      },
      kz: {
        seoTitle: kzTranslation?.seoTitle ?? "",
        seoDescription: kzTranslation?.seoDescription ?? "",
        title: kzTranslation?.name ?? "",
        category: kzTranslation?.category ?? "",
        description: kzTranslation?.description ?? "",
        details: getDetailsForLocale("kz", "detail"),
        features: getFeaturesForLocale("kz"),
        specifications: getDetailsForLocale("kz", "specification"),
      },
    },
    images,
  };
}

export default async function StaffEditPage({ params }: StaffEditPageProps) {
  await requireStaff();
  const { kind, slug } = await params;
  const product = await getEditorProductFormBySlug(kind, slug);

  if (!product) {
    notFound();
  }

  const formData =
    kind === "coffee"
      ? buildCoffeeFormData(slug, product)
      : buildEquipmentFormData(slug, product);
  const mediaItems = product.images.map((image) => ({
    id: image.id,
    url: image.url,
  }));

  const heroTitle =
    formData.kind === "coffee"
      ? formData.title
      : `${formData.title}`;

  const heroMeta =
    formData.kind === "coffee"
      ? `${formData.translations.ru.size} · ${formData.price}`
      : `${equipmentBrandLabels.ru[formData.brand]} · ${getEquipmentTypeLabel(
          formData.equipmentType,
        )}`;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/staff" className={styles.backLink}>
            {copy.back}
          </Link>
          <span className={styles.eyebrow}>{copy.eyebrow}</span>
        </header>

        <section className={styles.layout}>
          <div className={styles.editor}>
            <section className={styles.heroCard}>
              <div className={styles.heroCopy}>
                <span className={styles.kindLabel}>
                  {kind === "coffee" ? copy.labels.coffee : copy.labels.equipment}
                </span>
                <h1 className={styles.pageTitle}>{heroTitle}</h1>
                <p className={styles.pageMeta}>{heroMeta}</p>
              </div>

              <div className={styles.heroMedia}>
                <Image
                  src={formData.imageUrl}
                  alt={heroTitle}
                  fill
                  sizes="(max-width: 900px) 100vw, 24rem"
                  className={styles.heroImage}
                />
              </div>
            </section>

            <EditorVersionProvider key={`${kind}:${slug}`} initialVersion={formData.version}>
            <EditorProductForm product={formData} />

            <EditorMediaManager
              kind={kind}
              slug={slug}
              items={mediaItems}
              title={formData.title}
            />
            </EditorVersionProvider>
          </div>
        </section>
      </div>
    </main>
  );
}
