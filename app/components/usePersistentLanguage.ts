"use client";

import { useSyncExternalStore } from "react";
import {
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  type Language,
  normalizeLanguage,
} from "./language";

const LANGUAGE_EVENT = "sketo-language-change";

function getServerSnapshot(initialLanguage: Language): Language {
  return normalizeLanguage(initialLanguage);
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
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${normalizedLanguage}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(LANGUAGE_EVENT));
}

export default function usePersistentLanguage(initialLanguage: Language = "ru") {
  const language = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    () => getServerSnapshot(initialLanguage),
  );

  return [language, persistLanguage] as const;
}
