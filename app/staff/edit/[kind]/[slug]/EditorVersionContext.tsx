"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const Context = createContext<{ version: string; setVersion: (version: string) => void } | null>(null);

export function EditorVersionProvider({ initialVersion, children }: { initialVersion: string; children: ReactNode }) {
  // Keep the version of the form the user opened, not a background router refresh.
  const [version, setVersion] = useState(initialVersion);
  return <Context.Provider value={{ version, setVersion }}>{children}</Context.Provider>;
}

export function useEditorVersion() {
  const value = useContext(Context);
  if (!value) throw new Error("Editor version provider is missing");
  return value;
}
