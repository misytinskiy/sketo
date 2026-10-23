"use client";
import LanguageSwitch from "./LanguageSwitch";
import type { Language } from "./language";
import CartButton from "../cart/CartButton";
import styles from "../cart/cart.module.css";

export default function ShopHeaderActions(props: { value?: Language; onChange?: (language: Language) => void }) {
  return <div className={styles.headerActions}><LanguageSwitch {...props} /><CartButton /></div>;
}
