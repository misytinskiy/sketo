import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <Link href="/" className={styles.footerLogo} aria-label="Sketo home">
          <Image
            src="/logo.PNG"
            alt="Sketo"
            width={220}
            height={88}
            className={styles.footerLogoImage}
          />
        </Link>
      </div>

      <div className={styles.footerColumns}>
        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>Navigation</p>
          <Link href="/catalog" className={styles.footerLink}>
            Catalog
          </Link>
          <Link href="/equipment" className={styles.footerLink}>
            Equipment
          </Link>
          <a href="#about" className={styles.footerLink}>
            About
          </a>
          <a href="#academy" className={styles.footerLink}>
            Academy
          </a>
          <a href="#contacts" className={styles.footerLink}>
            Contact
          </a>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>Social</p>
          <a href="https://instagram.com" className={styles.footerLink}>
            Instagram
          </a>
          <a href="https://t.me" className={styles.footerLink}>
            Telegram
          </a>
          <a href="https://wa.me" className={styles.footerLink}>
            WhatsApp
          </a>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerTitle}>Contact</p>
          <a href="mailto:hello@sketo.coffee" className={styles.footerLink}>
            hello@sketo.coffee
          </a>
          <a href="tel:+77000000000" className={styles.footerLink}>
            +7 700 000 00 00
          </a>
          <p className={styles.footerText}>Almaty, Kazakhstan</p>
        </div>
      </div>
    </footer>
  );
}
