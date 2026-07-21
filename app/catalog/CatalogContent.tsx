"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import CatalogCard from "./CatalogCard";
import { type CatalogFilter, catalogItems } from "./catalog-data";
import styles from "./catalog.module.css";

const filterLabels: Record<CatalogFilter, string> = {
  all: "All",
  profiles: "Profiles",
  decaf: "Decaf",
  microlot: "Microlot",
};

export default function CatalogContent() {
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.filters.includes(activeFilter);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${item.name} ${item.notes}`.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, deferredSearch]);

  const resultsLabel = `${filteredItems.length} ${
    filteredItems.length === 1 ? "lot" : "lots"
  }`;

  return (
    <main className={styles.page}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.homeLogo} aria-label="Sketo home">
            sketo.
          </Link>
          <LanguageSwitch />
        </div>

        <section className={styles.controls} aria-label="Поиск и фильтры">
          <div className={styles.searchBlock}>
            <label htmlFor="catalog-search" className={styles.controlLabel}>
              Search
            </label>
            <input
              id="catalog-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className={styles.searchInput}
              placeholder="Название или вкусовые ноты"
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>Filters</span>
            <div className={styles.filterRow}>
              {(Object.keys(filterLabels) as CatalogFilter[]).map((filter) => {
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
                    {filterLabels[filter]}
                  </button>
                );
              })}
            </div>
          </div>

          <p className={styles.resultsCount}>{resultsLabel}</p>
        </section>

        <section className={styles.grid} aria-label="Каталог зерна">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <CatalogCard key={item.name} item={item} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                Nothing found. Try another name, note, or filter.
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
