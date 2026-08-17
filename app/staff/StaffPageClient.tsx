"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import {
  catalogItems,
  getCatalogItemContent,
} from "../catalog/catalog-data";
import {
  equipmentBrandLabels,
  equipmentItems,
  getEquipmentItemContent,
} from "../catalog/equipment/equipment-data";
import styles from "./staff.module.css";

type StaffTab = "all" | "coffee" | "equipment";
type ProductStatus = "all" | "in_stock" | "out_of_stock" | "preorder";
type SortMode = "name" | "kind" | "status";
type WorkspaceMode = "overview" | "coffee" | "equipment";

type StaffProduct = {
  slug: string;
  kind: "coffee" | "equipment";
  name: string;
  image: string;
  meta: string;
  price?: string;
  status: Exclude<ProductStatus, "all">;
  href: string;
  hasTranslation: boolean;
  sourceLabel: string;
  updatedLabel: string;
};

const copy = {
  ru: {
    home: "Главная Sketo",
    panel: "Кабинет",
    subtitle: "Рабочее место для каталога и карточек товаров",
    backToSite: "На сайт",
    search: "Поиск",
    searchPlaceholder: "Название, описание или бренд",
    category: "Категория",
    statusLabel: "Наличие",
    sortLabel: "Сортировка",
    workspaceLabel: "Режим",
    tabs: {
      all: "Все позиции",
      coffee: "Кофе",
      equipment: "Оборудование",
    },
    workspaceTabs: {
      overview: "Обзор",
      coffee: "Кофе",
      equipment: "Оборудование",
    },
    statusTabs: {
      all: "Любой статус",
      in_stock: "В наличии",
      out_of_stock: "Нет в наличии",
      preorder: "Под заказ",
    },
    sort: {
      name: "По названию",
      kind: "По типу",
      status: "По статусу",
    },
    primaryActions: {
      addCoffee: "Добавить кофе",
      addEquipment: "Добавить оборудование",
    },
    quickActions: {
      import: "Импорт",
      export: "Экспорт",
      duplicate: "Дублировать",
      archive: "Архивировать",
    },
    staff: "Сотрудник",
    metrics: {
      total: "Всего позиций",
      coffee: "Кофе",
      equipment: "Оборудование",
      issues: "Требуют внимания",
    },
    queueTitle: "Сейчас в работе",
    queue: {
      coffee: "Обновление лотов, нот и цен",
      equipment: "Статусы поставки, галерея и характеристики",
      overview: "Быстрый контроль публикации и наличия",
    },
    results: (count: number) => `${count} ${getCountLabel(count, "ru")}`,
    selected: (count: number) =>
      count === 0 ? "Ничего не выбрано" : `Выбрано: ${count}`,
    empty: "Ничего не найдено. Попробуйте другой запрос или фильтр.",
    status: {
      in_stock: "В наличии",
      out_of_stock: "Нет в наличии",
      preorder: "Под заказ",
    },
    kind: {
      coffee: "Кофе",
      equipment: "Оборудование",
    },
    row: {
      publicPage: "Открыть страницу",
      edit: "Редактировать",
      translationReady: "RU/EN",
      translationMissing: "Только один язык",
      coffeeLot: "Лот",
      equipmentCard: "Карточка техники",
      priceLabel: "Цена",
      updated: "Обновлено",
      source: "Источник",
      availability: "Наличие",
      actions: "Действия",
    },
  },
  en: {
    home: "Sketo home",
    panel: "Staff panel",
    subtitle: "Workspace for catalog and product card operations",
    backToSite: "Back to site",
    search: "Search",
    searchPlaceholder: "Name, description, or brand",
    category: "Category",
    statusLabel: "Availability",
    sortLabel: "Sort",
    workspaceLabel: "Mode",
    tabs: {
      all: "All items",
      coffee: "Coffee",
      equipment: "Equipment",
    },
    workspaceTabs: {
      overview: "Overview",
      coffee: "Coffee",
      equipment: "Equipment",
    },
    statusTabs: {
      all: "Any status",
      in_stock: "In stock",
      out_of_stock: "Out of stock",
      preorder: "On request",
    },
    sort: {
      name: "By name",
      kind: "By type",
      status: "By status",
    },
    primaryActions: {
      addCoffee: "Add coffee",
      addEquipment: "Add equipment",
    },
    quickActions: {
      import: "Import",
      export: "Export",
      duplicate: "Duplicate",
      archive: "Archive",
    },
    staff: "Staff",
    metrics: {
      total: "Total items",
      coffee: "Coffee",
      equipment: "Equipment",
      issues: "Need attention",
    },
    queueTitle: "Current focus",
    queue: {
      coffee: "Lot refresh, tasting notes, and pricing",
      equipment: "Supply status, gallery, and specifications",
      overview: "Quick control of publishing and availability",
    },
    results: (count: number) => `${count} ${getCountLabel(count, "en")}`,
    selected: (count: number) =>
      count === 0 ? "Nothing selected" : `Selected: ${count}`,
    empty: "Nothing found. Try another query or filter.",
    status: {
      in_stock: "In stock",
      out_of_stock: "Out of stock",
      preorder: "On request",
    },
    kind: {
      coffee: "Coffee",
      equipment: "Equipment",
    },
    row: {
      publicPage: "Open page",
      edit: "Edit",
      translationReady: "RU/EN",
      translationMissing: "Single language",
      coffeeLot: "Lot",
      equipmentCard: "Equipment card",
      priceLabel: "Price",
      updated: "Updated",
      source: "Source",
      availability: "Availability",
      actions: "Actions",
    },
  },
} as const;

