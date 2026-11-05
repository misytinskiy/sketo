import "server-only";
import { getCoffeeCatalogItems } from "../catalog/catalog-db";
import { getAccessory } from "../accessories/data";
import { accessoryContent, variantImages, volumeLabel } from "../accessories/model";
import type { Language } from "../components/language";

export type DemoProduct = {
  href: string; image: string; price: number;
  content: Record<Language, { name: string; detail: string }>;
};
const content = (make: (language: Language) => DemoProduct["content"][Language]) => ({ ru: make("ru"), en: make("en"), kz: make("kz") });

// Only public catalogue data. The orders themselves remain fictional.
export async function getDemoProducts(): Promise<DemoProduct[]> {
  const [coffeeItems, cup] = await Promise.all([
    getCoffeeCatalogItems(), getAccessory("muvna-tasting-cup-crystalline"),
  ]);
  const result: DemoProduct[] = [];
  const coffee = coffeeItems.find(item => item.slug === "colombia-jefferson-castano-250g");
  // Coffee prices use the catalogue's `KZT 5,700` display convention.
  const coffeePrice = coffee?.price.match(/^KZT\s*([\d,]+)(?:\.(\d{1,2}))?$/);
  if (coffee && coffeePrice) result.push({
    href: `/catalog/${coffee.slug}`, image: coffee.image,
    price: Number(coffeePrice[1].replaceAll(",", "") + (coffeePrice[2] ? `.${coffeePrice[2]}` : "")),
    content: content(language => ({ name: coffee.translations[language].name, detail: coffee.translations[language].size })),
  });
  const variant = cup?.variants[0];
  const volume = cup?.volumes?.[0];
  const amount = volume?.price ?? variant?.price;
  if (cup && variant && amount != null && Number.isFinite(Number(amount)) && (volume?.currency ?? variant.currency) === "KZT") {
    result.push({ href: `/accessories/${cup.slug}`, price: Number(amount),
      image: variantImages(cup, variant.id, volume?.id)[0]?.url || "/image-unavailable.svg",
      content: content(language => ({ name: accessoryContent(cup, language).name,
        detail: [variant.color, volume ? volumeLabel(volume, language) : ""].filter(Boolean).join(" · ") })),
    });
  }
  return result;
}
