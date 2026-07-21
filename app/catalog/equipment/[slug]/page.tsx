import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import LanguageSwitch from "../../../components/LanguageSwitch";
import {
  equipmentBrandLabels,
  equipmentItems,
  equipmentTypeLabels,
  getEquipmentItemBySlug,
} from "../equipment-data";
import EquipmentMediaGallery from "./EquipmentMediaGallery";
import styles from "./equipment-item.module.css";

export function generateStaticParams() {
  return equipmentItems.map((item) => ({
    slug: item.slug,
  }));
}

type EquipmentItemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EquipmentItemPage({
  params,
}: EquipmentItemPageProps) {
  const { slug } = await params;
  const item = getEquipmentItemBySlug(slug);
  const itemIndex = equipmentItems.findIndex(
    (equipmentItem) => equipmentItem.slug === slug
  );

  if (!item) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className={styles.contentShell}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.homeLogo} aria-label="Sketo home">
            sketo.
          </Link>
          <LanguageSwitch />
        </div>

        <section className={styles.layout}>
          <Link href="/equipment" className={styles.backLink}>
            Back to equipment
          </Link>

          <div className={styles.techMeta}>
            <p className={styles.techMetaText}>
              ITEM {(itemIndex + 1).toString().padStart(2, "0")}
            </p>
            <p className={styles.techMetaText}>
              SKU / {item.slug.toUpperCase()}
            </p>
            <p className={styles.techMetaText}>
              GALLERY / {String(item.images.length).padStart(2, "0")} FRAMES
            </p>
          </div>

          <EquipmentMediaGallery images={item.images} name={item.name} />

          <div className={styles.infoPanel}>
            <div className={styles.headline}>
              <h1 className={styles.title}>{item.name}</h1>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.sectionLabel}>Overview</p>
              <p className={styles.description}>{item.description}</p>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.sectionLabel}>Configuration</p>
              <div className={styles.detailsList}>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>Brand</p>
                  <p className={styles.detailValue}>
                    {equipmentBrandLabels[item.brand]}
                  </p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>Type</p>
                  <p className={styles.detailValue}>
                    {equipmentTypeLabels[item.type]}
                  </p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>Category</p>
                  <p className={styles.detailValue}>{item.category}</p>
                </div>
                <div className={styles.detailRow}>
                  <p className={styles.detailLabel}>Status</p>
                  <p className={styles.detailValue}>{item.status}</p>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <p className={styles.sectionLabel}>Details</p>
              <div className={styles.detailsList}>
                {item.details.map((detail) => (
                  <div key={detail.label} className={styles.detailRow}>
                    <p className={styles.detailLabel}>{detail.label}</p>
                    <p className={styles.detailValue}>{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.sectionBlock} ${styles.sectionBlockFeatures}`}
        >
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>01</p>
            <h2 className={styles.sectionTitle}>essential features</h2>
          </div>

          <div className={styles.featuresGrid}>
            {item.features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>02</p>
            <h2 className={styles.sectionTitle}>technical specifications</h2>
          </div>

          <div className={styles.specificationsList}>
            {item.specifications.map((specification) => (
              <div
                key={specification.label}
                className={styles.specificationRow}
              >
                <p className={styles.specificationLabel}>
                  {specification.label}
                </p>
                <p className={styles.specificationValue}>
                  {specification.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
