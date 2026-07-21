import AboutSketo from "./components/AboutSketo";
import HomeHero from "./components/HomeHero";
import SeasonalMenu from "./components/SeasonalMenu";
import Footer from "./components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <HomeHero />

      <section id="quote-section" className={styles.quoteSection}>
        <div className={styles.quoteContent}>
          <p className={styles.quoteText}>
            Coffee is a pause that sharpens attention, slows time, and turns an
            ordinary conversation into something warm, precise, and memorable.
          </p>
        </div>
      </section>

      <AboutSketo />
      <SeasonalMenu />

      <Footer />
    </main>
  );
}
