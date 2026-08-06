"use client";

import Link from "next/link";
import type { Language } from "./LanguageSwitch";
import styles from "./SplitCatalogPromo.module.css";

const posterLinksByLanguage = {
  ru: [
    {
      href: "/academy",
      title: "академия",
      caption: "sketo academy",
      description: "программы, менторы, траектории обучения",
      tone: "academy",
      index: "01",
    },
    {
      href: "/b2b",
      title: "b2b",
      caption: "sketo for business",
      description: "запуск, рабочие процессы, системы обучения",
      tone: "b2b",
      index: "02",
    },
  ],
  en: [
    {
      href: "/academy",
      title: "academy",
      caption: "sketo academy",
      description: "programs, mentors, learning tracks",
      tone: "academy",
      index: "01",
    },
    {
      href: "/b2b",
      title: "b2b",
      caption: "sketo for business",
      description: "launch, workflows, training systems",
      tone: "b2b",
      index: "02",
    },
  ],
} as const;

type SplitCatalogPromoProps = {
  language: Exclude<Language, "kz">;
};

export default function SplitCatalogPromo({
  language,
}: SplitCatalogPromoProps) {
  const posterLinks = posterLinksByLanguage[language];

  return (
    <div className={styles.stack}>
      <section className={styles.variantSection} aria-labelledby="poster-title">
        <div className={styles.posterGrid}>
          {posterLinks.map((item) => (
            <Link
              key={`poster-${item.title}`}
              href={item.href}
              className={`${styles.posterCard} ${
                item.tone === "academy"
                  ? styles.posterCardAcademy
                  : styles.posterCardB2b
              }`}
            >
              <p
                className={`${styles.posterIndex} ${
                  item.tone === "academy"
                    ? styles.posterIndexAcademy
                    : styles.posterIndexB2b
                }`}
              >
                {item.index}
              </p>
              <div
                className={`${styles.posterBody} ${
                  item.tone === "academy"
                    ? styles.posterBodyAcademy
                    : styles.posterBodyB2b
                }`}
              >
                <p className={styles.posterCaption}>{item.caption}</p>
                <h2
                  id="poster-title"
                  className={`${styles.posterTitle} ${
                    item.tone === "academy"
                      ? styles.posterTitleAcademy
                      : styles.posterTitleB2b
                  }`}
                >
                  {item.title}
                </h2>
                <div className={styles.posterFooterRow}>
                  <p className={styles.posterDescription}>{item.description}</p>
                  <span
                    className={`${styles.posterArrow} ${
                      item.tone === "academy"
                        ? styles.posterArrowAcademy
                        : styles.posterArrowB2b
                    }`}
                  >
                    {language === "en" ? "open" : "открыть"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
