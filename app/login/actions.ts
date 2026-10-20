"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { staffMembers } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function login(_previous: { message: string }, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const denied = { message: "Не удалось войти. Проверьте email, пароль и доступ к кабинету." };
  if (!email || email.length > 254 || !password || password.length > 256) return denied;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return denied;
    const userId = data.user.id;
    const member = await withBoundedDatabase("staff-auth", db => db.query.staffMembers.findFirst({ where: eq(staffMembers.userId, userId) }));
    if (!member?.isActive || (member.role !== "admin" && member.role !== "editor")) {
      await client.auth.signOut({ scope: "local" });
      return denied;
    }
  } catch {
    return { message: "Сервис входа временно недоступен. Повторите попытку позже." };
  }
  redirect("/staff");
}

export async function logout() {
  const client = await createClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw new Error("Не удалось выйти. Повторите попытку.");
  redirect("/login");
}
