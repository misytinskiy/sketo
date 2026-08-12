"use client";

import Link from "next/link";
import AcademyReveal from "../academy/AcademyReveal";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import B2BAudienceCore from "./B2BAudienceCore";
import B2BBlueprintSection from "./B2BBlueprintSection";
import B2BWorkflowSection from "./B2BWorkflowSection";
import B2BMetricsSection from "./B2BMetricsSection";
import styles from "./b2b.module.css";

const stages = [
  "concept",
  "equipment",
  "bar",
  "menu",
  "training",
  "launch",
  "support",
] as const;

const content = {
  ru: {
    back: "назад",
    lead:
      "Комплексные решения для кофейных проектов: от идеи и запуска до стабильной ежедневной работы.",
    introPrimary: "обсудить проект",
    introSecondary: "выбрать оборудование",
    introText:
      "Sketo B2B собирает кофейные проекты как цельную рабочую систему, а не как набор отдельных услуг.",
    audienceLeftTitle: "Кому?",
    audienceRightLabel: "система",
    audienceRightTitle: "Зачем?",
    audience: [
      "кофейни и спешелти-проекты",
      "рестораны и гастроформаты",
      "отели, офисы и частный сервис",
      "команды, которым нужен запуск без хаоса",
    ],
    purpose: [
      "собрать вкус, сервис и технику в одну систему",
      "сократить ошибки на этапе запуска",
      "дать команде понятный стандарт ежедневной работы",
      "удерживать стабильность после открытия",
    ],
    blueprintLead:
      "Полный маршрут кофейного проекта: от первой сборки системы до стабильной ежедневной работы заведения.",
    stageListAriaLabel: "Карта этапов проекта",
    services: [
      {
        index: "01",
        title: "Подбор оборудования",
        lead:
          "Подбираем кофемашины, кофемолки и всю техническую базу под формат, нагрузку и задачи проекта.",
        body: [
          "Собираем комплект без лишнего: только то, что реально работает на вашу модель сервиса.",
          "Учитываем поток гостей, формат меню, бюджет, требования по бару и сценарии ежедневной работы.",
        ],
        tags: ["кофемашины", "кофемолки", "система работы"],
      },
      {
        index: "02",
        title: "Проектирование бара",
        lead:
          "Разрабатываем удобное рабочее пространство для бариста и продумываем эргономику на старте.",
        body: [
          "Продумываем расположение оборудования, логистику движений и все ключевые рабочие процессы.",
          "Наша задача — сократить лишние действия, ускорить выдачу и сделать бар устойчивым к нагрузке.",
        ],
        tags: ["схема бара", "эргономика", "скорость сервиса"],
      },
      {
        index: "03",
        title: "Кофейная карта",
        lead:
          "Помогаем подобрать зерно и разработать меню напитков под концепцию вашего заведения.",
        body: [
          "Собираем линейку так, чтобы она была понятной гостю и удобной в работе команде.",
          "Настраиваем основу вкуса, сезонные позиции и подачу, чтобы кофе работал как часть бренда.",
        ],
        tags: ["зерно", "меню", "сезонные напитки"],
      },
      {
        index: "04",
        title: "Аксессуары",
        lead:
          "Подбираем всё необходимое для работы бара: посуду, инвентарь, аксессуары и расходные материалы.",
        body: [
          "Напрямую сотрудничаем с проверенными заводами в Китае, которые посещаем лично.",
          "Поэтому уверены в качестве каждого изделия и можем собрать комплект под конкретный стиль проекта.",
        ],
        tags: ["инвентарь", "керамика", "расходники"],
      },
      {
        index: "05",
        title: "Керамика",
        lead:
          "Создаём и подбираем керамику под стиль проекта — детали, которые делают бренд узнаваемым.",
        body: [
          "Формируем визуальный язык чашки, который поддерживает интерьер, подачу и общую атмосферу.",
          "Это не декоративное дополнение, а инструмент, который усиливает восприятие продукта.",
        ],
        tags: ["посуда", "детали бренда", "кастомный подбор"],
      },
      {
        index: "06",
        title: "Обучение",
        lead:
          "Обучаем бариста и команды. Программы собираются под задачи бизнеса и уровень подготовки сотрудников.",
        body: [
          "Настраиваем обучение так, чтобы команда понимала вкус, экстракцию и работу оборудования.",
          "Это помогает быстрее выйти на стабильность и держать единый стандарт внутри смены.",
        ],
        tags: ["обучение бариста", "система команды", "стандарты"],
      },
      {
        index: "07",
        title: "После запуска",
        lead:
          "Помогаем с установкой, настройкой оборудования и остаёмся на связи после открытия проекта.",
        body: [
          "Сопровождаем первые этапы работы, корректируем процессы и помогаем стабилизировать вкус.",
          "Наша роль не заканчивается на открытии: проект должен уверенно работать каждый день.",
        ],
        tags: ["сопровождение запуска", "настройка", "поддержка"],
      },
    ],
    workflowLead:
      "Не просто перечень услуг, а последовательность решений, где каждый следующий шаг опирается на предыдущий и собирает проект в рабочую систему.",
    workflowMapAriaLabel: "Схема работы Sketo B2B",
    workflowSteps: [
      {
        index: "01",
        title: "Brief",
        text: "Понимаем формат проекта, задачи бизнеса, поток, команду и ограничения по пространству.",
      },
      {
        index: "02",
        title: "Audit",
        text: "Собираем рабочую картину: оборудование, бар, меню, сервис и реальные точки потери качества.",
      },
      {
        index: "03",
        title: "System",
        text: "Формируем решение как цельную систему: техника, логика работы, вкус и обучение.",
      },
      {
        index: "04",
        title: "Launch",
        text: "Настраиваем, запускаем, обучаем команду и доводим бар до устойчивого ежедневного ритма.",
      },
      {
        index: "05",
        title: "Support",
        text: "Остаемся на связи после запуска, корректируем процессы и удерживаем стабильность в работе.",
      },
    ],
    metricsTitle:
      "Sketo собирает кофейный проект как живую систему, а не как набор разрозненных решений.",
    metricsLead:
      "Каждый блок ниже показывает, на чем эта логика держится в реальной ежедневной работе.",
    metrics: [
      {
        index: "01",
        value: "07",
        label: "модулей в одном b2b-цикле",
        note: "техника, бар, меню, аксессуары, керамика, обучение и сопровождение",
      },
      {
        index: "02",
        value: "360",
        label: "градусов взгляда на проект",
        note: "смотрим не на отдельную поставку, а на весь ежедневный операционный контур",
      },
      {
        index: "03",
        value: "01",
        label: "единая рабочая логика",
        note: "вкус, скорость, эргономика и стандарты собираются в одну систему",
      },
      {
        index: "04",
        value: "24/7",
        label: "фокус на стабильность после запуска",
        note: "проект должен не просто открыться, а уверенно работать каждый день",
      },
    ],
    ctaTitle: "Давайте соберём\nвашу кофейную систему",
    ctaText:
      "Если вы запускаете новую кофейную точку или пересобираете уже существующую, Sketo поможет выстроить всю систему вокруг вкуса, процессов и стабильности.",
  },
  en: {
    back: "back",
    lead:
      "Complete solutions for coffee projects, from concept and launch to stable day-to-day operation.",
    introPrimary: "discuss project",
    introSecondary: "choose equipment",
    introText:
      "Sketo B2B builds coffee projects as one working system, not a collection of separate services.",
    audienceLeftTitle: "Who?",
    audienceRightLabel: "system",
    audienceRightTitle: "Why?",
    audience: [
      "coffee shops and specialty concepts",
      "restaurants and hospitality formats",
      "hotels, offices, and private service",
      "teams that need a launch without chaos",
    ],
    purpose: [
      "bring taste, service, and equipment into one system",
      "reduce mistakes at the launch stage",
      "give the team a clear daily operating standard",
      "keep the project stable after opening",
    ],
    blueprintLead:
      "A complete route for a coffee project, from the first system setup to confident daily operation.",
    stageListAriaLabel: "Project stages map",
    services: [
      {
        index: "01",
        title: "Equipment selection",
        lead:
          "We match espresso machines, grinders, and the full technical setup to your format, workload, and project goals.",
        body: [
          "We build a clean setup with no excess, only what actually supports your service model.",
          "Guest flow, menu format, budget, bar requirements, and daily operating scenarios are all factored in.",
        ],
        tags: ["espresso machines", "grinders", "work system"],
      },
      {
        index: "02",
        title: "Bar planning",
        lead:
          "We design an efficient workspace for baristas and define ergonomics from the very beginning.",
        body: [
          "We think through equipment layout, movement logic, and the key workflows behind the bar.",
          "The goal is to reduce wasted motion, speed up service, and make the bar resilient under load.",
        ],
        tags: ["bar layout", "ergonomics", "service speed"],
      },
      {
        index: "03",
        title: "Coffee menu",
        lead:
          "We help select beans and shape a beverage menu that fits the concept of your venue.",
        body: [
          "The lineup is built to be clear for guests and practical for the team to work with.",
          "We tune the core flavor direction, seasonal items, and presentation so coffee works as part of the brand.",
        ],
        tags: ["beans", "menu", "seasonal drinks"],
      },
      {
        index: "04",
        title: "Accessories",
        lead:
          "We source everything the bar needs: cups, tools, accessories, and day-to-day consumables.",
        body: [
          "We work directly with trusted factories in China and visit them personally.",
          "That gives us confidence in every item and lets us build a kit that fits the visual language of the project.",
        ],
        tags: ["tools", "ceramics", "consumables"],
      },
      {
        index: "05",
        title: "Ceramics",
        lead:
          "We create and curate ceramics that fit the project style, details that make the brand recognizable.",
        body: [
          "We build a cup language that supports the interior, the service, and the overall atmosphere.",
          "This is not decoration for decoration’s sake, but a tool that strengthens how the product is perceived.",
        ],
        tags: ["tableware", "brand details", "custom curation"],
      },
      {
        index: "06",
        title: "Training",
        lead:
          "We train baristas and teams with programs shaped around business tasks and current staff level.",
        body: [
          "Training is set up so the team understands taste, extraction, and equipment behavior.",
          "That helps the project reach consistency faster and hold one clear standard across every shift.",
        ],
        tags: ["barista training", "team system", "standards"],
      },
      {
        index: "07",
        title: "Post-launch",
        lead:
          "We assist with installation, calibration, and stay involved after the project goes live.",
        body: [
          "We support the first operating stages, fine-tune workflows, and help stabilize taste.",
          "Our role does not end on opening day, the project should perform confidently every day after that.",
        ],
        tags: ["launch support", "calibration", "follow-up"],
      },
    ],
    workflowLead:
      "Not a list of separate services, but a sequence of decisions where each next step builds on the previous one and turns the project into a working system.",
    workflowMapAriaLabel: "Sketo B2B workflow map",
    workflowSteps: [
      {
        index: "01",
        title: "Brief",
        text: "We define the project format, business goals, guest flow, team setup, and space limitations.",
      },
      {
        index: "02",
        title: "Audit",
        text: "We assemble the real working picture: equipment, bar logic, menu, service, and the points where quality is lost.",
      },
      {
        index: "03",
        title: "System",
        text: "We shape one coherent solution: equipment, workflow logic, flavor direction, and training.",
      },
      {
        index: "04",
        title: "Launch",
        text: "We calibrate, launch, train the team, and bring the bar into a stable day-to-day rhythm.",
      },
      {
        index: "05",
        title: "Support",
        text: "We stay connected after launch, adjust processes, and help maintain consistency in operation.",
      },
    ],
    metricsTitle:
      "Sketo builds coffee projects as living systems, not as a stack of disconnected decisions.",
    metricsLead:
      "Each line below shows what that logic looks like in actual day-to-day operation.",
    metrics: [
      {
        index: "01",
        value: "07",
        label: "modules inside one b2b cycle",
        note: "equipment, bar, menu, accessories, ceramics, training, and support",
      },
      {
        index: "02",
        value: "360",
        label: "degrees of project view",
        note: "we look beyond a single delivery and work with the full operating loop",
      },
      {
        index: "03",
        value: "01",
        label: "shared working logic",
        note: "taste, speed, ergonomics, and standards are assembled into one system",
      },
      {
        index: "04",
        value: "24/7",
        label: "focus on stability after launch",
        note: "the project should not just open, it should keep performing every day",
      },
    ],
    ctaTitle: "Let’s build\nyour coffee system",
    ctaText:
      "If you are opening a new coffee point or rebuilding an existing one, Sketo can structure the whole system around taste, processes, and consistency.",
  },
} as const;

