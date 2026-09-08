"use client";

import { useTransition } from "react";
import styles from "./staff.module.css";

export default function StaffError({ unstable_retry }: { unstable_retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <main className={styles.page}>
      <section className={styles.emptyState} role="alert">
        <h1>Не удалось загрузить кабинет</h1>
        <p>Проверьте соединение и доступность Supabase, затем повторите загрузку.</p>
        <button className={styles.primaryButton} disabled={pending}
          onClick={() => startTransition(() => unstable_retry())}>
          {pending ? "Загружаем…" : "Повторить загрузку"}
        </button>
      </section>
    </main>
  );
}
