import "server-only";
import { sql } from "drizzle-orm";
import { withBoundedDatabase } from "@/lib/db/bounded";
import { requireStaff } from "@/lib/staff-auth";
import { uuidPattern, type AccessoryEditor } from "./editor-model";

export async function getAccessoryEditor(id: string): Promise<AccessoryEditor | null> {
  await requireStaff();
  if (!uuidPattern.test(id)) return null;
  const [row] = await withBoundedDatabase("accessory-read", db => db.execute<AccessoryEditor & Record<string, unknown>>(sql`
    SELECT p.id,p.slug,p.name,p.brand,p.category,p.attributes,p.editorial_state AS state,
      p.sort_order AS "sortOrder",p.updated_at::text AS version,COALESCE(to_jsonb(p)->'volume_options','[]'::jsonb) AS volumes,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('locale',t.locale,'name',t.name,'description',t.description))
        FROM accessory_translations t WHERE t.product_id=p.id),'[]') AS translations,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id',v.id,'sku',v.sku,'code',v.color_code,'color',v.color_label,
        'volumeMl',to_jsonb(v)->>'volume_ml','hex',v.color_hex,'price',v.retail_price::text,'currency',v.currency,'active',v.is_active,
        'availability',CASE WHEN to_jsonb(v)->>'availability'='in_stock' THEN 'in_stock' ELSE 'out_of_stock' END) ORDER BY v.sort_order,v.id)
        FROM accessory_variants v WHERE v.product_id=p.id),'[]') AS variants,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id',i.id,'url',i.url,'variantId',i.variant_id,'volumeId',to_jsonb(i)->>'volume_id','alt',i.alt,'approved',i.is_approved) ORDER BY i.sort_order,i.id)
        FROM accessory_images i WHERE i.product_id=p.id),'[]') AS images
    FROM accessory_products p WHERE p.id=${id}::uuid
  `));
  return row ?? null;
}
