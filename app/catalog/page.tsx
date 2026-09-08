import { getInitialLanguage } from "../components/getInitialLanguage";
import { getCoffeeCatalogItems } from "./catalog-db";
import CatalogContent from "./CatalogContent";

export default async function CatalogPage() {
  const initialLanguage = await getInitialLanguage();
  const items = await getCoffeeCatalogItems();

  return <CatalogContent initialLanguage={initialLanguage} items={items} />;
}
