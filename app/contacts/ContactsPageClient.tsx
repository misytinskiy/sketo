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
  initialLanguage: "ru" | "en" | "kz";
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
              {currentLanguage === "kz" ? "артқа" : currentLanguage === "en" ? "back" : "назад"}
            </span>
          </Link>

          <LanguageSwitch value={language} onChange={setLanguage} />
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>
              {currentLanguage === "kz" ? "sketo-ға\nкеліңіз" : currentLanguage === "en" ? "visit\nsketo" : "visit\nsketo"}
            </h1>
          </div>

          <div className={styles.infoPanel}>
            <div className={styles.copy}>
              <p className={styles.addressLead}>
                {currentLanguage === "kz" ? "Мұхтар Әуезов көшесі, 2" : currentLanguage === "en"
                  ? "Mukhtar Auezov St 2"
                  : "ул. Мухтара Ауэзова, 2"}
              </p>
              <p className={styles.lead}>
                {currentLanguage === "kz" ? "Кофехана, дән, өзіңізбен алып кету және жеткізу — бір жерде. Орынды тез тауып, оған оңай жетуге қажет ақпараттың бәрі осында." : currentLanguage === "en"
                  ? "Cafe, beans, takeaway, and delivery in one place. Everything you need to find the space quickly and get there without extra steps is collected here."
                  : "Кофейня, зерно, takeaway и доставка в одном месте. Всё, что нужно, чтобы быстро найти пространство и без лишних шагов добраться до него, собрано здесь."}
              </p>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "kz" ? "қала" : currentLanguage === "en" ? "city" : "город"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "kz" ? "Астана, Қазақстан" : currentLanguage === "en"
                    ? "Astana, Kazakhstan"
                    : "Астана, Казахстан"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "kz" ? "телефон" : currentLanguage === "en" ? "phone" : "телефон"}
                </p>
                <a href="tel:+77473835398" className={styles.detailValueLink}>
                  +7 747 383 53 98
                </a>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "kz" ? "жұмыс уақыты" : currentLanguage === "en" ? "hours" : "часы работы"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "kz" ? "08:00 - 22:00 / күн сайын" : currentLanguage === "en"
                    ? "08:00 - 22:00 / every day"
                    : "08:00 - 22:00 / каждый день"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "kz" ? "формат" : currentLanguage === "en" ? "format" : "формат"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "kz" ? "кофе / өзіңізбен алып кету / дән" : currentLanguage === "en"
                    ? "coffee / takeaway / beans"
                    : "кофе / takeaway / зерно"}
                </p>
              </div>

              <div className={styles.detailRow}>
                <p className={styles.detailLabel}>
                  {currentLanguage === "kz" ? "мәліметтер" : currentLanguage === "en" ? "details" : "детали"}
                </p>
                <p className={styles.detailValue}>
                  {currentLanguage === "kz" ? "брю-бар, дән, жеткізу, жабдық бойынша кеңес" : currentLanguage === "en"
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
                {currentLanguage === "kz" ? "Google Maps-та ашу" : currentLanguage === "en"
                  ? "open in Google Maps"
                  : "открыть в Google Maps"}
              </a>
            </div>

            <p className={styles.note}>
              {currentLanguage === "kz" ? "Кофе, дән, өзіңізбен алып кету және жабдық бойынша кеңес үшін күн сайын 08:00-ден 22:00-ге дейін ашықпыз." : currentLanguage === "en"
                ? "Open daily from 08:00 to 22:00 for coffee, beans, takeaway, and equipment consultations."
                : "Открыты ежедневно с 08:00 до 22:00 для кофе, зерна, takeaway и консультаций по оборудованию."}
            </p>
          </div>
        </div>

        <div className={styles.mapPanel}>
          <iframe
            title={
              currentLanguage === "kz" ? "Sketo Coffee Company картасы" : currentLanguage === "en"
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
