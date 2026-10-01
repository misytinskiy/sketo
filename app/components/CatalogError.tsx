"use client";
import LocalizedText from "@/app/components/LocalizedText";


import Link from "next/link";
import { useTransition } from "react";
import styles from "./CatalogError.module.css";

export default function CatalogError({ unstable_retry }: { unstable_retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return <main className={styles.page}>
    <section className={styles.panel} role="alert">
      <h1><LocalizedText text="Не удалось загрузить каталог" /></h1>
      <p><LocalizedText text="Данные временно недоступны. Попробуйте загрузить страницу ещё раз." /></p>
      <button disabled={pending} onClick={() => startTransition(() => unstable_retry())}>
        <LocalizedText text={pending ? "Загружаем…" : "Повторить загрузку"} />
      </button>
      <Link href="/"><LocalizedText text="На главную" /></Link>
    </section>
  </main>;
}
