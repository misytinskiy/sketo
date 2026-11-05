export type CustomerProfile = {
  full_name: string;
  phone: string;
  account_type: "personal" | "business";
  company_name: string;
  bin: string;
};

export type AccountState = { status: "idle" | "success" | "error"; message: string };
export const initialAccountState: AccountState = { status: "idle", message: "" };
export const emptyProfile: CustomerProfile = { full_name: "", phone: "", account_type: "personal", company_name: "", bin: "" };
export const validEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Only editable contact fields. Never accept identity, prices or loyalty privileges. */
export function parseCustomerProfile(form: FormData): CustomerProfile | null {
  const full_name = String(form.get("full_name") ?? "").trim();
  const rawPhone = String(form.get("phone") ?? "").trim();
  const phone = rawPhone.replace(/[\s()-]/g, "");
  const account_type = String(form.get("account_type") ?? "");
  const company_name = String(form.get("company_name") ?? "").trim();
  const bin = String(form.get("bin") ?? "").trim();
  if (!full_name || full_name.length > 100 || /[\u0000-\u001f]/.test(full_name) || rawPhone.length > 40 || !/^\+[1-9]\d{9,14}$/.test(phone)) return null;
  if (account_type !== "personal" && account_type !== "business") return null;
  if (account_type === "business" && (!company_name || company_name.length > 200 || !/^\d{12}$/.test(bin))) return null;
  return { full_name, phone, account_type, company_name: account_type === "business" ? company_name : "", bin: account_type === "business" ? bin : "" };
}
