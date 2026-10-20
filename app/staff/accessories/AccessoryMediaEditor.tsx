"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { EditorImage, EditorVariant, SaveResult } from './editor-model';
import { isVisibleAccessoryImage } from './editor-model';
import type { AccessoryVolume } from '../../accessories/model';
import EditorSelect from './EditorSelect';
import { validateImageFile } from '@/lib/supabase/media-validation';
import editor from '../edit/[kind]/[slug]/page.module.css';
import styles from './editor.module.css';

export type PendingPhoto = { id: string; file: File; url: string; variantId: string | null; volumeId?: string | null; primary?: boolean };
export default function AccessoryMediaEditor({ images, variants, volumes = [], queued, onImages, onQueue, onUpload, result, disabled = false }: {
  images: EditorImage[]; variants: EditorVariant[]; queued: PendingPhoto[];
  volumes?: AccessoryVolume[];
  disabled?: boolean;
  onUpload: () => void; result: SaveResult;
  onImages: (images: EditorImage[]) => void; onQueue: (files: PendingPhoto[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const liveQueue = useRef(queued);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const visible = (photo: EditorImage) => isVisibleAccessoryImage(photo, variants, volumes);
  const pendingPrimary = queued.some(p => p.primary && isVisibleAccessoryImage({ ...p, approved: true }, variants, volumes));
  const primaryId = images.find(visible)?.id;
  useEffect(() => { liveQueue.current = queued; }, [queued]);
  useEffect(() => () => { liveQueue.current.forEach(p => URL.revokeObjectURL(p.url)); }, []);
  const colors = [{ value: '', label: 'Все цвета · общее фото', hex: null }, ...variants.map(v => ({ value: v.id, label: v.color || 'Новый цвет', hex: v.hex }))];
  const volumeOptions = [{ value: '', label: 'Все объёмы · общее фото' }, ...volumes.map(v => ({ value: v.id, label: `${v.value || 'Новый объём'} ${v.unit}` }))];
  function add(files: File[]) {
    if (disabled) return;
    if (images.length + queued.length + files.length > 100) { setError('Максимум 100 фотографий.'); return; }
    // Bound each save to the same small batch used by the other editors.
    if (queued.length + files.length > 10) { setError('Добавляйте до 10 фото за одно сохранение.'); return; }
    if ([...queued.map(p => p.file), ...files].reduce((sum, file) => sum + file.size, 0) > 5 * 1024 * 1024) { setError('Общий размер новых фото — до 5 МБ за одно сохранение. Добавьте оставшиеся после сохранения.'); return; }
    const invalid = files.map(validateImageFile).find(Boolean);
    if (invalid) { setError(invalid); return; }
    setError('');
    onQueue([...queued, ...files.map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), variantId: null }))]);
  }
  function move(from: number, to: number) {
    if (disabled) return;
    if (from === to || from < 0 || to < 0 || to >= images.length) return;
    const next = [...images]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onImages(next);
  }
  return <section className={editor.sectionBlock} data-accessory-media>
    <div className={editor.sectionTopline}><h2 className={editor.sectionLabel}>Фотографии</h2><span>{images.length + queued.length} фото</span></div>
    {volumes.length > 0 && <p className={styles.hint}>«Все объёмы» — фото видно при любом объёме. Выберите конкретный объём, чтобы показывать фото только для него. Если также выбран цвет, должны совпасть оба параметра.</p>}
    <p className={styles.hint}>Выберите фото, при необходимости нажмите ★ и затем «Загрузить». Загрузка сохраняет фотографии отдельно, не меняя описание и цены. Порядок и настройки уже загруженных фото применяются кнопкой «Сохранить» или вместе с новой загрузкой.</p>
    <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp" className={editor.mediaInput} onChange={e => { add(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
    {error && <p role="alert" className={editor.formMessageError}>{error}</p>}
    {result.message && <p role={result.status === 'error' ? 'alert' : 'status'} className={result.status === 'error' ? editor.formMessageError : editor.formMessage}>{result.message}</p>}
    {queued.length > 0 && <div className={styles.buttons}>
      <button type="button" className={editor.primaryAction} disabled={disabled} onClick={onUpload}>{disabled ? 'Загружаем…' : `Загрузить (${queued.length})`}</button>
      <button type="button" className={editor.secondaryAction} disabled={disabled} onClick={() => { queued.forEach(p => URL.revokeObjectURL(p.url)); onQueue([]); }}>Отменить выбор</button>
    </div>}
    <div className={editor.mediaManagerGrid}>
      <button type="button" className={`${editor.mediaAddCard} ${dropActive ? editor.dropActive : ''}`} onClick={() => fileInput.current?.click()} onDragOver={e => { e.preventDefault(); setDropActive(true); }} onDragLeave={() => setDropActive(false)} onDrop={e => { e.preventDefault(); setDropActive(false); add(Array.from(e.dataTransfer.files)); }}>
        <span className={editor.mediaAddIcon}>+</span><span className={editor.mediaAddTitle}>Перетащите файлы сюда<br />или выберите изображения</span><small>JPEG, PNG, WebP · суммарно до 5 МБ</small>
      </button>
      {images.map((photo, index) => <article key={photo.id} className={`${editor.mediaItemCard} ${dragging === photo.id ? editor.mediaDragging : ''}`} draggable={!disabled} onDragStart={e => { setDragging(photo.id); e.dataTransfer.setData('text/plain', photo.id); }} onDragEnd={() => setDragging(null)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); move(images.findIndex(p => p.id === dragging), index); setDragging(null); }}>
        <div className={editor.mediaManagerFrame}>
          {!pendingPrimary && photo.id === primaryId && <span className={editor.primaryBadge}>★ Главное фото</span>}
          <Image src={photo.url} alt={photo.alt || 'Фото товара'} fill unoptimized sizes="240px" className={editor.mediaImage} />
        </div>
        <div className={editor.mediaItemToolbar}><span className={editor.mediaItemMeta}>{index + 1}</span>
          <button type="button" className={editor.mediaRemoveButton} disabled={!visible({ ...photo, approved: true }) || (photo.id === primaryId && !pendingPrimary)} title={visible({ ...photo, approved: true }) ? 'Сделать главным' : 'Фото недоступного цвета или объёма скрыто на сайте'} aria-label="Сделать главным" onClick={() => { onQueue(queued.map(p => ({ ...p, primary: false }))); onImages([{ ...photo, approved: true }, ...images.filter(p => p.id !== photo.id)]); }}>★</button>
          <button type="button" className={editor.mediaRemoveButton} disabled={index === 0} aria-label="Переместить раньше" onClick={() => move(index, index - 1)}>←</button>
          <button type="button" className={editor.mediaRemoveButton} disabled={index === images.length - 1} aria-label="Переместить позже" onClick={() => move(index, index + 1)}>→</button>
          <button type="button" className={editor.mediaRemoveButton} aria-label="Убрать фото" onClick={() => onImages(images.filter(p => p.id !== photo.id))}>×</button>
        </div>
        <div className={styles.photoControls}><EditorSelect label={`Цвет фото ${index + 1}`} value={photo.variantId ?? ''} options={colors} onChange={value => onImages(images.map(p => p.id === photo.id ? { ...p, variantId: value || null } : p))} />
          {volumes.length > 0 && <EditorSelect label={`Объём фото ${index + 1}`} value={photo.volumeId ?? ''} options={volumeOptions} onChange={value => onImages(images.map(p => p.id === photo.id ? { ...p, volumeId: value || null } : p))} />}
          <label className={styles.toggle}><input type="checkbox" checked={photo.approved} onChange={e => onImages(images.map(p => p.id === photo.id ? { ...p, approved: e.target.checked } : p))} />Показывать на сайте</label>
        </div>
      </article>)}
      {queued.map((photo, index) => <article key={photo.id} className={editor.mediaItemCard}>
        <div className={editor.mediaManagerFrame}><span className={editor.primaryBadge}>{photo.primary && isVisibleAccessoryImage({ ...photo, approved: true }, variants, volumes) ? '★ Главное после загрузки' : 'Новое · не загружено'}</span><Image src={photo.url} alt="Новое фото товара" fill unoptimized sizes="240px" className={editor.mediaImage} /></div>
        <div className={editor.mediaItemToolbar}><span className={editor.mediaItemMeta}>{photo.file.name}</span><button type="button" className={editor.mediaRemoveButton} disabled={photo.primary || disabled || !isVisibleAccessoryImage({ ...photo, approved: true }, variants, volumes)} aria-label="Сделать новое фото главным" title="Сделать главным" onClick={() => onQueue(queued.map(p => ({ ...p, primary: p.id === photo.id })))}>★</button><button type="button" className={editor.mediaRemoveButton} aria-label="Отменить добавление фото" onClick={() => { URL.revokeObjectURL(photo.url); onQueue(queued.filter(p => p.id !== photo.id)); }}>×</button></div>
        <div className={styles.photoControls}><EditorSelect label={`Цвет нового фото ${index + 1}`} value={photo.variantId ?? ''} options={colors} onChange={value => onQueue(queued.map(p => p.id === photo.id ? { ...p, variantId: value || null } : p))} />
          {volumes.length > 0 && <EditorSelect label={`Объём нового фото ${index + 1}`} value={photo.volumeId ?? ''} options={volumeOptions} onChange={value => onQueue(queued.map(p => p.id === photo.id ? { ...p, volumeId: value || null } : p))} />}
        </div>
      </article>)}
    </div>
    <p className={styles.hint}>Фото недоступного цвета скрывается автоматически. «Показывать на сайте» позволяет скрыть любое фото вручную, не удаляя его. Общие фото не зависят от наличия отдельного цвета. Удаление из карточки не удаляет файл из хранилища.</p>
  </section>;
}
