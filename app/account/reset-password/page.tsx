import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { RECOVERY_COOKIE, verifyRecoveryGrant } from "@/lib/password-recovery";
import AuthForm from "../AuthForm";
export const metadata = { title: "Новый пароль — Sketo", robots: { index: false, follow: false } };
export default async function ResetPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  const jar = await cookies();
  const valid = !(await searchParams).invalid && user && verifyRecoveryGrant(user.id, jar.get(RECOVERY_COOKIE)?.value ?? "");
  return <AuthForm mode="reset" invalid={!valid} />;
}
