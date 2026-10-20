import { getCurrentStaff } from "@/lib/staff-auth";
import { getStaffAccessories, isMissingAccessorySchema } from "../data";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  try {
    if (!await getCurrentStaff()) return Response.json({ error: "Войдите в кабинет заново." }, { status: 401, headers });
    return Response.json({ items: await getStaffAccessories() }, { headers });
  } catch (error) {
    return Response.json({ error: isMissingAccessorySchema(error)
      ? "Раздел аксессуаров ещё не настроен. Обратитесь к администратору."
      : "Не удалось загрузить аксессуары. Повторите попытку." }, { status: 503, headers });
  }
}
