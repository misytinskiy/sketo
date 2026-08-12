"use client";

import Link from "next/link";
import Footer from "../../../components/Footer";
import LanguageSwitch from "../../../components/LanguageSwitch";
import { getContentLanguage } from "../../../components/language";
import usePersistentLanguage from "../../../components/usePersistentLanguage";
import {
  equipmentBrandLabels,
  equipmentTypeLabels,
  type EquipmentItem,
  getEquipmentItemContent,
} from "../equipment-data";
import EquipmentMediaGallery from "./EquipmentMediaGallery";
import styles from "./equipment-item.module.css";

type EquipmentItemPageClientProps = {
  item: EquipmentItem;
  itemIndex: number;
  initialLanguage: "ru" | "en";
};

export default function EquipmentItemPageClient({
  item,
  itemIndex,
  initialLanguage,
}: EquipmentItemPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);
  const content = getEquipmentItemContent(item, currentLanguage);

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
          <Link href="/equipment" className={styles.backLink}>
            {currentLanguage === "en"
              ? "Back to equipment"
              : "Назад к оборудованию"}
          </Link>

          <div className={styles.techMeta}>
            <p className={styles.techMetaText}>
              {currentLanguage === "en" ? "ITEM" : "ТОВАР"}{" "}
              {(itemIndex + 1).toString().padStart(2, "0")}
            </p>
            <p className={styles.techMetaText}>
              {currentLanguage === "en" ? "ARTICLE" : "АРТИКУЛ"} /{" "}
              {item.slug.toUpperCase()}
            </p>
            <p className={styles.techMetaText}>
              {currentLanguage === "en" ? "GALLERY" : "ГАЛЕРЕЯ"} /{" "}
              {String(item.images.length).padStart(2, "0")}{" "}
              {currentLanguage === "en" ? "FRAMES" : "КАДРОВ"}
            </p>
          </div>

          <EquipmentMediaGallery
            images={item.images}
            name={item.name}
            language={currentLanguage}
          />

          <div className={styles.infoPanel}>
            <div className={styles.headline}>
              <h1 className={styles.title}>{item.name}</h1>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Overview" : "Обзор"}
              </p>
              <p className={styles.description}>{content.description}</p>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "en" ? "Configuration" : "Конфигурация"}
              </p>
              <div className={styles.detailsList}>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>
                    {currentLanguage === "en" ? "Brand" : "Бренд"}
                  </p>
                  <p className={styles.detailValue}>
                    {equipmentBrandLabels[currentLanguage][item.brand]}
                  </p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>
                    {currentLanguage === "en" ? "Type" : "Тип"}
                  </p>
                  <p className={styles.detailValue}>
                    {equipmentTypeLabels[currentLanguage][item.type]}
                  </p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>
                    {currentLanguage === "en" ? "Category" : "Категория"}
                  </p>
                  <p className={styles.detailValue}>{content.category}</p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>
                    {currentLanguage === "en" ? "Status" : "Статус"}
                  </p>
                  <p className={styles.detailValue}>{content.status}</p>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
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
          </div>
        </section>

        <section
          className={`${styles.sectionBlock} ${styles.sectionBlockFeatures}`}
        >
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>01</p>
            <h2 className={styles.sectionTitle}>
              {currentLanguage === "en"
                ? "essential features"
                : "ключевые особенности"}
            </h2>
          </div>

          <div className={styles.featuresGrid}>
            {content.features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>02</p>
            <h2 className={styles.sectionTitle}>
              {currentLanguage === "en"
                ? "technical specifications"
                : "технические характеристики"}
            </h2>
          </div>

          <div className={styles.specificationsList}>
            {content.specifications.map((specification) => (
              <div
                key={specification.label}
                className={styles.specificationRow}
              >
                <p className={styles.specificationLabel}>
                  {specification.label}
                </p>
                <p className={styles.specificationValue}>
                  {specification.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
