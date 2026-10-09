"use client";
import type { CoffeeCatalogCardItem } from "./catalog-db";

import Link from "next/link";
import { useDeferredValue, useMemo } from "react";
import Footer from "../components/Footer";
import CatalogSkeleton from "../components/CatalogSkeleton";
import LanguageSwitch from "../components/LanguageSwitch";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import CatalogCard from "./CatalogCard";
import type { CatalogFilter } from "./catalog-data";
import useCatalogViewState from "./useCatalogViewState";
import styles from "./catalog.module.css";

const INITIAL_CATALOG_SIZE = 8;
const CATALOG_VIEW_STORAGE_KEY = "sketo:catalog:coffee-view:v1";

type CoffeeCatalogViewState = {
  activeFilter: CatalogFilter;
  searchValue: string;
  isExpanded: boolean;
};

const initialCatalogViewState: CoffeeCatalogViewState = {
  activeFilter: "all",
  searchValue: "",
  isExpanded: false,
};

function parseCatalogViewState(value: unknown): CoffeeCatalogViewState | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<CoffeeCatalogViewState>;
  const validFilters: CatalogFilter[] = ["all", "profiles", "decaf", "microlot"];

  if (
    !validFilters.includes(candidate.activeFilter as CatalogFilter) ||
    typeof candidate.searchValue !== "string" ||
    typeof candidate.isExpanded !== "boolean"
  ) {
    return null;
  }

  return candidate as CoffeeCatalogViewState;
}

const filterLabels = {
  kz: {
    all: "Барлығы",
    profiles: "Профильдер",
    decaf: "Декаф",
    microlot: "Микролоттар",
  },
  ru: {
    all: "Все",
    profiles: "Профили",
    decaf: "Декаф",
    microlot: "Микролоты",
  },
  en: {
    all: "All",
    profiles: "Profiles",
    decaf: "Decaf",
    microlot: "Microlots",
  },
} satisfies Record<"ru" | "en" | "kz", Record<CatalogFilter, string>>;

function getLotsLabel(count: number, language: "ru" | "en" | "kz") {
  if (language === "kz") return "лот";
  if (language === "en") {
    return count === 1 ? "lot" : "lots";
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "лот";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "лота";
  }

  return "лотов";
};

type CatalogContentProps = {
  initialLanguage: "ru" | "en" | "kz";
  items: CoffeeCatalogCardItem[];
};

export default function CatalogContent({
  initialLanguage,
  items,
}: CatalogContentProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const { state, setState, saveScrollPosition, isRestored } = useCatalogViewState({
    storageKey: CATALOG_VIEW_STORAGE_KEY,
    initialState: initialCatalogViewState,
    parse: parseCatalogViewState,
  });
  const { activeFilter, searchValue, isExpanded } = state;
  const deferredSearch = useDeferredValue(searchValue);
  const currentLanguage = getContentLanguage(language);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      const content = item.translations[currentLanguage];
      const matchesFilter =
        activeFilter === "all" || item.filters.includes(activeFilter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${content.name} ${content.notes}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, currentLanguage, deferredSearch, items]);

  const resultsLabel = `${filteredItems.length} ${getLotsLabel(
    filteredItems.length,
    currentLanguage
  )}`;
  const visibleItems = isExpanded
    ? filteredItems
    : filteredItems.slice(0, INITIAL_CATALOG_SIZE);
  const hasMoreItems = filteredItems.length > INITIAL_CATALOG_SIZE && !isExpanded;

  // Mount the filter buttons with their restored styles, avoiding a transition
  // from the server's default selection (including streamed HTML before hydration).
  if (!isRestored) return <CatalogSkeleton filterCounts={[4]} />;

  return (
    <main className={styles.page}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <Link
            href="/"
            className={styles.homeLogo}
            aria-label={currentLanguage === "kz" ? "Sketo басты беті" : currentLanguage === "en" ? "Sketo home" : "Главная Sketo"}
          >
            sketo.
          </Link>
          <LanguageSwitch value={language} onChange={setLanguage} />
        </div>

        <section
          className={styles.controls}
          aria-label={
            currentLanguage === "kz" ? "Іздеу және сүзгілер" : currentLanguage === "en" ? "Search and filters" : "Поиск и фильтры"
          }
        >
          <div className={styles.searchBlock}>
            <label htmlFor="catalog-search" className={styles.controlLabel}>
              {currentLanguage === "kz" ? "Іздеу" : currentLanguage === "en" ? "Search" : "Поиск"}
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchValue}
              onChange={(event) => {
                setState((current) => ({
                  ...current,
                  searchValue: event.target.value,
                  isExpanded: false,
                }));
              }}
              className={styles.searchInput}
              placeholder={
                currentLanguage === "kz" ? "Атауы немесе дәм ноталары" : currentLanguage === "en"
                  ? "Name or tasting notes"
                  : "Название или вкусовые ноты"
              }
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>
              {currentLanguage === "kz" ? "Сүзгілер" : currentLanguage === "en" ? "Filters" : "Фильтры"}
            </span>
            <div className={styles.filterRow}>
              {(Object.keys(filterLabels.ru) as CatalogFilter[]).map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        activeFilter: filter,
                        isExpanded: false,
                      }));
                    }}
                    className={`${styles.filterChip} ${
                      isActive ? styles.filterChipActive : ""
                    }`}
                  >
                    {filterLabels[currentLanguage][filter]}
                  </button>
                );
              })}
            </div>
          </div>

          <p className={styles.resultsCount}>{resultsLabel}</p>
        </section>

        <section
          id="coffee-catalog-grid"
          className={styles.grid}
          aria-label={currentLanguage === "kz" ? "Кофе дәндерінің каталогы" : currentLanguage === "en" ? "Coffee catalog" : "Каталог зерна"}
        >
          {filteredItems.length > 0 ? (
            visibleItems.map((item) => (
              <CatalogCard
                key={item.slug}
                item={item}
                language={currentLanguage}
                onNavigate={saveScrollPosition}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                {currentLanguage === "kz" ? "Ештеңе табылмады. Басқа атауды, дәм ноталарын немесе сүзгіні қолданып көріңіз." : currentLanguage === "en"
                  ? "Nothing found. Try another name, note, or filter."
                  : "Ничего не найдено. Попробуй другое название, ноты или фильтр."}
              </p>
            </div>
          )}
        </section>

        {hasMoreItems ? (
          <div className={styles.catalogMore}>
            <button
              type="button"
              className={styles.catalogMoreButton}
              aria-controls="coffee-catalog-grid"
              aria-expanded={isExpanded}
              onClick={() => setState((current) => ({ ...current, isExpanded: true }))}
            >
              <span className={styles.catalogMoreLabel}>
                {currentLanguage === "kz"
                  ? "Барлығын көрсету"
                  : currentLanguage === "en"
                    ? "Show all"
                    : "Показать всё"}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
