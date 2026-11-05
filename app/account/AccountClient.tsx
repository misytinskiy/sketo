"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { initialAccountState, type CustomerProfile } from "@/lib/customer-profile";
import usePersistentLanguage from "../components/usePersistentLanguage";
import { saveCustomerProfile, customerLogout, changeCustomerEmail } from "./actions";
import { AccountMessage } from "./AuthForm";
import { accountCopy } from "./copy";
import AccountShell from "./AccountShell";
import styles from "./account.module.css";

export default function AccountClient({ profile, email }: { profile: CustomerProfile; email: string }) {
  const [language] = usePersistentLanguage();
  const t = accountCopy[language];
  const [section, setSection] = useState<"profile" | "orders">(profile.full_name ? "orders" : "profile");
  const [buyer, setBuyer] = useState(profile.account_type);
  const [state, save, saving] = useActionState(saveCustomerProfile, initialAccountState);
  const [exitState, exit, exiting] = useActionState(customerLogout, initialAccountState);
  const [emailState, updateEmail, changingEmail] = useActionState(changeCustomerEmail, initialAccountState);
  return <AccountShell><main className={styles.layout}>
    <aside className={styles.sidebar}><p className={styles.eyebrow}>{t.account}</p><p className={styles.name}>{profile.full_name || t.account}</p>
      <nav className={styles.nav} aria-label={t.account}>{(["orders", "profile"] as const).map(key => <button key={key} type="button" aria-current={section === key ? "page" : undefined} onClick={() => setSection(key)}>{t[key]}</button>)}</nav>
      <form action={exit}><button className={styles.exit} disabled={exiting}>{exiting ? t.pending : t.logout}</button><AccountMessage state={exitState} /></form>
    </aside>
    <div className={styles.content}>
      {section === "orders" ? <section><h1>{t.orders}</h1><h2 className={styles.subheading}>{t.empty}</h2><p className={styles.intro}>{t.emptyNote}</p><Link className={styles.textLink} href="/catalog">{t.browse} ↗</Link></section> : <section>
        <h1>{t.profile}</h1>
        <form action={save} className={styles.form} key={JSON.stringify(profile)}>
          <label>{t.name}<input name="full_name" defaultValue={profile.full_name} autoComplete="name" maxLength={100} required /></label>
          <label>{t.phone}<input name="phone" type="tel" defaultValue={profile.phone} placeholder="+7 700 000 00 00" autoComplete="tel" maxLength={40} required /></label>
          <label>{t.email}<input value={email} readOnly type="email" /></label>
          <fieldset className={styles.buyerType}><legend>{t.personal} / {t.business}</legend>{(["personal", "business"] as const).map(type => <label key={type}><input type="radio" name="account_type" value={type} checked={buyer === type} onChange={() => setBuyer(type)} />{t[type]}</label>)}</fieldset>
          {buyer === "business" && <>
            <label>{t.company}<input name="company_name" defaultValue={profile.company_name} autoComplete="organization" maxLength={200} required /></label>
            <label>{t.bin}<input name="bin" defaultValue={profile.bin} inputMode="numeric" pattern="[0-9]{12}" minLength={12} maxLength={12} required /></label><p className={styles.notice}>{t.businessNote}</p>
          </>}
          <AccountMessage state={state} /><button className={styles.primary} disabled={saving}>{saving ? t.pending : t.save}</button>
        </form>
        <details className={styles.emailDetails}><summary>{t.changeEmail}</summary><p className={styles.intro}>{t.emailNote}</p>
          <form action={updateEmail} className={styles.form}><label>{t.newEmail}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label><label>{t.currentPassword}<input name="currentPassword" type="password" autoComplete="current-password" maxLength={256} required /></label><AccountMessage state={emailState} /><button className={styles.primary} disabled={changingEmail || emailState.status === "success"}>{changingEmail ? t.pending : t.changeEmail}</button></form>
        </details>
        <Link className={styles.textLink} href="/account/forgot-password">{t.forgot} ↗</Link>
      </section>}
    </div>
  </main></AccountShell>;
}
