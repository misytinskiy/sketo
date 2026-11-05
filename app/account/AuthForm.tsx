"use client";
import Link from "next/link";
import { useActionState } from "react";
import { initialAccountState, type AccountState } from "@/lib/customer-profile";
import usePersistentLanguage from "../components/usePersistentLanguage";
import { customerLogin, customerRegister, customerForgotPassword, customerResetPassword } from "./actions";
import { accountCopy } from "./copy";
import AccountShell from "./AccountShell";
import styles from "./account.module.css";
export function AccountMessage({ state }: { state: AccountState }) {
  const [language] = usePersistentLanguage();
  const copy = accountCopy[language];
  if (!state.message) return null;
  return <p className={styles.notice} role={state.status === "error" ? "alert" : "status"}>{copy[state.message as keyof typeof copy] || copy.service}</p>;
}
const actions = { login: customerLogin, register: customerRegister, forgot: customerForgotPassword, reset: customerResetPassword };
export default function AuthForm({ mode, invalid = false }: { mode: keyof typeof actions; invalid?: boolean }) {
  const [language] = usePersistentLanguage();
  const t = accountCopy[language];
  const [state, action, pending] = useActionState(actions[mode], initialAccountState);
  const success = state.status === "success";
  return <AccountShell><main className={styles.authLayout}>
    <p className={styles.eyebrow}>{t.account}</p><h1>{t[mode]}</h1>
    {invalid && !success && <AccountMessage state={{ status: "error", message: "invalidLink" }} />}
    {success ? <AccountMessage state={state} /> : !(mode === "reset" && invalid) && <form action={action} className={styles.form}>
      {mode !== "reset" && <label>{t.email}<input name="email" type="email" autoComplete="username" maxLength={254} required /></label>}
      {mode !== "forgot" && <label>{t.password}<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? undefined : 12} maxLength={256} required />{mode !== "login" && <small>{t.passwordHint}</small>}</label>}
      {(mode === "register" || mode === "reset") && <label>{t.confirmation}<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={256} required /></label>}
      {mode === "register" && <label className={styles.check}><input name="consent" type="checkbox" required /><Link href="/info/privacy" target="_blank" rel="noopener noreferrer">{t.consent}</Link></label>}
      <AccountMessage state={state} /><button className={styles.primary} disabled={pending || success}>{pending ? t.pending : mode === "forgot" ? t.send : mode === "reset" ? t.save : t[mode]}</button>
    </form>}
    <nav className={styles.authLinks}>
      {mode !== "login" && <Link href="/account/login">{t.login} ↗</Link>}
      {mode === "login" && <Link href="/account/register">{t.register} ↗</Link>}
      {mode !== "forgot" && <Link href="/account/forgot-password">{t.forgot} ↗</Link>}
      {mode === "reset" && success && <Link href="/account">{t.account} ↗</Link>}
    </nav>
  </main></AccountShell>;
}
