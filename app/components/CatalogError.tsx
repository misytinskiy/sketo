"use client";

import Link from "next/link";
import { useTransition } from "react";
import styles from "./CatalogError.module.css";

export default function CatalogError({ unstable_retry }: { unstable_retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return <main className={styles.page}>
    <section className={styles.panel} role="alert">
      <h1>Не удалось загрузить каталог</h1>
      <p>Данные временно недоступны. Попробуйте загрузить страницу ещё раз.</p>
      <button disabled={pending} onClick={() => startTransition(() => unstable_retry())}>
        {pending ? "Загружаем…" : "Повторить загрузку"}
      </button>
      <Link href="/">На главную</Link>
    </section>
  </main>;
}
