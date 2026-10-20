-- Optional volume for each colour/price variant. Existing rows remain unchanged.
BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.accessory_variants
  ADD COLUMN IF NOT EXISTS volume_ml numeric(9,2)
  CHECK (volume_ml > 0);
COMMENT ON COLUMN public.accessory_variants.volume_ml IS 'Optional volume in millilitres; price and availability belong to this variant.';
COMMIT;