function getCountLabel(count: number, language: "ru" | "en") {
  if (language === "en") {
    return count === 1 ? "item" : "items";
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "товар";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "товара";
  }

  return "товаров";
}

function mapEquipmentStatus(statusLabel: string): Exclude<ProductStatus, "all"> {
  const normalized = statusLabel.toLowerCase();

  if (
    normalized.includes("нет в наличии") ||
    normalized.includes("out of stock")
  ) {
    return "out_of_stock";
  }

  if (normalized.includes("под заказ") || normalized.includes("on request")) {
    return "preorder";
  }

  return "in_stock";
}

function sortProducts(products: StaffProduct[], sortMode: SortMode) {
  const statusOrder: Record<Exclude<ProductStatus, "all">, number> = {
    out_of_stock: 0,
    preorder: 1,
    in_stock: 2,
  };

  return [...products].sort((left, right) => {
    if (sortMode === "kind") {
      return `${left.kind}-${left.name}`.localeCompare(
        `${right.kind}-${right.name}`,
      );
    }

    if (sortMode === "status") {
      return (
        statusOrder[left.status] - statusOrder[right.status] ||
        left.name.localeCompare(right.name)
      );
    }

    return left.name.localeCompare(right.name);
  });
}

type StaffPageClientProps = {
  initialLanguage: "ru" | "en";
};

