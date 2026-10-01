"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "../staff/access.module.css";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { message: "" });
  return <form action={action} className={styles.loginForm}>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}><span>Email</span><span>01</span></span>
      <input name="email" type="email" autoComplete="username" maxLength={254}
        placeholder="name@sketo.coffee" required />
    </label>
    <label className={styles.loginField}>
      <span className={styles.loginFieldHeader}><span>Пароль</span><span>02</span></span>
      <input name="password" type="password" autoComplete="current-password" maxLength={256}
        placeholder="••••••••••••" required />
    </label>
    {state.message && <p className={styles.loginError} role="alert">{state.message}</p>}
    <button className={styles.loginSubmit} disabled={pending}>
      <span>{pending ? "Проверяем доступ…" : "Войти в workspace"}</span>
      <span aria-hidden="true">↗</span>
    </button>
  </form>;
}
