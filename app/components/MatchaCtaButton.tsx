"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Language } from "./LanguageSwitch";
import styles from "./MatchaFeature.module.css";

type MatchaCtaButtonProps = {
  language: Exclude<Language, "kz">;
};

export default function MatchaCtaButton({ language }: MatchaCtaButtonProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const updatePointerVars = (clientX: number, clientY: number) => {
    const element = linkRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;

    element.style.setProperty("--matcha-link-shift-x", `${offsetX * 10}px`);
    element.style.setProperty("--matcha-link-shift-y", `${offsetY * 10}px`);
    element.style.setProperty("--matcha-link-text-x", `${offsetX * 4}px`);
    element.style.setProperty("--matcha-link-text-y", `${offsetY * 3}px`);
  };

  const className = [styles.ctaLink, isHovered ? styles.ctaLinkHovered : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      ref={linkRef}
      href="/contacts"
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={(event) => updatePointerVars(event.clientX, event.clientY)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <span className={styles.ctaLinkLabel}>
        {language === "en" ? "visit sketo" : "посетить sketo"}
      </span>
    </Link>
  );
}
