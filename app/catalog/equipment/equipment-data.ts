export type EquipmentBrand =
  | "all"
  | "la-marzocco"
  | "mahlkonig"
  | "anfim"
  | "mazzer"
  | "balenare"
  | "allround"
  | "victoria-arduino";

export type EquipmentType = "all" | "grinder" | "espresso-machine";

export type EquipmentLanguage = "ru" | "en";

export type EquipmentDetail = {
  label: string;
  value: string;
};

export type EquipmentFeature = {
  title: string;
  description: string;
};

type EquipmentTranslation = {
  category: string;
  status: string;
  description: string;
  details: EquipmentDetail[];
  features: EquipmentFeature[];
  specifications: EquipmentDetail[];
};

export type EquipmentItem = {
  slug: string;
  name: string;
  image: string;
  images: string[];
  brand: Exclude<EquipmentBrand, "all">;
  type: Exclude<EquipmentType, "all">;
  translations: Record<EquipmentLanguage, EquipmentTranslation>;
};

export const equipmentBrandLabels: Record<
  EquipmentLanguage,
  Record<EquipmentBrand, string>
> = {
  ru: {
    all: "Все",
    "la-marzocco": "La Marzocco",
    mahlkonig: "Mahlkönig",
    anfim: "Anfim",
    mazzer: "Mazzer",
    balenare: "Balenare",
    allround: "Allround",
    "victoria-arduino": "Victoria Arduino",
  },
  en: {
    all: "All",
    "la-marzocco": "La Marzocco",
    mahlkonig: "Mahlkönig",
    anfim: "Anfim",
    mazzer: "Mazzer",
    balenare: "Balenare",
    allround: "Allround",
    "victoria-arduino": "Victoria Arduino",
  },
};

export const equipmentTypeLabels: Record<
  EquipmentLanguage,
  Record<EquipmentType, string>
> = {
  ru: {
    all: "Все",
    grinder: "Кофемолки",
    "espresso-machine": "Кофемашины",
  },
  en: {
    all: "All",
    grinder: "Grinders",
    "espresso-machine": "Espresso machines",
  },
};

const lineaPbFeatures = {
  ru: [
    {
      title: "сатурированные группы",
      description:
        "Во время приготовления вода не покидает кофейный бойлер, поэтому термостабильность сохраняется от шота к шоту.",
    },
    {
      title: "двойной PID",
      description:
        "Независимый электронный контроль температуры кофейного и парового бойлеров для более точной настройки.",
    },
    {
      title: "цифровой дисплей",
      description:
        "Отображение температуры, таймеры шота, счетчик импульсов пролива и понятное программирование упрощают изменение параметров.",
    },
    {
      title: "крышки группы Piero",
      description:
        "Расходомеры, интегрированные в группу, улучшают точность объемного дозирования и повторяемость в ежедневной работе.",
    },
    {
      title: "система предварительного нагрева",
      description:
        "Вода предварительно нагревается перед попаданием в кофейный бойлер, что повышает производительность в часы пик.",
    },
    {
      title: "подсветка бариста",
      description:
        "LED-подсветка помогает лучше видеть группу и чашку во время экстракции.",
    },
  ],
  en: [
    {
      title: "saturated groups",
      description:
        "Water stays inside the coffee boiler during brewing, helping the machine maintain thermal stability from shot to shot.",
    },
    {
      title: "dual PID",
      description:
        "Independent electronic control of the coffee and steam boilers allows for more precise temperature tuning.",
    },
    {
      title: "digital display",
      description:
        "Temperature readouts, shot timers, pulse counters, and clear programming make machine adjustments easier in daily work.",
    },
    {
      title: "Piero group caps",
      description:
        "Flow meters integrated into the group improve volumetric dosing accuracy and repeatability during service.",
    },
    {
      title: "pre-heating system",
      description:
        "Water is pre-heated before entering the coffee boiler, improving performance during peak service hours.",
    },
    {
      title: "barista lights",
      description:
        "LED barista lighting makes the group and the cup easier to read during extraction.",
    },
  ],
} satisfies Record<EquipmentLanguage, EquipmentFeature[]>;

