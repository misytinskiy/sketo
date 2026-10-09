import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import { documentCopy } from "./documents";
import DocumentPageClient from "./DocumentPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getInitialLanguage();
  return { title: `${documentCopy.label[language]} | Sketo`, robots: { index: false, follow: true } };
}

export default async function InformationPage() {
  return <DocumentPageClient initialLanguage={await getInitialLanguage()} />;
}
