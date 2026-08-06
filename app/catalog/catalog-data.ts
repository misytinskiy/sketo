export type CatalogFilter = "all" | "profiles" | "decaf" | "microlot";

export type CatalogLanguage = "ru" | "en";

export type CatalogDetailField = {
  label: string;
  value: string;
};

type CatalogTranslation = {
  name: string;
  size: string;
  notes: string;
  description: string;
  details: CatalogDetailField[];
};

export type CatalogItem = {
  slug: string;
  image: string;
  price: string;
  filters: CatalogFilter[];
  translations: Record<CatalogLanguage, CatalogTranslation>;
};

export const catalogItems: CatalogItem[] = [
  {
    slug: "african-profile-1-0",
    image: "/photo/catalog/africanProfile1.png",
    price: "KZT 5,700",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "African Profile 1.0",
        size: "250 г",
        notes: "Цветы, грейпфрут, персик, ананас",
        description:
          "Яркий африканский профиль для чистой чашки с высокой ароматикой и сочным фруктовым раскрытием.",
        details: [
          { label: "Страна", value: "Эфиопия" },
          { label: "Регион", value: "Йиргачеффе, зона Гедео" },
          { label: "Обработка", value: "Хани" },
          { label: "Высота", value: "1800 м" },
          { label: "Q-score", value: "86" },
          { label: "Букет", value: "Цветы, грейпфрут, персик, ананас" },
        ],
      },
      en: {
        name: "African Profile 1.0",
        size: "250 g",
        notes: "Flowers, grapefruit, peach, pineapple",
        description:
          "A bright African profile with a clean cup, expressive aromatics, and juicy fruit clarity.",
        details: [
          { label: "Country", value: "Ethiopia" },
          { label: "Region", value: "Yirgacheffe, Gedeo Zone" },
          { label: "Process", value: "Honey" },
          { label: "Altitude", value: "1800 m" },
          { label: "Q-score", value: "86" },
          { label: "Profile", value: "Flowers, grapefruit, peach, pineapple" },
        ],
      },
    },
  },
  {
    slug: "latino-profile-2-0",
    image: "/photo/catalog/latinoProfile.png",
    price: "KZT 5,900",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "Latino Profile 2.0",
        size: "250 г",
        notes: "Тростниковый сахар, косточковые фрукты, карамель",
        description:
          "Сбалансированный латиноамериканский профиль с мягкой сладостью и комфортной эспрессо-чашкой.",
        details: [
          { label: "Страна", value: "Бразилия" },
          { label: "Лот", value: "Engheno Farm, лот 32#" },
          { label: "Обработка", value: "Палпд-натурал" },
          { label: "Разновидность", value: "Желтый бурбон" },
          { label: "Профиль обжарки", value: "Эспрессо | Фильтр" },
          {
            label: "Букет",
            value: "Тростниковый сахар, косточковые фрукты, карамель",
          },
        ],
      },
      en: {
        name: "Latino Profile 2.0",
        size: "250 g",
        notes: "Cane sugar, stone fruits, caramel",
        description:
          "A balanced Latin American profile with soft sweetness and a comfortable espresso-style cup.",
        details: [
          { label: "Country", value: "Brazil" },
          { label: "Lot", value: "Engheno Farm, lot 32#" },
          { label: "Process", value: "Pulped natural" },
          { label: "Variety", value: "Yellow Bourbon" },
          { label: "Roast profile", value: "Espresso | Filter" },
          { label: "Profile", value: "Cane sugar, stone fruits, caramel" },
        ],
      },
    },
  },
  {
    slug: "decaf",
    image: "/photo/catalog/decaf.png",
    price: "KZT 5,900",
    filters: ["decaf"],
    translations: {
      ru: {
        name: "Декаф",
        size: "250 г",
        notes: "Карамель, молочный шоколад, яблоко, лимон",
        description:
          "Декаф с плотным телом и привычным кофейным характером, без потери сладости и чистоты.",
        details: [
          { label: "Страна", value: "Колумбия, Нариньо" },
          { label: "Процесс", value: "Sugar Cane EA Decaf" },
          { label: "Тип", value: "Кофе с низким содержанием кофеина" },
          { label: "Обжарка", value: "Эспрессо" },
          { label: "Букет", value: "Карамель, молочный шоколад, яблоко, лимон" },
        ],
      },
      en: {
        name: "Decaf",
        size: "250 g",
        notes: "Caramel, milk chocolate, apple, lemon",
        description:
          "A decaf with dense body and a familiar coffee character, while keeping sweetness and clarity intact.",
        details: [
          { label: "Country", value: "Colombia, Nariño" },
          { label: "Process", value: "Sugar Cane EA Decaf" },
          { label: "Type", value: "Low-caffeine coffee" },
          { label: "Roast", value: "Espresso" },
          { label: "Profile", value: "Caramel, milk chocolate, apple, lemon" },
        ],
      },
    },
  },
  {
    slug: "asian-profile",
    image: "/photo/catalog/asianProfile.png",
    price: "KZT 5,900",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "Asian Profile",
        size: "250 г",
        notes: "Курага, чернослив, темный шоколад, арахис",
        description:
          "Более плотный и темный профиль с низкой кислотностью и шоколадно-ореховым послевкусием.",
        details: [
          { label: "Бленд", value: "Бразилия \\ Эфиопия, 60 \\ 40" },
          { label: "Сладость", value: "4/5" },
          { label: "Кислотность", value: "3/5" },
          { label: "Горечь", value: "3/5" },
          { label: "Тело", value: "4/5" },
          { label: "Букет", value: "Курага, чернослив, темный шоколад, арахис" },
        ],
      },
      en: {
        name: "Asian Profile",
        size: "250 g",
        notes: "Dried apricot, prune, dark chocolate, peanut",
        description:
          "A denser, darker profile with low acidity and a chocolate-nut finish.",
        details: [
          { label: "Blend", value: "Brazil \\ Ethiopia, 60 \\ 40" },
          { label: "Sweetness", value: "4/5" },
          { label: "Acidity", value: "3/5" },
          { label: "Bitterness", value: "3/5" },
          { label: "Body", value: "4/5" },
          { label: "Profile", value: "Dried apricot, prune, dark chocolate, peanut" },
        ],
      },
    },
  },
  {
    slug: "italian-profile-medium",
    image: "/photo/catalog/italianProfile.png",
    price: "KZT 5,900",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "Italian Profile Medium",
        size: "250 г",
        notes: "Темный шоколад, орехи",
        description:
          "Плотный итальянский профиль под эспрессо, ориентированный на шоколадную чашку и стабильность.",
        details: [
          { label: "Бленд", value: "Бразилия / Уганда" },
          { label: "Состав", value: "100% арабика" },
          { label: "Сладость", value: "4/5" },
          { label: "Кислотность", value: "2/5" },
          { label: "Горечь", value: "4/5" },
          { label: "Букет", value: "Темный шоколад, орехи" },
        ],
      },
      en: {
        name: "Italian Profile Medium",
        size: "250 g",
        notes: "Dark chocolate, nuts",
        description:
          "A dense Italian-style espresso profile focused on a chocolate-forward cup and stable performance.",
        details: [
          { label: "Blend", value: "Brazil / Uganda" },
          { label: "Composition", value: "100% arabica" },
          { label: "Sweetness", value: "4/5" },
          { label: "Acidity", value: "2/5" },
          { label: "Bitterness", value: "4/5" },
          { label: "Profile", value: "Dark chocolate, nuts" },
        ],
      },
    },
  },
  {
    slug: "brazilian-profile-1-0",
    image: "/photo/catalog/brazilianProfile1.png",
    price: "KZT 5,900",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "Brazilian Profile 1.0",
        size: "250 г",
        notes: "Карамель, темный шоколад, грецкий орех",
        description:
          "Мягкий бразильский профиль с ореховой базой и умеренной сладостью для повседневного эспрессо.",
        details: [
          { label: "Регион", value: "Бразилия Сирадо" },
          { label: "Сладость", value: "3/5" },
          { label: "Кислотность", value: "2/5" },
          { label: "Горечь", value: "3/5" },
          { label: "Тело", value: "4/5" },
          { label: "Букет", value: "Карамель, темный шоколад, грецкий орех" },
        ],
      },
      en: {
        name: "Brazilian Profile 1.0",
        size: "250 g",
        notes: "Caramel, dark chocolate, walnut",
        description:
          "A soft Brazilian profile with a nutty base and moderate sweetness for everyday espresso use.",
        details: [
          { label: "Region", value: "Brazil Cerrado" },
          { label: "Sweetness", value: "3/5" },
          { label: "Acidity", value: "2/5" },
          { label: "Bitterness", value: "3/5" },
          { label: "Body", value: "4/5" },
          { label: "Profile", value: "Caramel, dark chocolate, walnut" },
        ],
      },
    },
  },
  {
    slug: "brazilian-profile-2-0",
    image: "/photo/catalog/brazilianProfile2.png",
    price: "KZT 5,900",
    filters: ["profiles"],
    translations: {
      ru: {
        name: "Brazilian Profile 2.0",
        size: "250 г",
        notes: "Цитрусы, темный шоколад, грецкий орех",
        description:
          "Более яркая вариация бразильского профиля с легким цитрусовым акцентом и плотной базой.",
        details: [
          { label: "Бленд", value: "Бразилия \\ Эфиопия, 80 \\ 20" },
          { label: "Сладость", value: "3/5" },
          { label: "Кислотность", value: "2/5" },
          { label: "Горечь", value: "3/5" },
          { label: "Тело", value: "4/5" },
          { label: "Букет", value: "Цитрусы, темный шоколад, грецкий орех" },
        ],
      },
      en: {
        name: "Brazilian Profile 2.0",
        size: "250 g",
        notes: "Citrus, dark chocolate, walnut",
        description:
          "A brighter take on the Brazilian profile with a light citrus accent and a dense base.",
        details: [
          { label: "Blend", value: "Brazil \\ Ethiopia, 80 \\ 20" },
          { label: "Sweetness", value: "3/5" },
          { label: "Acidity", value: "2/5" },
          { label: "Bitterness", value: "3/5" },
          { label: "Body", value: "4/5" },
          { label: "Profile", value: "Citrus, dark chocolate, walnut" },
        ],
      },
    },
  },
  {
    slug: "microlot-2-0",
    image: "/photo/catalog/microlot2.png",
    price: "KZT 7,200",
    filters: ["microlot"],
    translations: {
      ru: {
        name: "Микролот 2.0",
        size: "250 г",
        notes: "Желтые фрукты, молочный шоколад, клюква, миндаль",
        description:
          "Микролот с более сложной ароматикой и деликатной ферментацией, ориентированный на выразительную чашку.",
        details: [
          { label: "Страна", value: "Бразилия, Санта-Катарина" },
          { label: "Разновидность", value: "Желтый катуаи" },
          { label: "Обработка", value: "Натуральная ферментация" },
          { label: "Обжарка", value: "Фильтр" },
          {
            label: "Букет",
            value: "Желтые фрукты, молочный шоколад, клюква, миндаль",
          },
        ],
      },
      en: {
        name: "Microlot 2.0",
        size: "250 g",
        notes: "Yellow fruits, milk chocolate, cranberry, almond",
        description:
          "A microlot with more complex aromatics and delicate fermentation, built for a more expressive cup.",
        details: [
          { label: "Country", value: "Brazil, Santa Catarina" },
          { label: "Variety", value: "Yellow Catuai" },
          { label: "Process", value: "Natural fermentation" },
          { label: "Roast", value: "Filter" },
          {
            label: "Profile",
            value: "Yellow fruits, milk chocolate, cranberry, almond",
          },
        ],
      },
    },
  },
];

export function getCatalogItemBySlug(slug: string) {
  return catalogItems.find((item) => item.slug === slug);
}

export function getCatalogItemContent(
  item: CatalogItem,
  language: CatalogLanguage,
) {
  return item.translations[language];
}
