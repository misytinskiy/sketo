import StaffPageClient from "./StaffPageClient";
import { getStaffProducts } from "./staff-data";

export const metadata = {
  title: "Кабинет — Sketo",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffPage() {
  const products = await getStaffProducts();

  return <StaffPageClient products={products} />;
}
