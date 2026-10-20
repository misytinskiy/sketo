"use client";
import Link from "next/link";
import { useTransition } from "react";
import styles from "../staff.module.css";

export default function AccessoryError({ unstable_retry }: { unstable_retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return <section className={styles.emptyState} role="alert">
    <h1>Не удалось загрузить аксессуар</h1>
    <p>Раздел временно недоступен. Остальные разделы кабинета можно продолжать использовать.</p>
    <button className={styles.primaryButton} disabled={pending} onClick={() => startTransition(() => unstable_retry())}>{pending ? "Загрузка…" : "Повторить"}</button>
    <Link href="/staff" className={styles.secondaryButton}>Вернуться к товарам</Link>
  </section>;
}
