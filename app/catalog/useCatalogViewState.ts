"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type StoredCatalogView<T> = {
  state: T;
  scrollY: number;
};

type CatalogViewStateOptions<T> = {
  storageKey: string;
  initialState: T;
  parse: (value: unknown) => T | null;
};

export default function useCatalogViewState<T>({
  storageKey,
  initialState,
  parse,
}: CatalogViewStateOptions<T>): {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  saveScrollPosition: () => void;
  isRestored: boolean;
} {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const scrollYRef = useRef(0);
  const restoreFrameRef = useRef<number | null>(null);
  const restoredRef = useRef(false);
  const [isRestored, setIsRestored] = useState(false);

  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  useLayoutEffect(() => {
    // Restore before the first navigation paint so the default filters never flash.
    try {
      const rawValue = window.sessionStorage.getItem(storageKey);

      if (rawValue) {
        const storedValue = JSON.parse(rawValue) as Partial<StoredCatalogView<unknown>>;
        const parsedState = parse(storedValue.state);

        if (parsedState) {
          stateRef.current = parsedState;
          scrollYRef.current =
            typeof storedValue.scrollY === "number" && storedValue.scrollY >= 0
              ? storedValue.scrollY
              : 0;
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only state before paint on catalog return.
          setState(parsedState);
        }
      }
    } catch {
      // Ignore malformed or unavailable session storage and use defaults.
    }

    restoredRef.current = true;
    setIsRestored(true);
  }, [parse, storageKey]);

  useEffect(() => {
    if (!isRestored) return;

    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: scrollYRef.current, behavior: "auto" });
      });

      restoreFrameRef.current = secondFrame;
    });
    restoreFrameRef.current = firstFrame;

    return () => {
      if (restoreFrameRef.current !== null) {
        window.cancelAnimationFrame(restoreFrameRef.current);
      }
    };
  }, [isRestored]);

  useEffect(() => {
    if (!isRestored) return;

    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ state, scrollY: scrollYRef.current }),
      );
    } catch {
      // Catalog navigation should still work if browser storage is unavailable.
    }
  }, [isRestored, state, storageKey]);

  const saveScrollPosition = useCallback(() => {
    if (!restoredRef.current) return;

    const scrollY = Math.max(0, window.scrollY);
    scrollYRef.current = scrollY;

    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({ state: stateRef.current, scrollY }),
      );
    } catch {
      // Catalog navigation should still work if browser storage is unavailable.
    }
  }, [storageKey]);

  useEffect(() => {
    window.addEventListener("pagehide", saveScrollPosition);

    return () => {
      window.removeEventListener("pagehide", saveScrollPosition);
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  return { state, setState, saveScrollPosition, isRestored };
}
