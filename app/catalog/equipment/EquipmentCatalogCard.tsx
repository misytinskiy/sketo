import Link from "next/link";
import Image from "next/image";
import {
  equipmentBrandLabels,
  type EquipmentItem,
} from "./equipment-data";
import styles from "./equipment.module.css";

type EquipmentCatalogCardProps = {
  item: EquipmentItem;
};

export default function EquipmentCatalogCard({
  item,
}: EquipmentCatalogCardProps) {
  return (
    <Link href={`/equipment/${item.slug}`} className={styles.cardLink}>
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
            <p className={styles.metaLabel}>Model</p>
            <h2 className={styles.name}>{item.name}</h2>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Brand</p>
            <p className={styles.details}>{equipmentBrandLabels[item.brand]}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Type</p>
            <p className={styles.details}>{item.category}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>Status</p>
            <p className={styles.price}>{item.status}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