const lineaPbSpecs = {
  ru: [
    { label: "Высота", value: "21 in / 53.3 cm" },
    { label: "Ширина", value: "28 in / 71 cm" },
    { label: "Глубина", value: "23 in / 59 cm" },
    { label: "Вес", value: "134.5 lb / 61 kg" },
    { label: "Мощность", value: "4600 W" },
    { label: "Кофейный бойлер", value: "3.4 L" },
    { label: "Паровой бойлер", value: "7 L" },
  ],
  en: [
    { label: "Height", value: "21 in / 53.3 cm" },
    { label: "Width", value: "28 in / 71 cm" },
    { label: "Depth", value: "23 in / 59 cm" },
    { label: "Weight", value: "134.5 lb / 61 kg" },
    { label: "Power", value: "4600 W" },
    { label: "Coffee boiler", value: "3.4 L" },
    { label: "Steam boiler", value: "7 L" },
  ],
} satisfies Record<EquipmentLanguage, EquipmentDetail[]>;

const lineaClassicFeatures = {
  ru: [
    {
      title: "двойные бойлеры",
      description:
        "Отдельные кофейный и паровой бойлеры позволяют одновременно стабильно готовить эспрессо и взбивать молоко.",
    },
    {
      title: "двойной PID",
      description:
        "Электронный контроль температуры обоих бойлеров делает настройку точнее и стабильнее.",
    },
    {
      title: "сатурированные группы",
      description:
        "Конструкция группы рассчитана на стабильную температуру заваривания при непрерывной работе.",
    },
    {
      title: "интерфейс с 3 кнопками",
      description:
        "Кнопки на левой группе в AV-версии или на электронной панели в EE используются для программирования и управления.",
    },
    {
      title: "поддержка Pro App",
      description:
        "Электронная плата поддерживает подключение к La Marzocco Pro App для управления и мониторинга машины.",
    },
    {
      title: "датчик воды",
      description:
        "Контроль проводимости и жесткости входящей воды помогает точнее планировать обслуживание.",
    },
  ],
  en: [
    {
      title: "dual boilers",
      description:
        "Separate coffee and steam boilers allow the machine to brew espresso and steam milk at the same time with stable output.",
    },
    {
      title: "dual PID",
      description:
        "Electronic temperature control for both boilers makes calibration more precise and repeatable.",
    },
    {
      title: "saturated groups",
      description:
        "The group design is built for stable brew temperature during continuous service.",
    },
    {
      title: "3-button interface",
      description:
        "Buttons on the left group in the AV version, or on the electronic panel in the EE version, are used for programming and control.",
    },
    {
      title: "Pro App support",
      description:
        "The electronic board supports La Marzocco Pro App integration for machine control and monitoring.",
    },
    {
      title: "water sensor",
      description:
        "Monitoring conductivity and incoming water hardness helps plan maintenance more accurately.",
    },
  ],
} satisfies Record<EquipmentLanguage, EquipmentFeature[]>;

const lineaClassicSpecs = {
  ru: [
    { label: "Высота", value: "20.5 in / 44.5 cm" },
    { label: "Ширина", value: "27.3 in / 69.3 cm" },
    { label: "Глубина", value: "23 in / 58.5 cm" },
    { label: "Вес", value: "130 lb / 59 kg" },
    { label: "Мощность мин.", value: "3350 W" },
    { label: "Мощность макс.", value: "5670 W" },
    { label: "Кофейный бойлер", value: "3.4 L" },
    { label: "Паровой бойлер", value: "7 L" },
  ],
  en: [
    { label: "Height", value: "20.5 in / 44.5 cm" },
    { label: "Width", value: "27.3 in / 69.3 cm" },
    { label: "Depth", value: "23 in / 58.5 cm" },
    { label: "Weight", value: "130 lb / 59 kg" },
    { label: "Min power", value: "3350 W" },
    { label: "Max power", value: "5670 W" },
    { label: "Coffee boiler", value: "3.4 L" },
    { label: "Steam boiler", value: "7 L" },
  ],
} satisfies Record<EquipmentLanguage, EquipmentDetail[]>;

