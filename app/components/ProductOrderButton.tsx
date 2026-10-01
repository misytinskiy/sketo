import { buildWhatsAppOrderUrl, orderCopy, type WhatsAppOrder } from "@/lib/whatsapp-order";
import styles from "./ProductOrderButton.module.css";

export default function ProductOrderButton(props: WhatsAppOrder) {
  const copy = orderCopy[props.language];
  return <div className={styles.order}>
    <a className={styles.button} href={buildWhatsAppOrderUrl(props)} target="_blank" rel="noopener noreferrer">
      <span className={styles.label}>{copy.button}</span>
    </a>
  </div>;
}
