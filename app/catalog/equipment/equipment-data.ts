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

export type EquipmentDetail = {
  label: string;
  value: string;
};

export type EquipmentFeature = {
  title: string;
  description: string;
};

export type EquipmentItem = {
  slug: string;
  name: string;
  image: string;
  images: string[];
  brand: Exclude<EquipmentBrand, "all">;
  type: Exclude<EquipmentType, "all">;
  category: string;
  status: string;
  description: string;
  details: EquipmentDetail[];
  features: EquipmentFeature[];
  specifications: EquipmentDetail[];
};

export const equipmentBrandLabels: Record<
  Exclude<EquipmentBrand, "all">,
  string
> = {
  "la-marzocco": "La Marzocco",
  mahlkonig: "Mahlkönig",
  anfim: "Anfim",
  mazzer: "Mazzer",
  balenare: "Balenare",
  allround: "Allround",
  "victoria-arduino": "Victoria Arduino",
};

export const equipmentTypeLabels: Record<
  Exclude<EquipmentType, "all">,
  string
> = {
  grinder: "Grinder",
  "espresso-machine": "Espresso machine",
};

const lineaPbFeatures: EquipmentFeature[] = [
  {
    title: "saturated groups",
    description:
      "Water never leaves the coffee boiler during brewing, keeping thermal stability steady shot after shot.",
  },
  {
    title: "dual pid",
    description:
      "Independent electronic control of coffee and steam boiler temperatures for more precise setup.",
  },
  {
    title: "digital display",
    description:
      "Temperature display, shot timers, flow pulse counter, and intuitive programming simplify parameter changes.",
  },
  {
    title: "piero group caps",
    description:
      "Flowmeters integrated into the group improve volumetric accuracy and day-to-day repeatability.",
  },
  {
    title: "pre-heating system",
    description:
      "Water is pre-heated before entering the coffee boiler, increasing productivity during service peaks.",
  },
  {
    title: "barista lights",
    description:
      "LED illumination keeps the group area and cup clearly visible during extraction.",
  },
];

const lineaPbSpecs: EquipmentDetail[] = [
  { label: "Height", value: "21 in / 53.3 cm" },
  { label: "Width", value: "28 in / 71 cm" },
  { label: "Depth", value: "23 in / 59 cm" },
  { label: "Weight", value: "134.5 lb / 61 kg" },
  { label: "Wattage", value: "4600 W" },
  { label: "Coffee boiler", value: "3.4 L" },
  { label: "Steam boiler", value: "7 L" },
];

const lineaClassicFeatures: EquipmentFeature[] = [
  {
    title: "dual boilers",
    description:
      "Separate coffee and steam boilers optimize extraction and milk steaming at the same time.",
  },
  {
    title: "dual pid",
    description:
      "Electronic temperature control for both boilers makes setup more accurate and repeatable.",
  },
  {
    title: "saturated groups",
    description:
      "Group design is built for stable brew temperature across consecutive shots in service.",
  },
  {
    title: "3-button interface",
    description:
      "Buttons on the left group in AV or on the electronics board in EE are used for programming and control.",
  },
  {
    title: "pro app compatible",
    description:
      "The electronic board supports La Marzocco Pro App connectivity for machine control and monitoring.",
  },
  {
    title: "water sensor",
    description:
      "Incoming water conductivity and hardness are monitored to support better maintenance decisions.",
  },
];

const lineaClassicSpecs: EquipmentDetail[] = [
  { label: "Height", value: "20.5 in / 44.5 cm" },
  { label: "Width", value: "27.3 in / 69.3 cm" },
  { label: "Depth", value: "23 in / 58.5 cm" },
  { label: "Weight", value: "130 lb / 59 kg" },
  { label: "Wattage min", value: "3350 W" },
  { label: "Wattage max", value: "5670 W" },
  { label: "Coffee boiler", value: "3.4 L" },
  { label: "Steam boiler", value: "7 L" },
];

const gb5Features: EquipmentFeature[] = [
  {
    title: "dual boilers",
    description:
      "Dedicated boilers for brewing and steam help the machine stay balanced under continuous workflow.",
  },
  {
    title: "dual pid",
    description:
      "Coffee and steam temperatures can be controlled electronically for tighter calibration.",
  },
  {
    title: "piero group caps",
    description:
      "The re-engineered internal water path and flowmeter positioning improve temperature stability.",
  },
  {
    title: "digital display",
    description:
      "An intuitive digital interface makes it easier to adjust machine parameters and monitor operation.",
  },
  {
    title: "dimmable barista lights",
    description:
      "Three-stage LED lighting supports eco, on, and brewing modes for clearer workflow at the group.",
  },
  {
    title: "easy rebuild steam valve",
    description:
      "The steam valve is engineered to be serviced from the front without removing the assembly.",
  },
];

