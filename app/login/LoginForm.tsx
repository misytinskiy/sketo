"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import styles from "../staff/access.module.css";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { message: "" });
  return <form action={action} className={styles.loginForm}>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Email</span>
      <input name="email" type="email" autoComplete="username" maxLength={254}
        placeholder="name@sketo.coffee" required />
    </label>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}>Пароль</span>
      <input name="password" type="password" autoComplete="current-password" maxLength={256}
        placeholder="••••••••••••" required />
    </label>
    {state.message && <p className={styles.loginError} role="alert">{state.message}</p>}
    <Link href="/login/forgot-password" className={styles.passwordLink}>Забыли пароль?</Link>
    <button className={styles.loginSubmit} disabled={pending}>
      <span>{pending ? "Проверяем доступ…" : "Войти в workspace"}</span>
      <span aria-hidden="true">↗</span>
    </button>
  </form>;
}
