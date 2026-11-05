"use client";

import Link from "next/link";
import Footer from "../../components/Footer";
import ShopHeaderActions from "../../components/ShopHeaderActions";
import { getContentLanguage } from "../../components/language";
import usePersistentLanguage from "../../components/usePersistentLanguage";
import {
  type CatalogItem,
  getCatalogItemContent,
} from "../catalog-data";
import LotEditorial from "./LotEditorial";
import LotMedia from "./LotMedia";
import ProductOrderButton from "../../components/ProductOrderButton";
import { localizeProduct, parseKztPrice } from "../../cart/model";
import styles from "./lot.module.css";
import AccessoryWorkflow from "../../accessories/AccessoryWorkflow";
import type { Recommendations } from "../../accessories/recommendations";
import { label } from "../../accessories/model";
import local from "../../accessories/accessories.module.css";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp-order";

type LotPageClientProps = {
  productUrl: string;
  item: CatalogItem;
  recommendations: Recommendations;
  itemIndex: number;
  initialLanguage: "ru" | "en" | "kz";
};

export default function LotPageClient({
  item,
  itemIndex,
  initialLanguage,
  productUrl,
  recommendations,
}: LotPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);
  const content = getCatalogItemContent(item, currentLanguage);
  const helpMessage = `${label(currentLanguage,
    "Здравствуйте! Помогите, пожалуйста, выбрать кофе:",
    "Hello! Could you help me choose coffee?",
    "Сәлеметсіз бе! Кофе таңдауға көмектесе аласыз ба?")}\n${content.name}\n${productUrl}`;

  return (
    <main className={styles.page}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <Link
            href="/"
            className={styles.homeLogo}
            aria-label={currentLanguage === "kz" ? "Sketo басты беті" : currentLanguage === "en" ? "Sketo home" : "Главная Sketo"}
          >
            sketo.
          </Link>
          <ShopHeaderActions value={language} onChange={setLanguage} />
        </div>

        <section className={styles.layout}>
          <Link href="/catalog" prefetch={true} className={styles.backLink}>
            {currentLanguage === "kz" ? "Каталогқа оралу" : currentLanguage === "en" ? "Back to catalog" : "Назад в каталог"}
          </Link>

          <div className={styles.techMeta}>
            <p className={styles.techMetaText}>
              {currentLanguage === "kz" ? "ЛОТ" : currentLanguage === "en" ? "LOT" : "ЛОТ"}{" "}
              {(itemIndex + 1).toString().padStart(2, "0")}
            </p>
            <p className={styles.techMetaText}>
              {currentLanguage === "kz" ? "АРТИКУЛ" : currentLanguage === "en" ? "ARTICLE" : "АРТИКУЛ"} /{" "}
              {item.slug.toUpperCase()}
            </p>
            <p className={styles.techMetaText}>SKETO COFFEE COMPANY</p>
          </div>

          <LotMedia
            image={item.image}
            name={content.name}
            language={currentLanguage}
          />

          <div className={styles.infoPanel}>
            <div className={styles.headline}>
              <h1 className={styles.title}>{content.name}</h1>
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "kz" ? "Сипаттама" : currentLanguage === "en" ? "Description" : "Описание"}
              </p>
              <p className={styles.description}>{content.description}</p>
            </div>

            <div className={styles.notesCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "kz" ? "Дәм ноталары" : currentLanguage === "en" ? "Notes" : "Ноты"}
              </p>
              <p className={styles.notesText}>{content.notes}</p>
            </div>

            <div className={styles.detailsCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "kz" ? "Мәліметтер" : currentLanguage === "en" ? "Details" : "Детали"}
              </p>
              <div className={styles.detailsList}>
                {content.details.map((detail) => (
                  <div key={detail.label} className={styles.detailRow}>
                    <p className={styles.detailLabel}>{detail.label}</p>
                    <p className={styles.detailValue}>{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>
                {currentLanguage === "kz" ? "Баға / Салмақ / Мәртебе" : currentLanguage === "en" ? "Price / Weight / Status" : "Цена / Вес / Статус"}
              </p>
              <div className={styles.priceLine}>
                <p className={styles.price}>{item.price}</p>
                <p className={styles.size}>{content.size}</p>
                <p className={styles.size}>{content.status}</p>
              </div>
              <ProductOrderButton kind="coffee" language={currentLanguage} name={content.name}
                slug={item.slug} size={content.size} price={item.price} productUrl={productUrl}
                unavailable={item.translations.ru.status === "Нет в наличии"}
                cartItem={{ kind: "coffee", slug: item.slug, href: `/catalog/${item.slug}`, image: item.image,
                  unitPrice: parseKztPrice(item.price), content: localizeProduct(locale => ({ name: item.translations[locale].name, detail: item.translations[locale].size })) }} />
            </div>
          </div>
        </section>

        <LotEditorial language={currentLanguage} />
        <AccessoryWorkflow key={item.slug} recommendations={recommendations} language={currentLanguage} />
        <section className={local.help} aria-labelledby="coffee-help-title">
          <div className={local.helpCopy}>
            <p className={local.helpEyebrow}>ASK SKETO</p>
            <h2 id="coffee-help-title" className={local.helpTitle}>
              <span>{label(currentLanguage, "Нужна помощь", "Need help", "Кофе таңдауға")}</span>
              <span>{label(currentLanguage, "с выбором кофе?", "choosing coffee?", "көмек керек пе?")}</span>
            </h2>
          </div>
          <div className={local.helpContent}>
            <p>{label(currentLanguage,
              "Расскажите, как вы готовите кофе и какие вкусы любите. Поможем выбрать зерно под ваш способ приготовления, разобраться в обжарке и подобрать рецепт для этого лота.",
              "Tell us how you brew coffee and which flavours you enjoy. We’ll help you choose beans for your brewing method, understand the roast and find a recipe for this lot.",
              "Кофені қалай дайындайтыныңызды және қандай дәмдерді ұнататыныңызды айтыңыз. Дайындау әдісіңізге сай дәнді таңдауға, қуыру ерекшеліктерін түсінуге және осы лотқа рецепт табуға көмектесеміз.")}</p>
            <a className={local.helpLink} href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(helpMessage)}`} target="_blank" rel="noopener noreferrer">
              <span>{label(currentLanguage, "Написать в WhatsApp", "Chat on WhatsApp", "WhatsApp-та жазу")}</span>
            </a>
          </div>
        </section>
      </div>

      <Footer language={currentLanguage} />
    </main>
  );
}
