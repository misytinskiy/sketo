"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Language } from "./LanguageSwitch";
import styles from "./SeasonalMenu.module.css";

const drinksByLanguage = {
  ru: [
    {
      name: "Cherry Bloom",
      image: "/photo/seasonMenu/cherryBloom.PNG",
      description:
        "Сочная вишня, спелое яблоко и легкое солодовое послевкусие. Напиток, напоминающий прогулку по летнему саду.",
    },
    {
      name: "Banana Tonic",
      image: "/photo/seasonMenu/bananaTonic.PNG",
      description:
        "Нежный банановый милк-панч, цитрусовая горчинка и освежающий тоник. Яркий и необычный вкус с легким оттенком ревеня.",
    },
    {
      name: "White Pine",
      image: "/photo/seasonMenu/whitePine.PNG",
      description:
        "Тропический ананас, цветочные ноты белого чая и легкий ботанический характер. Освежающий и элегантный напиток для жарких дней.",
    },
    {
      name: "Golden Osmanthus",
      image: "/photo/seasonMenu/goldenOsmanthus.PNG",
      description:
        "Османтус, Earl Grey и тонкие цитрусовые оттенки. Мягкий, цветочный и многослойный вкус для неспешных летних вечеров.",
    },
  ],
  en: [
    {
      name: "Cherry Bloom",
      image: "/photo/seasonMenu/cherryBloom.PNG",
      description:
        "Juicy cherry, ripe apple, and a light malty finish. A drink that feels like a walk through a summer garden.",
    },
    {
      name: "Banana Tonic",
      image: "/photo/seasonMenu/bananaTonic.PNG",
      description:
        "Soft banana milk punch, citrus bitterness, and refreshing tonic. Bright and unusual, with a subtle note of rhubarb.",
    },
    {
      name: "White Pine",
      image: "/photo/seasonMenu/whitePine.PNG",
      description:
        "Tropical pineapple, floral white tea notes, and a light botanical character. A refreshing and elegant drink for warm days.",
    },
    {
      name: "Golden Osmanthus",
      image: "/photo/seasonMenu/goldenOsmanthus.PNG",
      description:
        "Osmanthus, Earl Grey, and delicate citrus tones. Soft, floral, and layered for long unhurried summer evenings.",
    },
  ],
} as const;

type SeasonalMenuProps = {
  language: Exclude<Language, "kz">;
};

export default function SeasonalMenu({ language }: SeasonalMenuProps) {
  const drinks = drinksByLanguage[language];
  const [activeDrink, setActiveDrink] = useState<string>("");
  const sectionRef = useRef<HTMLElement | null>(null);
  const drinkMediaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousDrinkRef = useRef<string>("");

  useEffect(() => {
    const affectedDrink = activeDrink || previousDrinkRef.current;
    const affectedMedia = affectedDrink
      ? drinkMediaRefs.current[affectedDrink]
      : null;

    const refreshScroll = () => {
      ScrollTrigger.refresh();
    };

    const frameOne = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(refreshScroll);
    });
    const fallbackTimeout = window.setTimeout(refreshScroll, 380);

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (
        event.target !== affectedMedia ||
        event.propertyName !== "grid-template-rows"
      ) {
        return;
      }

      refreshScroll();
    };

    affectedMedia?.addEventListener("transitionend", handleTransitionEnd);
    previousDrinkRef.current = activeDrink;

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.clearTimeout(fallbackTimeout);
      affectedMedia?.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [activeDrink]);

  return (
    <section
      id="seasonal-menu-section"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="seasonal-menu-title"
    >
      <div className={styles.poster}>
        <div className={styles.content}>
          <div className={styles.mainColumn}>
            <div className={styles.topContent}>
              <div className={styles.headingBlock}>
                <p className={styles.eyebrow}>summer / 2026</p>
                <h2 id="seasonal-menu-title" className={styles.title}>
                  {language === "en" ? (
                    <>
                      Seasonal
                      <br />
                      menu
                    </>
                  ) : (
                    <>
                      Сезонное
                      <br />
                      меню
                    </>
                  )}
                </h2>
              </div>
              <div className={styles.leadBlock}>
                <p className={styles.lead}>
                  {language === "en"
                    ? "At sketo.coffee, we built a seasonal drink menu where every item carries its own mood: from juicy fruit brightness to delicate floral and tea-like notes. Light, refreshing, and full of character, these drinks are made for warm meetings and long conversations."
                    : "В sketo.coffee мы собрали сезонное меню напитков, где каждая позиция несет свое настроение: от сочной фруктовой свежести до тонких цветочных и чайных нот. Легкие, освежающие и с характером, эти напитки созданы для теплых встреч и долгих разговоров."}
                </p>
              </div>
            </div>

            <div className={styles.menuGrid}>
              {drinks.map((drink, index) => {
                const isActive = activeDrink === drink.name;

                return (
                  <button
                    key={drink.name}
                    type="button"
                    className={`${styles.drinkCard} ${
                      isActive ? styles.drinkCardActive : ""
                    }`}
                    onClick={() =>
                      setActiveDrink((current) =>
                        current === drink.name ? "" : drink.name
                      )
                    }
                    aria-expanded={isActive}
                  >
                    <div className={styles.drinkHeader}>
                      <div className={styles.drinkMetaRow}>
                        <p className={styles.drinkIndex}>
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <span className={styles.drinkExpand} aria-hidden="true" />
                      </div>
                      <div className={styles.drinkCopy}>
                        <h3 className={styles.drinkName}>{drink.name}</h3>
                        <p className={styles.drinkDescription}>
                          {drink.description}
                        </p>
                      </div>
                    </div>

                    <div
                      ref={(node) => {
                        drinkMediaRefs.current[drink.name] = node;
                      }}
                      className={`${styles.drinkMedia} ${
                        isActive ? styles.drinkMediaActive : ""
                      }`}
                    >
                      <div className={styles.drinkMediaInner}>
                        <div className={styles.drinkImageWrap}>
                          <Image
                            src={drink.image}
                            alt={drink.name}
                            width={1080}
                            height={1920}
                            sizes="(max-width: 900px) 100vw, 50vw"
                            className={styles.drinkImage}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className={styles.footerNote}>
              {language === "en"
                ? "Come by to taste, find your favorites, and spend the season with Sketo."
                : "Приходите пробовать, находить своих фаворитов и проводить сезон вместе со Sketo."}
            </p>
          </div>

          <div className={styles.mediaColumn}>
            <div className={styles.videoWrap}>
              <video
                className={styles.video}
                src="/video/seasonalMenu.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
