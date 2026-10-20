BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.accessory_images ADD COLUMN IF NOT EXISTS volume_id uuid;
COMMENT ON COLUMN public.accessory_images.volume_id IS 'Optional ID from product volume_options. NULL means all volumes; validated by staff editor.';
COMMIT;
