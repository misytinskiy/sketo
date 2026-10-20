-- New colours are available by default. Existing statuses are not overwritten.
BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.accessory_variants ALTER COLUMN availability SET DEFAULT 'in_stock';
COMMIT;
