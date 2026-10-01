"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createStaffUser, deleteStaffUser, type UserActionState } from "./actions";
import styles from "../access.module.css";

const initial: UserActionState = { status: "idle", message: "" };

type StaffRole = "staff" | "admin";

const roleOptions: Array<{ value: StaffRole; label: string }> = [
  { value: "staff", label: "Персонал" },
  { value: "admin", label: "Администратор" },
];

function RoleSelect({ value, onChange }: { value: StaffRole; onChange: (value: StaffRole) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = roleOptions.find((option) => option.value === value) ?? roleOptions[0];

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <div className={styles.memberSelect} ref={root} data-open={open || undefined}>
    <input type="hidden" name="role" value={selected.value} />
    <button type="button" className={styles.memberSelectTrigger} aria-label="Роль пользователя"
      aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId}
      onClick={() => setOpen((current) => !current)}>
      <span>{selected.label}</span>
      <span className={`${styles.memberSelectChevron} ${open ? styles.memberSelectChevronOpen : ""}`} aria-hidden="true" />
    </button>
    {open && <div id={menuId} className={styles.memberSelectMenu} role="listbox" aria-label="Роль пользователя">
      {roleOptions.map((option) => <button key={option.value} type="button" role="option"
        aria-selected={option.value === selected.value}
        className={`${styles.memberSelectOption} ${option.value === selected.value ? styles.memberSelectOptionActive : ""}`}
        onClick={() => { onChange(option.value); setOpen(false); }}>
        {option.label}
      </button>)}
    </div>}
  </div>;
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createStaffUser, initial);
  const [role, setRole] = useState<StaffRole>("staff");
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") {
      form.current?.reset();
    }
  }, [state]);
  return <form ref={form} action={action} className={styles.memberForm}>
    <label className={styles.memberField}><span>Имя / 01</span><input name="displayName" autoComplete="off" maxLength={100} placeholder="Имя сотрудника" required /></label>
    <label className={styles.memberField}><span>Email / 02</span><input name="email" type="email" autoComplete="off" maxLength={254} placeholder="name@sketo.coffee" required /></label>
    <div className={styles.memberField}><span>Роль / 03</span><RoleSelect value={role} onChange={setRole} /></div>
    <label className={styles.memberField}><span>Пароль / 04</span><input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} placeholder="Минимум 12 символов" required /></label>
    <p className={styles.memberFormHint}>Сохраните пароль и передайте сотруднику безопасным способом.</p>
    <button className={styles.memberSubmit} disabled={pending}><span>{pending ? "Добавляем…" : "Добавить пользователя"}</span><span aria-hidden="true">↗</span></button>
    {state.message && <p className={styles.memberMessage} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
  </form>;
}

export function DeleteUserForm({ id, email, inactive }: { id: string; email: string; inactive: boolean }) {
  const [state, action, pending] = useActionState(deleteStaffUser, initial);
  return <details className={styles.deleteMember}><summary>{inactive ? "Завершить удаление" : "Удалить"}</summary>
    <form action={action} className={styles.deleteMemberForm}>
      <input type="hidden" name="id" value={id} />
      <label className={styles.memberField}><span>Подтвердите email</span><input name="confirmation" type="email" autoComplete="off" placeholder={email} required /></label>
      <p className={styles.memberFormHint}>Аккаунт и доступ будут удалены.</p>
      <button className={styles.memberDanger} disabled={pending}>{pending ? "Удаляем…" : "Удалить навсегда"}</button>
      {state.message && <p className={styles.memberMessage} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    </form>
  </details>;
}
