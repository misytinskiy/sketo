import Link from "next/link";
import Image from "../components/CatalogImage";
import type { Language } from "../components/language";
import { accessoryContent, catalogPrice, categoryLabel, label, type Accessory } from "./model";
import styles from "../catalog/equipment/equipment.module.css";
import local from "./accessories.module.css";

export default function AccessoryCard({ item, language, onNavigate }: { item: Accessory; language: Language; onNavigate?: () => void }) {
  const content = accessoryContent(item, language);
  return <Link href={`/accessories/${item.slug}`} className={styles.cardLink} onNavigate={onNavigate}>
    <article className={styles.card}>
      <div className={styles.imagePanel}><Image src={item.images[0]?.url || "/image-unavailable.svg"} alt={content.name} fill
        sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw" className={styles.image} unoptimized /></div>
      <div className={`${styles.content} ${local.cardContent}`}>
        <div className={`${styles.metaBlock} ${local.cardName}`}><p className={styles.metaLabel}>{item.brand}</p><h2 className={styles.name}>{content.name}</h2></div>
        <div className={styles.metaBlock}><p className={styles.metaLabel}>{label(language, "Категория", "Category", "Санат")}</p><p className={styles.details}>{categoryLabel(item.category, language)}</p></div>
        <div className={styles.metaBlock}><p className={styles.metaLabel}>{label(language, "Цена", "Price", "Бағасы")}</p><p className={styles.price}>{catalogPrice(item, language)}</p></div>
        {item.variants.length > 1 && <div className={local.cardColors} aria-label={label(language, "Цвета", "Colours", "Түстер")}>
          {item.variants.map(v => <span key={v.id} title={v.color} className={local.colorPreview} style={{ background: v.hex || "transparent" }} />)}
        </div>}
      </div>
    </article>
  </Link>;
}
