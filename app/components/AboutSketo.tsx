"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./AboutSketo.module.css";

type AboutItem = {
  fact: string;
  title: string;
  columns: string[];
  layout?: "two" | "three";
};

const aboutItems: AboutItem[] = [
  {
    fact: "Coffee for home and hospitality",
    title:
      "Sketo builds a coffee system where beans, equipment, and training work together instead of existing as separate products.",
    columns: [
      "We select coffee with a clear sensory profile, pair it with equipment that is reliable in daily use, and shape each touchpoint so the experience feels intentional from the first cup.",
      "The result is a brand that can speak both to someone brewing at home and to teams building a cafe, bar, or hospitality concept with a stronger coffee identity.",
    ],
    layout: "two",
  },
  {
    fact: "Curated beans, equipment, and education",
    title:
      "We treat the menu, the machine, and the workflow as one system, so the final cup stays consistent across training, service, and scale.",
    columns: [
      "Coffee is chosen for clarity and structure, with profiles that stay readable both in espresso and in slower filter formats.",
      "Equipment is selected not only for performance, but for how it fits the counter, the service rhythm, and the people using it every day.",
      "Education closes the loop: bar teams get practical calibration, recipe logic, and a cleaner understanding of how to repeat quality.",
    ],
    layout: "three",
  },
  {
    fact: "Built around taste, rhythm, and service",
    title:
      "Every Sketo setup is designed to feel calm behind the bar, readable for the guest, and precise enough to support long-term coffee quality.",
    columns: [
      "Taste is the starting point, but rhythm matters just as much: dialing in, milk workflow, service speed, and maintenance all shape the daily result.",
      "That is why we build around usable systems, not isolated products, so the coffee program remains stable as the space grows and the menu evolves.",
    ],
    layout: "two",
  },
];

export default function AboutSketo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageMinHeight, setStageMinHeight] = useState<number | null>(null);
  const activeItem = aboutItems[activeIndex];
  const contentStageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isFirstRenderRef = useRef(true);

  useLayoutEffect(() => {
    const measure = () => {
      const heights = measureRefs.current
        .map((node) => node?.offsetHeight ?? 0)
        .filter((height) => height > 0);

      if (!heights.length) {
        return;
      }

      setStageMinHeight(Math.max(...heights));
    };

    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!contentStageRef.current || !contentRef.current) {
      return;
    }

    const stage = contentStageRef.current;
    const content = contentRef.current;
    const title = content.querySelector(`.${styles.aboutTitle}`);
    const columns = content.querySelectorAll(`.${styles.aboutText}`);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      gsap.set(stage, { clipPath: "inset(0 0 0 0)" });
      gsap.set(content, {
        x: 0,
        autoAlpha: 1,
        skewX: 0,
        filter: "blur(0px)",
      });
      gsap.set([title, columns], {
        x: 0,
        autoAlpha: 1,
      });
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline.set(stage, {
      clipPath: "inset(0 0 0 0)",
    });

    timeline.fromTo(
      content,
      {
        x: -1500,
        autoAlpha: 0,
        skewX: 20,
        // filter: "blur(8px)",
      },
      {
        x: 0,
        autoAlpha: 1,
        skewX: 0,
        // filter: "blur(0px)",
        duration: 1.5,
      }
    );

    timeline.fromTo(
      title,
      {
        x: -56,
        autoAlpha: 0,
      },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.52,
      },
      0.12
    );

    timeline.fromTo(
      columns,
      {
        x: -38,
        autoAlpha: 0,
      },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.44,
        stagger: 0.08,
      },
      0.22
    );

    return () => {
      timeline.kill();
    };
  }, [activeIndex]);

  return (
    <section
      id="about-sketo-section"
      className={styles.aboutSection}
      aria-labelledby="about-sketo-title"
    >
      <div className={styles.aboutMeta}>
        <p className={styles.aboutKicker}>About Sketo</p>
        <div className={styles.aboutFacts} role="tablist" aria-label="About Sketo sections">
          {aboutItems.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={item.fact}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`about-panel-${index}`}
                id={`about-tab-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`${styles.aboutFactButton} ${
                  isActive ? styles.aboutFactButtonActive : ""
                }`}
              >
                {item.fact}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.aboutStage} ref={contentStageRef}>
        <div
          id={`about-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`about-tab-${activeIndex}`}
          className={styles.aboutContent}
          ref={contentRef}
          style={stageMinHeight ? { minHeight: `${stageMinHeight}px` } : undefined}
        >
          <h2 id="about-sketo-title" className={styles.aboutTitle}>
            {activeItem.title}
          </h2>

          <div
            className={`${styles.aboutColumns} ${
              activeItem.layout === "three" ? styles.aboutColumnsThree : ""
            }`}
          >
            {activeItem.columns.map((column) => (
              <p key={column} className={styles.aboutText}>
                {column}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.aboutMeasureLayer} aria-hidden="true">
          {aboutItems.map((item, index) => (
            <div
              key={item.fact}
              ref={(node) => {
                measureRefs.current[index] = node;
              }}
              className={styles.aboutMeasureContent}
            >
              <h2 className={styles.aboutTitle}>{item.title}</h2>

              <div
                className={`${styles.aboutColumns} ${
                  item.layout === "three" ? styles.aboutColumnsThree : ""
                }`}
              >
                {item.columns.map((column) => (
                  <p key={column} className={styles.aboutText}>
                    {column}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
