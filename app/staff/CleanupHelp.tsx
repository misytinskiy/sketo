"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./cleanup-help.module.css";

export default function CleanupHelp() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return <span ref={root} className={styles.help}
    onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpen(false); }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button type="button" className={styles.trigger} aria-label="Зачем нужна очистка файлов"
      aria-expanded={open} aria-controls={id} aria-describedby={open ? id : undefined}
      onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
      onClick={() => setOpen((value) => !value)}><span aria-hidden="true">i</span></button>
    {open && <span id={id} role="tooltip" className={styles.tooltip}>
      Из-за сбоя не удалось завершить удаление файлов из хранилища. Нажмите «Повторить очистку». Это не мешает работе сайта: фотографии, которые используются в товарах, сохранятся. Если очистка снова не удастся, попробуйте позже.
    </span>}
  </span>;
}
