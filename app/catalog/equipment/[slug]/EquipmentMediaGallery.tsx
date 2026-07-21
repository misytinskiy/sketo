"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./equipment-item.module.css";

type EquipmentMediaGalleryProps = {
  images: string[];
  name: string;
};

export default function EquipmentMediaGallery({
  images,
  name,
}: EquipmentMediaGalleryProps) {
  const galleryImages = images.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

  const showPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    );
  };

  const showNext = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <div className={styles.mediaColumn}>
      <div className={styles.mediaPanel}>
        <div className={styles.mediaViewport}>
          <Image
            src={activeImage}
            alt={`${name} view ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 980px) 100vw, 54vw"
            className={styles.mediaImage}
          />
        </div>

        {hasMultipleImages ? (
          <div className={styles.mediaControls}>
            <button
              type="button"
              onClick={showPrevious}
              className={styles.mediaButton}
              aria-label="Previous image"
            >
              Prev
            </button>

            <p className={styles.mediaCounter}>
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(galleryImages.length).padStart(2, "0")}
            </p>

            <button
              type="button"
              onClick={showNext}
              className={styles.mediaButton}
              aria-label="Next image"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.thumbnailGrid}>
        {galleryImages.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`${styles.thumbnailButton} ${
                isActive ? styles.thumbnailButtonActive : ""
              }`}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={isActive}
            >
              <span className={styles.thumbnailIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.thumbnailLine} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
