"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  type Language,
  normalizeLanguage,
} from "./language";

import { useInitialLanguage } from "./LanguageProvider";

const LANGUAGE_EVENT = "sketo-language-change";

function getServerSnapshot(initialLanguage: Language): Language {
  return normalizeLanguage(initialLanguage);
}

function getClientSnapshot(initialLanguage: Language): Language {
  if (typeof window === "undefined") {
    return "ru";
  }

  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? initialLanguage);
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== LANGUAGE_STORAGE_KEY
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LANGUAGE_EVENT, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LANGUAGE_EVENT, handleStorage);
  };
}

export function persistLanguage(language: Language) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedLanguage = normalizeLanguage(language);

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${normalizedLanguage}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = normalizedLanguage === "kz" ? "kk" : normalizedLanguage;
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

export default function usePersistentLanguage(initialLanguage?: Language) {
  const contextLanguage = useInitialLanguage();
  const serverLanguage = initialLanguage ?? contextLanguage;
  const language = useSyncExternalStore(
    subscribe,
    () => getClientSnapshot(serverLanguage),
    () => getServerSnapshot(serverLanguage),
  );

  useEffect(() => {
    document.documentElement.lang = language === "kz" ? "kk" : language;
  }, [language]);

  return [language, persistLanguage] as const;
}
