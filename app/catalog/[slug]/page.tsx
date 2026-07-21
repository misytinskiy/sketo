import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import LanguageSwitch from "../../components/LanguageSwitch";
import { catalogItems, getCatalogItemBySlug } from "../catalog-data";
import LotEditorial from "./LotEditorial";
import LotMedia from "./LotMedia";
import styles from "./lot.module.css";

export function generateStaticParams() {
  return catalogItems.map((item) => ({
    slug: item.slug,
  }));
}

type LotPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LotPage({ params }: LotPageProps) {
  const { slug } = await params;
  const item = getCatalogItemBySlug(slug);
  const itemIndex = catalogItems.findIndex(
    (catalogItem) => catalogItem.slug === slug
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
          <Link href="/catalog" className={styles.backLink}>
            Back to catalog
          </Link>

          <div className={styles.techMeta}>
            <p className={styles.techMetaText}>
              LOT {(itemIndex + 1).toString().padStart(2, "0")}
            </p>
            <p className={styles.techMetaText}>SKU / {item.slug.toUpperCase()}</p>
            <p className={styles.techMetaText}>SKETO COFFEE COMPANY</p>
          </div>

          <LotMedia image={item.image} name={item.name} />

          <div className={styles.infoPanel}>
            <div className={styles.headline}>
              <h1 className={styles.title}>{item.name}</h1>
          
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>Description</p>
              <p className={styles.description}>{item.description}</p>
            </div>

            <div className={styles.notesCard}>
              <p className={styles.sectionLabel}>Notes</p>
              <p className={styles.notesText}>{item.notes}</p>
            </div>

            <div className={styles.detailsCard}>
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

            <div className={styles.descriptionCard}>
              <p className={styles.sectionLabel}>Price / Weight</p>
              <div className={styles.priceLine}>  
              <p className={styles.price}>{item.price}</p>
              <p className={styles.size}>{item.size}</p>
            </div>
            </div>

          
          </div>
        </section>

        <LotEditorial />
      </div>

      <Footer />
    </main>
  );
}
