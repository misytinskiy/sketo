"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Language } from "./language";
import styles from "./AboutSketo.module.css";

type AboutItem = {
  fact: string;
  title: string;
  columns: string[];
  layout?: "two" | "three";
};

const aboutItemsByLanguage: Record<Exclude<Language, "kz">, AboutItem[]> = {
  ru: [
    {
      fact: "Академия подбора оборудования и зерна",
      title:
        "Подбираем оборудование и кофе под конкретные задачи, формат работы и реальную нагрузку проекта.",
      columns: [
        "Смотрим на проект как на рабочую систему: поток гостей, формат меню, темп команды, задачи бара и тот вкус, который должен стабильно получаться в чашке каждый день.",
        "Подбираем кофемашины, кофемолки и зерно так, чтобы они усиливали друг друга, а не конфликтовали между собой в настройке, сервисе и ежедневной эксплуатации.",
      ],
      layout: "two",
    },
    {
      fact: "Комплексное сопровождение бизнеса",
      title:
        "Сопровождаем кофейный проект на всём пути: от идеи и комплектации до запуска, настройки процессов и дальнейшей поддержки.",
      columns: [
        "Помогаем собрать техническую и вкусовую основу проекта: оборудование, зерно, барную логику, меню и принципы работы команды.",
        "После запуска настраиваем процессы, помогаем стабилизировать вкус, корректируем рабочую систему и остаёмся на связи, когда проект выходит в ежедневный ритм.",
        "Так бизнес получает не разовую поставку, а партнёра, который понимает, как довести кофейную часть до устойчивого результата.",
      ],
      layout: "three",
    },
    {
      fact: "Всё для кофе дома",
      title:
        "Для домашних пользователей собираем полноценную кофейную среду: зерно, акссесуары и понятную помощь в приготовлении.",
      columns: [
        "Подбираем зерно под вкус и сценарий заваривания: на каждый день, для эспрессо, фильтра или более спокойных домашних ритуалов.",
        "Помогаем выбрать оборудование без перегруза лишними решениями и объясняем, как готовить кофе так, чтобы дома он был не случайным, а стабильно вкусным.",
      ],
      layout: "two",
    },
    {
      fact: "Наш подход",
      title:
        "Sketo работает системно: обучение, оборудование, зерно и сопровождение соединяются в один понятный путь с контролем качества на каждом этапе.",
      columns: [
        "За каждым решением в Sketo стоит квалифицированная команда с практическим опытом в обучении, настройке вкуса, подборе оборудования и ежедневной работе с кофейными проектами.",
        "Это значит, что мы смотрим не только на характеристики техники или описание зерна, а на то, как всё будет работать в реальной смене: в ритме команды, в логике бара и в стабильности чашки.",
        "Мы сопровождаем клиента дальше и держим качество под контролем на всём пути — от первого обучения и выбора оборудования до подбора зерна, настройки процессов и ежедневного результата.",
      ],
      layout: "three",
    },
  ],
  en: [
    {
      fact: "Equipment and bean selection academy",
      title:
        "We match equipment and coffee to specific tasks, operating format, team workflow, and the actual load of each project.",
      columns: [
        "We look at every project as a working system: guest flow, menu format, team pace, bar tasks, and the cup profile that must stay consistent every day.",
        "We select espresso machines, grinders, and coffee so they reinforce each other instead of conflicting in setup, service, and daily operation.",
      ],
      layout: "two",
    },
    {
      fact: "End-to-end business support",
      title:
        "We support coffee projects through the full journey: from concept and setup to launch, workflow tuning, and ongoing operational support.",
      columns: [
        "We help build the technical and sensory foundation of the project: equipment, coffee, bar logic, menu, and the operating principles of the team.",
        "After launch, we fine-tune workflows, stabilize cup quality, adjust the system, and stay involved as the project moves into its daily rhythm.",
        "That gives the business not a one-time supplier, but a partner who understands how to bring the coffee side to a stable result.",
      ],
      layout: "three",
    },
    {
      fact: "Everything for coffee at home",
      title:
        "For home users, we build a complete coffee environment: beans, gear, and clear guidance for brewing with confidence.",
      columns: [
        "We select coffee for taste preference and brewing scenario: everyday drinking, espresso, filter, or slower ritual-based home routines.",
        "We help choose equipment without unnecessary complexity and explain how to brew coffee at home so it becomes consistently good, not accidental.",
      ],
      layout: "two",
    },
    {
      fact: "Our approach",
      title:
        "Sketo works systemically: education, equipment, coffee, and support connect into one clear path with quality control at every stage.",
      columns: [
        "Behind every Sketo decision is a qualified team with hands-on experience in training, taste calibration, equipment selection, and real coffee project operations.",
        "That means we look beyond specs and tasting notes to how everything will perform in an actual shift: inside team rhythm, bar logic, and cup consistency.",
        "We stay with the client and keep quality under control all the way through — from initial training and equipment choice to coffee selection, workflow setup, and daily results.",
      ],
      layout: "three",
    },
  ],
};

type AboutSketoProps = {
  language: Exclude<Language, "kz">;
};

export default function AboutSketo({ language }: AboutSketoProps) {
  const aboutItems = aboutItemsByLanguage[language];
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
        <div
          className={styles.aboutFacts}
          role="tablist"
          aria-label={language === "en" ? "Sketo sections" : "Разделы о Sketo"}
        >
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
