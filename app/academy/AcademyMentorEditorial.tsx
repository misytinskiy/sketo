"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Mentor = {
  name: string;
  role: string;
  image: string;
  stats: readonly string[];
  focus: readonly string[];
  note: string;
};

type AcademyMentorEditorialProps = {
  mentors: readonly Mentor[];
};

export default function AcademyMentorEditorial({
  mentors,
}: AcademyMentorEditorialProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMentor = mentors[activeIndex];

  return (
    <div className={styles.editorialMentor}>
      <div className={styles.editorialMentorMedia}>
        <div className={styles.editorialMentorImageWrap}>
          <Image
            src={activeMentor.image}
            alt={activeMentor.name}
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
            className={styles.editorialMentorImage}
          />
        </div>
      </div>

      <div className={styles.editorialMentorBody}>
        <div className={styles.editorialMentorTopline}>
          <span className={styles.eyebrow}>
            /{String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className={styles.editorialMentorRole}>
            {activeMentor.role}
          </span>
        </div>

        <div className={styles.editorialMentorHeader}>
          <h3 className={styles.editorialMentorName}>{activeMentor.name}</h3>
          <p className={styles.editorialMentorNote}>{activeMentor.note}</p>
        </div>

        <div className={styles.editorialMentorColumns}>
          <div className={styles.editorialMentorColumn}>
            <span className={styles.editorialMentorLabel}>background</span>
            <ul className={styles.editorialMentorList}>
              {activeMentor.stats.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.editorialMentorColumn}>
            <span className={styles.editorialMentorLabel}>focus</span>
            <ul className={styles.editorialMentorList}>
              {activeMentor.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.editorialMentorSwitches}>
          {mentors.map((mentor, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={mentor.name}
                type="button"
                className={`${styles.editorialMentorSwitch} ${
                  isActive ? styles.editorialMentorSwitchActive : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
              >
                <span className={styles.editorialMentorSwitchIndex}>
                  /{String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.editorialMentorSwitchName}>
                  {mentor.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
