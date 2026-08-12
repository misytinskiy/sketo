"use client";

import AboutSketo from "./components/AboutSketo";
import Footer from "./components/Footer";
import HomeHero from "./components/HomeHero";
import MatchaFeature from "./components/MatchaFeature";
import SeasonalMenu from "./components/SeasonalMenu";
import SplitCatalogPromo from "./components/SplitCatalogPromo";
import { getContentLanguage } from "./components/language";
import usePersistentLanguage from "./components/usePersistentLanguage";
import styles from "./page.module.css";

type HomePageClientProps = {
  initialLanguage: "ru" | "en";
};

export default function HomePageClient({
  initialLanguage,
}: HomePageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);

  return (
    <main className={styles.page}>
      <HomeHero language={language} onLanguageChange={setLanguage} />

      <section id="quote-section" className={styles.quoteSection}>
        <div className={styles.quoteContent}>
          <p className={styles.quoteText}>
            {currentLanguage === "en"
              ? "Coffee is a pause that sharpens attention, slows down time, and turns an ordinary conversation into something warm, precise, and memorable."
              : "Кофе — это пауза, которая обостряет внимание, замедляет время и превращает обычный разговор в нечто теплое, точное и запоминающееся."}
          </p>
        </div>
      </section>

      <AboutSketo language={currentLanguage} />
      <SplitCatalogPromo language={currentLanguage} />
      <MatchaFeature language={currentLanguage} />
      <SeasonalMenu language={currentLanguage} />
      <Footer language={currentLanguage} />
    </main>
  );
}
