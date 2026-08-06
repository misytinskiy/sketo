import type { Metadata } from "next";
import AcademyPageClient from "./AcademyPageClient";

export const metadata: Metadata = {
  title: "Sketo Academy",
  description: "Academy as system page for Sketo.",
};

export default function AcademySystemPage() {
  return <AcademyPageClient />;
}
