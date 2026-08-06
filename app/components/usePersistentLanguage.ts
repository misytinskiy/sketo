"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "./LanguageSwitch";

export const LANGUAGE_STORAGE_KEY = "sketo-language";
const LANGUAGE_EVENT = "sketo-language-change";

function normalizeLanguage(language: string | null): Language {
  if (language === "en") {
    return "en";
  }

  return "ru";
}

function getServerSnapshot(): Language {
  return "ru";
}

function getClientSnapshot(): Language {
  if (typeof window === "undefined") {
    return "ru";
  }

  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
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
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

export function getContentLanguage(language: Language): "ru" | "en" {
  return language === "en" ? "en" : "ru";
}

export default function usePersistentLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  return [language, persistLanguage] as const;
}
