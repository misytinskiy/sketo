"use client";

import { useSyncExternalStore } from "react";

const eventName = "sketo-staff-preference";
const memory = new Map<string, string>();
function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", listener);
  };
}

export default function useStaffPreference<T extends string>(name: string, initial: T, choices: readonly T[]) {
  const key = `sketo:staff:${name}`;
  const value = useSyncExternalStore(subscribe, () => {
    let stored = memory.get(key);
    try { stored = window.localStorage.getItem(key) ?? stored; } catch { /* Storage may be disabled. */ }
    return choices.includes(stored as T) ? stored as T : initial;
  }, () => initial);
  function setValue(next: T) {
    memory.set(key, next);
    try { window.localStorage.setItem(key, next); } catch { /* Keep the preference for this visit. */ }
    window.dispatchEvent(new Event(eventName));
  }
  return [value, setValue] as const;
}
