import { Suspense } from "react";
import CatalogSkeleton from "../../components/CatalogSkeleton";
import { getInitialLanguage } from "../../components/getInitialLanguage";
import { getEquipmentCatalogItems } from "./equipment-db";
import EquipmentCatalogContent from "./EquipmentCatalogContent";

async function EquipmentCatalogPageContent() {
  const initialLanguage = await getInitialLanguage();
  const items = await getEquipmentCatalogItems();

  return <EquipmentCatalogContent initialLanguage={initialLanguage} items={items} />;
}

export default function EquipmentCatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton filterCounts={[10, 6]} />}>
      <EquipmentCatalogPageContent />
    </Suspense>
  );
}
