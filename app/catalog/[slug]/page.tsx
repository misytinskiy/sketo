import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import {
  getCoffeeCatalogItemBySlug,
  getCoffeeCatalogItemIndex,
  getCoffeeCatalogStaticParams,
} from "../catalog-db";
import LotPageClient from "./LotPageClient";
import { getSiteUrl, publicProductPath } from "@/lib/site-url";
import { buildProductMetadata, buildProductStructuredData, serializeStructuredData } from "@/lib/product-seo";

export async function generateStaticParams() {
  return getCoffeeCatalogStaticParams();
}

type LotPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: LotPageProps) {
  const { slug } = await params;
  const [item, language] = await Promise.all([getCoffeeCatalogItemBySlug(slug), getInitialLanguage()]);
  if (!item) notFound();
  return buildProductMetadata({ kind: "coffee", slug: item.slug, image: item.image, language, ...item.translations[language] });
}

export default async function LotPage({ params }: LotPageProps) {
  const initialLanguage = await getInitialLanguage();
  const { slug } = await params;
  const [item, itemIndex] = await Promise.all([
    getCoffeeCatalogItemBySlug(slug),
    getCoffeeCatalogItemIndex(slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(
      buildProductStructuredData({ kind: "coffee", slug: item.slug, image: item.image, language: initialLanguage, ...item.translations[initialLanguage] }),
    ) }} />
    <LotPageClient
      productUrl={new URL(publicProductPath("coffee", item.slug), getSiteUrl()).href}
      item={item}
      itemIndex={itemIndex}
      initialLanguage={initialLanguage}
    />
    </>
  );
}
