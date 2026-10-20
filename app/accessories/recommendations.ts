import { matchesStage, type Accessory, type Stage } from "./model";
import type { CoffeeCatalogCardItem } from "../catalog/catalog-db";

export type CoffeeCandidate = CoffeeCatalogCardItem & { methodText: string };
export type Recommendation = { kind: "accessory"; item: Accessory; reason: [string, string, string] }
  | { kind: "coffee"; coffee: CoffeeCandidate; reason: [string, string, string] };
export type Recommendations = Record<Stage, Recommendation[]>;
type Method = "espresso" | "pour-over";

function text(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const v = value as Record<string, unknown>;
  if (v._type === "localized-attribute") return text(v.value);
  return [v.ru, v.en, v.kz].map(text).join(" ");
}

function methods(item: Accessory): Set<Method> {
  const result = new Set<Method>();
  const value = text(item.attributes.brewing_method);
  if (/espresso|эспрессо/.test(value)) result.add("espresso");
  if (/pour[ -]?over|пуровер|v60|v-60|filter|фильтр/.test(value)) result.add("pour-over");
  if (!result.size) {
    if (["drippers", "kettles"].includes(item.category)) result.add("pour-over");
    if (["baskets", "tampers", "distributors", "milk-tools"].includes(item.category)) result.add("espresso");
  }
  return result;
}

// Standalone tools may be suggested without a known brewing method. Fitted parts
// still need reliable compatibility data; unknown method is not a mismatch.
const reasons: Record<string, [string, string, string]> = {
  scales: ["Для взвешивания кофе и воды", "For weighing coffee and water", "Кофе мен суды өлшеу үшін"],
  storage: ["Для хранения зёрен между приготовлениями", "For storing beans between brews", "Дайындау арасында дәндерді сақтау үшін"],
  grinders: ["Для помола перед приготовлением", "For grinding before brewing", "Дайындау алдында ұнтақтау үшін"],
  kettles: ["Для подачи воды при заваривании пуровера", "For pouring water when brewing pour-over", "Пуровер дайындағанда су құю үшін"],
  drippers: ["Для заваривания кофе методом пуровер", "For brewing pour-over coffee", "Пуровер әдісімен кофе демдеу үшін"],
  drinkware: ["Для готового кофе — дома или с собой", "For your coffee, at home or on the go", "Дайын кофеге — үйде немесе жолда"],
  serving: ["Для подачи приготовленного кофе", "For serving brewed coffee", "Дайын кофені ұсыну үшін"],
  cupping: ["Для дегустации готового кофе", "For tasting brewed coffee", "Дайын кофенің дәмін тату үшін"],
  cleaning: ["Для ухода за кофейными инструментами", "For caring for coffee tools", "Кофе құралдарын күту үшін"],
  "tamping-stations": ["Для организации рабочего места", "For organising your coffee workspace", "Кофе жұмыс орнын ұйымдастыру үшін"],
  dosing: ["Для подготовки порции молотого кофе", "For preparing a dose of ground coffee", "Ұнтақталған кофе мөлшерін дайындау үшін"],
  distributors: ["Для распределения молотого кофе", "For distributing ground coffee", "Ұнтақталған кофені тарату үшін"],
  "milk-tools": ["Для работы с молоком и подачи", "For milk preparation and serving", "Сүт дайындау және ұсыну үшін"],
  "coffee-makers": ["Для приготовления кофе", "For brewing coffee", "Кофе дайындау үшін"],
  sets: ["Набор инструментов для приготовления кофе", "A set of tools for brewing coffee", "Кофе дайындауға арналған құралдар жиынтығы"],
  gifts: ["Небольшая деталь для любителей кофе", "A small detail for coffee lovers", "Кофе әуесқойларына арналған шағын сыйлық"],
};

function requiresFit(item: Accessory) {
  if (["baskets", "filters", "tampers", "rinsers"].includes(item.category)) return true;
  if (!["dosing", "distributors", "tamping-stations"].includes(item.category)) return false;
  const name = [item.name, ...item.translations.map(t => t.name), text(item.attributes.tool_type)].join(" ").toLowerCase();
  const hasDiameter = item.attributes.diameter_mm != null || item.attributes.diameter_label != null;
  if (hasDiameter || /\b\d{2}(?:[.,]\d+)?\s*(?:mm|мм)\b/.test(name)) return true;
  if (item.category === "dosing") return !/cup|стакан|чаш|ыдыс/.test(name) || /ring|funnel|кольц|воронк/.test(name);
  if (item.category === "distributors") return !/wdt|needle|игольч|инелі/.test(name) || /rotary|вращ|ротор/.test(name);
  // Flat mats do not impose the machine/portafilter fit of a fitted station.
  return !/\bmat\b|коврик|кілемше/.test(name);
}

