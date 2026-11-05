"use client";

import { useSyncExternalStore } from "react";
import { isUsableRate, type EquipmentRate } from "@/lib/equipment-price";

let rate: EquipmentRate | null = null;
let pending: Promise<void> | null = null;
let lastAttempt = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function emit() { listeners.forEach(listener => listener()); }
function refresh() {
  if (rate && !isUsableRate(rate)) { rate = null; emit(); }
  if (pending || Date.now() - lastAttempt < 30_000) return;
  lastAttempt = Date.now();
  pending = (async () => {
    try {
      const response = await fetch("/api/equipment-rate", { cache: "no-store", signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error("Rate unavailable");
      const body = await response.json();
      const next = isUsableRate(body.rate) ? body.rate : null;
      if (JSON.stringify(rate) !== JSON.stringify(next)) { rate = next; emit(); }
    } catch { /* Retain a still-valid quote during a temporary connection failure. */ }
    finally { pending = null; }
  })();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
  }
  refresh();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { clearInterval(timer); window.removeEventListener("focus", refresh); }
  };
}
const snapshot = () => rate;
const serverSnapshot = () => null;
const disabledSubscribe = () => () => {};
export default function useEquipmentRate(enabled = true) {
  return useSyncExternalStore(enabled ? subscribe : disabledSubscribe, enabled ? snapshot : serverSnapshot, serverSnapshot);
}
