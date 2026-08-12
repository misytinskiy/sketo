"use client";

import styles from "../page.module.css";
import type { Language } from "./language";
import usePersistentLanguage from "./usePersistentLanguage";

const languages: Language[] = ["kz", "en", "ru"];

type LanguageSwitchProps = {
  value?: Language;
  onChange?: (language: Language) => void;
  disabledLanguages?: Language[];
};

export default function LanguageSwitch({
  value,
  onChange,
  disabledLanguages = ["kz"],
}: LanguageSwitchProps) {
  const [storedLanguage, setStoredLanguage] = usePersistentLanguage();
  const activeLanguage = value ?? storedLanguage;

  const handleChange = (language: Language) => {
    if (disabledLanguages.includes(language)) {
      return;
    }

    const normalizedLanguage = language === "en" ? "en" : "ru";

    if (onChange) {
      onChange(normalizedLanguage);
      return;
    }

    setStoredLanguage(normalizedLanguage);
  };

  return (
    <div className={styles.languageSwitch} aria-label="Language switcher">
      {languages.map((language, index) => {
        const isActive = activeLanguage === language;
        const isDisabled = disabledLanguages.includes(language);

        return (
          <div key={language} className={styles.languageGroup}>
            <button
              type="button"
              className={[
                isActive ? styles.languageActive : styles.languageOption,
                isDisabled ? styles.languageDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => handleChange(language)}
            >
              {language}
            </button>
            {index < languages.length - 1 ? (
              <span className={styles.languageDivider}>/</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
