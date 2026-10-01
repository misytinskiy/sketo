import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import B2BPageClient from "./B2BPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getInitialLanguage();
  return {
    title: "Sketo B2B",
    description: language === "kz" ? "Кофе жобаларына арналған Sketo B2B шешімдері." : "Sketo B2B solutions for coffee projects.",
  };
}

export default async function B2BPage() {
  const initialLanguage = await getInitialLanguage();

  return <B2BPageClient initialLanguage={initialLanguage} />;
}
