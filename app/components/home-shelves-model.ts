import type { Language } from "./language";

export type ShelfProduct = {
  href: string;
  image: string;
  content: Record<Language, { name: string; detail: string; price: string }>;
};
export type ShelfKind = "coffee" | "equipment" | "accessories";
export type Shelf = { kind: ShelfKind; products: ShelfProduct[] };

export function prioritizeShelfItem<T>(items: T[], matches: (item: T) => boolean): T[] {
  const preferred = items.find(matches);
  return preferred ? [preferred, ...items.filter(item => item !== preferred)] : items;
}

// Stable editorial order, with a different type for the second item if available.
export function selectShelfItems<T>(items: T[], image: (item: T) => string | undefined, group: (item: T) => string): T[] {
  const eligible = items.filter(item => image(item));
  const first = eligible[0];
  if (!first) return [];
  const second = eligible.slice(1).find(item => group(item) !== group(first)) ?? eligible[1];
  return second ? [first, second] : [first];
}
