import { getInitialLanguage } from "../components/getInitialLanguage";
import CatalogContent from "./CatalogContent";

export default async function CatalogPage() {
  const initialLanguage = await getInitialLanguage();

  return <CatalogContent initialLanguage={initialLanguage} />;
}
