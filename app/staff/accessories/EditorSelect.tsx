"use client";
import { useEffect, useId, useRef, useState } from 'react';
import editor from '../edit/[kind]/[slug]/page.module.css';
import styles from './editor.module.css';

export default function EditorSelect({ value, options, label, onChange }: {
  value: string; label: string; options: { value: string; label: string; hex?: string | null }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected = options.find(o => o.value === value);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  useEffect(() => {
    if (open) (root.current?.querySelector('[aria-selected="true"]') ?? root.current?.querySelector('[role="option"]'))?.scrollIntoView({ block: 'nearest' });
  }, [open]);
  function showMenu() {
    const rect = trigger.current?.getBoundingClientRect();
    const actionBar = document.querySelector<HTMLElement>('[data-editor-actions]');
    const lowerBoundary = actionBar?.getBoundingClientRect().top ?? window.innerHeight;
    const menuHeight = Math.min(options.length * 43, 280) + 8;
    const roomBelow = rect ? lowerBoundary - rect.bottom : lowerBoundary;
    const roomAbove = rect?.top ?? 0;
    setOpenUpward(roomBelow < menuHeight && roomAbove > roomBelow);
    setOpen(true);
  }
  return <div ref={root} className={`${editor.customSelect} ${open ? editor.customSelectOpen : ''}`} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={e => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.current?.focus(); }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      if (!open) { showMenu(); requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus()); return; }
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  }}>
    <button ref={trigger} type="button" className={editor.customSelectTrigger} aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => open ? setOpen(false) : showMenu()}>
      <span className={styles.optionLabel}>{selected?.hex && <span className={styles.swatch} style={{ backgroundColor: selected.hex }} />}{selected?.label || 'Выберите…'}</span>
      <span className={`${editor.customSelectChevron} ${open ? editor.customSelectChevronOpen : ''}`} />
    </button>
    {open && <div id={id} role="listbox" aria-label={label} className={`${editor.customSelectMenu} ${openUpward ? editor.customSelectMenuAbove : ''} ${styles.selectMenu}`}>
      {options.map(o => <button key={o.value} type="button" role="option" aria-selected={o.value === value} className={`${editor.customSelectOption} ${o.value === value ? editor.customSelectOptionActive : ''}`} onClick={() => { onChange(o.value); setOpen(false); trigger.current?.focus(); }}><span className={styles.optionLabel}>{o.hex && <span className={styles.swatch} style={{ backgroundColor: o.hex }} />}{o.label}</span></button>)}
    </div>}
  </div>;
}
