import { getInitialLanguage } from "../../components/getInitialLanguage";
import EquipmentCatalogContent from "./EquipmentCatalogContent";

export default async function EquipmentCatalogPage() {
  const initialLanguage = await getInitialLanguage();

  return <EquipmentCatalogContent initialLanguage={initialLanguage} />;
}
