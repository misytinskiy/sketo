-- Manual availability, independent of legacy warehouse snapshots.
BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.accessory_variants
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'unknown'
  CHECK (availability IN ('unknown', 'in_stock', 'out_of_stock', 'on_order'));
COMMENT ON COLUMN public.accessory_variants.availability IS 'Manual storefront status. Does not represent stock quantity.';
COMMIT;
