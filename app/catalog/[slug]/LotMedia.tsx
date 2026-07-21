"use client";

import Image from "next/image";
import gsap from "gsap";
import { type PointerEvent, useRef } from "react";
import styles from "./lot.module.css";

type LotMediaProps = {
  image: string;
  name: string;
};

export default function LotMedia({ image, name }: LotMediaProps) {
  const imageMotionRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!imageMotionRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(imageMotionRef.current, {
      x: offsetX * 22,
      y: offsetY * 22,
      rotateX: -offsetY * 3,
      rotateY: offsetX * 3,
      scale: 1.04,
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
      transformPerspective: 1000,
    });
  };

  const resetImage = () => {
    if (!imageMotionRef.current) {
      return;
    }

    gsap.to(imageMotionRef.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
    });
  };

  return (
    <div
      className={styles.mediaPanel}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetImage}
    >
      <div className={styles.mediaGrid} aria-hidden="true" />
      <span className={`${styles.cropMark} ${styles.cropTopLeft}`} />
      <span className={`${styles.cropMark} ${styles.cropTopRight}`} />
      <span className={`${styles.cropMark} ${styles.cropBottomLeft}`} />
      <span className={`${styles.cropMark} ${styles.cropBottomRight}`} />
      <p className={styles.mediaCaption} aria-hidden="true">
        PRODUCT SHEET / VISUAL FRAME
      </p>
      <div ref={imageMotionRef} className={styles.mediaMotion}>
        <Image
          src={image}
          alt={name}
          fill
          priority
          sizes="(max-width: 980px) 100vw, 50vw"
          className={styles.mediaImage}
        />
      </div>
    </div>
  );
}
