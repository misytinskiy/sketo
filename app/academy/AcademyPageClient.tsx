"use client";
import LocalizedText from "@/app/components/LocalizedText";


import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import LanguageSwitch from "../components/LanguageSwitch";
import { getContentLanguage } from "../components/language";
import usePersistentLanguage from "../components/usePersistentLanguage";
import AcademyReveal from "./AcademyReveal";
import AudienceCore from "./AudienceCore";
import AcademyCourseShowcase from "./AcademyCourseShowcase";
import AcademyFaq from "./AcademyFaq";
import styles from "./page.module.css";

const heroFacts = [
  "Astana / offline",
  "small groups",
  "SCA mindset",
  "barista + home brew",
] as const;

const content = {
  kz: {
    back: "артқа",
    lead:
      "Баристаларға, үйде кофе дайындайтын әуесқойларға және жай рецепт емес, кофені жүйелі түсінуді қалайтын командаларға арналған оқу.",
    introPrimary: "жазылу",
    introSecondary: "каталогқа өту",
    introText: "Sketo Academy — сіздің кофе тарихыңыз басталатын орын.",
    audienceLeftTitle: "Кімге?",
    audienceRightTitle: "Не үшін?",
    audience: [
      "бастаушы баристаларға",
      "жұмыс істеп жүрген мамандарға",
      "үйде кофе ішуді ұнататындарға",
      "командалар мен компанияларға",
    ],
    principles: [
      "дәмді түсіну",
      "экстракцияны бақылау",
      "жабдықпен сенімді жұмыс істеу",
      "индустрия тілінде сөйлеу",
    ],
    courseDisplayLabel: "НАҚТЫ ДАҒДЫЛАРҒА АРНАЛҒАН ОҚУ ЖҮЙЕСІ",
    courseDisplayLines: [
      "НАҚТЫ",
      "ДАҒДЫЛАРҒА",
      "АРНАЛҒАН",
      "ОҚУ",
      "ЖҮЙЕСІ",
    ],
    courseIntroTexts: [
      "Академия бағдарламалары жаңадан бастағандарға мамандықты нөлден меңгеруге, ал тәжірибелі баристаларға тұрақты практика, дәмді тану және жабдықты түсіну арқылы келесі деңгейге көтерілуге көмектеседі.",
      "Әр курсты ашып, кімге арналғанын, қандай форматта өтетінін және қандай дағдылар беретінін көре аласыз.",
    ],
    courses: [
      {
        title: "Бариста дағдылары",
        level: "бастапқы",
        format: "офлайн",
        price: "50 000 ₸",
        lead: "Мамандыққа енді қадам басып, эспрессо мен сүтпен сенімді жұмыс істегісі келетіндерге арналған негіз.",
        details: [
          "экстракция мен рецептура негіздері",
          "эспрессо және сүтті сусындар",
          "жұмыс орны және негізгі жұмыс тәртібі",
          "дәмді және жиі кездесетін қателерді түсіну",
        ],
      },
      {
        title: "Бариста дағдылары",
        level: "орта",
        format: "офлайн",
        price: "80 000 ₸",
        lead: "Жұмыс істеп жүрген баристаларға арналған келесі деңгей: тұрақтылық, жылдамдық және дәммен дәлірек жұмыс істеу.",
        details: [
          "эспрессоны терең баптау",
          "ауысым бойы нәтижені тұрақты ұстау",
          "сенсорика және кеседегі кофені бағалау",
          "жылдамдық, тазалық және сервис стандарттары",
        ],
      },
      {
        title: "Баламалы дайындау",
        level: "бастапқы",
        format: "офлайн",
        price: "50 000 ₸",
        lead: "Қолмен кофе дайындауға кіріспе: негізгі қағидалардан рецепт бойынша сенімді дайындауға дейін.",
        details: [
          "су, ұнтақтау және арақатынастар",
          "воронка және негізгі дайындау әдістері",
          "рецептті түсіну және түзету",
          "дәм, теңгерім және кеседегі тазалық",
        ],
      },
      {
        title: "Баламалы дайындау",
        level: "орта",
        format: "офлайн",
        price: "80 000 ₸",
        lead: "Баламалы әдістермен тереңірек жұмыс істеп, экстракцияны саналы басқарғысы келетіндерге арналған курс.",
        details: [
          "күрделі рецептер және калибрлеу",
          "қышқылдық пен қоюлықты басқару",
          "әдістер мен сүзгілерді салыстыру",
          "сенсорлық талдау және ұсынуды түзету",
        ],
      },
      {
        title: "Үйде кофе дайындау",
        level: "негіз",
        format: "қысқа курс",
        price: "15 000 ₸",
        lead: "Үйге арналған ықшам формат: кәсіби барсыз дәмді кофе дайындау жолы.",
        details: [
          "үйде кофе дайындауға арналған жабдық",
          "қарапайым әрі тиімді рецептер",
          "жиі кездесетін қателер және олардан сақтану",
          "дәмді өз талғамыңызға бейімдеу",
        ],
      },
    ],
    mentorsEyebrow: "тәлімгерлер",
    mentorLabels: {
      background: "тәжірибе",
      focus: "негізгі бағыт",
      note: "қосымша",
    },
    mentors: [
      {
        name: "Нұржігіт Тұрғын",
        role: "бас тәлімгер / сенсорика / жарысқа дайындық",
        image: "/photo/academy/mentors/nurdzhigit.JPEG",
        stats: [
          "кофе индустриясында 5 жылдан астам тәжірибе",
          "шеф-бариста, жаттықтырушы, сапа бақылаушысы",
          "evolved q-grader",
          "sca-ның 3 кәсіби модулі",
        ],
        focus: [
          "жарыстарға дайындық",
          "сенсорика және дәмді бағалау",
          "бар командасын оқыту стандарттары",
        ],
        note: "Бариста чемпионаттарының қатысушысы және жүлдегері. Баристаларды жарыстарға дайындайды және чемпионаттарда төрелік етеді.",
      },
      {
        name: "Ануар Асланұлы",
        role: "тәлімгер / қуыру / сапаны бақылау / жұмыс процестері",
        image: "/photo/academy/mentors/anuar.JPEG",
        stats: [
          "индустрияда 5 жылдан астам тәжірибе",
          "шеф-бариста, жаттықтырушы, сапа бақылаушысы, қуырушы",
          "кофе чемпионаттарына қатысқан",
        ],
        focus: [
          "қуыру және сапаны бақылау",
          "дәм мен экстракцияны баптау",
          "кофехананың жұмыс процестері",
        ],
        note: "Тбилисиде 2,5 жыл жұмыс істеп, Probarista кофеханасын ашуға қатысқан.",
      },
    ],
    faq: [
      {
        question: "Оқуды бастау үшін тәжірибе қажет пе?",
        answer:
          "Жоқ. Бастапқы курстар мамандыққа енді кірісіп жатқан немесе кофені тереңірек түсінгісі келетін адамдарға арналған.",
      },
      {
        question: "Тәжірибелі баристаларға арналған оқу бар ма?",
        answer:
          "Иә. Орта және жоғары деңгей модульдері білімді жүйелеуге, дәм сапасын және жабдықпен жұмысты жақсартуға көмектеседі.",
      },
      {
        question: "Команданы оқытуға бола ма?",
        answer:
          "Иә. Кафе, мейрамхана немесе бренд командасы үшін корпоративтік оқу форматын құра аламыз.",
      },
      {
        question: "Бір курс қанша уақытқа созылады?",
        answer:
          "Ұзақтығы бағдарлама мен деңгейге байланысты. Қысқа интенсивтер бір блоктан тұрады, ал бастапқы және орта деңгей курстары практикасы бар кеңейтілген құрылыммен өтеді.",
      },
      {
        question: "Оқудан кейін сертификат беріле ме?",
        answer:
          "Курс аяқталған соң бағдарламадан өткеніңізді растап, меңгерген дағдыларыңызды тіркейміз. Растау форматы нақты модульге байланысты.",
      },
    ],
    finalTitle: "Кофе туралы\nбіліміңіздің негізін қалаңыз",
    finalText:
      "Мамандыққа түсінікті қадам, жүйелі практика немесе командаға оқу қажет болса, Sketo Academy қазіргі деңгейіңіз бен мақсаттарыңызға сай бағыт құруға көмектеседі.",
  },
  ru: {
    back: "назад",
    lead:
      "Структурное обучение для бариста, домашних энтузиастов и команд, которым нужен не просто рецепт, а система понимания кофе.",
    introPrimary: "записаться",
    introSecondary: "перейти в каталог",
    introText: "Sketo Academy — место, где начинается ваша кофейная история.",
    audienceLeftTitle: "Кому?",
    audienceRightTitle: "Зачем?",
    audience: [
      "начинающим бариста",
      "работающим специалистам",
      "любителям кофе дома",
      "командам и компаниям",
    ],
    principles: [
      "понимать вкус",
      "контролировать экстракцию",
      "работать с оборудованием уверенно",
      "говорить на языке индустрии",
    ],
    courseDisplayLabel: "СИСТЕМА ОБУЧЕНИЯ ДЛЯ РЕАЛЬНЫХ НАВЫКОВ",
    courseDisplayLines: [
      "СИСТЕМА",
      "ОБУЧЕНИЯ",
      "ДЛЯ",
      "РЕАЛЬНЫХ",
      "НАВЫКОВ",
    ],
    courseIntroTexts: [
      "Программы академии собраны так, чтобы новичок мог зайти в профессию с нуля, а действующий бариста перейти на следующий уровень через стабильную практику, вкус и понимание оборудования.",
      "Каждый курс можно раскрыть и посмотреть: для кого он подходит, в каком формате проходит и какие навыки дает на выходе.",
    ],
    courses: [
      {
        title: "Навыки бариста",
        level: "начальный",
        format: "офлайн",
        price: "50 000 ₸",
        lead: "База для тех, кто только входит в профессию и хочет уверенно работать с эспрессо и молоком.",
        details: [
          "основы экстракции и рецептуры",
          "эспрессо и молочные напитки",
          "рабочая станция и базовый workflow",
          "понимание вкуса и типовых ошибок",
        ],
      },
      {
        title: "Навыки бариста",
        level: "средний",
        format: "офлайн",
        price: "80 000 ₸",
        lead: "Следующий уровень для действующих бариста: стабильность, скорость и более точная работа со вкусом.",
        details: [
          "углубленная настройка эспрессо",
          "контроль повторяемости в смене",
          "сенсорика и оценка чашки",
          "скорость, чистота и стандарты сервиса",
        ],
      },
      {
        title: "Альтернатива",
        level: "начальный",
        format: "офлайн",
        price: "50 000 ₸",
        lead: "Вход в manual brewing: от базовых принципов до уверенного заваривания по рецепту.",
        details: [
          "вода, помол и соотношения",
          "воронка и базовые методы заваривания",
          "чтение рецепта и корректировки",
          "вкус, баланс и чистота чашки",
        ],
      },
      {
        title: "Альтернатива",
        level: "средний",
        format: "офлайн",
        price: "80 000 ₸",
        lead: "Курс для тех, кто хочет глубже работать с альтернативой и осознанно управлять экстракцией.",
        details: [
          "продвинутые рецепты и калибровка",
          "управление кислотностью и телом",
          "сравнение методов и фильтров",
          "сенсорный разбор и корректировка подачи",
        ],
      },
      {
        title: "Home Brew",
        level: "база",
        format: "короткий курс",
        price: "15 000 ₸",
        lead: "Компактный формат для дома: как готовить вкусный кофе без профессиональной стойки.",
        details: [
          "оборудование для домашнего кофе",
          "простые рабочие рецепты",
          "частые ошибки и как их избежать",
          "как настроить вкус под себя",
        ],
      },
    ],
    mentorsEyebrow: "mentors",
    mentorLabels: {
      background: "background",
      focus: "focus",
      note: "note",
    },
    mentors: [
      {
        name: "Нуржигит Турғын",
        role: "head mentor / sensory / competition prep",
        image: "/photo/academy/mentors/nurdzhigit.JPEG",
        stats: [
          "более 5 лет в индустрии кофе",
          "шеф-бариста, тренер, qc",
          "evolved q-grader",
          "3 профессиональных модуля sca",
        ],
        focus: [
          "соревновательная подготовка",
          "сенсорика и оценка вкуса",
          "стандарты обучения bar team",
        ],
        note: "Участник и призер чемпионатов бариста. Готовит бариста к соревнованиям и судит чемпионаты.",
      },
      {
        name: "Ануар Асланұлы",
        role: "mentor / roasting / qc / operations",
        image: "/photo/academy/mentors/anuar.JPEG",
        stats: [
          "более 5 лет в индустрии",
          "шеф-бариста, тренер, qc, обжарщик",
          "участвовал в кофейных чемпионатах",
        ],
        focus: [
          "обжарка и контроль качества",
          "настройка вкуса и экстракции",
          "рабочие процессы кофейни",
        ],
        note: "2,5 года работал в Тбилиси и участвовал в открытии кофейни Probarista.",
      },
    ],
    faq: [
      {
        question: "Нужен ли опыт до старта?",
        answer:
          "Нет. Базовые курсы рассчитаны на тех, кто только заходит в профессию или хочет разобраться в кофе глубже.",
      },
      {
        question: "Есть ли обучение для действующих бариста?",
        answer:
          "Да. Средние и продвинутые модули помогают систематизировать знания, улучшить вкус и работу с оборудованием.",
      },
      {
        question: "Можно ли обучить команду?",
        answer:
          "Да. Мы можем собрать корпоративный формат под кафе, ресторан или внутреннюю команду бренда.",
      },
      {
        question: "Сколько длится один курс?",
        answer:
          "Длительность зависит от программы и уровня. Короткие интенсивы занимают один блок, а базовые и средние курсы идут по более развернутой структуре с практикой.",
      },
      {
        question: "Выдается ли сертификат после обучения?",
        answer:
          "После завершения курса мы подтверждаем прохождение программы и фиксируем освоенные навыки. Формат подтверждения зависит от конкретного модуля.",
      },
    ],
    finalTitle: "Соберите\nкофейную базу",
    finalText:
      "Если вам нужен понятный вход в профессию, системная практика или обучение для команды, Sketo Academy поможет собрать маршрут под ваш текущий уровень и цели.",
  },
  en: {
    back: "back",
    lead:
      "Structured education for baristas, home enthusiasts, and teams who need more than a recipe, they need a system for understanding coffee.",
    introPrimary: "enroll",
    introSecondary: "go to catalog",
    introText: "Sketo Academy is where your coffee story begins.",
    audienceLeftTitle: "Who?",
    audienceRightTitle: "Why?",
    audience: [
      "beginner baristas",
      "working professionals",
      "home coffee enthusiasts",
      "teams and companies",
    ],
    principles: [
      "understand flavor",
      "control extraction",
      "work with equipment confidently",
      "speak the language of the industry",
    ],
    courseDisplayLabel: "TRAINING SYSTEM FOR REAL SKILLS",
    courseDisplayLines: ["TRAINING", "SYSTEM", "FOR", "REAL", "SKILLS"],
    courseIntroTexts: [
      "The academy programs are structured so a beginner can enter the profession from zero, while a working barista can move to the next level through stable practice, taste, and equipment understanding.",
      "Each course can be expanded to see who it fits, what format it runs in, and which skills it builds by the end.",
    ],
    courses: [
      {
        title: "Barista skills",
        level: "beginner",
        format: "offline",
        price: "50 000 ₸",
        lead: "A foundation for those entering the profession and wanting to work confidently with espresso and milk.",
        details: [
          "basics of extraction and recipe logic",
          "espresso and milk drinks",
          "station setup and basic workflow",
          "flavor understanding and common mistakes",
        ],
      },
      {
        title: "Barista skills",
        level: "intermediate",
        format: "offline",
        price: "80 000 ₸",
        lead: "The next step for working baristas: consistency, speed, and more precise flavor control.",
        details: [
          "advanced espresso calibration",
          "shift-to-shift repeatability control",
          "sensory skills and cup evaluation",
          "speed, cleanliness, and service standards",
        ],
      },
      {
        title: "Alternative brewing",
        level: "beginner",
        format: "offline",
        price: "50 000 ₸",
        lead: "An entry into manual brewing, from first principles to confident brewing by recipe.",
        details: [
          "water, grind, and brew ratios",
          "pour-over and core brewing methods",
          "reading a recipe and making corrections",
          "flavor balance and clean cups",
        ],
      },
      {
        title: "Alternative brewing",
        level: "intermediate",
        format: "offline",
        price: "80 000 ₸",
        lead: "For those who want deeper control over filter coffee and extraction decisions.",
        details: [
          "advanced recipes and calibration",
          "managing acidity and body",
          "method and filter comparison",
          "sensory analysis and service adjustment",
        ],
      },
      {
        title: "Home Brew",
        level: "core",
        format: "short course",
        price: "15 000 ₸",
        lead: "A compact home format on how to brew great coffee without a professional bar.",
        details: [
          "equipment for home coffee",
          "simple working recipes",
          "common mistakes and how to avoid them",
          "how to shape flavor to your preference",
        ],
      },
    ],
    mentorsEyebrow: "mentors",
    mentorLabels: {
      background: "background",
      focus: "focus",
      note: "note",
    },
    mentors: [
      {
        name: "Nurdzhigit Turgyn",
        role: "head mentor / sensory / competition prep",
        image: "/photo/academy/mentors/nurdzhigit.JPEG",
        stats: [
          "5+ years in the coffee industry",
          "head barista, trainer, qc",
          "evolved q-grader",
          "3 professional sca modules",
        ],
        focus: [
          "competition preparation",
          "sensory and taste evaluation",
          "bar team training standards",
        ],
        note: "Barista championship participant and prize winner. Prepares baristas for competitions and judges championships.",
      },
      {
        name: "Anuar Aslanuly",
        role: "mentor / roasting / qc / operations",
        image: "/photo/academy/mentors/anuar.JPEG",
        stats: [
          "5+ years in the industry",
          "head barista, trainer, qc, roaster",
          "participant in coffee championships",
        ],
        focus: [
          "roasting and quality control",
          "flavor calibration and extraction",
          "coffee shop operating processes",
        ],
        note: "Worked in Tbilisi for 2.5 years and took part in launching Probarista.",
      },
    ],
    faq: [
      {
        question: "Do I need prior experience?",
        answer:
          "No. The foundation courses are designed for people entering the profession or wanting a deeper understanding of coffee.",
      },
      {
        question: "Is there training for working baristas?",
        answer:
          "Yes. Intermediate and advanced modules help systemize knowledge, improve flavor work, and sharpen equipment handling.",
      },
      {
        question: "Can you train a full team?",
        answer:
          "Yes. We can assemble a corporate format for a cafe, restaurant, or an internal brand team.",
      },
      {
        question: "How long does one course last?",
        answer:
          "The duration depends on the program and level. Short intensives fit into one block, while foundation and intermediate courses follow a broader structure with practice.",
      },
      {
        question: "Do students receive a certificate?",
        answer:
          "After completion we confirm the program and the skills covered. The exact confirmation format depends on the module.",
      },
    ],
    finalTitle: "Build\nyour coffee base",
    finalText:
      "If you need a clear entry into the profession, structured practice, or team education, Sketo Academy can shape a route around your current level and goals.",
  },
} as const;

