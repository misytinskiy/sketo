"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { passwordValidation, RECOVERY_COOKIE, verifyRecoveryGrant } from "@/lib/password-recovery";
import { parseCustomerProfile, validEmail, type AccountState } from "@/lib/customer-profile";

const failure = (message = "service"): AccountState => ({ status: "error", message });
const success = (message: string): AccountState => ({ status: "success", message });

export async function customerLogin(_state: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!validEmail(email) || !password || password.length > 256) return failure("invalid");
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return failure("denied");
  } catch { return failure(); }
  redirect("/account");
}

export async function customerRegister(_state: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!validEmail(email) || passwordValidation(password, String(form.get("confirmation") ?? "")) || form.get("consent") !== "on") return failure("invalid");
  let signedIn = false;
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: new URL("/auth/customer", getSiteUrl()).href } });
    if (error) return error.code === "user_already_exists" ? success("registered") : failure();
    signedIn = Boolean(data.session);
  } catch { return failure(); }
  if (signedIn) redirect("/account");
  return success("registered");
}

export async function customerLogout(_state: AccountState): Promise<AccountState> {
  void _state;
  try {
    const client = await createClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return failure();
    (await cookies()).delete(RECOVERY_COOKIE);
  } catch { return failure(); }
  redirect("/account/login");
}

export async function saveCustomerProfile(_state: AccountState, form: FormData): Promise<AccountState> {
  const profile = parseCustomerProfile(form);
  if (!profile) return failure("invalid");
  try {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return failure("denied");
    const { error: saveError } = await client.from("customer_profiles").upsert({ ...profile, user_id: user.id });
    if (saveError) return failure();
  } catch { return failure(); }
  revalidatePath("/account");
  return success("saved");
}

export async function customerForgotPassword(_state: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!validEmail(email)) return failure("invalid");
  try {
    const client = await createClient();
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: new URL("/auth/customer?recovery=1", getSiteUrl()).href });
    if (error) return failure();
  } catch { return failure(); }
  return success("sent");
}

export async function customerResetPassword(_state: AccountState, form: FormData): Promise<AccountState> {
  const password = String(form.get("password") ?? "");
  if (passwordValidation(password, String(form.get("confirmation") ?? ""))) return failure("invalid");
  try {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    const jar = await cookies();
    if (error || !user || !verifyRecoveryGrant(user.id, jar.get(RECOVERY_COOKIE)?.value ?? "")) return failure("invalidLink");
    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) return failure();
    jar.delete(RECOVERY_COOKIE);
  } catch { return failure(); }
  return success("changed");
}

export async function changeCustomerEmail(_state: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("currentPassword") ?? "");
  if (!validEmail(email) || !password || password.length > 256) return failure("invalid");
  try {
    const client = await createClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user?.email) return failure("denied");
    const { data: verified, error: authError } = await client.auth.signInWithPassword({ email: user.email, password });
    if (authError || verified.user?.id !== user.id) return failure("denied");
    const { error: updateError } = await client.auth.updateUser({ email }, { emailRedirectTo: new URL("/auth/customer", getSiteUrl()).href });
    if (updateError) return failure();
  } catch { return failure(); }
  revalidatePath("/account");
  return success("emailSent");
}
