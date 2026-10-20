import type { Language } from "../components/language";
export type AccessoryVolume = { id: string; value: string; unit: string; price: string; currency: string };
export function volumeLabel(volume: AccessoryVolume, language: Language) {
  const unit = language === 'en' ? ({ 'мл': 'ml', 'л': 'l', 'г': 'g', 'кг': 'kg' } as Record<string, string>)[volume.unit] ?? volume.unit : volume.unit;
  return `${Number(volume.value)} ${unit}`;
}

export type Accessory = {
  id: string; slug: string; name: string; brand: string; category: string;
  attributes: Record<string, unknown>;
  volumes?: AccessoryVolume[];
  translations: { locale: Language; name: string; description: string }[];
  variants: { id: string; sku: string; color: string; hex: string | null; volumeMl?: string | null;
    price: string | null; currency: string; availability: "in_stock" | "out_of_stock" | "unknown" | "on_order" }[];
  images: { id: string; url: string; alt: string; variantId: string | null; volumeId?: string | null }[];
};

const categories: Record<string, [string, string, string]> = {
  "coffee-makers": ["Кофеварки", "Coffee makers", "Кофеқайнатқыштар"],
  grinders: ["Кофемолки", "Grinders", "Кофеұнтақтағыштар"],
  baskets: ["Корзины и портафильтры", "Baskets & portafilters", "Себеттер мен портафильтрлер"],
  storage: ["Хранение кофе", "Coffee storage", "Кофені сақтау"],
  "milk-tools": ["Для молока и латте-арта", "Milk & latte art", "Сүт пен латте-арт"],
  "tamping-stations": ["Коврики и рабочее место", "Mats & stations", "Кілемшелер мен станциялар"],
  tampers: ["Темперы", "Tampers", "Темперлер"], distributors: ["Разравниватели", "Distributors", "Тегістегіштер"],
  drinkware: ["Чашки и термосы", "Cups & tumblers", "Кеселер мен термостар"],
  kettles: ["Чайники", "Kettles", "Шәйнектер"], filters: ["Фильтры", "Filters", "Сүзгілер"],
  drippers: ["Воронки", "Drippers", "Құйғыштар"], sets: ["Наборы", "Sets", "Жиынтықтар"],
  cleaning: ["Уход и очистка", "Cleaning", "Күтім мен тазалау"], rinsers: ["Ринзеры", "Rinsers", "Ринзерлер"],
  dosing: ["Дозирование", "Dosing", "Мөлшерлеу"], serving: ["Сервировка", "Serving", "Ұсыну"],
  cupping: ["Дегустация", "Cupping", "Дәм тату"], gifts: ["Брелки и подарки", "Gifts", "Сыйлықтар"],
  scales: ["Весы", "Scales", "Таразылар"],
};
export const label = (language: Language, ru: string, en: string, kz: string) => language === "en" ? en : language === "kz" ? kz : ru;
export const categoryLabel = (category: string, language: Language) => {
  const names = categories[category];
  return names ? label(language, ...names) : category;
};
export function groupAccessoriesByCategory(items: Accessory[]) {
  const groups = new Map<string, Accessory[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return Array.from(groups, ([category, products]) => ({ category, products }));
}
export function accessoryContent(item: Accessory, language: Language) {
  const ru = item.translations.find(t => t.locale === "ru");
  const translation = item.translations.find(t => t.locale === language);
  return { name: translation?.name || ru?.name || item.name, description: translation?.description || ru?.description || "" };
}
export function variantImages(item: Accessory, variantId: string, volumeId?: string) {
  // Never show another colour as if it were the selected variant.
  return item.images.filter(image => (image.variantId === variantId || image.variantId === null) && (!image.volumeId || image.volumeId === volumeId))
    .sort((a, b) => Number(b.variantId === variantId) - Number(a.variantId === variantId));
}
export function priceLabel(price: string | null, currency: string, language: Language) {
  if (price === null) return label(language, "Уточнить цену", "Price on request", "Бағасын нақтылау");
  return new Intl.NumberFormat(language === "kz" ? "kk-KZ" : language === "en" ? "en-US" : "ru-RU", {
    style: "currency", currency, maximumFractionDigits: 2,
  }).format(Number(price));
}
export function catalogPrice(item: Accessory, language: Language) {
  const variants = item.volumes?.length ? item.volumes : item.variants;
  if (!variants.length || variants.some(v => v.price === null) || new Set(variants.map(v => v.currency)).size !== 1)
    return priceLabel(null, "KZT", language);
  const prices = variants.map(v => Number(v.price));
  return (Math.min(...prices) !== Math.max(...prices) ? label(language, "от ", "from ", "бастап ") : "")
    + priceLabel(String(Math.min(...prices)), variants[0].currency, language);
}
export const stages = {
  prep: ["grinders", "scales", "dosing", "distributors", "tampers", "tamping-stations", "storage", "cleaning", "rinsers"],
  brew: ["coffee-makers", "baskets", "kettles", "drippers", "filters", "milk-tools", "sets"],
  serve: ["drinkware", "serving", "cupping", "gifts"],
} as const;
export type Stage = keyof typeof stages;
export function isStage(value: unknown): value is Stage { return value === "prep" || value === "brew" || value === "serve"; }
export function matchesStage(category: string, stage: Stage) { return (stages[stage] as readonly string[]).includes(category); }

export const attributeNames: Record<string, [string, string, string]> = {
  diameter_mm: ["Диаметр, мм", "Diameter, mm", "Диаметрі, мм"], diameter_label: ["Диаметр", "Diameter", "Диаметрі"],
  dose_g: ["Дозировка, г", "Dose, g", "Мөлшері, г"], volume_ml: ["Объём, мл", "Volume, ml", "Көлемі, мл"],
  capacity_g: ["Вместимость, г", "Capacity, g", "Сыйымдылығы, г"], size_cm: ["Размер, см", "Size, cm", "Өлшемі, см"],
  size: ["Размер", "Size", "Өлшемі"], material: ["Материал", "Material", "Материал"],
  finish: ["Покрытие", "Finish", "Жабыны"], base_material: ["Материал основания", "Base material", "Негіз материалы"],
  base: ["Основание", "Base", "Негізі"], tube_count: ["Количество трубок", "Tube count", "Түтік саны"],
  paddles: ["Лопасти", "Paddles", "Қалақтар"], plug: ["Вилка", "Plug", "Аша"],
  servings: ["Порции", "Servings", "Порциялар"], power_supply: ["Питание", "Power supply", "Қуат көзі"],
  version: ["Версия", "Version", "Нұсқасы"], panel: ["Панель", "Panel", "Панель"],
  shape: ["Форма", "Shape", "Пішіні"], base_set: ["Базовый набор", "Base set", "Негізгі жиынтық"],
  additional_item: ["В комплекте", "Included", "Жиынтықта"], foldable_handle: ["Складная ручка", "Folding handle", "Жиналмалы тұтқа"],
  operation: ["Управление", "Operation", "Басқару"], brewing_method: ["Способ приготовления", "Brewing method", "Дайындау тәсілі"],
  power_w: ["Мощность, Вт", "Power, W", "Қуаты, Вт"], dimensions_mm: ["Габариты, мм", "Dimensions, mm", "Өлшемдері, мм"],
  body_material: ["Материал корпуса", "Body material", "Корпус материалы"], container_volume_ml: ["Объём контейнера, мл", "Container volume, ml", "Ыдыс көлемі, мл"],
  spout: ["Носик", "Spout", "Шүмегі"], spout_count: ["Количество носиков", "Spout count", "Шүмек саны"],
  knock_bar: ["Перекладина", "Knock bar", "Көлденең тірек"], tool_type: ["Тип инструмента", "Tool type", "Құрал түрі"],
  burr_diameter_mm: ["Диаметр жерновов, мм", "Burr diameter, mm", "Диірмен тасының диаметрі, мм"],
  burr_material: ["Материал жерновов", "Burr material", "Диірмен тасының материалы"],
  adjustment_steps: ["Ступени регулировки", "Adjustment steps", "Реттеу қадамдары"],
  max_weight_g: ["Максимальный вес, г", "Maximum weight, g", "Ең үлкен салмақ, г"],
  resolution_g: ["Шаг измерения, г", "Resolution, g", "Өлшеу қадамы, г"],
  charging: ["Зарядка", "Charging", "Зарядтау"], timer: ["Таймер", "Timer", "Таймер"],
  temperature_control: ["Регулировка температуры", "Temperature control", "Температураны реттеу"],
  model: ["Модель", "Model", "Модель"], purpose: ["Назначение", "Purpose", "Мақсаты"],
  cleaning_method: ["Способ очистки", "Cleaning method", "Тазалау тәсілі"],
  configuration: ["Исполнение", "Configuration", "Нұсқасы"], construction: ["Конструкция", "Construction", "Құрылымы"],
  format: ["Формат", "Format", "Пішімі"], functions: ["Функции", "Functions", "Функциялары"],
  included_grinder: ["Кофемолка в наборе", "Included grinder", "Жиынтықтағы кофеұнтақтағыш"],
  set_contents: ["Состав набора", "Set contents", "Жиынтық құрамы"],
};
// Legacy scalar values remain unchanged in the database; localise them at display time.
const attributeValues: Record<string, [string, string, string]> = {
  acrylic: ["Акрил", "Acrylic", "Акрил"], walnut: ["Дерево грецкого ореха", "Walnut wood", "Жаңғақ ағашы"],
  titanium: ["Титан", "Titanium", "Титан"], "cherry wood": ["Вишнёвое дерево", "Cherry wood", "Шие ағашы"],
  silicone: ["Силикон", "Silicone", "Силикон"], threaded: ["Рифлёное", "Ribbed", "Бедерлі"],
  "X-shaped dual paddle": ["X-образное", "X-shaped", "X тәрізді"],
  "titanium coating": ["Титановое покрытие", "Titanium coating", "Титан қаптама"],
  crystalline: ["Кристаллическая глазурь", "Crystalline glaze", "Кристалды глазурь"],
  mains: ["От сети", "Mains powered", "Электр желісінен"], large: ["Большой", "Large", "Үлкен"], medium: ["Средний", "Medium", "Орташа"],
  "circular holes": ["Круглые отверстия", "Round holes", "Дөңгелек тесіктер"], "narrow slots": ["Щели", "Slots", "Саңылаулар"],
  long: ["Прямоугольная", "Rectangular", "Тікбұрышты"], square: ["Квадратная", "Square", "Шаршы"], round: ["Круглая", "Round", "Дөңгелек"],
  "portable electric coffee grinder": ["Портативная электрическая кофемолка", "Portable electric coffee grinder", "Портативті электр кофеұнтақтағышы"],
};
export function attributeRows(item: Accessory, language: Language) {
  return Object.entries(item.attributes).flatMap(([key, value]) => {
    let name = attributeNames[key] ? label(language, ...attributeNames[key]) : key.replaceAll("_", " ");
    if (value && typeof value === 'object' && '_type' in value && value._type === 'localized-attribute' && 'value' in value && 'labels' in value) {
      const names = value.labels as Record<string, unknown> | null;
      if (names && typeof names === 'object') {
        const translated = [names[language], names.ru, names.en, names.kz].find(text => typeof text === 'string' && text.trim());
        if (typeof translated === 'string') name = translated;
      }
      value = value.value;
    }
    if (value === null || Array.isArray(value)) return [];
    if (typeof value === "object") {
      const localized = value as Record<string, unknown>;
      value = [localized[language], localized.ru, localized.en, localized.kz]
        .find(text => typeof text === "string" && text.trim());
    }
    if (value === undefined || value === "") return [];
    if (typeof value === "string" && attributeValues[value]) value = label(language, ...attributeValues[value]);
    return [{ label: name,
      value: typeof value === "boolean" ? (value ? label(language, "Да", "Yes", "Иә") : label(language, "Нет", "No", "Жоқ")) : String(value) }];
  });
}
