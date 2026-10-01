import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import AcademyPageClient from "./AcademyPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getInitialLanguage();
  return {
    title: "Sketo Academy",
    description: language === "kz" ? "Sketo академиясы: баристалар мен кофе әуесқойларына арналған жүйелі оқу." : "Academy as system page for Sketo.",
  };
}

export default async function AcademySystemPage() {
  const initialLanguage = await getInitialLanguage();

  return <AcademyPageClient initialLanguage={initialLanguage} />;
}
