"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import gsap from "gsap";
import styles from "./b2b.module.css";

type B2BAudienceCoreProps = {
  label: string;
  title: string;
};

export default function B2BAudienceCore({
  label,
  title,
}: B2BAudienceCoreProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rootXToRef = useRef<((value: number) => gsap.core.Tween) | null>(null);
  const rootYToRef = useRef<((value: number) => gsap.core.Tween) | null>(null);
  const contentXToRef = useRef<((value: number) => gsap.core.Tween) | null>(null);
  const contentYToRef = useRef<((value: number) => gsap.core.Tween) | null>(null);

  const ensureQuickTo = () => {
    if (!rootRef.current || !contentRef.current) {
      return;
    }

    if (!rootXToRef.current || !rootYToRef.current) {
      rootXToRef.current = gsap.quickTo(rootRef.current, "x", {
        duration: 0.45,
        ease: "power3.out",
      });
      rootYToRef.current = gsap.quickTo(rootRef.current, "y", {
        duration: 0.45,
        ease: "power3.out",
      });
    }

    if (!contentXToRef.current || !contentYToRef.current) {
      contentXToRef.current = gsap.quickTo(contentRef.current, "x", {
        duration: 0.55,
        ease: "power3.out",
      });
      contentYToRef.current = gsap.quickTo(contentRef.current, "y", {
        duration: 0.55,
        ease: "power3.out",
      });
    }
  };

  const getPointerPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      radius: Math.hypot(rect.width, rect.height),
    };
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fillRef.current) {
      return;
    }

    ensureQuickTo();
    setIsHovered(true);

    const { x, y, radius } = getPointerPosition(event);

    gsap.killTweensOf(fillRef.current);
    gsap.set(fillRef.current, {
      clipPath: `circle(0px at ${x}px ${y}px)`,
    });
    gsap.to(fillRef.current, {
      clipPath: `circle(${radius}px at ${x}px ${y}px)`,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    ensureQuickTo();

    const { x, y, width, height } = getPointerPosition(event);
    const offsetX = (x / width - 0.5) * 16;
    const offsetY = (y / height - 0.5) * 16;

    rootXToRef.current?.(offsetX * 0.45);
    rootYToRef.current?.(offsetY * 0.45);
    contentXToRef.current?.(offsetX);
    contentYToRef.current?.(offsetY);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fillRef.current) {
      return;
    }

    const { x, y } = getPointerPosition(event);

    gsap.killTweensOf(fillRef.current);
    gsap.to(fillRef.current, {
      clipPath: `circle(0px at ${x}px ${y}px)`,
      duration: 0.45,
      ease: "power2.out",
    });

    rootXToRef.current?.(0);
    rootYToRef.current?.(0);
    contentXToRef.current?.(0);
    contentYToRef.current?.(0);

    setIsHovered(false);
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.audienceCore} ${
        isHovered ? styles.audienceCoreHovered : ""
      }`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span
        ref={fillRef}
        className={styles.audienceCoreFill}
        aria-hidden="true"
      />
      <div ref={contentRef} className={styles.audienceCoreContent}>
        <span className={styles.audienceCoreLabel}>{label}</span>
        <p className={styles.audienceCoreTitle}>{title}</p>
      </div>
    </div>
  );
}