type B2BPageClientProps = {
  initialLanguage: "ru" | "en";
};

export default function B2BPageClient({
  initialLanguage,
}: B2BPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);
  const copy = content[currentLanguage];

  return (
    <main className={styles.page}>
      <AcademyReveal />

      <section className={styles.hero}>
        <div className={styles.topControls}>
          <Link href="/" className={styles.backLink}>
            {copy.back}
          </Link>

          <LanguageSwitch value={language} onChange={setLanguage} />
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>b2b / service blueprint</p>
            <h1 className={styles.title}>
              Sketo.
              <br />
              for Business
            </h1>
            <p className={styles.lead}>{copy.lead}</p>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaStack}>
              <span className={styles.heroMetaItem}>full coffee project cycle</span>
              <span className={styles.heroMetaItem}>
                equipment / bar / menu / training / support
              </span>
              <span className={styles.heroMetaItem}>
                practical systems for real operations
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introLinks}>
          <Link href="/contacts" className={styles.introLink}>
            {copy.introPrimary}
          </Link>
          <Link href="/equipment" className={styles.introLinkSecondary}>
            {copy.introSecondary}
          </Link>
        </div>
        <p className={styles.introText}>{copy.introText}</p>
      </section>

      <section className={styles.audienceSection} data-reveal-group>
        <div className={styles.audienceBlock}>
          <div className={styles.audienceScheme}>
            <B2BAudienceCore label="b2b" title={copy.audienceLeftTitle} />

            <div className={styles.audienceList}>
              {copy.audience.map((item, index) => (
                <article key={item} className={styles.audienceNode}>
                  <span className={styles.audienceIndex} data-reveal="eyebrow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={styles.audienceNodeTitle} data-reveal="line">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.audienceScheme}>
            <B2BAudienceCore
              label={copy.audienceRightLabel}
              title={copy.audienceRightTitle}
            />

            <div className={styles.audienceList}>
              {copy.purpose.map((item, index) => (
                <article key={item} className={styles.audienceNode}>
                  <span className={styles.audienceIndex} data-reveal="eyebrow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={styles.audienceNodeTitle} data-reveal="line">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <B2BBlueprintSection
        services={copy.services}
        stages={stages}
        lead={copy.blueprintLead}
        stageListAriaLabel={copy.stageListAriaLabel}
      />

      <B2BWorkflowSection
        steps={copy.workflowSteps}
        lead={copy.workflowLead}
        mapAriaLabel={copy.workflowMapAriaLabel}
      />

      <B2BMetricsSection
        metrics={copy.metrics}
        title={copy.metricsTitle}
        lead={copy.metricsLead}
      />

      <section className={styles.ctaSection}>
        <div className={styles.ctaGrid}>
          <div className={styles.ctaCopy}>
            <p className={styles.eyebrow}>next step</p>
            <h2 className={styles.ctaTitle}>
              {copy.ctaTitle.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </div>

          <div className={styles.ctaPanel}>
            <p className={styles.ctaText}>{copy.ctaText}</p>

            <div className={styles.ctaActions}>
              <Link href="/contacts" className={styles.primaryLink}>
                {copy.introPrimary}
              </Link>
              <Link href="/equipment" className={styles.secondaryLink}>
                {copy.introSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer language={currentLanguage} />
    </main>
  );
}
