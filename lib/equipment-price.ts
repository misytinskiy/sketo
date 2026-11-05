export const RATE_REFRESH_SECONDS = 30 * 60;
export const RATE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SOURCE_MAX_AGE_MS = 4 * RATE_MAX_AGE_MS;

export type EquipmentRate = { sell: number; date: string; fetchedAt: number };

export function isUsableRate(value: unknown, now = Date.now()): value is EquipmentRate {
  if (!value || typeof value !== "object") return false;
  const rate = value as EquipmentRate;
  if (typeof rate.sell !== "number" || !Number.isFinite(rate.sell) || rate.sell <= 0 || rate.sell > 100000) return false;
  if (typeof rate.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(rate.date)) return false;
  const day = Date.parse(`${rate.date}T00:00:00+05:00`);
  return Number.isFinite(day) && day <= now && now - day < SOURCE_MAX_AGE_MS
    && Number.isFinite(rate.fetchedAt) && rate.fetchedAt <= now && now - rate.fetchedAt < RATE_MAX_AGE_MS;
}

export function parseHalykRate(payload: unknown, now = Date.now()): EquipmentRate {
  const body = payload as { result?: unknown; data?: { currencyHistory?: unknown } } | null;
  const history = body?.data?.currencyHistory;
  if (body?.result !== true || !history || typeof history !== "object") throw new Error("Invalid Halyk response");
  const candidates = Object.values(history).map(row => ({
    sell: row?.legalPersons?.["EUR/KZT"]?.sell,
    date: row?.date,
    fetchedAt: now,
  })).filter(rate => isUsableRate(rate, now)).sort((a, b) => b.date.localeCompare(a.date));
  if (!candidates.length) throw new Error("Halyk EUR business sell rate unavailable");
  return candidates[0];
}

// EUR stays the source of truth. Round up to the next 1,000 KZT and return minor units.
export function equipmentKztPrice(eur: string | null | undefined, rate: EquipmentRate | null): number | null {
  if (!eur || !/^\d{1,10}(?:\.\d{1,2})?$/.test(eur) || !rate) return null;
  const cents = BigInt(eur.split(".")[0]) * BigInt(100) + BigInt((eur.split(".")[1] ?? "").padEnd(2, "0"));
  if (cents <= BigInt(0) || !Number.isFinite(rate.sell) || rate.sell <= 0 || rate.sell > 100000) return null;
  const rateMillionths = BigInt(Math.round(rate.sell * 1e6));
  const thousandTenge = BigInt(100000000000);
  const minor = Number((cents * rateMillionths + thousandTenge - BigInt(1)) / thousandTenge) * 100000;
  return Number.isSafeInteger(minor) && minor > 0 && minor <= 1e12 ? minor : null;
}

export function formatEquipmentPrice(minor: number | null, from: boolean, language: "ru" | "en" | "kz") {
  if (minor === null) return { ru: "Цена по запросу", en: "Price on request", kz: "Баға сұрау бойынша" }[language];
  const amount = new Intl.NumberFormat(language === "ru" ? "ru-RU" : language === "kz" ? "kk-KZ" : "en-GB", { maximumFractionDigits: 2 }).format(minor / 100) + " ₸";
  return from ? language === "kz" ? `${amount} бастап` : `${language === "ru" ? "от" : "from"} ${amount}` : amount;
}
