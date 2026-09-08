import { getInitialLanguage } from "../../components/getInitialLanguage";
import { getEquipmentCatalogItems } from "./equipment-db";
import EquipmentCatalogContent from "./EquipmentCatalogContent";

export default async function EquipmentCatalogPage() {
  const initialLanguage = await getInitialLanguage();
  const items = await getEquipmentCatalogItems();

  return <EquipmentCatalogContent initialLanguage={initialLanguage} items={items} />;
}
