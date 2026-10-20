-- Independent accessories catalog. Does not alter products/equipment_type.
-- Requires the existing Sketo bootstrap/editor foundation and locale migration.
BEGIN;

-- Scoped helper: do not change legacy catalog permissions. The bootstrap's
-- PL/pgSQL current_role variable conflicts with PostgreSQL's CURRENT_ROLE.
CREATE OR REPLACE FUNCTION public.accessory_staff_access(min_role public.editorial_role DEFAULT 'viewer')
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members s
    WHERE s.user_id = auth.uid() AND s.is_active
      AND CASE min_role
        WHEN 'viewer' THEN s.role IN ('viewer', 'editor', 'admin')
        WHEN 'editor' THEN s.role IN ('editor', 'admin')
        WHEN 'admin' THEN s.role = 'admin'
        ELSE false
      END
  );
$$;
REVOKE ALL ON FUNCTION public.accessory_staff_access(public.editorial_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accessory_staff_access(public.editorial_role) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.accessory_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand text NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(attributes) = 'object'),
  editorial_state public.editorial_state NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accessory_translations (
  product_id uuid NOT NULL REFERENCES public.accessory_products(id) ON DELETE CASCADE,
  locale public.locale NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  PRIMARY KEY (product_id, locale)
);

CREATE TABLE IF NOT EXISTS public.accessory_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.accessory_products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  color_code text NOT NULL,
  color_label text NOT NULL,
  color_hex text CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9a-fA-F]{6}$'),
  retail_price numeric(12,2) NOT NULL CHECK (retail_price >= 0),
  currency text NOT NULL DEFAULT 'KZT' CHECK (currency ~ '^[A-Z]{3}$'),
  price_verified boolean NOT NULL DEFAULT false,
  stock_quantity integer CHECK (stock_quantity >= 0),
  inventory_verified boolean NOT NULL DEFAULT false,
  stock_recorded_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_code),
  UNIQUE (product_id, id)
);

-- variant_id NULL means an image shared by every colour of this product.
-- Composite FK prevents assigning a variant photo to a different product.
CREATE TABLE IF NOT EXISTS public.accessory_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.accessory_products(id) ON DELETE CASCADE,
  variant_id uuid,
  url text NOT NULL CHECK (url ~ '^https://' OR url ~ '^/[^/]'),
  alt text NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (product_id, variant_id) REFERENCES public.accessory_variants(product_id, id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS accessory_images_variant_unique
  ON public.accessory_images (product_id, variant_id, url) WHERE variant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS accessory_images_shared_unique
  ON public.accessory_images (product_id, url) WHERE variant_id IS NULL;

-- Research/import provenance is staff-only, not customer-facing metadata.
CREATE TABLE IF NOT EXISTS public.accessory_import_batches (
  import_key text PRIMARY KEY,
  source_file text NOT NULL,
  source_sha256 text NOT NULL,
  payload_md5 text NOT NULL,
  product_count integer NOT NULL,
  variant_count integer NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.accessory_import_rows (
  variant_id uuid PRIMARY KEY REFERENCES public.accessory_variants(id) ON DELETE CASCADE,
  import_key text NOT NULL REFERENCES public.accessory_import_batches(import_key),
  source_page integer NOT NULL CHECK (source_page > 0),
  source_row integer NOT NULL CHECK (source_row > 0),
  source_name text NOT NULL
);

CREATE INDEX IF NOT EXISTS accessory_products_listing ON public.accessory_products(editorial_state, category, sort_order);
CREATE INDEX IF NOT EXISTS accessory_variants_product ON public.accessory_variants(product_id, sort_order);
CREATE INDEX IF NOT EXISTS accessory_images_product ON public.accessory_images(product_id, variant_id, sort_order);

DROP TRIGGER IF EXISTS accessory_products_updated_at ON public.accessory_products;
CREATE TRIGGER accessory_products_updated_at BEFORE UPDATE ON public.accessory_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS accessory_variants_updated_at ON public.accessory_variants;
CREATE TRIGGER accessory_variants_updated_at BEFORE UPDATE ON public.accessory_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.accessory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_import_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accessory_products_public_read ON public.accessory_products;
CREATE POLICY accessory_products_public_read ON public.accessory_products FOR SELECT TO anon, authenticated
  USING (editorial_state = 'published');
DROP POLICY IF EXISTS accessory_translations_public_read ON public.accessory_translations;
CREATE POLICY accessory_translations_public_read ON public.accessory_translations FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.accessory_products p WHERE p.id = product_id AND p.editorial_state = 'published'));
DROP POLICY IF EXISTS accessory_variants_public_read ON public.accessory_variants;
CREATE POLICY accessory_variants_public_read ON public.accessory_variants FOR SELECT TO anon, authenticated
  USING (is_active AND EXISTS (SELECT 1 FROM public.accessory_products p WHERE p.id = product_id AND p.editorial_state = 'published'));
DROP POLICY IF EXISTS accessory_images_public_read ON public.accessory_images;
CREATE POLICY accessory_images_public_read ON public.accessory_images FOR SELECT TO anon, authenticated
  USING (is_approved
    AND EXISTS (SELECT 1 FROM public.accessory_products p WHERE p.id = product_id AND p.editorial_state = 'published')
    AND (variant_id IS NULL OR EXISTS (SELECT 1 FROM public.accessory_variants v WHERE v.id = variant_id AND v.is_active)));

DO $policies$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['accessory_products','accessory_translations','accessory_variants','accessory_images','accessory_import_batches','accessory_import_rows']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS staff_read ON public.%I', table_name);
    EXECUTE format('CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING (public.accessory_staff_access(''viewer''))', table_name);
    EXECUTE format('DROP POLICY IF EXISTS staff_manage ON public.%I', table_name);
    EXECUTE format('CREATE POLICY staff_manage ON public.%I FOR ALL TO authenticated USING (public.accessory_staff_access(''editor'')) WITH CHECK (public.accessory_staff_access(''editor''))', table_name);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', table_name);
  END LOOP;
END;
$policies$;
GRANT SELECT ON public.accessory_products, public.accessory_translations,
  public.accessory_variants, public.accessory_images TO anon;

COMMENT ON TABLE public.accessory_products IS 'Separate accessories catalog; not products.type=equipment/equipment_type=accessory.';
COMMENT ON COLUMN public.accessory_variants.stock_quantity IS 'Initial PDF stock snapshot. Not live inventory until inventory_verified=true.';
COMMENT ON COLUMN public.accessory_variants.stock_recorded_at IS 'Actual stock observation date, NULL if the source is undated.';
COMMENT ON COLUMN public.accessory_images.variant_id IS 'NULL for shared photos; otherwise specific colour SKU. UI: selected-variant photos plus shared photos.';
COMMIT;
