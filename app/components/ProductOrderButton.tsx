"use client";

import { buildWhatsAppOrderUrl, orderCopy, type WhatsAppOrder } from "@/lib/whatsapp-order";
import { useOpenCart } from "../cart/CartProvider";
import { addToCart, useCartLines } from "../cart/store";
import { cartKey, MAX_LINES, type CartProduct } from "../cart/model";
import { cartCopy } from "../cart/copy";
import cartStyles from "../cart/cart.module.css";
import styles from "./ProductOrderButton.module.css";

export default function ProductOrderButton(props: WhatsAppOrder & { cartItem?: CartProduct; unavailable?: boolean }) {
  const copy = orderCopy[props.language];
  const t = cartCopy[props.language];
  const open = useOpenCart();
  const lines = useCartLines();
  const full = lines.length >= MAX_LINES && props.cartItem && !lines.some(line => cartKey(line) === cartKey(props.cartItem!));
  if (props.cartItem) return <div className={styles.order}>
    <button type="button" className={styles.button} disabled={props.unavailable || Boolean(full)} onClick={() => { addToCart(props.cartItem!); open(); }}>
      <span className={styles.label}>{props.unavailable ? t.unavailable : t.add}</span>
    </button>
    {full && <p className={cartStyles.note}>{t.limit}</p>}
    <a className={cartStyles.textLink} href={buildWhatsAppOrderUrl(props)} target="_blank" rel="noopener noreferrer">{copy.button} ↗</a>
  </div>;
  return <div className={styles.order}>
    <a className={styles.button} href={buildWhatsAppOrderUrl(props)} target="_blank" rel="noopener noreferrer">
      <span className={styles.label}>{copy.button}</span>
    </a>
  </div>;
}
