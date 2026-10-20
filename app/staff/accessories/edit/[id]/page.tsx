import { notFound } from "next/navigation";
import { getAccessoryEditor } from "../../editor-data";
import AccessoryEditorForm from "../../AccessoryEditorForm";

export const metadata = { title: "Редактор аксессуара — Sketo", robots: { index: false, follow: false } };

export default async function AccessoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAccessoryEditor(id);
  if (!product) notFound();
  return <AccessoryEditorForm key={product.id} initial={product} />;
}
