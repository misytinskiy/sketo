export type ContentLanguage = "ru" | "en" | "kz";
export type Language = ContentLanguage;

export const LANGUAGE_STORAGE_KEY = "sketo-language";
export const LANGUAGE_COOKIE_KEY = "sketo-language";

export function normalizeLanguage(language: string | null): ContentLanguage {
  if (language === "en" || language === "kz") {
    return language;
  }

  return "ru";
}

export function getContentLanguage(language: Language): ContentLanguage {
  return normalizeLanguage(language);
}
