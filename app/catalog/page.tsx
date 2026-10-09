import { Suspense } from "react";
import CatalogSkeleton from "../components/CatalogSkeleton";
import { getInitialLanguage } from "../components/getInitialLanguage";
import { getCoffeeCatalogItems } from "./catalog-db";
import CatalogContent from "./CatalogContent";

async function CatalogPageContent() {
  const initialLanguage = await getInitialLanguage();
  const items = await getCoffeeCatalogItems();

  return <CatalogContent initialLanguage={initialLanguage} items={items} />;
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton filterCounts={[4]} />}>
      <CatalogPageContent />
    </Suspense>
  );
}
