import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "./catalog-data";
import styles from "./catalog.module.css";

type CatalogCardProps = {
  item: CatalogItem;
};

export default function CatalogCard({ item }: CatalogCardProps) {
  return (
    <Link href={`/catalog/${item.slug}`} className={styles.cardLink}>
      <article className={styles.card}>
        <div className={styles.imagePanel}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={styles.image}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Lot</p>
            <h2 className={styles.name}>{item.name}</h2>
            <p className={styles.details}>{item.size}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Notes</p>
            <p className={styles.details}>{item.notes}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Price</p>
            <p className={styles.price}>{item.price}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
