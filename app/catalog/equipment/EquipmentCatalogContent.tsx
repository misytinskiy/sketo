"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Footer from "../../components/Footer";
import LanguageSwitch from "../../components/LanguageSwitch";
import usePersistentLanguage, {
  getContentLanguage,
} from "../../components/usePersistentLanguage";
import EquipmentCatalogCard from "./EquipmentCatalogCard";
import {
  type EquipmentBrand,
  type EquipmentType,
  equipmentBrandLabels,
  equipmentItems,
  equipmentTypeLabels,
  getEquipmentItemContent,
} from "./equipment-data";
import styles from "./equipment.module.css";

function getItemsLabel(count: number, language: "ru" | "en") {
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

export default function EquipmentCatalogContent() {
  const [language, setLanguage] = usePersistentLanguage();
  const [activeBrand, setActiveBrand] = useState<EquipmentBrand>("all");
  const [activeType, setActiveType] = useState<EquipmentType>("all");
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const currentLanguage = getContentLanguage(language);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return equipmentItems.filter((item) => {
      const content = getEquipmentItemContent(item, currentLanguage);
      const matchesBrand = activeBrand === "all" || item.brand === activeBrand;
      const matchesType = activeType === "all" || item.type === activeType;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${item.name} ${content.category} ${content.description} ${
          equipmentBrandLabels[currentLanguage][item.brand]
        }`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesBrand && matchesType && matchesSearch;
    });
  }, [activeBrand, activeType, currentLanguage, deferredSearch]);

  const resultsLabel = `${filteredItems.length} ${getItemsLabel(
    filteredItems.length,
    currentLanguage,
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
            currentLanguage === "en"
              ? "Equipment search and filters"
              : "Поиск и фильтры оборудования"
          }
        >
          <div className={styles.searchBlock}>
            <label htmlFor="equipment-search" className={styles.controlLabel}>
              {currentLanguage === "en" ? "Search" : "Поиск"}
            </label>
            <input
              id="equipment-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className={styles.searchInput}
              placeholder={
                currentLanguage === "en"
                  ? "Model or category"
                  : "Модель или категория"
              }
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>
              {currentLanguage === "en" ? "Brands" : "Бренды"}
            </span>
            <div className={styles.filterRow}>
              {(Object.keys(equipmentBrandLabels.ru) as EquipmentBrand[]).map(
                (brand) => {
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
                      {equipmentBrandLabels[currentLanguage][brand]}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>
              {currentLanguage === "en" ? "Type" : "Тип"}
            </span>
            <div className={styles.filterRow}>
              {(Object.keys(equipmentTypeLabels.ru) as EquipmentType[]).map(
                (type) => {
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
                      {equipmentTypeLabels[currentLanguage][type]}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <p className={styles.resultsCount}>{resultsLabel}</p>
        </section>

        <section
          className={styles.grid}
          aria-label={
            currentLanguage === "en" ? "Equipment catalog" : "Каталог оборудования"
          }
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <EquipmentCatalogCard
                key={item.slug}
                item={item}
                language={currentLanguage}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                {currentLanguage === "en"
                  ? "Nothing found. Try another model, brand, or equipment type."
                  : "Ничего не найдено. Попробуй другую модель, бренд или тип оборудования."}
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
