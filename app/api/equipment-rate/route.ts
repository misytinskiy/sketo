import { getEquipmentRate } from "@/lib/halyk-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = await getEquipmentRate();
  return Response.json({ rate }, { headers: { "Cache-Control": "no-store" } });
}
