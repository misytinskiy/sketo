"use client";

import { useStaffFeedback } from "../../../StaffFeedback";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ProductType } from "@/lib/db/schema";
import { deleteProductMedia, uploadProductMedia, retryMediaCleanup, updateProductMediaOrder } from "./actions";
import { type EditorActionState } from "./action-state";
import { useEditorVersion } from "./EditorVersionContext";
import { MAX_UPLOAD_FILES, validateImageFile } from "@/lib/supabase/media-validation";
import styles from "./page.module.css";

type MediaItem = {
  id: string;
  url: string;
};

type EditorMediaManagerProps = {
  kind: ProductType;
  slug: string;
  items: MediaItem[];
  title: string;
};

export default function EditorMediaManager({
  kind,
  slug,
  items,
  title,
}: EditorMediaManagerProps) {
  const router = useRouter();
  const { version, setVersion } = useEditorVersion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [queued, setQueued] = useState<Array<{ file: File; url: string }>>([]);
  const queuedRef = useRef<Array<{ file: File; url: string }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectionError, setSelectionError] = useState("");
  useEffect(() => () => { queuedRef.current.forEach((item) => URL.revokeObjectURL(item.url)); }, []);
  function replaceQueue(next: Array<{ file: File; url: string }>) {
    queuedRef.current.filter((item) => !next.includes(item)).forEach((item) => URL.revokeObjectURL(item.url));
    queuedRef.current = next;
    setQueued(next);
  }
  function stageFiles(files: FileList | null) {
    if (!files?.length || isPending) return;
    const selected = Array.from(files);
    if (selected.length + queued.length > MAX_UPLOAD_FILES) { setSelectionError("Выберите не более 10 изображений за раз."); return; }
    for (const file of selected) {
      const error = validateImageFile(file);
      if (error) { setSelectionError(`${file.name}: ${error}`); return; }
    }
    setSelectionError("");
    replaceQueue([...queued, ...selected.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    if (inputRef.current) inputRef.current.value = "";
  }
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const { notify, runTask } = useStaffFeedback();
  const [isPending, startTransition] = useTransition();

  function startMediaTask(label: string, work: (progress: (label: string) => void) => Promise<void>) {
    startTransition(() => runTask(label, work));
  }

  function openFilePicker() {
    if (isPending) {
      return;
    }

    inputRef.current?.click();
  }

  function handleUpload(files: FileList | File[] | null) {
    if (!files?.length || isPending) return;
    const selected = Array.from(files);
    if (selected.length > MAX_UPLOAD_FILES) {
      setSelectionError("Выберите не более 10 изображений за раз.");
      return;
    }
    for (const file of selected) {
      const error = validateImageFile(file);
      if (error) { setSelectionError(`${file.name}: ${error}`); return; }
    }
    startMediaTask("Загружаем изображения…", async (reportProgress) => {
      const failed: File[] = [];
      const errors: string[] = [];
      let completed = 0;
      let currentVersion = version;
      for (const [index, file] of selected.entries()) {
        reportProgress(`Загрузка ${index + 1} из ${selected.length}: ${file.name}`);
        const payload = new FormData();
        payload.set("kind", kind);
        payload.set("slug", slug);
        payload.set("files", file);
        payload.set("version", currentVersion);
        try {
          const result = await uploadProductMedia(payload);
          if (result.status === "success") {
            completed++;
            if (result.version) { currentVersion = result.version; setVersion(result.version); }
          }
          else { failed.push(file); errors.push(`${file.name}: ${result.message}`); }
        } catch { failed.push(file); errors.push(`${file.name}: ошибка соединения`); }
      }
      setFailedFiles(failed);
      notify({ status: failed.length ? "error" : "success", message: `Загружено: ${completed}. Не удалось: ${failed.length}.${failed.length ? " Можно повторить только неудачные загрузки." : ""} ${errors.join("; ")}` });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  function handleDelete(imageId: string) {
    const payload = new FormData();
    payload.set("kind", kind);
    payload.set("slug", slug);
    payload.set("imageId", imageId);
    payload.set("version", version);

    startMediaTask("Удаляем изображение…", async () => {
      let result: EditorActionState;
      try { result = await deleteProductMedia(payload); }
      catch { result = { status: "error", message: "Не удалось удалить изображение. Повторите попытку." }; }
      notify(result);

      if (result.status === "success") {
        if (result.version) setVersion(result.version);
        router.refresh();
      }
    });
  }

  function moveImage(from: number, to: number) {
    if (isPending || to < 0 || to >= items.length || from === to) return;
    const ordered = [...items];
    const [image] = ordered.splice(from, 1);
    ordered.splice(to, 0, image);
    const payload = new FormData();
    payload.set("kind", kind); payload.set("slug", slug); payload.set("version", version);
    ordered.forEach((item) => payload.append("imageIds", item.id));
    startMediaTask("Сохраняем порядок изображений…", async () => {
      try {
        const result = await updateProductMediaOrder(payload);
        notify(result);
        if (result.status === "success") {
          if (result.version) setVersion(result.version);
          router.refresh();
        }
      } catch { notify({ status: "error", message: "Нет соединения. Повторите изменение порядка." }); }
    });
  }

  return (
    <details open className={`${styles.sectionBlock} ${styles.collapsible}`}>
      <summary>Фотографии</summary>
      <div className={styles.sectionTopline}>
        <span className={styles.sectionLabel}>Медиа</span>
        <span className={styles.sidebarValue}>
          {items.length} {items.length === 1 ? "изображение" : "изображений"}
        </span>
      </div>

      <p>JPEG, PNG или WebP · до 5 МБ и 25 Мп на файл · до 10 файлов за выбор.</p>
      {failedFiles.length > 0 && <button type="button" className={styles.secondaryAction} disabled={isPending} onClick={() => handleUpload(failedFiles)}>Повторить неудачные загрузки ({failedFiles.length})</button>}
      <button type="button" className={styles.secondaryAction} disabled={isPending} onClick={() => startMediaTask("Очищаем удалённые файлы…", async () => {
        try { notify(await retryMediaCleanup()); }
        catch { notify({ status: "error", message: "Очистка недоступна. Повторите позже." }); }
      })}>Повторить очистку удалённых файлов</button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className={styles.mediaInput}
        onChange={(event) => stageFiles(event.target.files)}
      />

      {selectionError && <p className={styles.fieldError} role="alert">{selectionError}</p>}
      {queued.length > 0 && <div className={styles.pendingPhotos}>
        <p>Готовы к загрузке: {queued.length}. Фотографии ещё не сохранены.</p>
        <div className={styles.mediaManagerGrid}>{queued.map((item) => <article key={item.url} className={styles.mediaItemCard}>
          <div className={styles.mediaManagerFrame}><Image src={item.url} alt={item.file.name} fill unoptimized sizes="240px" className={styles.mediaImage} /></div>
          <div className={styles.mediaItemToolbar}><span className={styles.mediaItemMeta}>{item.file.name}</span><button type="button" className={styles.mediaRemoveButton} disabled={isPending} aria-label={`Убрать ${item.file.name}`} onClick={() => replaceQueue(queued.filter((entry) => entry !== item))}>×</button></div>
        </article>)}</div>
        <button type="button" className={styles.primaryAction} disabled={isPending} onClick={() => { handleUpload(queued.map((item) => item.file)); replaceQueue([]); }}>Загрузить ({queued.length})</button>
        <button type="button" className={styles.secondaryAction} disabled={isPending} onClick={() => replaceQueue([])}>Отменить выбор</button>
      </div>}
      <div className={styles.mediaManagerGrid}>
        <button
          type="button"
          className={`${styles.mediaAddCard} ${dragActive ? styles.dropActive : ""}`}
          onDragOver={(event) => { event.preventDefault(); if (!isPending) setDragActive(true); }}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false); }}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); stageFiles(event.dataTransfer.files); }}
          onClick={openFilePicker}
          disabled={isPending}
        >
          <span className={styles.mediaAddIcon}>+</span>
          <span className={styles.mediaAddTitle}>Перетащите файлы сюда<br />или выберите изображения</span>
        </button>

        {items.map((item, index) => (
          <article key={item.id} className={styles.mediaItemCard}>
            <div className={styles.mediaManagerFrame}>
              {index === 0 && <span className={styles.primaryBadge}>★ Главное фото</span>}
              <Image
                src={item.url}
                alt={`${title} ${index + 1}`}
                fill
                sizes="(max-width: 900px) 100vw, 16rem"
                className={styles.mediaImage}
              />
            </div>

            <div className={styles.mediaItemToolbar}>
              <span className={styles.mediaItemMeta}>
                {index === 0 ? "Главное изображение" : `Кадр ${index + 1}`}
              </span>
              <button type="button" className={styles.mediaRemoveButton} disabled={isPending || index === 0} onClick={() => moveImage(index, 0)} aria-label="Сделать главным изображением" title="Сделать главным">★</button>
              <button type="button" className={styles.mediaRemoveButton} disabled={isPending || index === 0} onClick={() => moveImage(index, index - 1)} aria-label="Переместить изображение раньше" title="Переместить раньше">←</button>
              <button type="button" className={styles.mediaRemoveButton} disabled={isPending || index === items.length - 1} onClick={() => moveImage(index, index + 1)} aria-label="Переместить изображение позже" title="Переместить позже">→</button>
              <button
                type="button"
                className={styles.mediaRemoveButton}
                onClick={() => handleDelete(item.id)}
                disabled={isPending || items.length <= 1}
                aria-label="Удалить изображение"
                title="Удалить изображение"
              >
                ×
              </button>
            </div>
          </article>
        ))}
      </div>
    </details>
  );
}
