import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import { getSiteUrl } from "@/lib/site-url";
import { getAccessories, getAccessory } from "../data";
import { accessoryContent } from "../model";
import AccessoryPageClient from "../AccessoryPageClient";
import { recommendAccessories } from "../recommendations";
import { getCoffeeRecommendationItems } from "../../catalog/catalog-db";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [item, language] = await Promise.all([getAccessory(slug), getInitialLanguage()]);
  if (!item) notFound();
  const content = accessoryContent(item, language);
  return { title: `${content.name} — Sketo`, description: content.description,
    alternates: { canonical: `/accessories/${encodeURIComponent(item.slug)}` },
    openGraph: { title: content.name, description: content.description, images: item.images.slice(0, 1).map(i => i.url) } };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [item, initialLanguage] = await Promise.all([getAccessory(slug), getInitialLanguage()]);
  if (!item) notFound();
  const [catalog, coffee] = await Promise.all([getAccessories(), getCoffeeRecommendationItems()]);
  const recommendations = recommendAccessories(item, catalog, coffee);
  return <AccessoryPageClient key={item.id} item={item} recommendations={recommendations} initialLanguage={initialLanguage}
    productUrl={new URL(`/accessories/${encodeURIComponent(item.slug)}`, getSiteUrl()).href} />;
}
