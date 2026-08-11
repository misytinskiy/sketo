"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type AcademyCourse = {
  title: string;
  level: string;
  format: string;
  price: string;
  lead: string;
  details: readonly string[];
};

type AcademyCoursesProps = {
  courses: readonly AcademyCourse[];
};

export default function AcademyCourses({ courses }: AcademyCoursesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const detailRefs = useRef<Array<HTMLDivElement | null>>([]);

  const courseKeys = useMemo(
    () => courses.map((course) => `${course.title}-${course.level}`),
    [courses],
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
  }, [courseKeys]);

  return (
    <div className={styles.courseAccordion}>
      {courses.map((course, index) => {
        const isOpen = openIndex === index;

        return (
          <article
            key={`${course.title}-${course.level}`}
            className={`${styles.courseItem} ${
              isOpen ? styles.courseItemOpen : ""
            }`}
          >
            <button
              type="button"
              className={styles.courseSummary}
              onClick={() => {
                setOpenIndex((current) => (current === index ? null : index));
              }}
              aria-expanded={isOpen}
              aria-controls={`academy-course-panel-${index}`}
            >
              <span className={styles.courseSummaryIndex}>
                /{String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.courseSummaryTitle}>{course.title}</span>
              <span
                className={`${styles.courseSummaryMeta} ${styles.courseSummaryLevel}`}
              >
                {course.level}
              </span>
              <span
                className={`${styles.courseSummaryMeta} ${styles.courseSummaryFormat}`}
              >
                {course.format}
              </span>
              <span className={styles.courseSummaryToggle} aria-hidden="true">
                <span className={styles.courseSummaryArrow} />
              </span>
            </button>

            <div
              id={`academy-course-panel-${index}`}
              className={styles.courseDetailsWrap}
              style={{ height: isOpen ? `${heights[index] ?? 0}px` : "0px" }}
            >
              <div
                ref={(node) => {
                  detailRefs.current[index] = node;
                }}
                className={styles.courseDetails}
              >
                <div className={styles.courseDetailsInfo}>
                  <p className={styles.courseDetailsLead}>{course.lead}</p>
                </div>
                <ul className={styles.courseDetailsList}>
                  {course.details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <span className={styles.courseDetailsPrice}>{course.price}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
