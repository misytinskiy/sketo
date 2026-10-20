import "server-only";
import { sql } from "drizzle-orm";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { requireStaff } from "@/lib/staff-auth";
import type { StaffAccessory } from "./types";

// The new catalog is independent of products.type/equipment_type. Do not pass
// these IDs to existing equipment mutation or deletion actions.
export async function getStaffAccessories(): Promise<StaffAccessory[]> {
  await requireStaff();
  const rows = await withBoundedDatabase("accessory-read", db => db.execute<StaffAccessory & Record<string, unknown>>(sql`
    SELECT p.id, p.slug, COALESCE(NULLIF(t.name, ''), p.name) AS name,
      p.brand, p.category, p.editorial_state AS state,
      p.updated_at::text AS "updatedAt", COALESCE(to_jsonb(p)->'volume_options','[]'::jsonb) AS volumes,
      (SELECT i.url FROM public.accessory_images i WHERE i.product_id = p.id
        ORDER BY i.sort_order, i.id LIMIT 1) AS image,
      COALESCE(t.description, '') AS description,
      COALESCE((SELECT string_agg(concat_ws(' ', tr.name, tr.description), ' ')
        FROM public.accessory_translations tr WHERE tr.product_id=p.id), '') AS "searchText",
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', v.id, 'sku', v.sku, 'color', v.color_label, 'volumeMl', to_jsonb(v)->>'volume_ml',
          'price', v.retail_price::text, 'currency', v.currency,
          'active', v.is_active, 'availability', CASE WHEN to_jsonb(v)->>'availability'='in_stock' THEN 'in_stock' ELSE 'out_of_stock' END
        ) ORDER BY v.sort_order, v.sku)
        FROM public.accessory_variants v WHERE v.product_id = p.id
      ), '[]'::jsonb) AS variants
    FROM public.accessory_products p
    LEFT JOIN public.accessory_translations t ON t.product_id = p.id AND t.locale = 'ru'
    ORDER BY p.sort_order, p.name, p.id
  `));
  return Array.from(rows);
}

export function isMissingAccessorySchema(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "42P01") return true;
  return "cause" in error && isMissingAccessorySchema(error.cause);
}
