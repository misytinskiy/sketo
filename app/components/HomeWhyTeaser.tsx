import Link from "next/link";
import WhyScene from "../why/WhyScene";
import styles from "./HomeWhyTeaser.module.css";

const whyPoints = [
  "Direct sourcing",
  "Roasting precision",
  "Seasonal lots",
  "Education",
  "Consistent quality",
  "Community",
];

export default function HomeWhyTeaser() {
  return (
    <Link
      href="/why"
      className={styles.section}
      aria-labelledby="home-why-teaser-title"
    >
      <div className={styles.sceneWrap} aria-hidden="true">
        <WhyScene />
      </div>

      <div className={styles.pointGrid} aria-hidden="true">
        {whyPoints.map((point, index) => (
          <span key={point} className={styles.point} data-index={index + 1}>
            {point}
          </span>
        ))}
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>Sketo coffee company</p>
        <h2 id="home-why-teaser-title" className={styles.title}>
          Why Sketo
        </h2>
        <p className={styles.lead}>
          We build coffee around clarity, character and a quiet confidence in
          every detail.
        </p>
      </div>
    </Link>
  );
}
