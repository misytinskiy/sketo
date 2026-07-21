"use client";

import { useState } from "react";
import styles from "./lot.module.css";

const editorialTabs = [
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
] as const;

export default function LotEditorial() {
  const [activeTab, setActiveTab] = useState<(typeof editorialTabs)[number]["id"]>(
    editorialTabs[0].id
  );

  const currentTab =
    editorialTabs.find((tab) => tab.id === activeTab) ?? editorialTabs[0];

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
        <div className={styles.editorialTabs} role="tablist" aria-label="Lot editorial tabs">
          {editorialTabs.map((tab) => {
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
