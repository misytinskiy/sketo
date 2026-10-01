"use client";

import usePersistentLanguage from "../components/usePersistentLanguage";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import styles from "./why.module.css";

export default function WhyHomeLogo() {
  const [language] = usePersistentLanguage();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isClient) {
    return null;
  }

  const portalTarget = document.getElementById("fixed-layer");

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <Link href="/" className={styles.homeLogo} aria-label={language === "kz" ? "Sketo басты беті" : "Sketo home"}>
      sketo.
    </Link>,
    portalTarget,
  );
}
