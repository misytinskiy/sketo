"use client";

import Link from "next/link";
import Footer from "../../components/Footer";
import LanguageSwitch from "../../components/LanguageSwitch";
import { getContentLanguage } from "../../components/language";
import usePersistentLanguage from "../../components/usePersistentLanguage";
import {
  type CatalogItem,
  getCatalogItemContent,
} from "../catalog-data";
import LotEditorial from "./LotEditorial";
import LotMedia from "./LotMedia";
import styles from "./lot.module.css";

type LotPageClientProps = {
  item: CatalogItem;
  itemIndex: number;
  initialLanguage: "ru" | "en";
};

export default function LotPageClient({
  item,
  itemIndex,
  initialLanguage,
}: LotPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);
  const content = getCatalogItemContent(item, currentLanguage);

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

        <section className={styles.layout}>
          <Link href="/catalog" className={styles.backLink}>
            {currentLanguage === "en" ? "Back to catalog" : "Назад в каталог"}
          </Link>

          <div className={styles.techMeta}>
            <p className={styles.techMetaText}>
              {currentLanguage === "en" ? "LOT" : "ЛОТ"}{" "}
              {(itemIndex + 1).toString().padStart(2, "0")}
            </p>
            <p className={styles.techMetaText}>
              {currentLanguage === "en" ? "ARTICLE" : "АРТИКУЛ"} /{" "}
              {item.slug.toUpperCase()}
            </p>
            <p className={styles.techMetaText}>SKETO COFFEE COMPANY</p>
          </div>

          <LotMedia
            image={item.image}
            name={content.name}
            language={currentLanguage}
          />

          <div className={styles.infoPanel}>
            <div className={styles.headline}>
              <h1 className={styles.title}>{content.name}</h1>
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Description" : "Описание"}
              </p>
              <p className={styles.description}>{content.description}</p>
            </div>

            <div className={styles.notesCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Notes" : "Ноты"}
              </p>
              <p className={styles.notesText}>{content.notes}</p>
            </div>

            <div className={styles.detailsCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Details" : "Детали"}
              </p>
              <div className={styles.detailsList}>
                {content.details.map((detail) => (
                  <div key={detail.label} className={styles.detailRow}>
                    <p className={styles.detailLabel}>{detail.label}</p>
                    <p className={styles.detailValue}>{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Price / Weight" : "Цена / Вес"}
              </p>
              <div className={styles.priceLine}>
                <p className={styles.price}>{item.price}</p>
                <p className={styles.size}>{content.size}</p>
              </div>
            </div>
          </div>
        </section>

        <LotEditorial language={currentLanguage} />
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
