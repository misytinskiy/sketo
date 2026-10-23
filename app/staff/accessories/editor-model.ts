import type { AccessoryVariant, StaffAccessory } from "./types";
import type { AccessoryVolume } from "../../accessories/model";

export type EditorVariant = AccessoryVariant & { code: string; hex: string | null };
export type EditorImage = { id: string; url: string; variantId: string | null; volumeId?: string | null; alt: string; approved: boolean };
export type AccessoryEditor = Omit<StaffAccessory, "variants"> & {
  slug: string; version: string; sortOrder: number; attributes: Record<string, unknown>;
  translations: { locale: "ru" | "en" | "kz"; name: string; description: string }[];
  variants: EditorVariant[]; images: EditorImage[];
  volumes?: AccessoryVolume[];
  deletedVariantIds?: string[];
};
export type SaveResult = { status: "idle" | "success" | "error"; message: string; product?: AccessoryEditor };
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Match public catalog visibility, including colour availability and removed volumes.
export function isVisibleAccessoryImage(
  image: { approved: boolean; variantId: string | null; volumeId?: string | null },
  variants: { id: string; active: boolean; availability?: string }[],
  volumes: { id: string }[] = [],
) {
  return image.approved && (!image.volumeId || volumes.some(v => v.id === image.volumeId)) &&
    (!image.variantId || variants.some(v => v.id === image.variantId && v.active && v.availability === 'in_stock'));
}

function text(value: unknown, label: string, max: number, required = true) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error(`Проверьте поле «${label}».`);
  return value.trim();
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Некорректные данные карточки.");
  return value as Record<string, unknown>;
}
function id(value: unknown) {
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new Error("Некорректный идентификатор.");
  return value;
}
function boolean(value: unknown) {
  if (typeof value !== "boolean") throw new Error("Некорректный переключатель.");
  return value;
}

