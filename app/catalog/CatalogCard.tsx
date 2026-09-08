import type { CoffeeCatalogCardItem } from "./catalog-db";
import Image from "../components/CatalogImage";
import Link from "next/link";
import type { CatalogLanguage } from "./catalog-data";
import styles from "./catalog.module.css";

type CatalogCardProps = {
  item: CoffeeCatalogCardItem;
  language: CatalogLanguage;
};

export default function CatalogCard({ item, language }: CatalogCardProps) {
  const content = item.translations[language];

  return (
    <Link href={`/catalog/${item.slug}`} className={styles.cardLink}>
      <article className={styles.card}>
        <div className={styles.imagePanel}>
          <Image
            src={item.image}
            alt={content.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>{language === "en" ? "Lot" : "Лот"}</p>
            <h2 className={styles.name}>{content.name}</h2>
            <p className={styles.details}>{content.size}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>{language === "en" ? "Notes" : "Ноты"}</p>
            <p className={styles.details}>{content.notes}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>{language === "en" ? "Price" : "Цена"}</p>
            <p className={styles.price}>{item.price}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
