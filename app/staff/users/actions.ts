"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
import { appendAuditLog, type EditorTransaction } from "@/lib/db/editor";
import { requireAdmin } from "@/lib/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserActionState = { status: "idle" | "success" | "error"; message: string };

// Serialize membership changes and recheck the caller under the same lock. Two
// administrators cannot concurrently revoke each other and leave no administrator.
async function lockMembers(tx: EditorTransaction, actorId: string) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('staff:members'))`);
  const actor = await tx.query.staffMembers.findFirst({ where: eq(staffMembers.id, actorId) });
  if (!actor?.isActive || actor.role !== "admin") throw new Error("Admin access revoked");
}

export async function createStaffUser(_previous: UserActionState, form: FormData): Promise<UserActionState> {
  const actor = await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const displayName = String(form.get("displayName") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const role = form.get("role");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !displayName || displayName.length > 100 ||
      password.length < 12 || password.length > 256 || (role !== "admin" && role !== "staff")) {
    return { status: "error", message: "Укажите имя, корректный email, роль и пароль от 12 до 256 символов." };
  }
  const admin = createAdminClient();
  let createdUserId: string | undefined;
  try {
    // No invitation email is sent. The administrator passes credentials to the user.
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) return { status: "error", message: "Не удалось создать аккаунт. Возможно, email уже занят или пароль не соответствует требованиям." };
    createdUserId = data.user.id;
    await db.transaction(async (tx) => {
      await lockMembers(tx, actor.id);
      const [member] = await tx.insert(staffMembers).values({
        userId: data.user.id, email, displayName, role: role === "admin" ? "admin" : "editor",
      }).returning();
      await appendAuditLog({ entityType: "staff", entityId: member.id, actorId: actor.id,
        action: "create", summary: `Добавлен пользователь ${email}`, diff: { role } }, tx);
    });
  } catch {
    // An Auth account without an active membership has no cabinet access.
    if (createdUserId) {
      try {
        const { error } = await admin.auth.admin.deleteUser(createdUserId);
        if (error) console.error("Staff account compensation failed", createdUserId);
      } catch { console.error("Staff account compensation failed", createdUserId); }
    }
    return { status: "error", message: "Не удалось предоставить доступ. Аккаунт не добавлен в кабинет. Повторите попытку; если email занят, проверьте его в Supabase Auth." };
  }
  revalidatePath("/staff/users");
  return { status: "success", message: "Пользователь добавлен. Передайте ему email и пароль безопасным способом." };
}

export async function deleteStaffUser(_previous: UserActionState, form: FormData): Promise<UserActionState> {
  const actor = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const confirmation = String(form.get("confirmation") ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { status: "error", message: "Некорректный пользователь." };
  }
  if (id === actor.id) return { status: "error", message: "Нельзя удалить собственный аккаунт." };
  let target: typeof staffMembers.$inferSelect;
  try {
    target = await db.transaction(async (tx) => {
      await lockMembers(tx, actor.id);
      const member = await tx.query.staffMembers.findFirst({ where: eq(staffMembers.id, id) });
      if (!member || confirmation !== member.email.toLowerCase()) throw new Error("Invalid confirmation");
      if (member.role === "admin" && member.isActive) {
        const admins = await tx.select({ id: staffMembers.id }).from(staffMembers)
          .where(and(eq(staffMembers.role, "admin"), eq(staffMembers.isActive, true)));
        if (admins.length <= 1) throw new Error("Last administrator");
      }
      // Commit revocation BEFORE the external API call. Failure leaves a disabled
      // entry visible to administrators so deletion can be retried safely.
      await tx.update(staffMembers).set({ isActive: false, updatedAt: new Date() }).where(eq(staffMembers.id, id));
      await appendAuditLog({ entityType: "staff", entityId: id, actorId: actor.id, action: "update",
        summary: `Доступ ${member.email} отозван`, diff: { isActive: false } }, tx);
      return member;
    });
  } catch {
    return { status: "error", message: "Не удалось удалить пользователя. Проверьте email подтверждения и обновите страницу. Последнего администратора удалить нельзя." };
  }
  try {
    const { error } = await createAdminClient().auth.admin.deleteUser(target.userId);
    if (error && error.code !== "user_not_found") throw error;
    await db.transaction(async (tx) => {
      await tx.delete(staffMembers).where(and(eq(staffMembers.id, id), eq(staffMembers.isActive, false)));
      await appendAuditLog({ entityType: "staff", entityId: id, actorId: actor.id, action: "delete",
        summary: `Удалён пользователь ${target.email}` }, tx);
    });
  } catch {
    revalidatePath("/staff/users");
    return { status: "error", message: "Доступ уже отозван, но удаление аккаунта не завершено. Повторите удаление." };
  }
  revalidatePath("/staff/users");
  return { status: "success", message: "Пользователь удалён. Доступ к кабинету закрыт." };
}
