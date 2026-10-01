"use client";

import { createContext, useContext } from "react";
import type { Language } from "./language";

const InitialLanguageContext = createContext<Language>("ru");
export const useInitialLanguage = () => useContext(InitialLanguageContext);

export default function LanguageProvider({ language, children }: {
  language: Language;
  children: React.ReactNode;
}) {
  return <InitialLanguageContext.Provider value={language}>{children}</InitialLanguageContext.Provider>;
}
