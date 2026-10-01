import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../../components/getInitialLanguage";
import {
  getEquipmentItemBySlug,
  getEquipmentItemIndex,
  getEquipmentStaticParams,
} from "../equipment-db";
import EquipmentItemPageClient from "./EquipmentItemPageClient";
import { getSiteUrl, publicProductPath } from "@/lib/site-url";
import { buildProductMetadata, buildProductStructuredData, serializeStructuredData } from "@/lib/product-seo";

export async function generateStaticParams() {
  return getEquipmentStaticParams();
}

type EquipmentItemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: EquipmentItemPageProps) {
  const { slug } = await params;
  const [item, language] = await Promise.all([getEquipmentItemBySlug(slug), getInitialLanguage()]);
  if (!item) notFound();
  return buildProductMetadata({ kind: "equipment", slug: item.slug, name: item.name, image: item.image, language, ...item.translations[language] });
}

export default async function EquipmentItemPage({
  params,
}: EquipmentItemPageProps) {
  const initialLanguage = await getInitialLanguage();
  const { slug } = await params;
  const [item, itemIndex] = await Promise.all([
    getEquipmentItemBySlug(slug),
    getEquipmentItemIndex(slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(
      buildProductStructuredData({ kind: "equipment", slug: item.slug, name: item.name, image: item.image, language: initialLanguage, ...item.translations[initialLanguage] }),
    ) }} />
    <EquipmentItemPageClient
      productUrl={new URL(publicProductPath("equipment", item.slug), getSiteUrl()).href}
      item={item}
      itemIndex={itemIndex}
      initialLanguage={initialLanguage}
    />
    </>
  );
}
