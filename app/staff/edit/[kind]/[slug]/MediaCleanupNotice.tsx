"use client";

import { useEffect, useState } from "react";
import ActionSpinner from "../../../ActionSpinner";
import CleanupHelp from "../../../CleanupHelp";
import { useStaffFeedback } from "../../../StaffFeedback";
import { getMediaCleanupStatus, retryMediaCleanup } from "./actions";
import styles from "./page.module.css";

export default function MediaCleanupNotice({ revision, disabled }: { revision: number; disabled: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, setPending] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const { notify, runTask } = useStaffFeedback();
  useEffect(() => {
    let cancelled = false;
    getMediaCleanupStatus().then((value) => {
      if (!cancelled) { setCount(value); setUnavailable(false); }
    }).catch(() => { if (!cancelled) setUnavailable(true); });
    return () => { cancelled = true; };
  }, [revision, refresh]);

  if (unavailable) return <div className={styles.cleanupNotice} role="status">
    <p>Не удалось проверить, остались ли файлы для очистки.</p>
    <button type="button" className={styles.secondaryAction} disabled={disabled || pending}
      onClick={() => setRefresh((value) => value + 1)}>Проверить ещё раз</button>
  </div>;
  if (!count) return null;
  return <div className={styles.cleanupNotice} role="status">
    <p>Осталось очистить файлов: <strong>{count}</strong></p>
    <p>Это очередь очистки всего каталога. Неиспользуемые файлы остались в хранилище; работе сайта это не мешает.</p>
    <div className={styles.cleanupControls}>
      <button type="button" className={styles.secondaryAction} disabled={disabled || pending} onClick={async () => {
        setPending(true);
        try {
          await runTask("Очищаем оставшиеся файлы…", async () => { notify(await retryMediaCleanup()); });
        } catch { notify({ status: "error", message: "Не удалось выполнить очистку. Попробуйте позже." }); }
        finally { setPending(false); setRefresh((value) => value + 1); }
      }}>{pending ? <><ActionSpinner />Очищаем…</> : "Повторить очистку"}</button>
      <CleanupHelp />
    </div>
  </div>;
}
