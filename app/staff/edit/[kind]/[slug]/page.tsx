import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../../../components/getInitialLanguage";
import {
  getContentLanguage,
  type ContentLanguage,
} from "../../../../components/language";
import {
  catalogItems,
  getCatalogItemBySlug,
  getCatalogItemContent,
} from "../../../../catalog/catalog-data";
import {
  equipmentBrandLabels,
  equipmentItems,
  getEquipmentItemBySlug,
  getEquipmentItemContent,
  type EquipmentItem,
} from "../../../../catalog/equipment/equipment-data";
import styles from "./page.module.css";

type StaffEditKind = "coffee" | "equipment";

type StaffEditPageProps = {
  params: Promise<{
    kind: StaffEditKind;
    slug: string;
  }>;
};

const copy = {
  ru: {
    back: "Назад к кабинету",
    eyebrow: "Editor",
    status: "Статус",
    visibility: "Видимость",
    languages: "Языки",
    slug: "Slug",
    source: "Источник",
    actions: "Действия",
    saveDraft: "Сохранить черновик",
    preview: "Предпросмотр",
    publish: "Опубликовать",
    archive: "В архив",
    remove: "Удалить",
    sections: {
      main: "Основное",
      media: "Медиа",
      details: "Детали",
      structure: "Структура",
    },
    fields: {
      title: "Название",
      size: "Вес / размер",
      price: "Цена",
      category: "Категория",
      notes: "Ноты",
      description: "Описание",
      brand: "Бренд",
      type: "Тип",
      gallery: "Галерея",
      fields: "Поля карточки",
      features: "Ключевые блоки",
      specs: "Технические характеристики",
    },
    labels: {
      coffee: "Кофе",
      equipment: "Оборудование",
      live: "Опубликовано",
      inStock: "В наличии",
      onRequest: "Под заказ",
      ruEn: "RU / EN",
      catalogCoffee: "Каталог кофе",
      catalogEquipment: "Каталог оборудования",
      espressoMachine: "Кофемашина",
      grinder: "Кофемолка",
    },
    hints: {
      title: "Заголовок карточки и SEO title.",
      notes: "Короткий блок для списка и заглавного экрана.",
      description: "Основной редакционный текст карточки.",
      media: "Порядок кадров, обложка и fallback для мобильной галереи.",
      details: "Поля собираются из таблицы и выводятся на публичной странице.",
      features:
        "Этот блок нужен для equipment-страниц и показывает смысловые преимущества.",
      specs:
        "Технические характеристики выводятся отдельной секцией ниже на странице.",
    },
  },
  en: {
    back: "Back to staff",
    eyebrow: "Editor",
    status: "Status",
    visibility: "Visibility",
    languages: "Languages",
    slug: "Slug",
    source: "Source",
    actions: "Actions",
    saveDraft: "Save draft",
    preview: "Preview",
    publish: "Publish",
    archive: "Archive",
    remove: "Delete",
    sections: {
      main: "Main",
      media: "Media",
      details: "Details",
      structure: "Structure",
    },
    fields: {
      title: "Title",
      size: "Size",
      price: "Price",
      category: "Category",
      notes: "Notes",
      description: "Description",
      brand: "Brand",
      type: "Type",
      gallery: "Gallery",
      fields: "Card fields",
      features: "Key blocks",
      specs: "Specifications",
    },
    labels: {
      coffee: "Coffee",
      equipment: "Equipment",
      live: "Live",
      inStock: "In stock",
      onRequest: "On request",
      ruEn: "RU / EN",
      catalogCoffee: "Coffee catalog",
      catalogEquipment: "Equipment catalog",
      espressoMachine: "Espresso machine",
      grinder: "Grinder",
    },
    hints: {
      title: "Card heading and SEO title.",
      notes: "Short block used in list view and the hero card.",
      description: "Main editorial copy for the product page.",
      media: "Frame order, cover image, and fallback for mobile gallery.",
      details: "Fields are mapped from the table and rendered on the public page.",
      features:
        "This block is used on equipment pages to explain functional strengths.",
      specs:
        "Technical specifications render as a separate section below on the page.",
    },
  },
} as const;

function getEquipmentTypeLabel(
  item: EquipmentItem,
  language: ContentLanguage,
  t: (typeof copy)[ContentLanguage],
) {
  if (item.type === "grinder") {
    return t.labels.grinder;
  }

  return t.labels.espressoMachine;
}

export async function generateStaticParams() {
  return [
    ...catalogItems.map((item) => ({ kind: "coffee" as const, slug: item.slug })),
    ...equipmentItems.map((item) => ({
      kind: "equipment" as const,
      slug: item.slug,
    })),
  ];
}

