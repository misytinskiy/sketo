import { getCoffeeRecommendationItems } from "../catalog/catalog-db";
import { getEquipmentCatalogItems } from "../catalog/equipment/equipment-db";
import { getAccessories } from "../accessories/data";
import { accessoryContent, catalogPrice, categoryLabel, label } from "../accessories/model";
import type { Language } from "./language";
import { prioritizeShelfItem, selectShelfItems, type ShelfProduct } from "./home-shelves-model";
import HomeProductShelves from "./HomeProductShelves";

function translations(make: (language: Language) => ShelfProduct["content"][Language]): ShelfProduct["content"] {
  return { ru: make("ru"), en: make("en"), kz: make("kz") };
}

export default async function HomeProductShelvesData({ initialLanguage }: { initialLanguage: Language }) {
  // Reuse public caches and their invalidation tags; a failed category must not break the home page.
  const results = await Promise.allSettled([getCoffeeRecommendationItems(), getEquipmentCatalogItems(), getAccessories()]);
  results.forEach((result, index) => {
    if (result.status === "rejected") console.error("Home shelf unavailable", ["coffee", "equipment", "accessories"][index]);
  });
  const coffee = prioritizeShelfItem(
    results[0].status === "fulfilled" ? results[0].value : [],
    item => item.slug === "colombia-jefferson-castano-250g",
  );
  const equipment = results[1].status === "fulfilled" ? results[1].value : [];
  const accessories = prioritizeShelfItem(
    results[2].status === "fulfilled" ? results[2].value : [],
    item => item.slug === "muvna-tasting-cup-crystalline",
  );
  return <HomeProductShelves initialLanguage={initialLanguage} shelves={[
    { kind: "coffee", products: selectShelfItems(coffee, item => item.image, item => item.filters[0] ?? "coffee").map(item => ({
      href: `/catalog/${item.slug}`, image: item.image,
      content: translations(language => ({ name: item.translations[language].name, detail: item.translations[language].notes, price: item.price })),
    })) },
    { kind: "equipment", products: selectShelfItems(equipment, item => item.image, item => item.type).map(item => ({
      href: `/catalog/equipment/${item.slug}`, image: item.image,
      content: translations(language => ({ name: item.name, detail: item.translations[language].category, price: label(language, "Цена по запросу", "Price on request", "Бағасы сұрау бойынша") })),
    })) },
    { kind: "accessories", products: selectShelfItems(accessories, item => item.images[0]?.url, item => item.category).map(item => ({
      href: `/accessories/${item.slug}`, image: item.images[0].url,
      content: translations(language => ({ name: accessoryContent(item, language).name, detail: categoryLabel(item.category, language), price: catalogPrice(item, language) })),
    })) },
  ]} />;
}
