"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import CatalogCard from "./CatalogCard";
import {
  type CatalogFilter,
  catalogItems,
  getCatalogItemContent,
} from "./catalog-data";
import styles from "./catalog.module.css";

const filterLabels = {
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
} satisfies Record<"ru" | "en", Record<CatalogFilter, string>>;

function getLotsLabel(count: number, language: "ru" | "en") {
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
  initialLanguage: "ru" | "en";
};

export default function CatalogContent({
  initialLanguage,
}: CatalogContentProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const currentLanguage = getContentLanguage(language);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const content = getCatalogItemContent(item, currentLanguage);
      const matchesFilter =
        activeFilter === "all" || item.filters.includes(activeFilter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${content.name} ${content.notes}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, currentLanguage, deferredSearch]);

  const resultsLabel = `${filteredItems.length} ${getLotsLabel(
    filteredItems.length,
    currentLanguage
  )}`;

  return (
    <main className={styles.page}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <Link
            href="/"
            className={styles.homeLogo}
            aria-label={currentLanguage === "en" ? "Sketo home" : "Главная Sketo"}
          >
            sketo.
          </Link>
          <LanguageSwitch value={language} onChange={setLanguage} />
        </div>

        <section
          className={styles.controls}
          aria-label={
            currentLanguage === "en" ? "Search and filters" : "Поиск и фильтры"
          }
        >
          <div className={styles.searchBlock}>
            <label htmlFor="catalog-search" className={styles.controlLabel}>
              {currentLanguage === "en" ? "Search" : "Поиск"}
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className={styles.searchInput}
              placeholder={
                currentLanguage === "en"
                  ? "Name or tasting notes"
                  : "Название или вкусовые ноты"
              }
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>
              {currentLanguage === "en" ? "Filters" : "Фильтры"}
            </span>
            <div className={styles.filterRow}>
              {(Object.keys(filterLabels.ru) as CatalogFilter[]).map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
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
          className={styles.grid}
          aria-label={currentLanguage === "en" ? "Coffee catalog" : "Каталог зерна"}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <CatalogCard key={item.slug} item={item} language={currentLanguage} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                {currentLanguage === "en"
                  ? "Nothing found. Try another name, note, or filter."
                  : "Ничего не найдено. Попробуй другое название, ноты или фильтр."}
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
