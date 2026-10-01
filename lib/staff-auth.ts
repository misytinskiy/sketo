import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { staffMembers } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "staff";
export type StaffIdentity = {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  role: StaffRole;
};

// Request-local deduplication only. Never persist authorization in the data cache.
export const getCurrentStaff = cache(async (): Promise<StaffIdentity | null> => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const member = await db.query.staffMembers.findFirst({ where: eq(staffMembers.userId, user.id) });
  // "editor" is the existing database value for the personnel role. Legacy viewers
  // are deliberately not promoted to editors by this change.
  if (!member?.isActive || (member.role !== "admin" && member.role !== "editor")) return null;
  return { id: member.id, userId: user.id, email: member.email, displayName: member.displayName,
    role: member.role === "admin" ? "admin" : "staff" };
});

export async function requireStaff() {
  const member = await getCurrentStaff();
  if (!member) redirect("/login");
  return member;
}

export async function requireAdmin() {
  const member = await requireStaff();
  if (member.role !== "admin") throw new Error("Доступ разрешён только администратору.");
  return member;
}
