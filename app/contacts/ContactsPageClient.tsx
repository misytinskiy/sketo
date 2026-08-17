"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import styles from "./contacts.module.css";

const mapLink = "https://maps.app.goo.gl/cFffiJuC9Q692hYv6";
const mapEmbed =
  "https://www.google.com/maps?q=Mukhtar%20Auezov%20St%202%2C%20Astana%2C%20Kazakhstan&z=16&output=embed";

type ContactsPageClientProps = {
  initialLanguage: "ru" | "en";
};

export default function ContactsPageClient({
  initialLanguage,
}: ContactsPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.topControls}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.backLabel}>
              {currentLanguage === "en" ? "back" : "назад"}
            </span>
          </Link>

          <LanguageSwitch value={language} onChange={setLanguage} />
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>
              {currentLanguage === "en" ? "visit\nsketo" : "visit\nsketo"}
            </h1>
          </div>

          <div className={styles.infoPanel}>
            <div className={styles.copy}>
              <p className={styles.addressLead}>
                {currentLanguage === "en"
                  ? "Mukhtar Auezov St 2"
                  : "ул. Мухтара Ауэзова, 2"}
              </p>
              <p className={styles.lead}>
                {currentLanguage === "en"
                  ? "Cafe, beans, takeaway, and delivery in one place. Everything you need to find the space quickly and get there without extra steps is collected here."
                  : "Кофейня, зерно, takeaway и доставка в одном месте. Всё, что нужно, чтобы быстро найти пространство и без лишних шагов добраться до него, собрано здесь."}
              </p>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "en" ? "city" : "город"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "en"
                    ? "Astana, Kazakhstan"
                    : "Астана, Казахстан"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "en" ? "phone" : "телефон"}
                </p>
                <a href="tel:+77473835398" className={styles.detailValueLink}>
                  +7 747 383 53 98
                </a>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "en" ? "hours" : "часы работы"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "en"
                    ? "08:00 - 22:00 / every day"
                    : "08:00 - 22:00 / каждый день"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "en" ? "format" : "формат"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "en"
                    ? "coffee / takeaway / beans"
                    : "кофе / takeaway / зерно"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "en" ? "details" : "детали"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "en"
                    ? "brew bar, beans, delivery, equipment consulting"
                    : "brew bar, зерно, доставка, консультации по оборудованию"}
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className={styles.primaryLink}
              >
                {currentLanguage === "en"
                  ? "open in Google Maps"
                  : "открыть в Google Maps"}
              </a>
            </div>

            <p className={styles.note}>
              {currentLanguage === "en"
                ? "Open daily from 08:00 to 22:00 for coffee, beans, takeaway, and equipment consultations."
                : "Открыты ежедневно с 08:00 до 22:00 для кофе, зерна, takeaway и консультаций по оборудованию."}
            </p>
          </div>
        </div>

        <div className={styles.mapPanel}>
          <iframe
            title={
              currentLanguage === "en"
                ? "Sketo Coffee Company map"
                : "Карта Sketo Coffee Company"
            }
            src={mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.mapFrame}
          />
        </div>
      </section>

      <Footer language={currentLanguage} />
    </main>
  );
}
