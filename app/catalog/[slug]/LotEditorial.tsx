"use client";

import { useState } from "react";
import styles from "./lot.module.css";

type LotEditorialProps = {
  language: "ru" | "en";
};

const editorialTabs = {
  ru: [
    {
      id: "cup-note",
      label: "Нота чашки",
      content:
        "Мы выбираем кофе с ясной структурой, чистым послевкусием и выразительным, но читаемым профилем. Каждый лот в коллекции отбирается так, чтобы чашка оставалась точной, сбалансированной по сладости и понятной уже с первого глотка.",
    },
    {
      id: "origin",
      label: "Происхождение",
      content:
        "Для Sketo важно, чтобы происхождение кофе считывалось через разновидность, высоту произрастания и способ обработки. Нам интересны лоты, которые сохраняют региональный характер, будь то более яркий, цветочный профиль или глубокий, шоколадный.",
    },
    {
      id: "brew-guide",
      label: "Рецепт",
      content:
        "Этот кофе можно использовать как универсальный на каждый день: для фильтра начните со среднего помола, воды 92–94°C и соотношения 1:16. Для эспрессо возьмите базовый сбалансированный рецепт и подстройте его по вкусу, ориентируясь на сладость и чистоту чашки.",
    },
  ],
  en: [
    {
      id: "cup-note",
      label: "Cup note",
      content:
        "We select coffees with clear structure, a clean finish, and a profile that is expressive but easy to read. Every lot in the collection is chosen so the cup feels precise, balanced in sweetness, and understandable from the first sip.",
    },
    {
      id: "origin",
      label: "Origin",
      content:
        "For Sketo, origin should be readable through variety, altitude, and processing. We look for lots that keep a strong regional character, whether it appears as a brighter floral profile or a deeper chocolate-driven cup.",
    },
    {
      id: "brew-guide",
      label: "Recipe",
      content:
        "This coffee works well as an everyday versatile option: for filter start with a medium grind, 92–94°C water, and a 1:16 ratio. For espresso begin with a balanced base recipe and adjust toward sweetness and cup clarity.",
    },
  ],
} as const;

type EditorialTab = (typeof editorialTabs)["ru"][number];

export default function LotEditorial({ language }: LotEditorialProps) {
  const tabs = editorialTabs[language];
  const [activeTab, setActiveTab] = useState<EditorialTab["id"]>(tabs[0].id);

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section className={styles.editorialSection}>
      <div className={styles.editorialMedia}>
        <video
          className={styles.editorialVideo}
          src="/photo/catalog/catalogueItemVideo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      <div className={styles.editorialContent}>
        <div
          className={styles.editorialTabs}
          role="tablist"
          aria-label={
            language === "en" ? "Lot description tabs" : "Вкладки описания лота"
          }
        >
          {tabs.map((tab) => {
            const isActive = tab.id === currentTab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.editorialTab}${isActive ? ` ${styles.editorialTabActive}` : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className={styles.editorialTextPanel}>
          <p className={styles.editorialBody}>{currentTab.content}</p>
        </div>
      </div>
    </section>
  );
}
