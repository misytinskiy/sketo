import styles from "./action-spinner.module.css";

export default function ActionSpinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}
