import type { Metadata } from "next";
import AccountClient from "./AccountClient";
import { getDemoProducts } from "./demo-products";

export const metadata: Metadata = {
  title: "Личный кабинет | Sketo",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  return <AccountClient products={await getDemoProducts()} />;
}
