"use client";
import Link from "next/link";
import { useDeferredValue } from "react";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import usePersistentLanguage from "../components/usePersistentLanguage";
import CatalogSkeleton from "../components/CatalogSkeleton";
import type { Language } from "../components/language";
import useCatalogViewState from "../catalog/useCatalogViewState";
import { accessoryContent, categoryLabel, groupAccessoriesByCategory, label, matchesStage, type Accessory, type Stage } from "./model";
import AccessoryCard from "./AccessoryCard";
import styles from "../catalog/equipment/equipment.module.css";
import local from "./accessories.module.css";

type View = { category: string; brand: string; search: string; expanded: boolean };
const initialState: View = { category: "all", brand: "all", search: "", expanded: false };
function parse(value: unknown): View | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<View>;
  return typeof v.category === "string" && typeof v.brand === "string" && typeof v.search === "string" && typeof v.expanded === "boolean" ? v as View : null;
}
export default function AccessoriesCatalog({ items, initialLanguage, stage }: { items: Accessory[]; initialLanguage: Language; stage?: Stage }) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const { state, setState, saveScrollPosition, isRestored } = useCatalogViewState({ storageKey: `sketo:catalog:accessories:v1:${stage || "all"}`, initialState, parse });
  const query = useDeferredValue(state.search).trim().toLocaleLowerCase();
  const scoped = stage ? items.filter(item => matchesStage(item.category, stage)) : items;
  const categories = [...new Set(scoped.map(item => item.category))];
  const brands = [...new Set(scoped.map(item => item.brand))];
  const category = categories.includes(state.category) ? state.category : "all";
  const brand = brands.includes(state.brand) ? state.brand : "all";
  const filtered = scoped.filter(item => {
    const content = accessoryContent(item, language);
    return (category === "all" || category === item.category) && (brand === "all" || brand === item.brand) &&
      `${content.name} ${content.description} ${item.brand} ${categoryLabel(item.category, language)} ${item.variants.map(v => `${v.sku} ${v.color}`).join(" ")}`.toLocaleLowerCase().includes(query);
  });
  const orderedItems = groupAccessoriesByCategory(filtered).flatMap(group => group.products);
  const visibleItems = state.expanded ? orderedItems : orderedItems.slice(0, 12);
  if (!isRestored) return <CatalogSkeleton filterCounts={[1, 6]} />;
  return <main className={styles.page}><div className={styles.contentShell}>
    <div className={styles.topBar}><Link href="/" className={styles.homeLogo} aria-label="Sketo">sketo.</Link><LanguageSwitch value={language} onChange={setLanguage} /></div>
    <section className={`${styles.controls} ${local.controls}`} aria-label={label(language, "Фильтры", "Filters", "Сүзгілер")}>
      <div className={styles.searchBlock}><label htmlFor="accessory-search" className={styles.controlLabel}>{label(language, "Поиск", "Search", "Іздеу")}</label>
        <input id="accessory-search" type="search" value={state.search} className={styles.searchInput} placeholder={label(language, "Название или артикул", "Name or SKU", "Атауы немесе артикулы")}
          onChange={e => setState(v => ({ ...v, search: e.target.value, expanded: false }))} /></div>
      <div className={styles.filtersBlock}><span className={styles.controlLabel}>{label(language, "Бренды", "Brands", "Брендтер")}</span><div className={styles.filterRow}>
        {["all", ...brands].map(b => <button type="button" key={b} aria-pressed={b === brand} className={`${styles.filterChip} ${b === brand ? styles.filterChipActive : ""}`} onClick={() => setState(v => ({ ...v, brand: b, expanded: false }))}>{b === "all" ? label(language, "Все", "All", "Барлығы") : b}</button>)}
      </div></div>
      <p className={styles.resultsCount} aria-live="polite">{stage ? label(language, "Найдено в подборке", "Found in collection", "Жинақтан табылды") : label(language, "Товаров", "Items", "Тауарлар")}: {filtered.length}</p>
      <div className={`${styles.filtersBlock} ${local.categories}`}><span className={styles.controlLabel}>{label(language, "Категории", "Categories", "Санаттар")}</span><div className={styles.filterRow}>
        {["all", ...categories].map(c => <button type="button" key={c} aria-pressed={c === category} className={`${styles.filterChip} ${c === category ? styles.filterChipActive : ""}`} onClick={() => setState(v => ({ ...v, category: c, expanded: false }))}>{c === "all" ? label(language, "Все", "All", "Барлығы") : categoryLabel(c, language)}</button>)}
      </div></div>
    </section>
    <section className={styles.grid} aria-label={label(language, "Каталог аксессуаров", "Accessory catalogue", "Аксессуарлар каталогы")}>
      {visibleItems.map(item => <AccessoryCard key={item.id} item={item} language={language} onNavigate={saveScrollPosition} />)}
      {!filtered.length && <div className={`${styles.emptyState} ${local.empty}`}><p className={styles.emptyStateText}>{items.length ? label(language, "Ничего не найдено. Попробуйте изменить фильтры.", "Nothing found. Try changing the filters.", "Ештеңе табылмады. Сүзгілерді өзгертіңіз.") : label(language, "Каталог скоро появится. Мы готовим аксессуары к публикации.", "Accessories are coming soon. We are preparing the catalogue.", "Аксессуарлар жақында пайда болады. Каталогты дайындап жатырмыз.")}</p></div>}
    </section>
    {!state.expanded && filtered.length > 12 && <div className={styles.catalogMore}><button className={styles.catalogMoreButton} onClick={() => setState(v => ({ ...v, expanded: true }))}><span className={styles.catalogMoreLabel}>{label(language, "Показать всё", "Show all", "Барлығын көрсету")}</span></button></div>}
  </div><Footer language={language} /></main>;
}
