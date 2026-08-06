import type { Metadata } from "next";
import B2BPageClient from "./B2BPageClient";

export const metadata: Metadata = {
  title: "Sketo B2B",
  description: "Sketo B2B solutions for coffee projects.",
};

export default function B2BPage() {
  return <B2BPageClient />;
}
