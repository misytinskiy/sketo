import type { Metadata } from "next";
import ContactsPageClient from "./ContactsPageClient";

export const metadata: Metadata = {
  title: "Sketo Contacts",
  description: "Контактная страница Sketo Coffee Company в Астане.",
};

export default function ContactsPage() {
  return <ContactsPageClient />;
}
