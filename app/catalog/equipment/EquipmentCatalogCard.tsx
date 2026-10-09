import type { EquipmentCatalogCardItem } from "./equipment-db";
import Link from "next/link";
import Image from "../../components/CatalogImage";
import {
  equipmentBrandLabels,
  
  type EquipmentLanguage,

} from "./equipment-data";
import styles from "./equipment.module.css";

type EquipmentCatalogCardProps = {
  item: EquipmentCatalogCardItem;
  language: EquipmentLanguage;
  onNavigate?: () => void;
};

export default function EquipmentCatalogCard({
  item,
  language,
  onNavigate,
}: EquipmentCatalogCardProps) {
  const content = item.translations[language];

  return (
    <Link
      href={`/equipment/${item.slug}`}
      className={styles.cardLink}
      onNavigate={onNavigate}
    >
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
            <p className={styles.metaLabel}>
              {language === "kz" ? "Модель" : language === "en" ? "Model" : "Модель"}
            </p>
            <h2 className={styles.name}>{item.name}</h2>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>
              {language === "kz" ? "Бренд" : language === "en" ? "Brand" : "Бренд"}
            </p>
            <p className={styles.details}>{equipmentBrandLabels[language][item.brand]}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>
              {language === "kz" ? "Түрі" : language === "en" ? "Type" : "Тип"}
            </p>
            <p className={styles.details}>{content.category}</p>
          </div>

          <div className={styles.metaBlock}>
            <p className={styles.metaLabel}>
              {language === "kz" ? "Мәртебе" : language === "en" ? "Status" : "Статус"}
            </p>
            <p className={styles.price}>{content.status}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