const gb5Features = {
  ru: [
    {
      title: "двойные бойлеры",
      description:
        "Отдельные бойлеры для эспрессо и пара помогают машине сохранять стабильность при непрерывной работе.",
    },
    {
      title: "двойной PID",
      description:
        "Температуры кофе и пара регулируются электронно для более точной калибровки.",
    },
    {
      title: "крышки группы Piero",
      description:
        "Переработанный внутренний путь воды и положение расходомера улучшают температурную стабильность.",
    },
    {
      title: "цифровой дисплей",
      description:
        "Понятный цифровой интерфейс упрощает настройку параметров машины и контроль работы.",
    },
    {
      title: "диммируемая подсветка",
      description:
        "Трехрежимная LED-подсветка поддерживает режимы eco, on и brewing для лучшей видимости у группы.",
    },
    {
      title: "быстросервисный паровой клапан",
      description:
        "Паровой клапан спроектирован так, чтобы обслуживаться спереди без снятия всего узла.",
    },
  ],
  en: [
    {
      title: "dual boilers",
      description:
        "Separate boilers for espresso and steam help the machine stay stable during continuous service.",
    },
    {
      title: "dual PID",
      description:
        "Coffee and steam temperatures are electronically controlled for more precise calibration.",
    },
    {
      title: "Piero group caps",
      description:
        "A redesigned internal water path and flow meter position improve temperature stability.",
    },
    {
      title: "digital display",
      description:
        "A clear digital interface makes machine settings and daily monitoring easier.",
    },
    {
      title: "dimmable lighting",
      description:
        "Three-mode LED lighting supports eco, on, and brewing states for better visibility around the group.",
    },
    {
      title: "front-service steam valve",
      description:
        "The steam valve is designed to be serviced from the front without removing the entire assembly.",
    },
  ],
} satisfies Record<EquipmentLanguage, EquipmentFeature[]>;

const gb5Specs = {
  ru: [
    { label: "Высота", value: "21.4 in / 54.4 cm" },
    { label: "Ширина", value: "30 in / 77 cm" },
    { label: "Глубина", value: "25 in / 64 cm" },
    { label: "Вес", value: "154 lb / 70 kg" },
    { label: "Мощность мин.", value: "3730 W" },
    { label: "Мощность макс.", value: "5445 W" },
    { label: "Кофейный бойлер", value: "3.4 L" },
    { label: "Паровой бойлер", value: "7 L" },
  ],
  en: [
    { label: "Height", value: "21.4 in / 54.4 cm" },
    { label: "Width", value: "30 in / 77 cm" },
    { label: "Depth", value: "25 in / 64 cm" },
    { label: "Weight", value: "154 lb / 70 kg" },
    { label: "Min power", value: "3730 W" },
    { label: "Max power", value: "5445 W" },
    { label: "Coffee boiler", value: "3.4 L" },
    { label: "Steam boiler", value: "7 L" },
  ],
} satisfies Record<EquipmentLanguage, EquipmentDetail[]>;

