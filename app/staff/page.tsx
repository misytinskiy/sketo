import { getInitialLanguage } from "../components/getInitialLanguage";
import StaffPageClient from "./StaffPageClient";

export const metadata = {
  title: "Кабинет — Sketo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffPage() {
  const initialLanguage = await getInitialLanguage();

  return <StaffPageClient initialLanguage={initialLanguage} />;
}
