import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../staff/access.module.css";

export default function PasswordShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className={styles.loginPage}>
    <header className={styles.loginHeader}>
      <Link href="/" className={styles.loginLogo} aria-label="На главную Sketo">sketo.</Link>
      <Link href="/login" className={styles.passwordLink}>Вернуться ко входу ↗</Link>
    </header>
    <section className={styles.loginLayout}>
      <div className={styles.loginIntro}>
        <p className={styles.loginEyebrow}>staff / account security</p>
        <h1 className={styles.loginTitle}><span>staff</span><span>workspace.</span></h1>
      </div>
      <section className={styles.loginPanel} aria-labelledby="password-heading">
        <div className={styles.loginPanelHeader}><p className={styles.loginIndex}>account / password</p><h2 id="password-heading">{title}</h2></div>
        {children}
      </section>
    </section>
    <footer className={styles.loginFooter}><span>Astana / Kazakhstan</span><span>© Sketo Coffee Company</span></footer>
  </main>;
}
