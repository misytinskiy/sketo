"use client";

import { useState } from "react";
import styles from "./b2b.module.css";

type Service = {
  index: string;
  title: string;
  lead: string;
  body: readonly string[];
  tags: readonly string[];
};

type B2BBlueprintSectionProps = {
  services: readonly Service[];
  stages: readonly string[];
  lead: string;
  stageListAriaLabel: string;
};

export default function B2BBlueprintSection({
  services,
  stages,
  lead,
  stageListAriaLabel,
}: B2BBlueprintSectionProps) {
  const [openService, setOpenService] = useState<string | null>(null);

  return (
    <section className={styles.blueprintSection}>
      <div className={styles.blueprintRail}>
        <div className={styles.blueprintSticky}>
          <p className={styles.eyebrow}>service map</p>
          <div className={styles.blueprintStickyBody}>
            <h2 className={styles.blueprintTitle}>
              From concept
              <br />
              to daily
              <br />
              operation
            </h2>
            <p className={styles.blueprintLead}>{lead}</p>

            <div className={styles.stageList} aria-label={stageListAriaLabel}>
              {stages.map((stage, index) => {
                const stageIndex = String(index + 1).padStart(2, "0");
                const isActive = openService === stageIndex;

                return (
                  <div
                    key={stage}
                    className={`${styles.stageItem} ${
                      isActive ? styles.stageItemActive : ""
                    }`}
                  >
                    <span className={styles.stageIndex}>{stageIndex}</span>
                    <span className={styles.stageName}>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardsColumn}>
        {services.map((service) => {
          const isOpen = openService === service.index;

          return (
            <article
              key={service.index}
              className={`${styles.serviceCard} ${
                isOpen ? styles.serviceCardOpen : ""
              }`}
            >
              <div className={styles.serviceGrid}>
                <div className={styles.serviceIndexWrap}>
                  <span className={styles.serviceIndex}>{service.index}</span>
                </div>

                <button
                  type="button"
                  className={styles.serviceMainButton}
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenService((current) =>
                      current === service.index ? null : service.index
                    )
                  }
                >
                  <div className={styles.serviceMain}>
                    <div className={styles.serviceHeader}>
                      <div className={styles.serviceTitleRow}>
                        <h3 className={styles.serviceTitle}>{service.title}</h3>
                        <span
                          className={`${styles.serviceArrow} ${
                            isOpen ? styles.serviceArrowOpen : ""
                          }`}
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </div>
                      <div className={styles.serviceTags}>
                        {service.tags.map((tag) => (
                          <span key={tag} className={styles.serviceTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.serviceContent}>
                      <div className={styles.serviceContentInner}>
                        <p className={styles.serviceLead}>{service.lead}</p>
                        <div className={styles.serviceTextGrid}>
                          {service.body.map((paragraph) => (
                            <p
                              key={paragraph}
                              className={styles.serviceParagraph}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
