import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import { catalogItems, getCatalogItemBySlug } from "../catalog-data";
import LotPageClient from "./LotPageClient";

export function generateStaticParams() {
  return catalogItems.map((item) => ({
    slug: item.slug,
  }));
}

type LotPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LotPage({ params }: LotPageProps) {
  const initialLanguage = await getInitialLanguage();
  const { slug } = await params;
  const item = getCatalogItemBySlug(slug);
  const itemIndex = catalogItems.findIndex(
    (catalogItem) => catalogItem.slug === slug
  );

  if (!item) {
    notFound();
  }

  return (
    <LotPageClient
      item={item}
      itemIndex={itemIndex}
      initialLanguage={initialLanguage}
    />
  );
}
