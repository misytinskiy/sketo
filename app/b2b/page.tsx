import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import B2BPageClient from "./B2BPageClient";

export const metadata: Metadata = {
  title: "Sketo B2B",
  description: "Sketo B2B solutions for coffee projects.",
};

export default async function B2BPage() {
  const initialLanguage = await getInitialLanguage();

  return <B2BPageClient initialLanguage={initialLanguage} />;
}
