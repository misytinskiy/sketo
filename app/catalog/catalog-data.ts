export type CatalogFilter = "all" | "profiles" | "decaf" | "microlot";

export type CatalogDetailField = {
  label: string;
  value: string;
};

export type CatalogItem = {
  slug: string;
  name: string;
  size: string;
  image: string;
  price: string;
  notes: string;
  filters: CatalogFilter[];
  description: string;
  details: CatalogDetailField[];
};

export const catalogItems: CatalogItem[] = [
  {
    slug: "african-profile-1-0",
    name: "African Profile 1.0",
    size: "250 г",
    image: "/photo/catalog/africanProfile1.png",
    price: "KZT 5,700",
    notes: "Цветы, грейпфрут, персик, ананас",
    filters: ["profiles"],
    description:
      "Яркий африканский профиль для чистой чашки с высокой ароматикой и сочным фруктовым раскрытием.",
    details: [
      { label: "Страна", value: "Эфиопия" },
      { label: "Регион", value: "Yirgacheffe, Gedeo zone" },
      { label: "Обработка", value: "Хани" },
      { label: "Высота", value: "1800 м" },
      { label: "Q-score", value: "86" },
      { label: "Букет", value: "Цветы, грейпфрут, персик, ананас" },
    ],
  },
  {
    slug: "latino-profile-2-0",
    name: "Latino Profile 2.0",
    size: "250 г",
    image: "/photo/catalog/latinoProfile.png",
    price: "KZT 5,900",
    notes: "Тростниковый сахар, косточковые фрукты, карамель",
    filters: ["profiles"],
    description:
      "Сбалансированный латиноамериканский профиль с мягкой сладостью и комфортной эспрессо-чашкой.",
    details: [
      { label: "Страна", value: "Бразилия" },
      { label: "Лот", value: "Engheno Farm lot 32#" },
      { label: "Обработка", value: "Pulped natural" },
      { label: "Разновидность", value: "Yellow bourbon" },
      { label: "Профиль обжарки", value: "Эспрессо | Фильтр" },
      {
        label: "Букет",
        value: "Тростниковый сахар, косточковые фрукты, карамель",
      },
    ],
  },
  {
    slug: "decaf",
    name: "Decaf",
    size: "250 г",
    image: "/photo/catalog/decaf.png",
    price: "KZT 5,900",
    notes: "Карамель, молочный шоколад, яблоко, лимон",
    filters: ["decaf"],
    description:
      "Декаф с плотным телом и привычным кофейным характером, без потери сладости и чистоты.",
    details: [
      { label: "Страна", value: "Colombia Nariño" },
      { label: "Процесс", value: "Sugar Cane EA Decaf" },
      { label: "Тип", value: "Кофе с низким содержанием кофеина" },
      { label: "Обжарка", value: "Эспрессо" },
      { label: "Букет", value: "Карамель, молочный шоколад, яблоко, лимон" },
    ],
  },
  {
    slug: "asian-profile",
    name: "Asian Profile",
    size: "250 г",
    image: "/photo/catalog/asianProfile.png",
    price: "KZT 5,900",
    notes: "Курага, чернослив, темный шоколад, арахис",
    filters: ["profiles"],
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
  {
    slug: "italian-profile-medium",
    name: "Italian Profile Medium",
    size: "250 г",
    image: "/photo/catalog/italianProfile.png",
    price: "KZT 5,900",
    notes: "Темный шоколад, орехи",
    filters: ["profiles"],
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
  {
    slug: "brazilian-profile-1-0",
    name: "Brazilian Profile 1.0",
    size: "250 г",
    image: "/photo/catalog/brazilianProfile1.png",
    price: "KZT 5,900",
    notes: "Карамель, темный шоколад, грецкий орех",
    filters: ["profiles"],
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
  {
    slug: "brazilian-profile-2-0",
    name: "Brazilian Profile 2.0",
    size: "250 г",
    image: "/photo/catalog/brazilianProfile2.png",
    price: "KZT 5,900",
    notes: "Цитрусы, темный шоколад, грецкий орех",
    filters: ["profiles"],
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
  {
    slug: "microlot-2-0",
    name: "Microlot 2.0",
    size: "250 г",
    image: "/photo/catalog/microlot2.png",
    price: "KZT 7,200",
    notes: "Желтые фрукты, молочный шоколад, клюква, миндаль",
    filters: ["microlot"],
    description:
      "Микролот с более сложной ароматикой и деликатной ферментацией, ориентированный на выразительную чашку.",
    details: [
      { label: "Страна", value: "Brazilia Santa Catarina" },
      { label: "Разновидность", value: "Желтый катуаи" },
      { label: "Обработка", value: "Натуральная ферментация" },
      { label: "Обжарка", value: "Filter" },
      {
        label: "Букет",
        value: "Желтые фрукты, молочный шоколад, клюква, миндаль",
      },
    ],
  },
];

export function getCatalogItemBySlug(slug: string) {
  return catalogItems.find((item) => item.slug === slug);
}
