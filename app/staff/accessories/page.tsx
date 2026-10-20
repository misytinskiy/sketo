import { redirect } from "next/navigation";

// Accessories now live in the catalog tabs, not on a separate page.
export default function AccessoriesPage() {
  redirect("/staff");
}
