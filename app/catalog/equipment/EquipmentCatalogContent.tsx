"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Footer from "../../components/Footer";
import LanguageSwitch from "../../components/LanguageSwitch";
import EquipmentCatalogCard from "./EquipmentCatalogCard";
import {
  type EquipmentBrand,
  type EquipmentType,
  equipmentItems,
} from "./equipment-data";
import styles from "./equipment.module.css";

const brandLabels: Record<EquipmentBrand, string> = {
  all: "All",
  "la-marzocco": "La Marzocco",
  mahlkonig: "Mahlkonig",
  anfim: "Anfim",
  mazzer: "Mazzer",
  balenare: "Balenare",
  allround: "Allround",
  "victoria-arduino": "Victoria Arduino",
};

const typeLabels: Record<EquipmentType, string> = {
  all: "All",
  grinder: "Grinders",
  "espresso-machine": "Espresso machines",
};

export default function EquipmentCatalogContent() {
  const [activeBrand, setActiveBrand] = useState<EquipmentBrand>("all");
  const [activeType, setActiveType] = useState<EquipmentType>("all");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return equipmentItems.filter((item) => {
      const matchesBrand = activeBrand === "all" || item.brand === activeBrand;
      const matchesType = activeType === "all" || item.type === activeType;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${item.name} ${item.category} ${brandLabels[item.brand]}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesBrand && matchesType && matchesSearch;
    });
  }, [activeBrand, activeType, deferredSearch]);

  const resultsLabel = `${filteredItems.length} ${
    filteredItems.length === 1 ? "item" : "items"
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

        <section className={styles.controls} aria-label="Equipment search and filters">
          <div className={styles.searchBlock}>
            <label htmlFor="equipment-search" className={styles.controlLabel}>
              Search
            </label>
            <input
              id="equipment-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className={styles.searchInput}
              placeholder="Model or category"
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>Brands</span>
            <div className={styles.filterRow}>
              {(Object.keys(brandLabels) as EquipmentBrand[]).map((brand) => {
                const isActive = activeBrand === brand;

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setActiveBrand(brand)}
                    className={`${styles.filterChip} ${
                      isActive ? styles.filterChipActive : ""
                    }`}
                  >
                    {brandLabels[brand]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>Type</span>
            <div className={styles.filterRow}>
              {(Object.keys(typeLabels) as EquipmentType[]).map((type) => {
                const isActive = activeType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`${styles.filterChip} ${
                      isActive ? styles.filterChipActive : ""
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <p className={styles.resultsCount}>{resultsLabel}</p>
        </section>

        <section className={styles.grid} aria-label="Equipment catalog">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <EquipmentCatalogCard key={item.slug} item={item} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                Nothing found. Try another model name, brand, or equipment type.
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
