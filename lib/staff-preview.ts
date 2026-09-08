import { createHmac, timingSafeEqual } from "node:crypto";
import type { ProductType } from "./db/schema";

const TTL_SECONDS = 15 * 60;
function sign(kind: ProductType, slug: string, expires: number) {
  const secret = process.env.STAFF_PREVIEW_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DATABASE_URL;
  if (!secret) throw new Error("Preview signing secret is unavailable");
  return createHmac("sha256", secret).update(`sketo:preview:${kind}:${slug}:${expires}`).digest("hex");
}
export function createPreviewHref(kind: ProductType, slug: string, now = Date.now()) {
  const expires = Math.floor(now / 1000) + TTL_SECONDS;
  return `/staff/preview/${kind}/${encodeURIComponent(slug)}?token=${expires}.${sign(kind, slug, expires)}`;
}
export function verifyPreviewToken(kind: ProductType, slug: string, token: string, now = Date.now()) {
  const [expiry, signature, extra] = token.split(".");
  const expires = Number(expiry);
  if (extra || !/^\d+$/.test(expiry ?? "") || !/^[a-f0-9]{64}$/.test(signature ?? "") ||
      !Number.isSafeInteger(expires) || expires <= Math.floor(now / 1000) || expires > Math.floor(now / 1000) + TTL_SECONDS) return false;
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(kind, slug, expires), "hex"));
}
