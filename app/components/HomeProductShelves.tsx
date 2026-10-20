"use client";

import Image from "next/image";
import Link from "next/link";
import usePersistentLanguage from "./usePersistentLanguage";
import type { Language } from "./language";
import type { Shelf, ShelfKind } from "./home-shelves-model";
import styles from "./home-product-shelves.module.css";

const copy = {
  ru: { title: "Выбирайте своё", label: "Sketo / В нашей коллекции", coffee: "Кофе", equipment: "Оборудование", accessories: "Аксессуары", links: ["Весь кофе", "Всё оборудование", "Все аксессуары"], empty: "Посмотрите ассортимент в каталоге" },
  en: { title: "Make it yours", label: "Sketo / In our collection", coffee: "Coffee", equipment: "Equipment", accessories: "Accessories", links: ["All coffee", "All equipment", "All accessories"], empty: "Explore the collection in our catalogue" },
  kz: { title: "Өзіңізге таңдаңыз", label: "Sketo / Біздің топтамада", coffee: "Кофе", equipment: "Жабдықтар", accessories: "Аксессуарлар", links: ["Барлық кофе", "Барлық жабдықтар", "Барлық аксессуарлар"], empty: "Каталогтағы ассортиментті қараңыз" },
};
const kinds: ShelfKind[] = ["coffee", "equipment", "accessories"];
const hrefs = { coffee: "/catalog", equipment: "/equipment", accessories: "/accessories" };
const displayOrder: ShelfKind[] = ["equipment", "coffee", "accessories"];
const showcaseNames: Record<string, string> = {
  "/catalog/colombia-jefferson-castano-250g": "Colombia Jefferson Castano",
};
const heading = {
  ru: { title: "Для вашего кофе", lead: "Хороший кофе начинается с деталей. Зёрна, оборудование и инструменты для вашей любимой чашки." },
  en: { title: "For your coffee", lead: "Good coffee starts with the details. Beans, equipment and tools for your favourite cup." },
  kz: { title: "Кофеңіз үшін", lead: "Жақсы кофе ұсақ-түйектен басталады. Сүйікті кофеңізге арналған дәндер, жабдықтар мен құралдар." },
};

export default function HomeProductShelves({ shelves = [], initialLanguage, loading = false }: {
  shelves?: Shelf[]; initialLanguage: Language; loading?: boolean;
}) {
  const [language] = usePersistentLanguage(initialLanguage);
  const text = copy[language];
  return (
    <section className={styles.section} aria-labelledby="home-collection-title" aria-busy={loading}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>In our collection</p>
        <h2 id="home-collection-title" className={styles.title}>{heading[language].title}</h2>
        <p className={styles.lead}>{heading[language].lead}</p>
      </header>
      <div className={styles.products}>
      {displayOrder.map(kind => {
        const product = shelves.find(shelf => shelf.kind === kind)?.products[0];
        const content = product?.content[language];
        return (
          <div className={styles.column} key={kind}>
              {loading ? <div className={styles.skeleton} aria-hidden="true" /> : product && content ? (
                  <Link href={product.href} className={styles.product}>
                    <div className={`${styles.image} ${
                      kind === "coffee" ? styles.coffeeImage
                        : kind === "accessories" ? styles.accessoryImage
                        : ""
                    }`}>
                      <Image src={product.image} alt="" fill sizes="(max-width: 700px) 90vw, 30vw" />
                    </div>
                    <div className={styles.productCopy}>
                      <p className={styles.category}>{text[kind]}</p>
                      <h3>{showcaseNames[product.href] ?? content.name}</h3>
                      {content.detail && <p className={styles.detail}>{content.detail}</p>}
                    </div>
                    <span className={styles.arrow} aria-hidden="true">↗</span>
                  </Link>
              ) : <div className={styles.empty}><h3>{text[kind]}</h3><p>{text.empty}</p></div>}
              <Link className={styles.catalogLink} href={hrefs[kind]}>
                {text.links[kinds.indexOf(kind)]} <span aria-hidden="true">↗</span>
              </Link>
          </div>
        );
      })}
      </div>
    </section>
  );
}
