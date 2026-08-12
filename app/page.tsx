import { getInitialLanguage } from "./components/getInitialLanguage";
import HomePageClient from "./HomePageClient";

export default async function Home() {
  const initialLanguage = await getInitialLanguage();

  return <HomePageClient initialLanguage={initialLanguage} />;
}
