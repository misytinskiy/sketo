"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "../components/Footer";
import ShopHeaderActions from "../components/ShopHeaderActions";
import usePersistentLanguage from "../components/usePersistentLanguage";
import styles from "./account.module.css";
export default function AccountShell({ children }: { children: ReactNode }) {
  const [language] = usePersistentLanguage();
  return <div className={styles.page}><div className={styles.viewport}><header className={styles.header}><Link href="/" className={styles.logo} aria-label="Sketo">sketo.</Link><ShopHeaderActions /></header>{children}</div><Footer language={language} /></div>;
}
