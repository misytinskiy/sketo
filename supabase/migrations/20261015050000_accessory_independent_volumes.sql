BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.accessory_products ADD COLUMN IF NOT EXISTS volume_options jsonb NOT NULL DEFAULT '[]'::jsonb
  CHECK (jsonb_typeof(volume_options) = 'array');
-- Preserve any volumes entered with the previous editor. Keep old variant data intact.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.accessory_variants v JOIN public.accessory_products p ON p.id=v.product_id
   WHERE v.volume_ml IS NOT NULL AND p.volume_options='[]'::jsonb
   GROUP BY v.product_id,v.volume_ml HAVING count(DISTINCT (v.retail_price,v.currency)) > 1)
 THEN RAISE EXCEPTION 'Same volume has different prices by colour; manual review required'; END IF;
END $$;
UPDATE public.accessory_products p SET volume_options = source.volumes, updated_at = now()
FROM (
 SELECT product_id, jsonb_agg(jsonb_build_object('id',id,'value',volume_ml::text,'unit','мл','price',retail_price::text,'currency',currency) ORDER BY volume_ml) AS volumes
 FROM (SELECT DISTINCT ON (product_id,volume_ml) * FROM public.accessory_variants WHERE volume_ml IS NOT NULL ORDER BY product_id,volume_ml,sort_order,id) v
 GROUP BY product_id
) source WHERE source.product_id=p.id AND p.volume_options='[]'::jsonb;
COMMIT;