export default function StaffPageClient({
  initialLanguage,
}: StaffPageClientProps) {
  const [language] = usePersistentLanguage(initialLanguage);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("overview");
  const [activeTab, setActiveTab] = useState<StaffTab>("all");
  const [activeStatus, setActiveStatus] = useState<ProductStatus>("all");
  const [sortMode, setSortMode] = useState<SortMode>("status");
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const deferredSearch = useDeferredValue(searchValue);
  const currentLanguage = getContentLanguage(language);
  const t = copy[currentLanguage];

  const effectiveTab: StaffTab =
    workspaceMode === "overview" ? activeTab : workspaceMode;

  const products = useMemo<StaffProduct[]>(() => {
    const coffeeProducts: StaffProduct[] = catalogItems.map((item, index) => {
      const content = getCatalogItemContent(item, currentLanguage);

      return {
        slug: item.slug,
        kind: "coffee",
        name: content.name,
        image: item.image,
        meta: `${content.size} · ${content.notes}`,
        price: item.price,
        status: "in_stock",
        href: `/catalog/${item.slug}`,
        hasTranslation: true,
        sourceLabel: currentLanguage === "en" ? "Coffee catalog" : "Каталог кофе",
        updatedLabel:
          currentLanguage === "en"
            ? `${Math.max(1, 8 - (index % 6))}d ago`
            : `${Math.max(1, 8 - (index % 6))} дн. назад`,
      };
    });

    const equipmentProducts: StaffProduct[] = equipmentItems.map((item, index) => {
      const content = getEquipmentItemContent(item, currentLanguage);

      return {
        slug: item.slug,
        kind: "equipment",
        name: item.name,
        image: item.image,
        meta: `${equipmentBrandLabels[currentLanguage][item.brand]} · ${content.category}`,
        status: mapEquipmentStatus(content.status),
        href: `/equipment/${item.slug}`,
        hasTranslation: true,
        sourceLabel:
          currentLanguage === "en" ? "Equipment catalog" : "Каталог оборудования",
        updatedLabel:
          currentLanguage === "en"
            ? `${Math.max(1, 5 - (index % 4))}d ago`
            : `${Math.max(1, 5 - (index % 4))} дн. назад`,
      };
    });

    return [...coffeeProducts, ...equipmentProducts];
  }, [currentLanguage]);

  const metrics = useMemo(
    () => ({
      total: products.length,
      coffee: products.filter((product) => product.kind === "coffee").length,
      equipment: products.filter((product) => product.kind === "equipment").length,
      issues: products.filter(
        (product) => product.status === "out_of_stock" || product.status === "preorder",
      ).length,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesTab = effectiveTab === "all" || product.kind === effectiveTab;
      const matchesStatus =
        activeStatus === "all" || product.status === activeStatus;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${product.name} ${product.meta} ${product.price ?? ""} ${product.sourceLabel}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesTab && matchesStatus && matchesSearch;
    });

    return sortProducts(nextProducts, sortMode);
  }, [activeStatus, deferredSearch, effectiveTab, products, sortMode]);

  const selectedCount = selectedIds.filter((id) =>
    filteredProducts.some((product) => `${product.kind}:${product.slug}` === id),
  ).length;

  function toggleSelection(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function toggleAllVisible() {
    const visibleIds = filteredProducts.map(
      (product) => `${product.kind}:${product.slug}`,
    );

    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  }

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedIds.includes(`${product.kind}:${product.slug}`),
    );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.brandBlock}>
              <Link href="/" className={styles.homeLogo} aria-label={t.home}>
                sketo.
              </Link>
              <div className={styles.panelMeta}>
                <p className={styles.panelLabel}>{t.panel}</p>
                <p className={styles.panelSubtitle}>{t.subtitle}</p>
              </div>
            </div>

            <div className={styles.headerActions}>
              <Link href="/" className={styles.backLink}>
                {t.backToSite}
              </Link>
              <div className={styles.staffBadge}>{t.staff}</div>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{t.metrics.total}</p>
              <p className={styles.metricValue}>{metrics.total}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{t.metrics.coffee}</p>
              <p className={styles.metricValue}>{metrics.coffee}</p>
            </article>
            <article className={styles.metricCard}>
              <p className={styles.metricLabel}>{t.metrics.equipment}</p>
              <p className={styles.metricValue}>{metrics.equipment}</p>
            </article>
            <article className={`${styles.metricCard} ${styles.metricCardAlert}`}>
              <p className={styles.metricLabel}>{t.metrics.issues}</p>
              <p className={styles.metricValue}>{metrics.issues}</p>
            </article>
          </div>

          <div className={styles.actionPanel}>
            <div className={styles.primaryActions}>
              <button type="button" className={styles.primaryButton}>
                {t.primaryActions.addCoffee}
              </button>
              <button type="button" className={styles.primaryButton}>
                {t.primaryActions.addEquipment}
              </button>
            </div>

            <div className={styles.utilityActions}>
              <button type="button" className={styles.secondaryButton}>
                {t.quickActions.import}
              </button>
              <button type="button" className={styles.secondaryButton}>
                {t.quickActions.export}
              </button>
            </div>
          </div>
        </header>

        <section
          className={styles.controls}
          aria-label={currentLanguage === "en" ? "Catalog filters" : "Фильтры каталога"}
        >
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBlock}>
              <p className={styles.controlLabel}>{t.workspaceLabel}</p>
              <div className={styles.workspaceNav}>
                {(Object.keys(t.workspaceTabs) as WorkspaceMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`${styles.workspaceButton} ${
                      workspaceMode === mode ? styles.workspaceButtonActive : ""
                    }`}
                    onClick={() => {
                      setWorkspaceMode(mode);
                      if (mode === "coffee" || mode === "equipment") {
                        setActiveTab(mode);
                      }
                    }}
                  >
                    {t.workspaceTabs[mode]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sidebarBlock}>
              <p className={styles.controlLabel}>{t.queueTitle}</p>
              <p className={styles.sidebarText}>{t.queue[workspaceMode]}</p>
            </div>

            <div className={styles.sidebarBlock}>
              <div className={styles.utilityActions}>
                <button type="button" className={styles.secondaryButton}>
                  {t.quickActions.import}
                </button>
                <button type="button" className={styles.secondaryButton}>
                  {t.quickActions.export}
                </button>
              </div>
            </div>
          </aside>

          <div className={styles.controlsMain}>
          <div className={styles.searchBlock}>
            <label htmlFor="staff-search" className={styles.controlLabel}>
              {t.search}
            </label>
            <input
              id="staff-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className={styles.searchInput}
              placeholder={t.searchPlaceholder}
            />
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filtersBlock}>
              <p className={styles.controlLabel}>{t.category}</p>
              <div className={styles.filterRow}>
                {(Object.keys(t.tabs) as StaffTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.filterChip} ${
                      effectiveTab === tab && workspaceMode === "overview"
                        ? styles.filterChipActive
                        : ""
                    }`}
                    onClick={() => {
                      setWorkspaceMode("overview");
                      setActiveTab(tab);
                    }}
                    disabled={workspaceMode !== "overview"}
                  >
                    {t.tabs[tab]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtersBlock}>
              <p className={styles.controlLabel}>{t.statusLabel}</p>
              <div className={styles.filterRow}>
                {(Object.keys(t.statusTabs) as ProductStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`${styles.filterChip} ${
                      activeStatus === status ? styles.filterChipActive : ""
                    }`}
                    onClick={() => setActiveStatus(status)}
                  >
                    {t.statusTabs[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>

          <div className={styles.sortBlock}>
            <label htmlFor="staff-sort" className={styles.controlLabel}>
              {t.sortLabel}
            </label>
            <select
              id="staff-sort"
              className={styles.sortSelect}
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
            >
              <option value="status">{t.sort.status}</option>
              <option value="name">{t.sort.name}</option>
              <option value="kind">{t.sort.kind}</option>
            </select>
          </div>
        </section>

        <section className={styles.listSection} aria-label={t.panel}>
          <div className={styles.listToolbar}>
            <button
              type="button"
              className={styles.selectAllButton}
              onClick={toggleAllVisible}
            >
              {allVisibleSelected
                ? currentLanguage === "en"
                  ? "Clear visible"
                  : "Снять видимые"
                : currentLanguage === "en"
                  ? "Select visible"
                  : "Выбрать видимые"}
            </button>

            <p className={styles.resultsCount}>{t.results(filteredProducts.length)}</p>

            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>{t.selected(selectedCount)}</span>
              <button type="button" className={styles.secondaryButton}>
                {t.quickActions.duplicate}
              </button>
              <button type="button" className={styles.secondaryButton}>
                {t.quickActions.archive}
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>{t.empty}</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {filteredProducts.map((product) => {
                const productId = `${product.kind}:${product.slug}`;
                const selected = selectedIds.includes(productId);

                return (
                  <li key={productId}>
                    <article className={styles.row}>
                      <label className={styles.checkboxWrap}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelection(productId)}
                          className={styles.checkbox}
                        />
                        <span className={styles.checkboxIndicator} />
                      </label>

                      <div className={styles.thumb}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className={styles.thumbImage}
                        />
                      </div>

                      <div className={styles.rowBody}>
                        <div className={styles.tableHead}>
                          <div className={styles.tableColMain}>
                            <span className={styles.rowFieldLabel}>{t.row.source}</span>
                          </div>
                          <div className={styles.tableCol}>
                            <span className={styles.rowFieldLabel}>{t.row.updated}</span>
                          </div>
                          <div className={styles.tableCol}>
                            <span className={styles.rowFieldLabel}>{t.row.availability}</span>
                          </div>
                          <div className={styles.tableCol}>
                            <span className={styles.rowFieldLabel}>
                              {product.price ? t.row.priceLabel : t.row.source}
                            </span>
                          </div>
                        </div>

                        <div className={styles.tableRow}>
                          <div className={styles.tableColMain}>
                            <div className={styles.rowTitleBlock}>
                              <div className={styles.rowMicro}>
                                <span className={styles.rowKind}>{t.kind[product.kind]}</span>
                                <span className={styles.rowType}>
                                  {product.kind === "coffee"
                                    ? t.row.coffeeLot
                                    : t.row.equipmentCard}
                                </span>
                              </div>
                              <h2 className={styles.rowTitle}>{product.name}</h2>
                              <p className={styles.rowMeta}>{product.meta}</p>
                            </div>
                          </div>

                          <div className={styles.tableCol}>
                            <span className={styles.rowFieldValue}>{product.updatedLabel}</span>
                          </div>

                          <div className={styles.tableCol}>
                            <span
                              className={`${styles.status} ${styles[`status_${product.status}`]}`}
                            >
                              {t.status[product.status]}
                            </span>
                          </div>

                          <div className={styles.tableCol}>
                            <span className={styles.rowFieldValue}>
                              {product.price ?? product.sourceLabel}
                            </span>
                          </div>
                        </div>

                        <div className={styles.rowBottom}>
                          <span
                            className={`${styles.translationBadge} ${
                              product.hasTranslation ? styles.translationReady : ""
                            }`}
                          >
                            {product.hasTranslation
                              ? t.row.translationReady
                              : t.row.translationMissing}
                          </span>
                        </div>
                      </div>

                      <div className={styles.rowActions}>
                        <span className={styles.rowFieldLabel}>{t.row.actions}</span>
                        <Link href={product.href} className={styles.textAction}>
                          {t.row.publicPage}
                        </Link>
                        <Link
                          href={`/staff/edit/${product.kind}/${product.slug}`}
                          className={styles.secondaryButton}
                        >
                          {t.row.edit}
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
