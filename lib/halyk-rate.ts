import { unstable_cache } from "next/cache";
import { isUsableRate, parseHalykRate, RATE_REFRESH_SECONDS } from "./equipment-price";

// Cache only validated successes: failed background revalidation retains the last good value.
// Keep this separate from product/page caches so changing a rate never requires rebuilding products.
const loadRate = unstable_cache(async () => {
  const response = await fetch("https://back.halykbank.kz/common/currency-history", {
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Halyk rate HTTP ${response.status}`);
  return parseHalykRate(await response.json());
}, ["halyk-eur-kzt-legal-sell-v1"], { revalidate: RATE_REFRESH_SECONDS });

export async function getEquipmentRate() {
  try {
    const rate = await loadRate();
    return isUsableRate(rate) ? rate : null;
  } catch {
    console.warn("Equipment exchange rate unavailable");
    return null;
  }
}
