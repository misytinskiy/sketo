"use server";

import { requireStaff } from "@/lib/staff-auth";
import { createClient } from "@/lib/supabase/server";
import { passwordValidation } from "@/lib/password-recovery";
import type { PasswordState } from "@/app/login/password-actions";

export async function changePassword(_previous: PasswordState, form: FormData): Promise<PasswordState> {
  const member = await requireStaff();
  const current = String(form.get("currentPassword") ?? "");
  const password = String(form.get("password") ?? "");
  const invalid = passwordValidation(password, String(form.get("confirmation") ?? ""));
  if (invalid) return { status: "error", message: invalid };
  if (!current || current.length > 256) return { status: "error", message: "Введите текущий пароль." };
  if (current === password) return { status: "error", message: "Новый пароль должен отличаться от текущего." };
  try {
    const client = await createClient();
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user?.email || user.id !== member.userId) return { status: "error", message: "Войдите в кабинет заново." };
    const { data, error } = await client.auth.signInWithPassword({ email: user.email, password: current });
    if (error || data.user?.id !== member.userId) return { status: "error", message: "Текущий пароль неверен или проверка временно недоступна." };
    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) return { status: "error", message: "Не удалось изменить пароль. Попробуйте другой надёжный пароль." };
    return { status: "success", message: "Пароль изменён." };
  } catch {
    return { status: "error", message: "Сервис временно недоступен. Повторите попытку позже." };
  }
}