export default async function StaffEditPage({ params }: StaffEditPageProps) {
  const { kind, slug } = await params;
  const initialLanguage = await getInitialLanguage();
  const language = getContentLanguage(initialLanguage);
  const t = copy[language];

  if (kind === "coffee") {
    const item = getCatalogItemBySlug(slug);

    if (!item) {
      notFound();
    }

    const content = getCatalogItemContent(item, language);

    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.topbar}>
            <Link href="/staff" className={styles.backLink}>
              {t.back}
            </Link>
            <span className={styles.eyebrow}>{t.eyebrow}</span>
          </header>

          <section className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.status}</span>
                <div className={styles.badgeRow}>
                  <span className={styles.badgeLive}>{t.labels.live}</span>
                  <span className={styles.badgeNeutral}>{t.labels.inStock}</span>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.visibility}</span>
                <p className={styles.sidebarValue}>/catalog/{item.slug}</p>
              </div>

              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.languages}</span>
                <p className={styles.sidebarValue}>{t.labels.ruEn}</p>
              </div>

              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.slug}</span>
                <p className={styles.sidebarValue}>{item.slug}</p>
              </div>

              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.source}</span>
                <p className={styles.sidebarValue}>{t.labels.catalogCoffee}</p>
              </div>

              <div className={styles.sidebarCard}>
                <span className={styles.sidebarLabel}>{t.actions}</span>
                <div className={styles.actionStack}>
                  <button type="button" className={styles.primaryAction}>
                    {t.saveDraft}
                  </button>
                  <button type="button" className={styles.secondaryAction}>
                    {t.preview}
                  </button>
                  <button type="button" className={styles.secondaryAction}>
                    {t.publish}
                  </button>
                  <button type="button" className={styles.secondaryAction}>
                    {t.archive}
                  </button>
                  <button type="button" className={styles.secondaryActionDanger}>
                    {t.remove}
                  </button>
                </div>
              </div>
            </aside>

            <div className={styles.editor}>
              <section className={styles.heroCard}>
                <div className={styles.heroCopy}>
                  <span className={styles.kindLabel}>{t.labels.coffee}</span>
                  <h1 className={styles.pageTitle}>{content.name}</h1>
                  <p className={styles.pageMeta}>
                    {content.size} · {item.price}
                  </p>
                </div>

                <div className={styles.heroMedia}>
                  <Image
                    src={item.image}
                    alt={content.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 24rem"
                    className={styles.heroImage}
                  />
                </div>
              </section>

              <section className={styles.sectionBlock}>
                <div className={styles.sectionTopline}>
                  <span className={styles.sectionLabel}>{t.sections.main}</span>
                </div>
                <div className={styles.formGrid}>
                  <article className={styles.fieldCard}>
                    <span className={styles.fieldLabel}>{t.fields.title}</span>
                    <p className={styles.fieldValue}>{content.name}</p>
                    <p className={styles.fieldHint}>{t.hints.title}</p>
                  </article>
                  <article className={styles.fieldCard}>
                    <span className={styles.fieldLabel}>{t.fields.size}</span>
                    <p className={styles.fieldValue}>{content.size}</p>
                  </article>
                  <article className={styles.fieldCard}>
                    <span className={styles.fieldLabel}>{t.fields.price}</span>
                    <p className={styles.fieldValue}>{item.price}</p>
                  </article>
                  <article className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                    <span className={styles.fieldLabel}>{t.fields.notes}</span>
                    <p className={styles.fieldValue}>{content.notes}</p>
                    <p className={styles.fieldHint}>{t.hints.notes}</p>
                  </article>
                  <article className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                    <span className={styles.fieldLabel}>{t.fields.description}</span>
                    <p className={styles.fieldValue}>{content.description}</p>
                    <p className={styles.fieldHint}>{t.hints.description}</p>
                  </article>
                </div>
              </section>

              <section className={styles.sectionBlock}>
                <div className={styles.sectionTopline}>
                  <span className={styles.sectionLabel}>{t.sections.media}</span>
                </div>
                <div className={styles.mediaSingle}>
                  <div className={styles.mediaFrame}>
                    <Image
                      src={item.image}
                      alt={content.name}
                      fill
                      sizes="(max-width: 900px) 100vw, 48rem"
                      className={styles.mediaImage}
                    />
                  </div>
                  <p className={styles.sectionHint}>{t.hints.media}</p>
                </div>
              </section>

              <section className={styles.sectionBlock}>
                <div className={styles.sectionTopline}>
                  <span className={styles.sectionLabel}>{t.sections.details}</span>
                </div>
                <div className={styles.tableBlock}>
                  <div className={styles.tableHeader}>
                    <span>{t.fields.fields}</span>
                    <span>Value</span>
                  </div>
                  <div className={styles.tableBody}>
                    {content.details.map((detail) => (
                      <div key={detail.label} className={styles.tableRow}>
                        <span className={styles.tableKey}>{detail.label}</span>
                        <span className={styles.tableValue}>{detail.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className={styles.sectionHint}>{t.hints.details}</p>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const item = getEquipmentItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const content = getEquipmentItemContent(item, language);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/staff" className={styles.backLink}>
            {t.back}
          </Link>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
        </header>

        <section className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.status}</span>
              <div className={styles.badgeRow}>
                <span className={styles.badgeLive}>{t.labels.live}</span>
                <span className={styles.badgeNeutral}>
                  {content.status.includes("request") || content.status.includes("заказ")
                    ? t.labels.onRequest
                    : t.labels.inStock}
                </span>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.visibility}</span>
              <p className={styles.sidebarValue}>/equipment/{item.slug}</p>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.languages}</span>
              <p className={styles.sidebarValue}>{t.labels.ruEn}</p>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.slug}</span>
              <p className={styles.sidebarValue}>{item.slug}</p>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.source}</span>
              <p className={styles.sidebarValue}>{t.labels.catalogEquipment}</p>
            </div>

            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>{t.actions}</span>
              <div className={styles.actionStack}>
                <button type="button" className={styles.primaryAction}>
                  {t.saveDraft}
                </button>
                <button type="button" className={styles.secondaryAction}>
                  {t.preview}
                </button>
                <button type="button" className={styles.secondaryAction}>
                  {t.publish}
                </button>
                <button type="button" className={styles.secondaryAction}>
                  {t.archive}
                </button>
                <button type="button" className={styles.secondaryActionDanger}>
                  {t.remove}
                </button>
              </div>
            </div>
          </aside>

          <div className={styles.editor}>
            <section className={styles.heroCard}>
              <div className={styles.heroCopy}>
                <span className={styles.kindLabel}>{t.labels.equipment}</span>
                <h1 className={styles.pageTitle}>{item.name}</h1>
                <p className={styles.pageMeta}>
                  {equipmentBrandLabels[language][item.brand]} ·{" "}
                  {getEquipmentTypeLabel(item, language, t)}
                </p>
              </div>

              <div className={styles.heroMedia}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 24rem"
                  className={styles.heroImage}
                />
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionTopline}>
                <span className={styles.sectionLabel}>{t.sections.main}</span>
              </div>
              <div className={styles.formGrid}>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>{t.fields.title}</span>
                  <p className={styles.fieldValue}>{item.name}</p>
                  <p className={styles.fieldHint}>{t.hints.title}</p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>{t.fields.brand}</span>
                  <p className={styles.fieldValue}>
                    {equipmentBrandLabels[language][item.brand]}
                  </p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>{t.fields.type}</span>
                  <p className={styles.fieldValue}>
                    {getEquipmentTypeLabel(item, language, t)}
                  </p>
                </article>
                <article className={styles.fieldCard}>
                  <span className={styles.fieldLabel}>{t.fields.category}</span>
                  <p className={styles.fieldValue}>{content.category}</p>
                </article>
                <article className={`${styles.fieldCard} ${styles.fieldCardWide}`}>
                  <span className={styles.fieldLabel}>{t.fields.description}</span>
                  <p className={styles.fieldValue}>{content.description}</p>
                  <p className={styles.fieldHint}>{t.hints.description}</p>
                </article>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionTopline}>
                <span className={styles.sectionLabel}>{t.sections.media}</span>
              </div>
              <div className={styles.galleryGrid}>
                {item.images.slice(0, 6).map((image, index) => (
                  <div key={image} className={styles.galleryFrame}>
                    <Image
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 16rem"
                      className={styles.mediaImage}
                    />
                  </div>
                ))}
              </div>
              <p className={styles.sectionHint}>{t.hints.media}</p>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionTopline}>
                <span className={styles.sectionLabel}>{t.sections.details}</span>
              </div>
              <div className={styles.tableBlock}>
                <div className={styles.tableHeader}>
                  <span>{t.fields.fields}</span>
                  <span>Value</span>
                </div>
                <div className={styles.tableBody}>
                  {content.details.map((detail) => (
                    <div key={detail.label} className={styles.tableRow}>
                      <span className={styles.tableKey}>{detail.label}</span>
                      <span className={styles.tableValue}>{detail.value}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.sectionHint}>{t.hints.details}</p>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <div className={styles.sectionTopline}>
                <span className={styles.sectionLabel}>{t.sections.structure}</span>
              </div>
              <div className={styles.dualColumn}>
                <div className={styles.stackBlock}>
                  <span className={styles.fieldLabel}>{t.fields.features}</span>
                  <div className={styles.stackList}>
                    {content.features.map((feature) => (
                      <article key={feature.title} className={styles.stackCard}>
                        <h2 className={styles.stackTitle}>{feature.title}</h2>
                        <p className={styles.stackText}>{feature.description}</p>
                      </article>
                    ))}
                  </div>
                  <p className={styles.sectionHint}>{t.hints.features}</p>
                </div>

                <div className={styles.stackBlock}>
                  <span className={styles.fieldLabel}>{t.fields.specs}</span>
                  <div className={styles.stackList}>
                    {content.specifications.map((spec) => (
                      <article key={spec.label} className={styles.stackCard}>
                        <h2 className={styles.stackTitle}>{spec.label}</h2>
                        <p className={styles.stackText}>{spec.value}</p>
                      </article>
                    ))}
                  </div>
                  <p className={styles.sectionHint}>{t.hints.specs}</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
