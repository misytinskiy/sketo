"use client";
import { useSyncExternalStore } from "react";
import { addLine, cartKey, decodeCart, setQuantity, type CartLine, type CartProduct } from "./model";

const STORAGE_KEY = "sketo-cart-v1";
const EMPTY: CartLine[] = [];
let lines: CartLine[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();
function read() { try { return decodeCart(localStorage.getItem(STORAGE_KEY)); } catch { return []; } }
function snapshot() {
  if (!initialized && typeof window !== "undefined") { lines = read(); initialized = true; }
  return lines;
}
function emit() { listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) { lines = read(); initialized = true; emit(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}
function write(next: CartLine[]) {
  lines = next;
  initialized = true;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, lines })); } catch { /* Still usable in memory when storage is unavailable. */ }
  emit();
}
export const addToCart = (item: CartProduct) => write(addLine(snapshot(), item));
export const changeQuantity = (key: string, quantity: number) => write(setQuantity(snapshot(), key, quantity));
export const removeFromCart = (key: string) => write(snapshot().filter(item => cartKey(item) !== key));
export const useCartLines = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);
