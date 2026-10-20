import type { Metadata } from "next";
import { getInitialLanguage } from "../components/getInitialLanguage";
import { getAccessories } from "./data";
import AccessoriesCatalog from "./AccessoriesCatalog";
import { isStage, label } from "./model";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getInitialLanguage();
  return { title: `${label(language, "Аксессуары для кофе", "Coffee accessories", "Кофе аксессуарлары")} — Sketo`,
    description: label(language, "Аксессуары для приготовления и подачи кофе. Каталог Sketo.", "Tools for preparing, brewing and serving coffee. Sketo catalogue.", "Кофені дайындауға және ұсынуға арналған аксессуарлар. Sketo каталогы."),
    alternates: { canonical: "/accessories" } };
}
export default async function Page({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const [{ stage }, initialLanguage, items] = await Promise.all([searchParams, getInitialLanguage(), getAccessories()]);
  return <AccessoriesCatalog key={stage || "all"} items={items} initialLanguage={initialLanguage} stage={isStage(stage) ? stage : undefined} />;
}