// Normalize every value on the server. Never trust IDs, prices or variant ownership from the form.
export function parseAccessoryInput(raw: string) {
  if (raw.length > 200_000) throw new Error("Слишком большой объём данных.");
  const p = record(JSON.parse(raw));
  const slug = text(p.slug, "Адрес", 160);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error("В адресе допустимы латинские буквы, цифры и дефисы.");
  const state = p.state;
  if (state !== "draft" && state !== "review" && state !== "published" && state !== "archived") throw new Error("Некорректный статус.");
  if (!Number.isInteger(p.sortOrder) || Math.abs(Number(p.sortOrder)) > 1_000_000) throw new Error("Некорректный порядок сортировки.");
  const attributes = record(p.attributes);
  if (p.volumes != null && (!Array.isArray(p.volumes) || p.volumes.length > 100)) throw new Error('Максимум 100 объёмов.');
  const volumes = ((p.volumes ?? []) as unknown[]).map(entry => {
    const v = record(entry);
    const value = text(v.value, 'Объём', 10).replace(',', '.');
    if (!/^\d{1,7}(\.\d{1,2})?$/.test(value) || Number(value) <= 0) throw new Error('Объём должен быть положительным числом.');
    const price = text(v.price, 'Цена объёма', 20).replace(',', '.');
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(price) || Number(price) > 9999999999.99) throw new Error('Проверьте цену объёма.');
    const currency = text(v.currency, 'Валюта', 3);
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Проверьте валюту объёма.');
    const skuByVariant = v.skuByVariant == null ? undefined : Object.fromEntries(
      Object.entries(record(v.skuByVariant)).map(([variantId, sku]) => [id(variantId), text(sku, 'Артикул объёма', 100)]),
    );
    if (skuByVariant && Object.keys(skuByVariant).length > 100) throw new Error('Слишком много артикулов объёма.');
    return { id: id(v.id), value: String(Number(value)), unit: text(v.unit ?? 'мл', 'Единица измерения', 20), price, currency, ...(skuByVariant ? { skuByVariant } : {}) };
  });
  if (new Set(volumes.map(v => v.id)).size !== volumes.length || new Set(volumes.map(v => `${v.value}:${v.unit.toLowerCase()}`)).size !== volumes.length) throw new Error('Объёмы не должны повторяться.');
  if (!Array.isArray(p.translations) || p.translations.length !== 3) throw new Error("Нужны поля для RU, EN и KZ.");
  const translations = p.translations.map((entry) => {
    const t = record(entry);
    if (t.locale !== "ru" && t.locale !== "en" && t.locale !== "kz") throw new Error("Некорректный язык.");
    return { locale: t.locale, name: text(t.name, "Название", 300, t.locale === "ru"), description: text(t.description, "Описание", 15000, false) };
  });
  if (new Set(translations.map((t) => t.locale)).size !== 3) throw new Error("Языки не должны повторяться.");
  if (!Array.isArray(p.variants) || p.variants.length < 1 || p.variants.length > 100) throw new Error("Добавьте от 1 до 100 вариантов.");
  const variants = p.variants.map((entry) => {
    const v = record(entry);
    const price = text(v.price, "Цена", 20).replace(",", ".");
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(price) || Number(price) > 9999999999.99) throw new Error("Цена должна быть неотрицательной, максимум два знака после запятой.");
    const hex = v.hex === "" || v.hex === null ? null : text(v.hex, "Цвет HEX", 7);
    if (hex && !/^#[\da-f]{6}$/i.test(hex)) throw new Error("Цвет указывается как #AABBCC.");
    const currency = text(v.currency, "Валюта", 3);
    const availability = v.availability ?? 'in_stock';
    if (!['in_stock', 'out_of_stock'].includes(String(availability))) throw new Error('Некорректный статус наличия.');
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Валюта: три заглавные буквы, например KZT.");
    const variantId = id(v.id);
    const volumeMl = v.volumeMl == null || v.volumeMl === '' ? null : text(v.volumeMl, 'Объём, мл', 10).replace(',', '.');
    if (volumeMl !== null && (!/^\d{1,7}(\.\d{1,2})?$/.test(volumeMl) || Number(volumeMl) <= 0)) throw new Error('Объём должен быть положительным числом в мл.');
    return { id: variantId, sku: text(v.sku || `ACC-${variantId}`, "Артикул", 100), code: text(v.code || `color-${variantId}`, "Код цвета", 100), color: text(v.color, "Цвет", 100),
      volumeMl: volumeMl === null ? null : String(Number(volumeMl)), hex, price, currency, availability: availability as NonNullable<EditorVariant['availability']>, active: boolean(v.active) };
  });
  for (const key of ["id", "sku", "code"] as const) if (new Set(variants.map((v) => v[key])).size !== variants.length) throw new Error("Артикулы, идентификаторы и коды цветов не должны повторяться.");
  for (const volume of volumes) {
    if (volume.skuByVariant) volume.skuByVariant = Object.fromEntries(
      Object.entries(volume.skuByVariant).filter(([variantId]) => variants.some(v => v.id === variantId)),
    );
  }
  if (p.deletedVariantIds != null && (!Array.isArray(p.deletedVariantIds) || p.deletedVariantIds.length > 100)) throw new Error('Некорректный список удаляемых цветов.');
  const deletedVariantIds = ((p.deletedVariantIds ?? []) as unknown[]).map(id);
  if (new Set(deletedVariantIds).size !== deletedVariantIds.length || deletedVariantIds.some(id => variants.some(v => v.id === id))) throw new Error('Удаляемый цвет не должен оставаться в карточке.');
  if (!Array.isArray(p.images) || p.images.length > 100) throw new Error("Слишком много изображений.");
  const images = p.images.map((entry) => {
    const i = record(entry);
    const variantId = i.variantId === null ? null : id(i.variantId);
    const volumeId = i.volumeId == null ? null : id(i.volumeId);
    if (volumeId && !volumes.some(v => v.id === volumeId)) throw new Error('Фото привязано к неизвестному объёму.');
    if (variantId && !variants.some((v) => v.id === variantId)) throw new Error("Фото привязано к неизвестному цвету.");
    return { id: id(i.id), variantId, volumeId, alt: text(i.alt, "Описание фото", 500, false), approved: boolean(i.approved) };
  });
  if (new Set(images.map((i) => i.id)).size !== images.length) throw new Error("Фотографии не должны повторяться.");
  return { id: id(p.id), version: text(p.version, "Версия", 100), slug, state, brand: text(p.brand, "Бренд", 100),
    category: text(p.category, "Категория", 100), sortOrder: p.sortOrder as number, attributes, volumes, deletedVariantIds, translations, variants, images };
}
