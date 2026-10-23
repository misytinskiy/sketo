"use client";
import { useOpenCart } from "./CartProvider";
import { useCartLines } from "./store";
import { cartTotals } from "./model";
import { cartCopy } from "./copy";
import usePersistentLanguage from "../components/usePersistentLanguage";
import styles from "./cart.module.css";

export default function CartButton() {
  const open = useOpenCart();
  const [language] = usePersistentLanguage();
  const count = cartTotals(useCartLines()).count;
  return <button type="button" className={styles.trigger} onClick={open} aria-haspopup="dialog" aria-label={`${cartCopy[language].title} (${count})`}>
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M3 3h2l2.5 12h11l2-9H6M8 19h.01M18 19h.01" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="19" r="1"/><circle cx="18" cy="19" r="1"/></svg>
    <span>({count})</span>
  </button>;
}
