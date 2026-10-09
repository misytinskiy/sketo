import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import { documents } from "../documents";
import DocumentPageClient from "../DocumentPageClient";

type Props = { params: Promise<{ document: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { document } = await params;
  const entry = documents.find((item) => item.slug === document);
  if (!entry) notFound();
  const language = await getInitialLanguage();
  return { title: `${entry.title[language]} | Sketo`, description: entry.intro[language], robots: { index: false, follow: true } };
}

export default async function DocumentPage({ params }: Props) {
  const { document } = await params;
  if (!documents.some((item) => item.slug === document)) notFound();
  return <DocumentPageClient slug={document} initialLanguage={await getInitialLanguage()} />;
}
