import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../../components/getInitialLanguage";
import {
  getEquipmentItemBySlug,
  getEquipmentItemIndex,
  getEquipmentStaticParams,
} from "../equipment-db";
import EquipmentItemPageClient from "./EquipmentItemPageClient";

export async function generateStaticParams() {
  return getEquipmentStaticParams();
}

type EquipmentItemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    <EquipmentItemPageClient
      item={item}
      itemIndex={itemIndex}
      initialLanguage={initialLanguage}
    />
  );
}
