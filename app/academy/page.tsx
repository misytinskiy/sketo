import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import AcademyPageClient from "./AcademyPageClient";

export const metadata: Metadata = {
  title: "Sketo Academy",
  description: "Academy as system page for Sketo.",
};

export default async function AcademySystemPage() {
  const initialLanguage = await getInitialLanguage();

  return <AcademyPageClient initialLanguage={initialLanguage} />;
}