// Stable per product, but different across products. Unlike ID sorting this does
// not permanently favour the same model; no random changes on page refresh.
function affinity(seed: string, id: string) {
  let hash = 2166136261;
  for (const char of `${seed}:${id}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return (hash >>> 0) / 4294967295;
}
function medianPrice(item: Accessory) {
  const values = (item.volumes?.length ? item.volumes : item.variants)
    .filter(v => v.currency === "KZT" && v.price !== null && Number(v.price) > 0)
    .map(v => Number(v.price)).sort((a, b) => a - b);
  return values.length ? values[Math.floor(values.length / 2)] : undefined;
}

export function recommendAccessories(current: Accessory, catalog: Accessory[], coffee: CoffeeCandidate[] = []): Recommendations {
  const result: Recommendations = { prep: [], brew: [], serve: [] };
  const currentMethods = methods(current);
  const included = text(current.attributes.set_contents) + " " + text(current.attributes.additional_item);
  const hasGrinder = Boolean(text(current.attributes.included_grinder).trim()) || /grinder|кофемол|кофеұнтақ/.test(included);
  const includedCategories: Record<string, RegExp> = {
    scales: /scales?|весы|таразы/, kettles: /kettle|чайник|шәйнек/,
    drippers: /dripper|воронк|құйғыш/, drinkware: /\bcups?\b|tumbler|чашк|термос|кесе/,
    serving: /server|сервер/, storage: /storage|хранени|сақтау/,
  };
  const seen = new Set<string>();
  const ranked = catalog.flatMap(item => {
    if (seen.has(item.id) || item.id === current.id || item.slug === current.slug) return [];
    seen.add(item.id);
    if (!reasons[item.category] || requiresFit(item)) return [];
    if (current.category === "sets" && includedCategories[item.category]?.test(included)) return [];
    const variants = item.variants.filter(v => v.availability === "in_stock");
    if (!variants.length) return [];
    const images = item.images.filter(image => (!image.variantId || variants.some(v => v.id === image.variantId))
      && (!image.volumeId || item.volumes?.some(v => v.id === image.volumeId)));
    const candidateMethods = methods(item);
    const sharedMethod = [...currentMethods].some(method => candidateMethods.has(method));
    if (currentMethods.size && candidateMethods.size && !sharedMethod) return [];
    if (item.category === "grinders" && hasGrinder) return [];
    const priority: Record<string, number> = { scales: 85, grinders: 90, kettles: 85, drippers: 85, drinkware: 90, serving: 85, storage: 75, cupping: 75,
      cleaning: 85, "tamping-stations": 85, dosing: 85, distributors: 85, "milk-tools": 80, "coffee-makers": 80, sets: 65, gifts: 60 };
    const currentPrice = medianPrice(current), price = medianPrice(item);
    const priceFit = currentPrice && price ? Math.max(0, 1 - Math.abs(Math.log(price / currentPrice)) / 4) * 10 : 0;
    return [{ item: { ...item, variants, images }, score: priority[item.category] + (sharedMethod ? 25 : 0)
      + priceFit + affinity(current.id, item.id) * 24 - (item.category === current.category ? 45 : 0) }];
  }).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));

  const coffeeSeen = new Set<string>();
  const coffeeRanked = coffee.flatMap(lot => {
    if (coffeeSeen.has(lot.slug)) return [];
    coffeeSeen.add(lot.slug);
    const value = lot.methodText.toLowerCase();
    const espresso = /espresso|эспрессо/.test(value);
    const filter = /pour[ -]?over|пуровер|v-?60|filter|фильтр/.test(value);
    const match = (espresso && currentMethods.has("espresso")) || (filter && currentMethods.has("pour-over"));
    if (currentMethods.size && (espresso || filter) && !match) return [];
    return [{ lot, match, score: (match ? 100 : 0) + affinity(current.id, lot.slug) * 24 }];
  }).sort((a, b) => b.score - a.score || a.lot.slug.localeCompare(b.lot.slug));
  const coffeeRecommendation = ({ lot, match }: typeof coffeeRanked[number]): Recommendation => ({
    kind: "coffee", coffee: lot, reason: match
      ? ["Кофе для этого способа приготовления", "Coffee for this brewing method", "Осы дайындау әдісіне арналған кофе"]
      : ["Попробуйте этот лот кофе", "Explore this coffee lot", "Осы кофе түрін байқап көріңіз"],
  });
  for (const stage of Object.keys(result) as Stage[]) {
    if (stage === "brew" && coffeeRanked.length) result.brew.push(coffeeRecommendation(coffeeRanked[0]));
    const categories = new Set<string>();
    // Type uniqueness is a hard constraint, including during fallback.
    // A same-category alternative to the viewed item is only a last resort.
    for (const pass of [0, 1]) {
      for (const { item } of ranked) {
        if (result[stage].length >= 3) break;
        if (!matchesStage(item.category, stage) || categories.has(item.category)) continue;
        if (pass === 0 && item.category === current.category) continue;
        result[stage].push({ kind: "accessory", item, reason: item.category === current.category
          ? ["Другой вариант для этого этапа", "Another option for this stage", "Осы кезеңге арналған басқа нұсқа"] : reasons[item.category] });
        categories.add(item.category);
      }
    }
  }
  return result;
}
