import { notFound } from "next/navigation";
import { getInitialLanguage } from "../../../components/getInitialLanguage";
import {
  equipmentItems,
  getEquipmentItemBySlug,
} from "../equipment-data";
import EquipmentItemPageClient from "./EquipmentItemPageClient";

export function generateStaticParams() {
  return equipmentItems.map((item) => ({
    slug: item.slug,
  }));
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
  const item = getEquipmentItemBySlug(slug);
  const itemIndex = equipmentItems.findIndex(
    (equipmentItem) => equipmentItem.slug === slug,
  );

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
