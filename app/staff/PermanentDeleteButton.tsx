"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { permanentlyDeleteProduct } from "./permanent-delete";
import { useStaffFeedback } from "./StaffFeedback";
import ActionSpinner from "./ActionSpinner";
import styles from "./staff.module.css";

export default function PermanentDeleteButton({ kind, slug, name, version, disabled }: {
  kind: "coffee" | "equipment"; slug: string; name: string; version: string | null; disabled: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify, runTask } = useStaffFeedback();
  const router = useRouter();
  return <>
    <button type="button" className={styles.secondaryButtonDanger} disabled={disabled || pending}
      onClick={() => { setError(""); dialog.current?.showModal(); }}>Удалить навсегда</button>
    <dialog ref={dialog} className={styles.permanentDeleteDialog} onCancel={(event) => { if (pending) event.preventDefault(); }} aria-labelledby={`delete-${kind}-${slug}`}>
      <form onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        setPending(true);
        setError("");
        const data = new FormData();
        data.set("kind", kind); data.set("slug", slug); data.set("version", version ?? "");
        try {
          await runTask("Удаляем товар навсегда…", async () => {
            const result = await permanentlyDeleteProduct(data);
            if (result.status === "error") setError(result.message);
            else notify(result);
            if (result.status === "success") { dialog.current?.close(); router.refresh(); }
          });
        } catch { setError("Нет соединения с сервером. Обновите корзину, чтобы проверить результат удаления."); }
        finally { setPending(false); }
      }}>
        <h2 id={`delete-${kind}-${slug}`}>Удалить «{name}» навсегда?</h2>
        <p>Товар и история его изменений будут удалены без возможности восстановления. Фотографии, используемые другими товарами, сохранятся.</p>
        {error && <p role="alert">{error}</p>}
        <div className={styles.permanentDeleteActions}>
          <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => dialog.current?.close()}>Отмена</button>
          <button type="submit" className={styles.secondaryButtonDanger} disabled={pending}>
            {pending ? <><ActionSpinner />Удаляем…</> : "Удалить"}
          </button>
        </div>
      </form>
    </dialog>
  </>;
}
