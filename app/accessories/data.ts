import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { withBoundedDatabase } from "@/lib/db/bounded";
import type { Accessory } from "./model";

// DATABASE_URL can bypass RLS: enforce public visibility in every subquery.
// Only retail/public fields leave the server; no stock quantities or import metadata.
async function loadAccessories(slug?: string): Promise<Accessory[]> {
  const rows = await withBoundedDatabase("accessory-read", db => db.execute<Accessory & Record<string, unknown>>(sql`
    SELECT p.id, p.slug, p.name, p.brand, p.category, p.attributes,COALESCE(to_jsonb(p)->'volume_options','[]'::jsonb) AS volumes,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('locale',t.locale,'name',t.name,'description',t.description))
        FROM public.accessory_translations t WHERE t.product_id=p.id), '[]'::jsonb) AS translations,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id',v.id,'sku',v.sku,'color',v.color_label,'hex',v.color_hex,'volumeMl',to_jsonb(v)->>'volume_ml',
        'price',v.retail_price::text,'currency',v.currency,
        'availability',COALESCE(to_jsonb(v)->>'availability','unknown')
      ) ORDER BY v.sort_order,v.sku) FROM public.accessory_variants v WHERE v.product_id=p.id AND v.is_active AND to_jsonb(v)->>'availability'='in_stock'), '[]'::jsonb) AS variants,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id',i.id,'url',i.url,'alt',i.alt,'variantId',i.variant_id,'volumeId',to_jsonb(i)->>'volume_id')
        ORDER BY i.sort_order,i.id) FROM public.accessory_images i
        WHERE i.product_id=p.id AND i.is_approved
        AND (to_jsonb(i)->>'volume_id' IS NULL OR EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(to_jsonb(p)->'volume_options','[]'::jsonb)) vol WHERE vol->>'id'=to_jsonb(i)->>'volume_id'))
        AND (i.variant_id IS NULL OR EXISTS (
          SELECT 1 FROM public.accessory_variants v WHERE v.id=i.variant_id AND v.product_id=p.id AND v.is_active AND to_jsonb(v)->>'availability'='in_stock'
        ))), '[]'::jsonb) AS images
    FROM public.accessory_products p
    WHERE p.editorial_state='published'
      AND EXISTS (SELECT 1 FROM public.accessory_variants v WHERE v.product_id=p.id AND v.is_active AND to_jsonb(v)->>'availability'='in_stock')
      ${slug === undefined ? sql`` : sql`AND p.slug=${slug}`}
    ORDER BY p.sort_order,p.name,p.id
  `));
  return Array.from(rows);
}

// Match the equipment catalogue: React cache deduplicates within a render;
// Next Data Cache also avoids a new database connection on return navigation.
// Only public rows enter this cache. Staff reads remain uncached.
export const getAccessories = cache(unstable_cache(loadAccessories,
  ['accessories-public-v1-stock-colour-visibility'],
  { tags: ['accessories-catalog'], revalidate: 300 },
));

export const getAccessory = cache(async (slug: string) => (await getAccessories(slug))[0] ?? null);
