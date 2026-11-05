ALTER TABLE public.products ADD COLUMN IF NOT EXISTS coffee_brand text;

-- Copy known roasters without overwriting brands already set by staff.
UPDATE public.products p
SET coffee_brand = CASE lower(trim(d.value))
  WHEN 'serikov coffee company' THEN 'Serikov'
  ELSE trim(d.value)
END
FROM public.product_details d
WHERE p.type = 'coffee' AND p.coffee_brand IS NULL
  AND d.product_id = p.id AND d.locale = 'ru'
  AND d.label = 'Обжарщик' AND length(trim(d.value)) BETWEEN 1 AND 80;

-- The original 250 g Pro Barista range predates roaster detail fields.
UPDATE public.products SET coffee_brand = 'Pro Barista'
WHERE type = 'coffee' AND coffee_brand IS NULL AND slug IN (
  'african-profile-1-0', 'asian-profile', 'brazilian-profile-1-0',
  'brazilian-profile-2-0', 'decaf', 'italian-profile-medium',
  'latino-profile-2-0', 'microlot-2-0'
);

-- Both roasters confirmed by the customer.
UPDATE public.products SET coffee_brand = 'Сварщица Екатерина'
WHERE type = 'coffee' AND coffee_brand IS NULL
  AND slug IN ('rwanda-kabue-250g', 'colombia-jefferson-castano-250g');
