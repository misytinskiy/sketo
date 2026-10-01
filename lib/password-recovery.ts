import { createHmac, timingSafeEqual } from "node:crypto";

export const RECOVERY_COOKIE = "sketo-password-recovery";
export const RECOVERY_TTL = 15 * 60;

function signature(userId: string, expiry: number) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Recovery signing secret is unavailable");
  return createHmac("sha256", secret).update(`sketo:password-recovery:${userId}:${expiry}`).digest("hex");
}

export function createRecoveryGrant(userId: string, now = Date.now()) {
  const expiry = Math.floor(now / 1000) + RECOVERY_TTL;
  return `${expiry}.${signature(userId, expiry)}`;
}

export function verifyRecoveryGrant(userId: string, token: string, now = Date.now()) {
  const [expiry, mac, extra] = token.split(".");
  const expires = Number(expiry);
  const current = Math.floor(now / 1000);
  if (extra || !/^\d+$/.test(expiry ?? "") || !/^[a-f0-9]{64}$/.test(mac ?? "") ||
      !Number.isSafeInteger(expires) || expires <= current || expires > current + RECOVERY_TTL) return false;
  return timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(signature(userId, expires), "hex"));
}

export function passwordValidation(password: string, confirmation: string) {
  if (password.length < 12 || password.length > 256) return "Пароль должен содержать от 12 до 256 символов.";
  if (password !== confirmation) return "Пароли не совпадают.";
  return null;
}
