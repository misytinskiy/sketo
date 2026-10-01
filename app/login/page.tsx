import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/staff-auth";
import LoginForm from "./LoginForm";
import styles from "../staff/access.module.css";

export const metadata = { title: "Вход в кабинет — Sketo", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentStaff()) redirect("/staff");
  return <main className={styles.loginPage}>
    <header className={styles.loginHeader}>
      <Link href="/" className={styles.loginLogo} aria-label="На главную Sketo">sketo.</Link>
      <div className={styles.loginHeaderMeta}>
        <span>staff workspace</span>
        <span>restricted access</span>
      </div>
    </header>

    <section className={styles.loginLayout}>
      <div className={styles.loginIntro}>
        <p className={styles.loginEyebrow}>internal system / sketo coffee company</p>
        <h1 className={styles.loginTitle}>
          <span>staff</span>
          <span>workspace.</span>
        </h1>
      </div>

      <section className={styles.loginPanel} aria-labelledby="login-heading">
        <div className={styles.loginPanelHeader}>
          <p className={styles.loginIndex}>authorization / 01</p>
          <h2 id="login-heading">Вход в кабинет</h2>
        </div>
        <LoginForm />
      </section>
    </section>

    <footer className={styles.loginFooter}>
      <span>Astana / Kazakhstan</span>
      <span>catalog management system</span>
      <span>© Sketo Coffee Company</span>
    </footer>
  </main>;
}
