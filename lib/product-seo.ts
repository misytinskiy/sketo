import type { Metadata } from "next";
import type { Language } from "@/app/components/language";
import { getSiteUrl, publicProductPath } from "./site-url";

type ProductSeoInput = {
  kind: "coffee" | "equipment";
  slug: string;
  name: string;
  description: string;
  image: string;
  language: Language;
  seoTitle?: string;
  seoDescription?: string;
};

const copy = {
  ru: { coffee: "Кофе", equipment: "Оборудование", home: "Главная", locale: "ru_RU" },
  en: { coffee: "Coffee", equipment: "Equipment", home: "Home", locale: "en_US" },
  kz: { coffee: "Кофе", equipment: "Жабдық", home: "Басты бет", locale: "kk_KZ" },
};

function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function seoImageUrl(image: string) {
  // Inline placeholders and blob URLs cannot be fetched by social crawlers.
  if (!image || /^(data:|blob:)/i.test(image)) return undefined;
  try {
    const url = new URL(image, getSiteUrl());
    return /^https?:$/.test(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function buildProductMetadata(input: ProductSeoInput): Metadata {
  const labels = copy[input.language];
  const name = plainText(input.name) || input.slug;
  const title = plainText(input.seoTitle || "") || `${name} — ${labels[input.kind]} | Sketo`;
  const fullDescription = plainText(input.seoDescription || "") || plainText(input.description) || `${name} — ${labels[input.kind]} Sketo.`;
  const description = fullDescription.length > 180 ? `${fullDescription.slice(0, 177).trimEnd()}…` : fullDescription;
  const url = new URL(publicProductPath(input.kind, input.slug), getSiteUrl()).href;
  const image = seoImageUrl(input.image);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Sketo Coffee", locale: labels.locale, title, description, url,
      images: image ? [{ url: image, alt: name }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title, description,
      images: image ? [{ url: image, alt: name }] : [] },
  };
}

export function buildProductStructuredData(input: ProductSeoInput) {
  const origin = getSiteUrl();
  const url = new URL(publicProductPath(input.kind, input.slug), origin).href;
  const image = seoImageUrl(input.image);
  const labels = copy[input.language];
  // Use visible product content, not marketing metadata. Do not invent offers,
  // reviews, stock levels or prices for equipment sold by enquiry.
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Product", "@id": `${url}#product`, url, name: input.name,
        description: input.description, ...(image ? { image: [image] } : {}) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: labels.home, item: origin.href },
        { "@type": "ListItem", position: 2, name: labels[input.kind], item: new URL(input.kind === "coffee" ? "/catalog" : "/equipment", origin).href },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ] },
    ],
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
