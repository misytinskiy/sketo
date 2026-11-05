import type { Metadata } from "next";
import AccountClient from "./AccountClient";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emptyProfile, type CustomerProfile } from "@/lib/customer-profile";

export const metadata: Metadata = {
  title: "Личный кабинет | Sketo",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/account/login");
  const { data: profile, error: profileError } = await client.from("customer_profiles")
    .select("full_name,phone,account_type,company_name,bin").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error("Customer profile unavailable");
  return <AccountClient profile={(profile as CustomerProfile | null) ?? emptyProfile} email={user.email ?? ""} />;
}
