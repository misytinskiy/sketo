"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./why.module.css";

export default function WhyFinalCtaButton() {
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

    element.style.setProperty("--final-link-shift-x", `${offsetX * 10}px`);
    element.style.setProperty("--final-link-shift-y", `${offsetY * 10}px`);
    element.style.setProperty("--final-link-text-x", `${offsetX * 4}px`);
    element.style.setProperty("--final-link-text-y", `${offsetY * 3}px`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    updatePointerVars(event.clientX, event.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsHovered(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
  };

  const className = [styles.finalLink, isHovered ? styles.finalLinkHovered : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      ref={linkRef}
      href="/catalog"
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className={styles.finalLinkLabel}>View catalogue</span>
    </Link>
  );
}
