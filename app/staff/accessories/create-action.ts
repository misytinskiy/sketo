"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { auditLogs } from "@/lib/db/schema";
import { requireStaff } from "@/lib/staff-auth";
import { uuidPattern } from "./editor-model";

export async function createAccessory(form: FormData) {
  const actor = await requireStaff();
  const id = form.get("requestId");
  if (typeof id !== "string" || !uuidPattern.test(id)) throw new Error("Некорректный идентификатор запроса.");
  await withBoundedDatabase("accessory-write", async tx => {
    const [member] = await tx.execute(sql`SELECT id FROM staff_members WHERE id=${actor.id}::uuid AND is_active AND role IN ('admin','editor') FOR SHARE`);
    if (!member) throw new Error("Доступ сотрудника отозван.");
    // A retried request returns the same draft, including after an ambiguous timeout.
    const [created] = await tx.execute(sql`INSERT INTO accessory_products(id,slug,name,brand,category,editorial_state)
      VALUES(${id}::uuid,${`accessory-${id}`},'Новый аксессуар','muvna','coffee-makers','draft')
      ON CONFLICT(id) DO NOTHING RETURNING id`);
    if (!created) return;
    for (const [locale, name] of [['ru', 'Новый аксессуар'], ['en', 'New accessory'], ['kz', 'Жаңа аксессуар']]) {
      await tx.execute(sql`INSERT INTO accessory_translations(product_id,locale,name,description)
        VALUES(${id}::uuid,${locale}::locale,${name},'')`);
    }
    await tx.execute(sql`INSERT INTO accessory_variants(product_id,sku,color_code,color_label,retail_price,currency,availability,is_active)
      VALUES(${id}::uuid,${`ACC-${id}`},'default','Стандартный',0,'KZT','in_stock',true)`);
    await tx.insert(auditLogs).values({ entityType: "product", entityId: id, actorId: actor.id,
      action: "create", summary: "Создан черновик аксессуара", diff: { catalog: "accessories", state: "draft" } });
  });
  revalidatePath("/staff");
  revalidatePath("/staff/accessories");
  return { href: `/staff/accessories/edit/${id}` };
}
