import Link from "next/link";
import styles from "./WhyEntry.module.css";

export default function WhyEntry() {
  return (
    <section className={styles.section} aria-labelledby="why-entry-title">
      <div className={styles.inner}>
        <div className={styles.meta}>
          <p className={styles.eyebrow}>Why Sketo</p>
        </div>

        <div className={styles.content}>
          <h2 id="why-entry-title" className={styles.title}>
            A closer look at how Sketo thinks about sourcing, roast logic,
            seasonality and quality.
          </h2>

          <div className={styles.columns}>
            <p className={styles.text}>
              The menu is only the visible layer. Behind it sits a quieter
              system of decisions that shapes how coffee tastes, moves, and
              stays consistent day after day.
            </p>

            <div className={styles.linkWrap}>
              <p className={styles.text}>
                Open the full Why Sketo page for the brand logic, internal
                structure, and the principles that hold the whole cup together.
              </p>

              <Link href="/why" className={styles.link}>
                <span className={styles.linkLabel}>Open why sketo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
