import { requireStaff } from "@/lib/staff-auth";
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
  await requireStaff();
  const products = await getStaffProducts();
  // Accessories load independently after the main workspace is usable.
  return <StaffPageClient products={products} />;
}
