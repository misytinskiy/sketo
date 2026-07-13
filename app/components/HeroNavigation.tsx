"use client";

import Image from "next/image";
import Link from "next/link";
import type { FocusEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";

const navItems = [
  { id: "catalog", label: "Каталог", href: "/catalog", image: "/photo/1.JPG" },
  { id: "about", label: "О нас", href: "#about", image: "/photo/2.JPG" },
  { id: "academy", label: "Академия", href: "#academy", image: "/photo/3.JPG" },
  { id: "contacts", label: "Контакты", href: "#contacts", image: "/photo/4.JPG" },
] as const;

export default function HeroNavigation() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [leavingItem, setLeavingItem] = useState<string | null>(null);
  const [previewLeft, setPreviewLeft] = useState<string>("50%");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const heroNavRef = useRef<HTMLDivElement | null>(null);
  const leavingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (leavingTimeoutRef.current) {
        clearTimeout(leavingTimeoutRef.current);
      }
    };
  }, []);

  const scheduleLeavingReset = (itemId: string | null) => {
    if (leavingTimeoutRef.current) {
      clearTimeout(leavingTimeoutRef.current);
    }

    setLeavingItem(itemId);

    if (itemId) {
      leavingTimeoutRef.current = setTimeout(() => {
        setLeavingItem((current) => (current === itemId ? null : current));
      }, 340);
    }
  };

  const activateItem = (
    itemId: string,
    event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
  ) => {
    const itemRect = event.currentTarget.getBoundingClientRect();
    const navRect = heroNavRef.current?.getBoundingClientRect();

    if (navRect) {
      setPreviewLeft(`${itemRect.left + itemRect.width / 2 - navRect.left}px`);
    }

    if (activeItem && activeItem !== itemId) {
      scheduleLeavingReset(activeItem);
    } else if (leavingTimeoutRef.current) {
      clearTimeout(leavingTimeoutRef.current);
      leavingTimeoutRef.current = null;
      setLeavingItem(null);
    }

    setActiveItem(itemId);
  };

  const deactivateActiveItem = () => {
    if (activeItem) {
      scheduleLeavingReset(activeItem);
    }

    setActiveItem(null);
  };

  return (
    <div ref={heroNavRef} className={styles.heroNav}>
      <div
        className={`${styles.preview} ${
          activeItem && loadedImages[activeItem] ? styles.previewVisible : ""
        }`}
        style={{ left: previewLeft }}
        aria-hidden="true"
      >
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.previewImageWrap} ${
              activeItem === item.id ? styles.previewImageActive : ""
            }`}
          >
            <Image
              src={item.image}
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 0px, 320px"
              className={styles.previewImage}
              onLoad={() =>
                setLoadedImages((current) =>
                  current[item.id] ? current : { ...current, [item.id]: true },
                )
              }
            />
          </div>
        ))}
      </div>

      <nav
        className={styles.nav}
        aria-label="Основная навигация"
        onMouseLeave={deactivateActiveItem}
      >
        {navItems.map((item, index) => {
          const content = (
            <>
              <span className={styles.navNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </>
          );

          const sharedProps = {
            className: [
              styles.navItem,
              activeItem === item.id ? styles.navItemActive : "",
              leavingItem === item.id ? styles.navItemLeaving : "",
            ]
              .filter(Boolean)
              .join(" "),
            onMouseEnter: (
              event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
            ) => activateItem(item.id, event),
            onFocus: (
              event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
            ) => activateItem(item.id, event),
            onBlur: deactivateActiveItem,
          };

          if (item.href.startsWith("/")) {
            return (
              <Link key={item.id} href={item.href} {...sharedProps}>
                {content}
              </Link>
            );
          }

          return (
            <a key={item.id} href={item.href} {...sharedProps}>
              {content}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
