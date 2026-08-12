import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import ContactsPageClient from "./ContactsPageClient";

export const metadata: Metadata = {
  title: "Sketo Contacts",
  description: "Контактная страница Sketo Coffee Company в Астане.",
};

export default async function ContactsPage() {
  const initialLanguage = await getInitialLanguage();

  return <ContactsPageClient initialLanguage={initialLanguage} />;
}
