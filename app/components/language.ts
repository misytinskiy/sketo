export type ContentLanguage = "ru" | "en";
export type Language = "kz" | ContentLanguage;

export const LANGUAGE_STORAGE_KEY = "sketo-language";
export const LANGUAGE_COOKIE_KEY = "sketo-language";

export function normalizeLanguage(language: string | null): ContentLanguage {
  if (language === "en") {
    return "en";
  }

  return "ru";
}

export function getContentLanguage(language: Language): ContentLanguage {
  return language === "en" ? "en" : "ru";
}
