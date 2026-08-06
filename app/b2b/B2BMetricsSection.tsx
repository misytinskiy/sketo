"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./b2b.module.css";

gsap.registerPlugin(ScrollTrigger);

type Metric = {
  index: string;
  value: string;
  label: string;
  note: string;
};

type Props = {
  metrics: readonly Metric[];
  title: string;
  lead: string;
};

function animateNumericValue(
  element: HTMLElement,
  finalValue: string,
  delay = 0,
) {
  const numericPattern = /^\d+$/;
  const ratioPattern = /^(\d+)\/(\d+)$/;

  if (numericPattern.test(finalValue)) {
    const target = Number(finalValue);
    const length = finalValue.length;
    const state = { value: 0 };

    element.textContent = String(0).padStart(length, "0");

    gsap.to(state, {
      value: target,
      delay,
      duration: 1.05,
      ease: "power3.out",
      snap: { value: 1 },
      onUpdate: () => {
        element.textContent = String(Math.round(state.value)).padStart(length, "0");
      },
    });

    return;
  }

  const ratioMatch = finalValue.match(ratioPattern);

  if (ratioMatch) {
    const leftElement = element.querySelector<HTMLElement>("[data-metric-left]");
    const rightElement = element.querySelector<HTMLElement>("[data-metric-right]");

    if (!leftElement || !rightElement) {
      element.textContent = finalValue;
      return;
    }

    const [, leftFinal, rightFinal] = ratioMatch;
    const leftState = { value: 0 };
    const rightState = { value: 0 };

    leftElement.textContent = String(0).padStart(leftFinal.length, "0");
    rightElement.textContent = String(0).padStart(rightFinal.length, "0");

    gsap.to(leftState, {
      value: Number(leftFinal),
      delay,
      duration: 1.05,
      ease: "power3.out",
      snap: { value: 1 },
      onUpdate: () => {
        leftElement.textContent = String(Math.round(leftState.value)).padStart(
          leftFinal.length,
          "0",
        );
      },
    });

    gsap.to(rightState, {
      value: Number(rightFinal),
      delay: delay + 0.08,
      duration: 0.8,
      ease: "power3.out",
      snap: { value: 1 },
      onUpdate: () => {
        rightElement.textContent = String(Math.round(rightState.value)).padStart(
          rightFinal.length,
          "0",
        );
      },
    });

    return;
  }

  element.textContent = finalValue;
}

export default function B2BMetricsSection({ metrics, title, lead }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const introItems = gsap.utils.toArray<HTMLElement>("[data-metrics-intro]", section);
      const rows = gsap.utils.toArray<HTMLElement>("[data-metric-row]", section);

      gsap.set(introItems, {
        autoAlpha: 0,
        y: 20,
      });

      gsap.to(introItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      rows.forEach((row, index) => {
        const indexEl = row.querySelector<HTMLElement>("[data-metric-index]");
        const valueEl = row.querySelector<HTMLElement>("[data-metric-value]");
        const metaEl = row.querySelector<HTMLElement>("[data-metric-meta]");

        gsap.set([indexEl, metaEl], {
          autoAlpha: 0,
          y: 16,
        });

        gsap.set(valueEl, {
          autoAlpha: 0,
          y: 34,
          filter: "blur(10px)",
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 82%",
            once: true,
          },
        });

        timeline
          .to(
            [indexEl, metaEl],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              ease: "power2.out",
            },
            0,
          )
          .to(
            valueEl,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.95,
              ease: "power4.out",
            },
            index === 0 ? 0.08 : 0.02,
          )
          .add(() => {
            if (valueEl) {
              animateNumericValue(valueEl, valueEl.dataset.finalValue ?? valueEl.textContent ?? "");
            }
          }, 0.06);
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.metricsSection}>
      <div className={styles.metricsIntro}>
        <span data-metrics-intro className={styles.metricsMark}>
          *
        </span>
        <h2 data-metrics-intro className={styles.metricsTitle}>
          {title}
        </h2>
        <p data-metrics-intro className={styles.metricsLead}>{lead}</p>
      </div>

      <div className={styles.metricsTable}>
        {metrics.map((metric) => {
          const isRatio = metric.value.includes("/");
          const [leftValue = metric.value, rightValue = ""] = metric.value.split("/");

          return (
            <article
              key={metric.index}
              className={styles.metricRow}
              data-metric-row
            >
              <span
                className={styles.metricIndex}
                data-metric-index
              >
                {metric.index}
              </span>

              <div className={styles.metricCenter}>
                <span
                  className={styles.metricValue}
                  data-final-value={metric.value}
                  data-metric-value
                >
                  {isRatio ? (
                    <>
                      <span data-metric-left>{leftValue}</span>
                      <span className={styles.metricSlash}>/</span>
                      <span data-metric-right>{rightValue}</span>
                    </>
                  ) : (
                    metric.value
                  )}
                </span>
              </div>

              <div className={styles.metricMeta} data-metric-meta>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricNote}>{metric.note}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
