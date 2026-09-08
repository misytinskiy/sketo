import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import {
  getCoffeeCatalogItemBySlug,
  getCoffeeCatalogItemIndex,
  getCoffeeCatalogStaticParams,
} from "../catalog-db";
import LotPageClient from "./LotPageClient";

export async function generateStaticParams() {
  return getCoffeeCatalogStaticParams();
}

type LotPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    <LotPageClient
      item={item}
      itemIndex={itemIndex}
      initialLanguage={initialLanguage}
    />
  );
}