export const equipmentItems: EquipmentItem[] = [
  {
    slug: "la-marzocco-micra",
    name: "La Marzocco Micra",
    image: "/photo/techCatalog/La Marzocco Micra/1.webp",
    images: ["/photo/techCatalog/La Marzocco Micra/1.webp"],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Домашняя кофемашина",
        status: "Под заказ",
        description:
          "Компактная платформа La Marzocco для домашних кухонь, студийных баров и небольших гостевых пространств, где нужен коммерческий характер в уменьшенном формате.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "Micra" },
          { label: "Формат", value: "Дом / компакт" },
          { label: "Назначение", value: "Эспрессо" },
        ],
        features: [
          {
            title: "трансформируемый портафильтр",
            description:
              "Портафильтр 3-в-1 быстро переключается между одинарным носиком, двойным носиком и бездонной конфигурацией.",
          },
          {
            title: "рычаг пролива",
            description:
              "Ощущение механической paddle-активации сочетается с надежностью электрического переключателя.",
          },
          {
            title: "изолированная паровая трубка",
            description:
              "Паровая трубка cool-touch удобнее в работе и при этом сохраняет мощную подачу пара.",
          },
          {
            title: "удобный резервуар",
            description:
              "Автономный резервуар на 2 литра легко доступен и позволяет при необходимости подключить машину к воде.",
          },
          {
            title: "подключение к приложению",
            description:
              "Через La Marzocco Home App можно менять температуру, настройки, расписания и запускать авто-бэкфлаш.",
          },
          {
            title: "подсветка бариста",
            description:
              "LED-подсветка выделяет рабочую зону и улучшает видимость у группы.",
          },
        ],
        specifications: [
          { label: "Высота", value: "13.3 in / 33.8 cm" },
          { label: "Ширина", value: "11.4 in / 29 cm" },
          { label: "Глубина", value: "18.6 in / 47.2 cm" },
          { label: "Вес", value: "42 lb / 19 kg" },
          { label: "Мощность мин.", value: "1600 W (110V)" },
          { label: "Мощность макс.", value: "1850 W (220V)" },
          { label: "Кофейный бойлер", value: "0.25 L" },
          { label: "Паровой бойлер", value: "1.6 L" },
          { label: "Резервуар", value: "2 L" },
        ],
      },
      en: {
        category: "Home espresso machine",
        status: "On request",
        description:
          "A compact La Marzocco platform for home kitchens, studio bars, and small guest spaces where a commercial character is needed in a reduced format.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "Micra" },
          { label: "Format", value: "Home / compact" },
          { label: "Use", value: "Espresso" },
        ],
        features: [
          {
            title: "convertible portafilter",
            description:
              "The 3-in-1 portafilter quickly switches between a single spout, double spout, and bottomless configuration.",
          },
          {
            title: "brew paddle",
            description:
              "The tactile feeling of mechanical paddle activation is paired with the reliability of an electric switch.",
          },
          {
            title: "insulated steam wand",
            description:
              "The cool-touch steam wand is easier to work with while maintaining strong steam power.",
          },
          {
            title: "easy-access reservoir",
            description:
              "The self-contained 2-liter reservoir is easy to access and the machine can be plumbed when needed.",
          },
          {
            title: "app connectivity",
            description:
              "La Marzocco Home App support allows temperature changes, scheduling, settings, and auto-backflush control.",
          },
          {
            title: "barista lights",
            description:
              "LED lighting highlights the work area and improves visibility around the group.",
          },
        ],
        specifications: [
          { label: "Height", value: "13.3 in / 33.8 cm" },
          { label: "Width", value: "11.4 in / 29 cm" },
          { label: "Depth", value: "18.6 in / 47.2 cm" },
          { label: "Weight", value: "42 lb / 19 kg" },
          { label: "Min power", value: "1600 W (110V)" },
          { label: "Max power", value: "1850 W (220V)" },
          { label: "Coffee boiler", value: "0.25 L" },
          { label: "Steam boiler", value: "1.6 L" },
          { label: "Reservoir", value: "2 L" },
        ],
      },
    },
  },
  {
    slug: "linea-mini-r",
    name: "Linea Mini R",
    image: "/photo/techCatalog/Linea Mini R/1.webp",
    images: [
      "/photo/techCatalog/Linea Mini R/1.webp",
      "/photo/techCatalog/Linea Mini R/2.webp",
      "/photo/techCatalog/Linea Mini R/3.webp",
    ],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Просьюмер-кофемашина",
        status: "Под заказ",
        description:
          "Просьюмер-платформа Linea с более архитектурным силуэтом и коммерческим визуальным языком для премиальных домашних сетапов, каппинг-зон и дизайн-ориентированных кофе-поинтов.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "Linea Mini R" },
          { label: "Формат", value: "Просьюмер" },
          { label: "Назначение", value: "Эспрессо" },
        ],
        features: [
          {
            title: "двойные бойлеры + PID",
            description:
              "Двойные бойлеры с PID-контролем температуры обеспечивают стабильную и предсказуемую экстракцию эспрессо.",
          },
          {
            title: "встроенный таймер шота",
            description:
              "Встроенный таймер дает визуальный контроль времени пролива при каждом шоте.",
          },
          {
            title: "быстрая настройка давления",
            description:
              "Давление помпы можно быстро подстроить под конкретный кофе и рецепт.",
          },
          {
            title: "система предсмачивания",
            description:
              "Двухклапанная система предсмачивания обеспечивает мягкое насыщение таблетки и самоочищающийся ограничитель потока.",
          },
          {
            title: "полуавтоматическая paddle",
            description:
              "Интерфейс paddle сочетает ощущение ручной работы с электронным контролем предсмачивания.",
          },
          {
            title: "интеграция с Home App",
            description:
              "Подключение к La Marzocco Home App открывает расширенные возможности настройки, обслуживания и работы.",
          },
        ],
        specifications: [
          { label: "Высота", value: "15 in / 38 cm" },
          { label: "Ширина", value: "14.2 in / 36 cm" },
          { label: "Глубина", value: "21.3 in / 54 cm" },
          { label: "Вес", value: "66.2 lb / 30 kg" },
          { label: "Напряжение", value: "120V или 220-240V, одна фаза" },
          {
            label: "Мощность макс.",
            value: "1800 W (120V) / 1770-2100 W (220-240V)",
          },
          { label: "Паровой бойлер", value: "3-3.5 L" },
          { label: "Резервуар", value: "2.5 L" },
        ],
      },
      en: {
        category: "Prosumer espresso machine",
        status: "On request",
        description:
          "A prosumer Linea platform with a more architectural silhouette and a commercial visual language for premium home setups, cupping zones, and design-driven coffee points.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "Linea Mini R" },
          { label: "Format", value: "Prosumer" },
          { label: "Use", value: "Espresso" },
        ],
        features: [
          {
            title: "dual boilers + PID",
            description:
              "Dual boilers with PID temperature control deliver stable and predictable espresso extraction.",
          },
          {
            title: "built-in shot timer",
            description:
              "The integrated timer gives a clear visual reference for shot duration on every extraction.",
          },
          {
            title: "fast pressure adjustment",
            description:
              "Pump pressure can be quickly tuned to fit a specific coffee and recipe.",
          },
          {
            title: "pre-infusion system",
            description:
              "The dual-valve pre-infusion system provides gentle puck saturation and a self-cleaning flow restrictor.",
          },
          {
            title: "semi-automatic paddle",
            description:
              "The paddle interface combines the tactile feel of manual work with electronic pre-infusion control.",
          },
          {
            title: "Home App integration",
            description:
              "La Marzocco Home App connectivity opens up advanced setup, maintenance, and workflow controls.",
          },
        ],
        specifications: [
          { label: "Height", value: "15 in / 38 cm" },
          { label: "Width", value: "14.2 in / 36 cm" },
          { label: "Depth", value: "21.3 in / 54 cm" },
          { label: "Weight", value: "66.2 lb / 30 kg" },
          { label: "Voltage", value: "120V or 220-240V, single phase" },
          {
            label: "Max power",
            value: "1800 W (120V) / 1770-2100 W (220-240V)",
          },
          { label: "Steam boiler", value: "3-3.5 L" },
          { label: "Reservoir", value: "2.5 L" },
        ],
      },
    },
  },
  {
    slug: "linea-pb-av-2-group",
    name: "Linea PB AV 2 Group",
    image: "/photo/techCatalog/Linea PB AV 2 Group/1.webp",
    images: [
      "/photo/techCatalog/Linea PB AV 2 Group/1.webp",
      "/photo/techCatalog/Linea PB AV 2 Group/2.webp",
      "/photo/techCatalog/Linea PB AV 2 Group/3.webp",
      "/photo/techCatalog/Linea PB AV 2 Group/4.webp",
      "/photo/techCatalog/Linea PB AV 2 Group/5.webp",
      "/photo/techCatalog/Linea PB AV 2 Group/6.webp",
    ],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Коммерческая кофемашина",
        status: "Под заказ",
        description:
          "Двухгруппная volumetric-конфигурация для стабильного потока в кофейне, сочетающая знакомый профиль PB, аккуратную отделку из нержавеющей стали и эргономику под сервис.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "Linea PB AV" },
          { label: "Группы", value: "2 группы" },
          { label: "Управление", value: "Автоматическое объемное" },
        ],
        features: lineaPbFeatures.ru,
        specifications: lineaPbSpecs.ru,
      },
      en: {
        category: "Commercial espresso machine",
        status: "On request",
        description:
          "A two-group volumetric configuration for stable café throughput, combining the familiar PB profile, clean stainless finishing, and service-oriented ergonomics.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "Linea PB AV" },
          { label: "Groups", value: "2 group" },
          { label: "Control", value: "Automatic volumetric" },
        ],
        features: lineaPbFeatures.en,
        specifications: lineaPbSpecs.en,
      },
    },
  },
  {
    slug: "linea-classic-s-av-2-group",
    name: "Linea Classic S AV 2 Group",
    image: "/photo/techCatalog/Linea Classic S AV 2 Group/1.png",
    images: [
      "/photo/techCatalog/Linea Classic S AV 2 Group/1.png",
      "/photo/techCatalog/Linea Classic S AV 2 Group/2.webp",
      "/photo/techCatalog/Linea Classic S AV 2 Group/3.png",
      "/photo/techCatalog/Linea Classic S AV 2 Group/4.png",
      "/photo/techCatalog/Linea Classic S AV 2 Group/5.webp",
      "/photo/techCatalog/Linea Classic S AV 2 Group/6.webp",
    ],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Коммерческая кофемашина",
        status: "Под заказ",
        description:
          "Самый узнаваемый силуэт Linea в AV-конфигурации для загруженных баров, которым нужна надежная логика работы и вневременной внешний вид машины.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "Linea Classic S AV" },
          { label: "Группы", value: "2 группы" },
          { label: "Управление", value: "Автоматическое объемное" },
        ],
        features: lineaClassicFeatures.ru,
        specifications: lineaClassicSpecs.ru,
      },
      en: {
        category: "Commercial espresso machine",
        status: "On request",
        description:
          "The most recognizable Linea silhouette in an AV configuration for busy bars that need reliable workflow logic and a timeless machine presence.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "Linea Classic S AV" },
          { label: "Groups", value: "2 group" },
          { label: "Control", value: "Automatic volumetric" },
        ],
        features: lineaClassicFeatures.en,
        specifications: lineaClassicSpecs.en,
      },
    },
  },
  {
    slug: "gb5-s-av-2-group",
    name: "GB5 S AV 2 Group",
    image: "/photo/techCatalog/GB5 S AV 2 Group/1.webp",
    images: [
      "/photo/techCatalog/GB5 S AV 2 Group/1.webp",
      "/photo/techCatalog/GB5 S AV 2 Group/2.webp",
      "/photo/techCatalog/GB5 S AV 2 Group/3.webp",
      "/photo/techCatalog/GB5 S AV 2 Group/4.webp",
      "/photo/techCatalog/GB5 S AV 2 Group/5.webp",
      "/photo/techCatalog/GB5 S AV 2 Group/6.webp",
    ],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Коммерческая кофемашина",
        status: "Под заказ",
        description:
          "GB5 с изогнутым корпусом, AV-управлением и более выразительной фронтальной деталью для заведений, которым нужен классический визуальный центр бара.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "GB5 S AV" },
          { label: "Группы", value: "2 группы" },
          { label: "Управление", value: "Автоматическое объемное" },
        ],
        features: gb5Features.ru,
        specifications: gb5Specs.ru,
      },
      en: {
        category: "Commercial espresso machine",
        status: "On request",
        description:
          "GB5 with a curved body, AV control, and a more expressive front detail for venues that need a classic visual center behind the bar.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "GB5 S AV" },
          { label: "Groups", value: "2 group" },
          { label: "Control", value: "Automatic volumetric" },
        ],
        features: gb5Features.en,
        specifications: gb5Specs.en,
      },
    },
  },
  {
    slug: "gb5-s-ee-2-group",
    name: "GB5 S EE 2 Group",
    image: "/photo/techCatalog/GB5 S EE 2 Group/1.png",
    images: [
      "/photo/techCatalog/GB5 S EE 2 Group/1.png",
      "/photo/techCatalog/GB5 S EE 2 Group/2.png",
      "/photo/techCatalog/GB5 S EE 2 Group/3.png",
      "/photo/techCatalog/GB5 S EE 2 Group/4.png",
      "/photo/techCatalog/GB5 S EE 2 Group/5.png",
      "/photo/techCatalog/GB5 S EE 2 Group/6.png",
    ],
    brand: "la-marzocco",
    type: "espresso-machine",
    translations: {
      ru: {
        category: "Коммерческая кофемашина",
        status: "Под заказ",
        description:
          "Ручная интерпретация GB5 с тем же выразительным корпусом для тех, кто хочет больше тактильного контроля над экстракцией и узнаваемый классический облик.",
        details: [
          { label: "Бренд", value: "La Marzocco" },
          { label: "Серия", value: "GB5 S EE" },
          { label: "Группы", value: "2 группы" },
          { label: "Управление", value: "Полуавтоматическое" },
        ],
        features: gb5Features.ru,
        specifications: gb5Specs.ru,
      },
      en: {
        category: "Commercial espresso machine",
        status: "On request",
        description:
          "A manual interpretation of the GB5 with the same expressive body for those who want more tactile control over extraction and a recognizable classic look.",
        details: [
          { label: "Brand", value: "La Marzocco" },
          { label: "Series", value: "GB5 S EE" },
          { label: "Groups", value: "2 group" },
          { label: "Control", value: "Semi-automatic" },
        ],
        features: gb5Features.en,
        specifications: gb5Specs.en,
      },
    },
  },
];

export function getEquipmentItemBySlug(slug: string) {
  return equipmentItems.find((item) => item.slug === slug);
}

export function getEquipmentItemContent(
  item: EquipmentItem,
  language: EquipmentLanguage,
) {
  return item.translations[language];
}
