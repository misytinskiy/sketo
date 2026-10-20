import { getInitialLanguage } from "./components/getInitialLanguage";
import HomePageClient from "./HomePageClient";
import { Suspense } from "react";
import HomeProductShelves from "./components/HomeProductShelves";
import HomeProductShelvesData from "./components/HomeProductShelvesData";

export default async function Home() {
  const initialLanguage = await getInitialLanguage();

  return <HomePageClient initialLanguage={initialLanguage} productShelves={
    <Suspense fallback={<HomeProductShelves initialLanguage={initialLanguage} loading />}>
      <HomeProductShelvesData initialLanguage={initialLanguage} />
    </Suspense>
  } />;
}
