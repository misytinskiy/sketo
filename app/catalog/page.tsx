import Image from "next/image";
import Link from "next/link";
import LanguageSwitch from "../components/LanguageSwitch";
import styles from "./catalog.module.css";

const catalogItems = [
  {
    name: "African Profile 1.0",
    size: "250 г",
    image: "/photo/catalog/africanProfile1.jpg",
    price: "KZT 5,700",
    notes: "Цветы, грейпфрут, персик, ананас",
  },
  {
    name: "Latino Profile 2.0",
    size: "250 г",
    image: "/photo/catalog/latinoProfile2.jpg",
    price: "KZT 5,900",
    notes: "Тростниковый сахар, косточковые фрукты, карамель",
  },
  {
    name: "Decaf",
    size: "250 г",
    image: "/photo/catalog/decaf.jpg",
    price: "KZT 5,900",
    notes: "Карамель, молочный шоколад, яблоко, лимон",
  },
  {
    name: "Asian Profile",
    size: "250 г",
    image: "/photo/catalog/asianProfile.jpg",
    price: "KZT 5,900",
    notes: "Курага, чернослив, темный шоколад, арахис",
  },
  {
    name: "Italian Profile Medium",
    size: "250 г",
    image: "/photo/catalog/italianProfile.jpg",
    price: "KZT 5,900",
    notes: "Темный шоколад, орехи",
  },
  {
    name: "Brazilian Profile 1.0",
    size: "250 г",
    image: "/photo/catalog/brazilianProfile1.jpg",
    price: "KZT 5,900",
    notes: "Карамель, темный шоколад, грецкий орех",
  },
  {
    name: "Brazilian Profile 2.0",
    size: "250 г",
    image: "/photo/catalog/brazilianProfile2.jpg",
    price: "KZT 5,900",
    notes: "Цитрусы, темный шоколад, грецкий орех",
  },
] as const;

export default function CatalogPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          На главную
        </Link>
        <LanguageSwitch />
      </div>

  
    

      <section className={styles.grid} aria-label="Каталог зерна">
        {catalogItems.map((item) => (
          <article key={item.name} className={styles.card}>
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
        ))}
      </section>
    </main>
  );
}
