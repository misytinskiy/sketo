"use server";

import { cookies } from "next/headers";
import { getCurrentStaff } from "@/lib/staff-auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { passwordValidation, RECOVERY_COOKIE, verifyRecoveryGrant } from "@/lib/password-recovery";

export type PasswordState = { status: "idle" | "success" | "error"; message: string };

export async function requestPasswordReset(_previous: PasswordState, form: FormData): Promise<PasswordState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Укажите корректный email." };
  }
  try {
    const client = await createClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/recovery", getSiteUrl()).href,
    });
    if (error) return { status: "error", message: "Не удалось отправить запрос. Подождите немного и повторите попытку." };
    return { status: "success", message: "Если аккаунт существует, на указанный email придёт ссылка. Проверьте папку «Спам» и откройте письмо в том же браузере, где отправили запрос." };
  } catch {
    return { status: "error", message: "Сервис временно недоступен. Повторите попытку позже." };
  }
}

export async function resetPassword(_previous: PasswordState, form: FormData): Promise<PasswordState> {
  try {
    const member = await getCurrentStaff();
    const jar = await cookies();
    if (!member || !verifyRecoveryGrant(member.userId, jar.get(RECOVERY_COOKIE)?.value ?? "")) {
      return { status: "error", message: "Ссылка недействительна или истекла. Запросите новую ссылку восстановления." };
    }
    const password = String(form.get("password") ?? "");
    const invalid = passwordValidation(password, String(form.get("confirmation") ?? ""));
    if (invalid) return { status: "error", message: invalid };
    const client = await createClient();
    const { error } = await client.auth.updateUser({ password });
    if (error) return { status: "error", message: "Не удалось изменить пароль. Используйте новый надёжный пароль или запросите новую ссылку." };
    jar.delete(RECOVERY_COOKIE);
    return { status: "success", message: "Пароль изменён. Теперь можно перейти в кабинет." };
  } catch {
    return { status: "error", message: "Сервис временно недоступен. Повторите попытку позже." };
  }
}