type AcademyPageClientProps = {
  initialLanguage: "ru" | "en" | "kz";
};

export default function AcademyPageClient({
  initialLanguage,
}: AcademyPageClientProps) {
  const [language, setLanguage] = usePersistentLanguage(initialLanguage);
  const currentLanguage = getContentLanguage(language);
  const copy = content[currentLanguage];

  return (
    <main className={styles.page}>
      <AcademyReveal />

      <section className={styles.hero}>
        <div className={styles.heroTopRow}>
          <Link href="/" className={styles.backLink}>
            {copy.back}
          </Link>

          <div className={styles.heroTopMeta}>
            <LanguageSwitch value={language} onChange={setLanguage} />
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><LocalizedText text="academy as system" /></p>
            <h1 className={styles.title}>
              sketo.
              <br />
              <LocalizedText text="academy" /></h1>
            <p className={styles.lead}>{copy.lead}</p>
          </div>
          <div className={styles.heroInfoStack}>
            {heroFacts.map((item) => (
              <span key={item} className={styles.heroInfoItem}>
                <LocalizedText text={item} />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.ctaLinks}>
          <Link href="/contacts" className={styles.ctaLink}>
            {copy.introPrimary}
          </Link>
          <Link href="/catalog" className={styles.ctaLinkSecondary}>
            {copy.introSecondary}
          </Link>
        </div>
        <p className={styles.ctaText}>{copy.introText}</p>
      </section>

      <section className={styles.section} data-reveal-group>
        <div className={styles.audienceBlock}>
          <div className={styles.audienceScheme}>
            <AudienceCore label="core" title={copy.audienceLeftTitle} />

            <div className={styles.audienceList}>
              {copy.audience.map((item, index) => (
                <article key={item} className={styles.audienceNode}>
                  <span className={styles.cardIndex} data-reveal="eyebrow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={styles.cardTitle} data-reveal="line">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.audienceScheme}>
            <AudienceCore label="core" title={copy.audienceRightTitle} />

            <div className={styles.audienceList}>
              {copy.principles.map((item, index) => (
                <article key={item} className={styles.audienceNode}>
                  <span className={styles.cardIndex} data-reveal="eyebrow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={styles.cardTitle} data-reveal="line">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}><LocalizedText text="sketo academy program" /></p>
        </div>
        <AcademyCourseShowcase
          courses={copy.courses}
          displayLabel={copy.courseDisplayLabel}
          displayLines={copy.courseDisplayLines}
          introTexts={copy.courseIntroTexts}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{copy.mentorsEyebrow}</p>
        </div>

        <div className={styles.mentorGrid}>
          {copy.mentors.map((mentor, index) => (
            <article key={mentor.name} className={styles.mentorCard}>
              <div className={styles.mentorBody}>
                <div className={styles.mentorTopline}>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.mentorRole}>{mentor.role}</span>
                </div>

                <div className={styles.mentorHeader}>
                  <h3 className={styles.mentorName}>{mentor.name}</h3>
                </div>

                <div className={styles.mentorColumns}>
                  <div className={styles.mentorPanel}>
                    <span className={styles.mentorLabel}>
                      {copy.mentorLabels.background}
                    </span>
                    <ul className={styles.mentorList}>
                      {mentor.stats.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.mentorPanel}>
                    <span className={styles.mentorLabel}>
                      {copy.mentorLabels.focus}
                    </span>
                    <ul className={styles.mentorList}>
                      {mentor.focus.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.mentorNoteBlock}>
                  <span className={styles.mentorLabel}>
                    {copy.mentorLabels.note}
                  </span>
                  <p className={styles.mentorNote}>{mentor.note}</p>
                </div>
              </div>
              <div className={styles.mentorImageWrap}>
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 42vw"
                  className={styles.mentorImage}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}><LocalizedText text="faq" /></p>
        </div>
        <AcademyFaq items={copy.faq} />
      </section>

      <section className={`${styles.section} ${styles.finalCtaSection}`}>
        <div className={styles.finalCtaGrid}>
          <div className={styles.finalCtaCopy}>
            <p className={styles.eyebrow}><LocalizedText text="next step" /></p>
            <h2 className={styles.finalCtaTitle}>
              {copy.finalTitle.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </div>

          <div className={styles.finalCtaPanel}>
            <p className={styles.finalCtaText}>{copy.finalText}</p>

            <div className={styles.finalCtaActions}>
              <Link href="/contacts" className={styles.finalPrimaryLink}>
                {copy.introPrimary}
              </Link>
              <Link href="/catalog" className={styles.finalSecondaryLink}>
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
