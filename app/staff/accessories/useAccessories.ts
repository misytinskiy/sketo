"use client";
import { useEffect, useState } from "react";
import type { StaffAccessory } from "./types";

export default function useAccessories(revision: unknown) {
  const [result, setResult] = useState<{ items: StaffAccessory[]; error?: string; loading: boolean }>({ items: [], loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timer = setTimeout(() => controller.abort(), 28_000);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Request lifecycle resets when the server workspace refreshes.
    setResult({ items: [], loading: true });
    void (async () => {
      try {
        const response = await fetch("/staff/accessories/list", { cache: "no-store", signal: controller.signal });
        if (response.redirected) throw new Error("Войдите в кабинет заново.");
        const body = await response.json();
        if (!response.ok || !Array.isArray(body.items)) throw new Error(body.error || "Не удалось загрузить аксессуары.");
        if (!disposed) setResult({ items: body.items, loading: false });
      } catch (error) {
        if (!disposed) setResult({ items: [], loading: false, error: controller.signal.aborted
          ? "Загрузка аксессуаров заняла слишком много времени. Повторите попытку."
          : error instanceof Error ? error.message : "Не удалось загрузить аксессуары." });
      } finally { clearTimeout(timer); }
    })();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [revision, attempt]);
  return { accessories: result.items, accessoriesError: result.error, accessoriesLoading: result.loading,
    retryAccessories: () => setAttempt(value => value + 1) };
}
