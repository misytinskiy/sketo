"use client";

import { useState } from "react";
import styles from "../page.module.css";

type Language = "kz" | "en" | "ru";

const languages: Language[] = ["kz", "en", "ru"];

export default function LanguageSwitch() {
  const [activeLanguage, setActiveLanguage] = useState<Language>("kz");

  return (
    <div className={styles.languageSwitch} aria-label="Переключение языка">
      {languages.map((language, index) => (
        <div key={language} className={styles.languageGroup}>
          <button
            type="button"
            className={
              activeLanguage === language
                ? styles.languageActive
                : styles.languageOption
            }
            aria-pressed={activeLanguage === language}
            onClick={() => setActiveLanguage(language)}
          >
            {language}
          </button>
          {index < languages.length - 1 ? (
            <span className={styles.languageDivider}>/</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
