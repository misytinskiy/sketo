import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyPreviewToken } from "@/lib/staff-preview";
import { getCoffeePreviewItem } from "@/app/catalog/catalog-db";
import { getEquipmentPreviewItem } from "@/app/catalog/equipment/equipment-db";
import LotPageClient from "@/app/catalog/[slug]/LotPageClient";
import EquipmentItemPageClient from "@/app/catalog/equipment/[slug]/EquipmentItemPageClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Предпросмотр товара — Sketo", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function PreviewPage({ params, searchParams }: {
  params: Promise<{ kind: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { kind, slug } = await params;
  const { token } = await searchParams;
  if ((kind !== "coffee" && kind !== "equipment") || typeof token !== "string" || !verifyPreviewToken(kind, slug, token)) notFound();
  const content = kind === "coffee" ? await getCoffeePreviewItem(slug) : await getEquipmentPreviewItem(slug);
  if (!content) notFound();
  return <>
    <aside style={{ padding: "16px", background: "#2d3134", color: "white" }}>
      Предпросмотр сохранённой версии · ссылка действует 15 минут. {" "}
      <Link href={`/staff/edit/${kind}/${slug}`}>Вернуться к редактору</Link>
    </aside>
    {"price" in content
      ? <LotPageClient item={content} itemIndex={0} initialLanguage="ru" />
      : <EquipmentItemPageClient item={content} itemIndex={0} initialLanguage="ru" />}
  </>;
}
