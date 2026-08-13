import { cookies } from "next/headers";
import { LANGUAGE_COOKIE_KEY, normalizeLanguage } from "./language";

export async function getInitialLanguage(): Promise<"ru" | "en"> {
  const cookieStore = await cookies();
  const language = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value ?? null;

  return normalizeLanguage(language);
}
