import HeroNavigation from "./components/HeroNavigation";
import Image from "next/image";
import LanguageSwitch from "./components/LanguageSwitch";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <header className={styles.topBar}>
          <LanguageSwitch />
        </header>

        <div className={styles.header}>
          <HeroNavigation />
        </div>

        <div className={styles.logoWrap}>
          <span className={styles.logo}>sketo.</span>
        </div>
      </section>

      <section className={styles.quoteSection}>
        <div className={styles.quoteContent}>
          <p className={styles.quoteText}>
            Coffee is a pause that sharpens attention, slows time, and turns an
            ordinary conversation into something warm, precise, and memorable.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image
            src="/logo.PNG"
            alt="Sketo"
            width={220}
            height={88}
            className={styles.footerLogo}
          />
        </div>

        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <p className={styles.footerTitle}>Navigation</p>
            <a href="/catalog" className={styles.footerLink}>
              Catalog
            </a>
            <a href="#about" className={styles.footerLink}>
              About
            </a>
            <a href="#academy" className={styles.footerLink}>
              Academy
            </a>
            <a href="#contacts" className={styles.footerLink}>
              Contact
            </a>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerTitle}>Social</p>
            <a href="https://instagram.com" className={styles.footerLink}>
              Instagram
            </a>
            <a href="https://t.me" className={styles.footerLink}>
              Telegram
            </a>
            <a href="https://wa.me" className={styles.footerLink}>
              WhatsApp
            </a>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerTitle}>Contact</p>
            <a href="mailto:hello@sketo.coffee" className={styles.footerLink}>
              hello@sketo.coffee
            </a>
            <a href="tel:+77000000000" className={styles.footerLink}>
              +7 700 000 00 00
            </a>
            <p className={styles.footerText}>Almaty, Kazakhstan</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
