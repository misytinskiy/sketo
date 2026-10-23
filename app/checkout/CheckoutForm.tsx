"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import ShopHeaderActions from "../components/ShopHeaderActions";
import usePersistentLanguage from "../components/usePersistentLanguage";
import { money, useOpenCart } from "../cart/CartProvider";
import { cartCopy } from "../cart/copy";
import { cartKey, cartTotals } from "../cart/model";
import { useCartLines } from "../cart/store";
import { checkoutCopy } from "./copy";
import styles from "./checkout.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function CheckoutForm() {
  const [language] = usePersistentLanguage();
  const t = checkoutCopy[language];
  const cartText = cartCopy[language];
  const lines = useCartLines();
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const totals = cartTotals(lines);
  const openCart = useOpenCart();
  const [buyer, setBuyer] = useState<"personal" | "business">("personal");
  const [delivery, setDelivery] = useState<"delivery" | "pickup">("delivery");
  const [submittedCart, setSubmittedCart] = useState<string | null>(null);
  const phone = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const cartSignature = JSON.stringify(lines);
  const submitted = submittedCart === cartSignature;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phone.current?.value.replace(/\D/g, "") ?? "";
    if (digits.length < 10 || digits.length > 15) {
      phone.current?.setCustomValidity(t.phoneError);
      phone.current?.reportValidity();
      return;
    }
    if (!lines.length) return;
    setSubmittedCart(cartSignature);
    requestAnimationFrame(() => status.current?.focus());
  }

  return <div className={styles.page}>
    <div className={styles.viewport}>
      <header className={styles.header}><Link href="/" className={styles.logo} aria-label="Sketo">sketo.</Link><ShopHeaderActions /></header>
      {!ready ? <main className={styles.empty} aria-busy="true"><p>{t.loading}</p></main> : !lines.length ? <main className={styles.empty}>
        <h1>{cartText.empty}</h1><p>{cartText.emptyNote}</p><Link className={styles.textLink} href="/catalog">{cartText.browse} ↗</Link>
      </main> : <main>
        <form className={styles.layout} onSubmit={submit} onChange={() => setSubmittedCart(null)}>
        <div className={styles.formColumn}>
          <h1>{t.title}</h1>
          <div className={styles.buyerSwitch} role="group" aria-label={t.title}>
            {(["personal", "business"] as const).map(type => <button key={type} type="button" aria-pressed={buyer === type} onClick={() => { setBuyer(type); setSubmittedCart(null); }}>{t[type]}</button>)}
          </div>
          <fieldset className={styles.fieldset}>
            <legend>{t.contacts}</legend>
            <div className={styles.fields}>
              <label className={styles.field}><span>{t.name}</span><input name="name" placeholder={t.name} autoComplete="given-name" required pattern={".*\\S.*"} maxLength={100} /></label>
              <label className={styles.field}><span>{t.phone}</span><input ref={phone} name="phone" type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" required maxLength={30} onInput={event => event.currentTarget.setCustomValidity("")} /></label>
              {buyer === "business" && <>
                <label className={styles.field}><span>{t.company}</span><input name="company" autoComplete="organization" required pattern={".*\\S.*"} maxLength={200} /></label>
                <label className={styles.field}><span>{t.bin}</span><input name="bin" inputMode="numeric" pattern="[0-9]{12}" minLength={12} maxLength={12} placeholder="000000000000" required /></label>
                <label className={`${styles.field} ${styles.wide}`}><span>{t.email}</span><input name="email" type="email" placeholder="name@company.kz" autoComplete="email" required maxLength={254} /></label>
              </>}
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend>{t.receiving}</legend>
            <div className={styles.deliveryOptions}>
              {(["delivery", "pickup"] as const).map(method => <label key={method}><input type="radio" name="deliveryMethod" value={method} checked={delivery === method} onChange={() => setDelivery(method)} /><span>{t[method]}</span></label>)}
            </div>
            {delivery === "delivery" ? <div className={styles.fields}>
              <label className={styles.field}><span>{t.city}</span><input name="city" defaultValue="Астана" autoComplete="address-level2" required pattern={".*\\S.*"} maxLength={100} /></label>
              <label className={styles.field}><span>{t.street}</span><input name="street" placeholder={t.addressPlaceholder} autoComplete="address-line1" required pattern={".*\\S.*"} maxLength={200} /></label>
              <label className={styles.field}><span>{t.apartment}</span><input name="apartment" placeholder={t.optional} autoComplete="address-line2" maxLength={100} /></label>
              <label className={styles.field}><span>{t.courierNote}</span><input name="courierNote" placeholder={t.optional} maxLength={300} /></label>
            </div> : <p className={styles.pickupNote}>{t.pickupNote}</p>}
          </fieldset>
          <details className={styles.comment}>
            <summary>{t.comment}<span aria-hidden="true" /></summary>
            <label className={styles.field}><span>{t.commentLabel}</span><textarea name="comment" rows={3} maxLength={1500} placeholder={t.commentPlaceholder} /></label>
          </details>
        </div>
        <aside className={styles.orderColumn} aria-labelledby="order-summary-title">
          <div className={styles.orderHeading}><h2 id="order-summary-title">{t.review}</h2><button type="button" className={styles.textLink} onClick={openCart}>{t.edit}</button></div>
          <ul className={styles.products}>{lines.map(line => {
            const content = line.content[language];
            return <li key={cartKey(line)} className={styles.product}>
              <Link className={styles.image} href={line.href} tabIndex={-1} aria-hidden="true"><Image src={line.image || "/image-unavailable.svg"} alt="" width={110} height={120} unoptimized /></Link>
              <div className={styles.productCopy}><Link href={line.href}>{content.name}</Link><p>{[content.detail, `${line.quantity} ${t.quantity}`].filter(Boolean).join(" · ")}</p></div>
              <strong>{line.unitPrice === null ? cartText.quote : money(line.unitPrice * line.quantity, language)}</strong>
            </li>;
          })}</ul>
          <dl className={styles.breakdown}>
            <div><dt>{totals.needsQuote ? cartText.knownTotal : t.items}</dt><dd>{money(totals.subtotal, language)}</dd></div>
            <div><dt>{t[delivery]}</dt><dd>{delivery === "delivery" ? t.deliveryLater : t.pickupLater}</dd></div>
          </dl>
          <div className={styles.total} aria-live="polite"><span>{totals.needsQuote ? cartText.knownTotal : cartText.total}</span><strong>{money(totals.subtotal, language)}</strong></div>
          {totals.needsQuote && <p className={styles.note}>{cartText.quoteNote}</p>}
          <label className={styles.consent}><input type="checkbox" name="consent" required /><span>{t.acceptStart}<Link href="/info/offer" target="_blank" rel="noopener noreferrer">{t.offer}</Link>{t.acceptMiddle}<Link href="/info/privacy" target="_blank" rel="noopener noreferrer">{t.privacy}</Link></span></label>
          <button type="submit" className={styles.submit}>{t.submit}</button>
          <p className={styles.demo}>{t.demo}</p>
          <p ref={status} tabIndex={-1} role="status" className={submitted ? styles.success : styles.status}>{submitted ? t.success : ""}</p>
          <p className={styles.note}>{t.process}</p>
          <div className={styles.help}><span>{t.help}</span><Link className={styles.textLink} href="/contacts">{t.write} ↗</Link></div>
        </aside>
        </form>
      </main>}
    </div>
    <div className={styles.footerWrap}><Footer language={language} /></div>
  </div>;
}
