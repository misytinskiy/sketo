-- Source EUR price is separate from the eventual converted selling price in KZT.
ALTER TABLE public.products
  ADD COLUMN equipment_price_eur numeric(12, 2),
  ADD COLUMN equipment_price_from boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT products_equipment_price_eur_check CHECK (
    equipment_price_eur IS NULL OR
    (type = 'equipment' AND equipment_price_eur > 0 AND equipment_price_eur < 10000000000)
  ),
  ADD CONSTRAINT products_equipment_price_from_check CHECK (
    NOT equipment_price_from OR (type = 'equipment' AND equipment_price_eur IS NOT NULL)
  );

COMMENT ON COLUMN public.products.equipment_price_eur IS
  'Equipment list price in EUR, in major units. NULL means unknown; no currency conversion applied.';
COMMENT ON COLUMN public.products.equipment_price_from IS
  'True when the EUR price is the minimum for the model/configuration range.';
