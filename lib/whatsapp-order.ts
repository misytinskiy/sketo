import type { Language } from "@/app/components/language";

export type WhatsAppOrder = {
  kind: "coffee" | "equipment";
  language: Language;
  name: string;
  slug: string;
  productUrl: string;
  size?: string;
  price?: string;
};

export const orderCopy = {
  ru: {
    button: "Заказать в WhatsApp",
  },
  en: {
    button: "Order on WhatsApp",
  },
  kz: {
    button: "WhatsApp арқылы тапсырыс беру",
  },
} as const;

export function buildWhatsAppOrderUrl(order: WhatsAppOrder) {
  const name = order.name.trim() || order.slug;
  const text = {
    ru: {
      intro: `Здравствуйте! Хочу заказать ${order.kind === "coffee" ? "кофе" : "оборудование"} «${name}».`,
      size: "Вес", price: "Цена на сайте", article: "Артикул",
      question: order.kind === "coffee"
        ? "Подскажите, пожалуйста, наличие и как оформить заказ."
        : "Подскажите, пожалуйста, стоимость, наличие и условия поставки.",
    },
    en: {
      intro: `Hello! I'd like to order ${order.kind === "coffee" ? "coffee" : "equipment"}: ${name}.`,
      size: "Weight", price: "Website price", article: "Item code",
      question: order.kind === "coffee"
        ? "Could you confirm availability and help me place an order?"
        : "Could you share the price, availability and delivery terms?",
    },
    kz: {
      intro: `Сәлеметсіз бе! «${name}» ${order.kind === "coffee" ? "кофесіне" : "жабдығына"} тапсырыс бергім келеді.`,
      size: "Салмағы", price: "Сайттағы баға", article: "Артикул",
      question: order.kind === "coffee"
        ? "Қолда бар-жоғын және тапсырысты қалай рәсімдеуге болатынын айта аласыз ба?"
        : "Бағасын, қолда бар-жоғын және жеткізу шарттарын айта аласыз ба?",
    },
  }[order.language];
  const message = [
    text.intro,
    "",
    `${text.article}: ${order.slug}`,
    ...(order.kind === "coffee" && order.size?.trim() ? [`${text.size}: ${order.size.trim()}`] : []),
    ...(order.kind === "coffee" && order.price?.trim() ? [`${text.price}: ${order.price.trim()}`] : []),
    order.productUrl,
    "",
    text.question,
  ].join("\n");
  return `https://wa.me/77473835398?text=${encodeURIComponent(message)}`;
}
