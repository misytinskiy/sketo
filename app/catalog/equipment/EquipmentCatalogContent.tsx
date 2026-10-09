"use client";
import type { EquipmentCatalogCardItem } from "./equipment-db";

import Link from "next/link";
import { useDeferredValue, useMemo } from "react";
import Footer from "../../components/Footer";
import CatalogSkeleton from "../../components/CatalogSkeleton";
import LanguageSwitch from "../../components/LanguageSwitch";
import { getContentLanguage } from "../../components/language";
import usePersistentLanguage from "../../components/usePersistentLanguage";
import EquipmentCatalogCard from "./EquipmentCatalogCard";
import {
  type EquipmentBrand,
  type EquipmentType,
  equipmentBrandLabels,
  equipmentTypeLabels,
} from "./equipment-data";
import styles from "./equipment.module.css";
import useCatalogViewState from "../useCatalogViewState";

const INITIAL_CATALOG_SIZE = 8;
const EQUIPMENT_VIEW_STORAGE_KEY = "sketo:catalog:equipment-view:v1";
const HIDDEN_PUBLIC_BRANDS = new Set<EquipmentBrand>(["balenare", "allround"]);

type EquipmentCatalogViewState = {
  activeBrand: EquipmentBrand;
  activeType: EquipmentType;
  searchValue: string;
  isExpanded: boolean;
};

const initialCatalogViewState: EquipmentCatalogViewState = {
  activeBrand: "all",
  activeType: "all",
  searchValue: "",
  isExpanded: false,
};

function parseCatalogViewState(value: unknown): EquipmentCatalogViewState | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<EquipmentCatalogViewState>;
  const validBrands = Object.keys(equipmentBrandLabels.ru) as EquipmentBrand[];
  const validTypes = Object.keys(equipmentTypeLabels.ru) as EquipmentType[];

  if (
    !validBrands.includes(candidate.activeBrand as EquipmentBrand) ||
    !validTypes.includes(candidate.activeType as EquipmentType) ||
    typeof candidate.searchValue !== "string" ||
    typeof candidate.isExpanded !== "boolean"
  ) {
    return null;
  }

  return candidate as EquipmentCatalogViewState;
}

function getItemsLabel(count: number, language: "ru" | "en" | "kz") {
  if (language === "kz") return "тауар";
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

type EquipmentCatalogContentProps = {
  initialLanguage: "ru" | "en" | "kz";
  items: EquipmentCatalogCardItem[];
};

export default function EquipmentCatalogContent({
  initialLanguage,
  items,
}: EquipmentCatalogContentProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const { state, setState, saveScrollPosition, isRestored } = useCatalogViewState({
    storageKey: EQUIPMENT_VIEW_STORAGE_KEY,
    initialState: initialCatalogViewState,
    parse: parseCatalogViewState,
  });
  const { activeBrand, activeType, searchValue, isExpanded } = state;
  const deferredSearch = useDeferredValue(searchValue);
  const currentLanguage = getContentLanguage(language);
  const availableBrands = useMemo(
    () =>
      (Object.keys(equipmentBrandLabels.ru) as EquipmentBrand[]).filter(
        (brand) =>
          !HIDDEN_PUBLIC_BRANDS.has(brand) &&
          (brand === "all" || items.some((item) => item.brand === brand)),
      ),
    [items],
  );
  const availableTypes = useMemo(
    () =>
      (Object.keys(equipmentTypeLabels.ru) as EquipmentType[]).filter(
        (type) => type === "all" || items.some((item) => item.type === type),
      ),
    [items],
  );
  const selectedBrand = availableBrands.includes(activeBrand) ? activeBrand : "all";
  const selectedType = availableTypes.includes(activeType) ? activeType : "all";

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      const content = item.translations[currentLanguage];
      const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${item.name} ${content.category} ${content.description} ${
          equipmentBrandLabels[currentLanguage][item.brand]
        }`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesBrand && matchesType && matchesSearch;
    });
  }, [currentLanguage, deferredSearch, items, selectedBrand, selectedType]);

  const resultsLabel = `${filteredItems.length} ${getItemsLabel(
    filteredItems.length,
    currentLanguage,
  )}`;
  const visibleItems = isExpanded
    ? filteredItems
    : filteredItems.slice(0, INITIAL_CATALOG_SIZE);
  const hasMoreItems = filteredItems.length > INITIAL_CATALOG_SIZE && !isExpanded;

  if (!isRestored) return <CatalogSkeleton filterCounts={[10, 6]} />;

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
            currentLanguage === "kz" ? "Жабдықты іздеу және сүзгілер" : currentLanguage === "en"
              ? "Equipment search and filters"
              : "Поиск и фильтры оборудования"
          }
        >
          <div className={styles.searchBlock}>
            <label htmlFor="equipment-search" className={styles.controlLabel}>
              {currentLanguage === "kz" ? "Іздеу" : currentLanguage === "en" ? "Search" : "Поиск"}
            </label>
            <input
              id="equipment-search"
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
                currentLanguage === "kz" ? "Модель немесе санат" : currentLanguage === "en"
                  ? "Model or category"
                  : "Модель или категория"
              }
            />
          </div>

          <div className={styles.filtersBlock}>
            <span className={styles.controlLabel}>
              {currentLanguage === "kz" ? "Брендтер" : currentLanguage === "en" ? "Brands" : "Бренды"}
            </span>
            <div className={styles.filterRow}>
              {availableBrands.map(
                (brand) => {
                  const isActive = selectedBrand === brand;

                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          activeBrand: brand,
                          isExpanded: false,
                        }));
                      }}
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
              {currentLanguage === "kz" ? "Түрі" : currentLanguage === "en" ? "Type" : "Тип"}
            </span>
            <div className={styles.filterRow}>
              {availableTypes.map(
                (type) => {
                  const isActive = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          activeType: type,
                          isExpanded: false,
                        }));
                      }}
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
          id="equipment-catalog-grid"
          className={styles.grid}
          aria-label={
            currentLanguage === "kz" ? "Жабдық каталогы" : currentLanguage === "en" ? "Equipment catalog" : "Каталог оборудования"
          }
        >
          {filteredItems.length > 0 ? (
            visibleItems.map((item) => (
              <EquipmentCatalogCard
                key={item.slug}
                item={item}
                language={currentLanguage}
                onNavigate={saveScrollPosition}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                {currentLanguage === "kz" ? "Ештеңе табылмады. Басқа модельді, брендті немесе жабдық түрін қолданып көріңіз." : currentLanguage === "en"
                  ? "Nothing found. Try another model, brand, or equipment type."
                  : "Ничего не найдено. Попробуй другую модель, бренд или тип оборудования."}
              </p>
            </div>
          )}
        </section>

        {hasMoreItems ? (
          <div className={styles.catalogMore}>
            <button
              type="button"
              className={styles.catalogMoreButton}
              aria-controls="equipment-catalog-grid"
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
