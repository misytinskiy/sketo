import Link from "next/link";
import Image from "next/image";
import type { Language } from "./LanguageSwitch";
import styles from "./Footer.module.css";

type FooterProps = {
  language: Exclude<Language, "kz">;
};

export default function Footer({ language }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <Link
          href="/"
          className={styles.footerLogo}
          aria-label={language === "en" ? "Sketo home" : "Главная Sketo"}
        >
          <Image
            src="/logo.PNG"
            alt="Sketo"
            width={220}
            height={88}
            className={styles.footerLogoImage}
          />
        </Link>
      </div>

      <div className={styles.footerColumns}>
        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>
            {language === "en" ? "Navigation" : "Навигация"}
          </p>
          <Link href="/catalog" className={styles.footerLink}>
            {language === "en" ? "Coffee" : "Кофе"}
          </Link>
          <Link href="/equipment" className={styles.footerLink}>
            {language === "en" ? "Equipment" : "Оборудование"}
          </Link>
          <Link href="/b2b" className={styles.footerLink}>
            B2B
          </Link>
          <Link href="/academy" className={styles.footerLink}>
            {language === "en" ? "Academy" : "Академия"}
          </Link>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>
            {language === "en" ? "Social" : "Соцсети"}
          </p>
          <a
            href="https://www.instagram.com/sketo.coffee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            className={styles.footerLink}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/c/77473835398"
            className={styles.footerLink}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>
            {language === "en" ? "Contact" : "Контакты"}
          </p>
          <Link href="/contacts" className={styles.footerLink}>
            {language === "en" ? "Contact page" : "Страница контактов"}
          </Link>
          <a
            href="https://maps.app.goo.gl/cFffiJuC9Q692hYv6"
            className={styles.footerLink}
            target="_blank"
            rel="noreferrer"
          >
            Google Maps
          </a>
          <p className={styles.footerText}>
            {language === "en"
              ? "Astana, 2 Mukhtar Auezov St."
              : "Астана, ул. Мухтара Ауэзова, 2"}
          </p>
          <a href="tel:+77473835398" className={styles.footerLink}>
            +7 747 383 5398
          </a>
        </div>
      </div>
    </footer>
  );
}
