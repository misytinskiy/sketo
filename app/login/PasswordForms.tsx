"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword, type PasswordState } from "./password-actions";
import { changePassword } from "../staff/security/actions";
import styles from "../staff/access.module.css";

const initial: PasswordState = { status: "idle", message: "" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return <form action={action} className={styles.loginForm}>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Email</span>
      <input name="email" type="email" autoComplete="username" maxLength={254} placeholder="name@sketo.coffee" required />
    </label>
    {state.message && <p className={state.status === "error" ? styles.loginError : styles.passwordMessage} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    <button className={styles.loginSubmit} disabled={pending || state.status === "success"}>
      <span>{pending ? "Отправляем…" : state.status === "success" ? "Запрос отправлен" : "Получить ссылку"}</span><span aria-hidden="true">↗</span>
    </button>
  </form>;
}

export function NewPasswordForm({ mode }: { mode: "recovery" | "change" }) {
  const [state, action, pending] = useActionState(mode === "recovery" ? resetPassword : changePassword, initial);
  if (state.status === "success") return <div className={styles.loginForm}>
    <p className={styles.passwordMessage} role="status">{state.message}</p>
    <Link className={styles.passwordLink} href="/staff">Перейти в кабинет ↗</Link>
  </div>;
  return <form action={action} className={styles.loginForm}>
    {mode === "change" && <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Текущий пароль</span>
      <input name="currentPassword" type="password" autoComplete="current-password" maxLength={256} required />
    </label>}
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Новый пароль</span>
      <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} placeholder="Минимум 12 символов" required />
    </label>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Повторите новый пароль</span>
      <input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={256} required />
    </label>
    {state.message && <p className={styles.loginError} role="alert">{state.message}</p>}
    <button className={styles.loginSubmit} disabled={pending}>
      <span>{pending ? "Сохраняем…" : "Сохранить пароль"}</span><span aria-hidden="true">↗</span>
    </button>
    <Link href="/login/forgot-password" className={styles.passwordLink}>{mode === "change" ? "Не помню текущий пароль" : "Запросить новую ссылку"}</Link>
  </form>;
}
