"use client";
import LocalizedText from "@/app/components/LocalizedText";


import {
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Language } from "./language";
import styles from "./SeasonalMenu.module.css";

const seasonalImages = {
  pear: { image: "/photo/seasonMenu/груша-розмарин.PNG", width: 1086, height: 1448 },
  cocoa: { image: "/photo/seasonMenu/какао-фундук.JPG", width: 4000, height: 6000 },
  citrus: { image: "/photo/seasonMenu/фильтр-цитрус.JPG", width: 4000, height: 6000 },
  pumpkin: { image: "/photo/seasonMenu/пампкин-матча-латте.JPG", width: 6000, height: 4000 },
} as const;

const drinksByLanguage = {
  kz: [
    {
      name: "Алмұрт — розмарин",
      ...seasonalImages.pear,
      description:
        "Алмұрт езбесі мен розмарин қосылған шу пуэр. Жемістің жұмсақ тәттілігі, шайдың ағаш ноталары және балғын шөп хош иісі.",
    },
    {
      name: "Какао — орман жаңғағы",
      ...seasonalImages.cocoa,
      description:
        "Орман жаңғағы пастасы, лимон қабығы және үгітілген жаңғақ қосылған қою какао. Барқыттай жұмсақ, шоколадты әрі жаңғақ дәмі қанық.",
    },
    {
      name: "Цитрусты сүзгі кофе",
      ...seasonalImages.citrus,
      description:
        "Нәзік апельсин көбігі мен балғын қабығы қосылған қара сүзгі кофе. Айқын кофе дәмі, цитрус тәттілігі және жеңіл ащылық.",
    },
    {
      name: "Асқабақ матча латте",
      ...seasonalImages.pumpkin,
      description:
        "Асқабақ көбігі, кілегей және үйеңкі шәрбаты қосылған сүтті матча. Нәзік кілегейлі дәм мен асқабақтың жұмсақ тәттілігі.",
    },
  ],
  ru: [
    {
      name: "Груша — розмарин",
      ...seasonalImages.pear,
      description:
        "Шу пуэр с грушевым пюре и розмарином. Мягкая фруктовая сладость, древесные ноты чая и свежий травяной аромат.",
    },
    {
      name: "Какао — фундук",
      ...seasonalImages.cocoa,
      description:
        "Насыщенное какао с фундуковой пастой, лимонной цедрой и тёртым фундуком. Бархатистый, шоколадный и по-настоящему ореховый вкус.",
    },
    {
      name: "Фильтр «Цитрус»",
      ...seasonalImages.citrus,
      description:
        "Чёрный фильтр-кофе с нежной апельсиновой пенкой и свежей цедрой. Яркий кофейный вкус с цитрусовой сладостью и лёгкой горчинкой.",
    },
    {
      name: "Пампкин матча латте",
      ...seasonalImages.pumpkin,
      description:
        "Матча на молоке с тыквенной пенкой, сливками и кленовым сиропом. Нежный сливочный вкус с мягкой сладостью тыквы.",
    },
  ],
  en: [
    {
      name: "Pear — Rosemary",
      ...seasonalImages.pear,
      description:
        "Shu pu-erh with pear purée and rosemary. Gentle fruit sweetness, woody tea notes and a fresh herbal aroma.",
    },
    {
      name: "Cocoa — Hazelnut",
      ...seasonalImages.cocoa,
      description:
        "Rich cocoa with hazelnut paste, lemon zest and grated hazelnut. Velvety, chocolatey and deeply nutty.",
    },
    {
      name: "Citrus Filter",
      ...seasonalImages.citrus,
      description:
        "Black filter coffee with delicate orange foam and fresh zest. Bright coffee flavour with citrus sweetness and a light bitterness.",
    },
    {
      name: "Pumpkin Matcha Latte",
      ...seasonalImages.pumpkin,
      description:
        "Matcha with milk, pumpkin foam, cream and maple syrup. A soft, creamy taste with the gentle sweetness of pumpkin.",
    },
  ],
} as const;

type SeasonalMenuProps = {
  language: Language;
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
                <p className={styles.eyebrow}>{language === "kz" ? "күз / 2026" : language === "en" ? "autumn / 2026" : "осень / 2026"}</p>
                <h2 id="seasonal-menu-title" className={styles.title}>
                  {language === "kz" ? (
                    <>
                      <LocalizedText text="Сезонное" /><br />
                      <LocalizedText text="меню" /></>
                  ) : language === "en" ? (
                    <>
                      Seasonal
                      <br />
                      menu
                    </>
                  ) : (
                    <>
                      <LocalizedText text="Сезонное" /><br />
                      <LocalizedText text="меню" /></>
                  )}
                </h2>
              </div>
              <div className={styles.leadBlock}>
                <p className={styles.lead}>
                  {language === "kz" ? "Жаңа күзгі сусындар мәзірде. Алмұрт пен розмарин, жаңғақты какао, цитрусты кофе және асқабақты матча — таныс дәмдер жаңаша ашылатын төрт үйлесім." : language === "en"
                    ? "Our autumn specials are here: four fresh combinations that give familiar flavours a new character — pear and rosemary, hazelnut cocoa, citrus coffee and pumpkin matcha."
                    : "Новые осенние напитки уже в меню. Четыре сочетания, в которых знакомые вкусы раскрываются по-новому: груша с розмарином, какао с фундуком, цитрусовый кофе и тыквенная матча."}
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
                            width={drink.width}
                            height={drink.height}
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
              {language === "kz" ? "Күзіңізге арналған төрт көңіл күй. Келіп дәм татып, сүйікті сусыныңызды табыңыз." : language === "en"
                ? "Four different moods for your autumn. Come by, taste them and find your favourite."
                : "Четыре разных настроения для вашей осени. Приходите пробовать и находить своего фаворита."}
            </p>
          </div>

          <div className={styles.mediaColumn}>
            <div className={styles.videoWrap}>
              <video
                className={styles.video}
                src="/photo/seasonMenu/autumn-2026.mp4"
                poster="/photo/seasonMenu/груша-розмарин.PNG"
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
