"use client";
import AccountShell from "./AccountShell";
import usePersistentLanguage from "../components/usePersistentLanguage";
import { accountCopy } from "./copy";
import styles from "./account.module.css";
export default function AccountError({ reset }: { reset: () => void }) {
  const [language] = usePersistentLanguage();
  const t = accountCopy[language];
  return <AccountShell><main className={styles.authLayout}><h1>{t.account}</h1><p role="alert" className={styles.intro}>{t.unavailable}</p><button className={styles.primary} onClick={reset}>{t.retry}</button></main></AccountShell>;
}
