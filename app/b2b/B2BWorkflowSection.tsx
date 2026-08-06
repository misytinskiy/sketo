"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./b2b.module.css";

gsap.registerPlugin(ScrollTrigger);

type WorkflowStep = {
  index: string;
  title: string;
  text: string;
};

type B2BWorkflowSectionProps = {
  steps: readonly WorkflowStep[];
  lead: string;
  mapAriaLabel: string;
};

export default function B2BWorkflowSection({
  steps,
  lead,
  mapAriaLabel,
}: B2BWorkflowSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-workflow-step]", section);

      cards.forEach((card) => {
        const contentBlock = card.querySelector<HTMLElement>("[data-workflow-content]");

        if (!contentBlock) {
          return;
        }

        gsap.set(contentBlock, {
          autoAlpha: 0,
          x: -24,
          clipPath: "inset(0 100% 0 0)",
          willChange: "transform, opacity, clip-path",
        });

        gsap.to(contentBlock, {
          autoAlpha: 1,
          x: 0,
          clipPath: "inset(0 0% 0 0)",
          duration: 0.6,
          ease: "power3.out",
          clearProps: "willChange",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.workflowSection}>
      <div className={styles.workflowIntro}>
        <p className={styles.eyebrow}>workflow / how it works</p>
        <h2 className={styles.workflowTitle}>
          How
          <br />
          work moves
        </h2>
        <p className={styles.workflowLead}>{lead}</p>
      </div>

      <div className={styles.workflowMap} aria-label={mapAriaLabel}>
    

        {steps.map((step, index) => (
          <article
            key={step.index}
            data-workflow-step
            className={`${styles.workflowStep} ${
              index % 2 === 0 ? styles.workflowStepRight : styles.workflowStepLeft
            }`}
          >
            <span className={styles.workflowDot} aria-hidden="true" />
            <span className={styles.workflowBranch} aria-hidden="true" />

            <div className={styles.workflowNode} data-workflow-content>
              <div className={styles.workflowNodeTop}>
                <span className={styles.workflowIndex}>{step.index}</span>
                <h3 className={styles.workflowNodeTitle}>{step.title}</h3>
              </div>
              <p className={styles.workflowText}>{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
