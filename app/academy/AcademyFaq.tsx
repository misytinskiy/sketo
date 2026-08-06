"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type AcademyFaqItem = {
  question: string;
  answer: string;
};

type AcademyFaqProps = {
  items: readonly AcademyFaqItem[];
};

export default function AcademyFaq({ items }: AcademyFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const detailRefs = useRef<Array<HTMLDivElement | null>>([]);

  const itemKeys = useMemo(
    () => items.map((item) => item.question),
    [items],
  );

  useEffect(() => {
    const measure = () => {
      setHeights(
        detailRefs.current.map((node) => (node ? node.scrollHeight : 0)),
      );
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });

    detailRefs.current.forEach((node) => {
      if (node) {
        resizeObserver.observe(node);
      }
    });

    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [itemKeys]);

  return (
    <div className={styles.faqAccordion}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <article
            key={item.question}
            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
          >
            <button
              type="button"
              className={styles.faqSummary}
              onClick={() => {
                setOpenIndex((current) => (current === index ? null : index));
              }}
              aria-expanded={isOpen}
              aria-controls={`academy-faq-panel-${index}`}
            >
              <span className={styles.faqSummaryIndex}>
                /{String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.faqSummaryTitle}>{item.question}</span>
              <span className={styles.faqSummaryToggle} aria-hidden="true">
                <span className={styles.faqSummaryArrow} />
              </span>
            </button>

            <div
              id={`academy-faq-panel-${index}`}
              className={styles.faqDetailsWrap}
              style={{ height: isOpen ? `${heights[index] ?? 0}px` : "0px" }}
            >
              <div
                ref={(node) => {
                  detailRefs.current[index] = node;
                }}
                className={styles.faqDetails}
              >
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