const gb5Specs: EquipmentDetail[] = [
  { label: "Height", value: "21.4 in / 54.4 cm" },
  { label: "Width", value: "30 in / 77 cm" },
  { label: "Depth", value: "25 in / 64 cm" },
  { label: "Weight", value: "154 lb / 70 kg" },
  { label: "Wattage min", value: "3730 W" },
  { label: "Wattage max", value: "5445 W" },
  { label: "Coffee boiler", value: "3.4 L" },
  { label: "Steam boiler", value: "7 L" },
];

export const equipmentItems: EquipmentItem[] = [
  {
    slug: "la-marzocco-micra",
    name: "La Marzocco Micra",
    image: "/photo/techCatalog/La Marzocco Micra/1.webp",
    images: ["/photo/techCatalog/La Marzocco Micra/1.webp"],
    brand: "la-marzocco",
    type: "espresso-machine",
    category: "Home espresso machine",
    status: "On request",
    description:
      "Compact La Marzocco platform for private kitchens, studio bars, and small hospitality corners where full commercial character is needed in a reduced footprint.",
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
          "The three-in-one convertible portafilter switches between single-spout, double-spout, and bottomless.",
      },
      {
        title: "brew paddle",
        description:
          "Mechanical-style paddle activation is paired with the reliability of an electric switch.",
      },
      {
        title: "insulated steam wand",
        description:
          "The cool-touch steam wand keeps handling more comfortable while delivering strong steam power.",
      },
      {
        title: "easy-fill reservoir",
        description:
          "The self-contained 2-liter reservoir is easy to access and keeps optional plumbing possible.",
      },
      {
        title: "stay connected",
        description:
          "La Marzocco Home App access lets you adjust temperature, settings, schedules, and auto-backflush.",
      },
      {
        title: "barista lights",
        description:
          "LED lighting highlights the extraction area and improves visibility at the group.",
      },
    ],
    specifications: [
      { label: "Height", value: "13.3 in / 33.8 cm" },
      { label: "Width", value: "11.4 in / 29 cm" },
      { label: "Depth", value: "18.6 in / 47.2 cm" },
      { label: "Weight", value: "42 lb / 19 kg" },
      { label: "Wattage min", value: "1600 W (110V)" },
      { label: "Wattage max", value: "1850 W (220V)" },
      { label: "Coffee boiler", value: "0.25 L" },
      { label: "Steam boiler", value: "1.6 L" },
      { label: "Reservoir", value: "2 L" },
    ],
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
    category: "Prosumer espresso machine",
    status: "On request",
    description:
      "Prosumer Linea platform with a more architectural silhouette and commercial visual language for premium home setups, tasting rooms, and design-led coffee points.",
    details: [
      { label: "Brand", value: "La Marzocco" },
      { label: "Series", value: "Linea Mini R" },
      { label: "Format", value: "Prosumer" },
      { label: "Use", value: "Espresso" },
    ],
    features: [
      {
        title: "dual boilers + pid",
        description:
          "Dual boilers with PID temperature control keep espresso extraction stable and consistent.",
      },
      {
        title: "built-in shot timer",
        description:
          "The integrated shot timer gives direct visual control over espresso timing during every pull.",
      },
      {
        title: "easy pressure adjustment",
        description:
          "Pump pressure can be adjusted quickly to tailor extraction behavior to the coffee and recipe.",
      },
      {
        title: "pre-infusion system",
        description:
          "The two-valve pre-infusion system supports soft saturation and a self-cleaning flow restrictor.",
      },
      {
        title: "semi-automatic paddle",
        description:
          "The paddle interface brings manual workflow feel together with electronic pre-infusion control.",
      },
      {
        title: "home app integration",
        description:
          "La Marzocco Home App connectivity unlocks advanced setup, maintenance, and workflow options.",
      },
    ],
    specifications: [
      { label: "Height", value: "15 in / 38 cm" },
      { label: "Width", value: "14.2 in / 36 cm" },
      { label: "Depth", value: "21.3 in / 54 cm" },
      { label: "Weight", value: "66.2 lb / 30 kg" },
      { label: "Voltage", value: "120V or 220-240V single phase" },
      { label: "Wattage max", value: "1800 W (120V) / 1770-2100 W (220-240V)" },
      { label: "Steam boiler", value: "3-3.5 L" },
      { label: "Reservoir", value: "2.5 L" },
    ],
  },
  // {
  //   slug: "linea-pb",
  //   name: "LINEA PB",
  //   image: "/photo/techCatalog/LINEA PB/1.jpg",
  //   images: [
  //     "/photo/techCatalog/LINEA PB/1.jpg",
  //     "/photo/techCatalog/LINEA PB/2.jpg",
  //   ],
  //   brand: "la-marzocco",
  //   type: "espresso-machine",
  //   category: "Commercial espresso machine",
  //   status: "On request",
  //   description:
  //     "A restrained commercial workhorse with classic La Marzocco geometry, intended for service bars that need stable day-to-day throughput with a clean front-of-house presence.",
  //   details: [
  //     { label: "Brand", value: "La Marzocco" },
  //     { label: "Series", value: "LINEA PB" },
  //     { label: "Format", value: "Commercial" },
  //     { label: "Use", value: "Espresso service" },
  //   ],
  //   features: lineaPbFeatures,
  //   specifications: lineaPbSpecs,
  // },
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
    category: "Commercial espresso machine",
    status: "On request",
    description:
      "Two-group volumetric configuration for steady cafe flow, combining a familiar PB profile with a refined stainless finish and service-first ergonomics.",
    details: [
      { label: "Brand", value: "La Marzocco" },
      { label: "Series", value: "Linea PB AV" },
      { label: "Groups", value: "2 group" },
      { label: "Control", value: "Automatic volumetric" },
    ],
    features: lineaPbFeatures,
    specifications: lineaPbSpecs,
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
    category: "Commercial espresso machine",
    status: "On request",
    description:
      "The most recognizable Linea silhouette in an AV setup, suited for busy bars that want durable workflow logic and a direct, timeless machine presence.",
    details: [
      { label: "Brand", value: "La Marzocco" },
      { label: "Series", value: "Linea Classic S AV" },
      { label: "Groups", value: "2 group" },
      { label: "Control", value: "Automatic volumetric" },
    ],
    features: lineaClassicFeatures,
    specifications: lineaClassicSpecs,
  },
  // {
  //   slug: "linea-classic-s-ee-2-group",
  //   name: "Linea Classic S EE 2 Group",
  //   image: "/photo/techCatalog/Linea Classic S EE 2 Group/1.jpg",
  //   images: [
  //     "/photo/techCatalog/Linea Classic S EE 2 Group/1.jpg",
  //     "/photo/techCatalog/Linea Classic S EE 2 Group/2.jpg",
  //     "/photo/techCatalog/Linea Classic S EE 2 Group/3.jpg",
  //     "/photo/techCatalog/Linea Classic S EE 2 Group/4.jpg",
  //   ],
  //   brand: "la-marzocco",
  //   type: "espresso-machine",
  //   category: "Commercial espresso machine",
  //   status: "On request",
  //   description:
  //     "Electronic paddle-driven Linea Classic execution for bars that prefer direct manual rhythm while keeping the same iconic chassis and service reliability.",
  //   details: [
  //     { label: "Brand", value: "La Marzocco" },
  //     { label: "Series", value: "Linea Classic S EE" },
  //     { label: "Groups", value: "2 group" },
  //     { label: "Control", value: "Semi-automatic" },
  //   ],
  //   features: lineaClassicFeatures,
  //   specifications: lineaClassicSpecs,
  // },
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
    category: "Commercial espresso machine",
    status: "On request",
    description:
      "Curved GB5 body with AV control and more expressive front detailing for venues that want a classic bar centerpiece with elevated finish language.",
    details: [
      { label: "Brand", value: "La Marzocco" },
      { label: "Series", value: "GB5 S AV" },
      { label: "Groups", value: "2 group" },
      { label: "Control", value: "Automatic volumetric" },
    ],
    features: gb5Features,
    specifications: gb5Specs,
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
    category: "Commercial espresso machine",
    status: "On request",
    description:
      "Manual GB5 interpretation with the same sculpted bodywork, designed for operators who want more tactile extraction control and an unmistakable heritage look.",
    details: [
      { label: "Brand", value: "La Marzocco" },
      { label: "Series", value: "GB5 S EE" },
      { label: "Groups", value: "2 group" },
      { label: "Control", value: "Semi-automatic" },
    ],
    features: gb5Features,
    specifications: gb5Specs,
  },
];

export function getEquipmentItemBySlug(slug: string) {
  return equipmentItems.find((item) => item.slug === slug);
}
