-- Sketo Supabase bootstrap
-- For a fresh Supabase project. Run in SQL Editor.
-- Creates catalog/editor tables, enums, triggers, indexes, basic RLS,
-- and optional public storage buckets for project assets.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
    CREATE TYPE product_type AS ENUM ('coffee', 'equipment');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('in_stock', 'out_of_stock', 'preorder');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_brand') THEN
    CREATE TYPE equipment_brand AS ENUM (
      'la-marzocco',
      'mahlkonig',
      'anfim',
      'mazzer',
      'balenare',
      'allround',
      'victoria-arduino'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
    CREATE TYPE equipment_type AS ENUM ('grinder', 'espresso-machine');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'locale') THEN
    CREATE TYPE locale AS ENUM ('ru', 'en', 'kz');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'detail_kind') THEN
    CREATE TYPE detail_kind AS ENUM ('detail', 'specification');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'editorial_role') THEN
    CREATE TYPE editorial_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'editorial_state') THEN
    CREATE TYPE editorial_state AS ENUM ('draft', 'review', 'published', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_kind') THEN
    CREATE TYPE media_kind AS ENUM ('image', 'video', 'document');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_role') THEN
    CREATE TYPE media_role AS ENUM ('thumbnail', 'gallery', 'hero', 'attachment');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_entity_type') THEN
    CREATE TYPE audit_entity_type AS ENUM ('product', 'media', 'staff', 'translation');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM (
      'create',
      'update',
      'delete',
      'publish',
      'unpublish',
      'archive',
      'restore',
      'upload'
    );
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  type product_type NOT NULL,
  status product_status NOT NULL DEFAULT 'in_stock',
  editorial_state editorial_state NOT NULL DEFAULT 'published',
  name TEXT,
  sku TEXT,
  subtitle TEXT,
  excerpt TEXT,
  price_display TEXT,
  price_amount INTEGER,
  price_currency TEXT DEFAULT 'KZT',
  image_url TEXT NOT NULL,
  brand equipment_brand,
  equipment_type equipment_type,
  filters TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  name TEXT,
  size TEXT,
  notes TEXT,
  description TEXT NOT NULL DEFAULT '',
  category TEXT,
  status_label TEXT,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE (product_id, locale)
);

CREATE TABLE IF NOT EXISTS product_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  kind detail_kind NOT NULL DEFAULT 'detail',
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role editorial_role NOT NULL DEFAULT 'editor',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL DEFAULT 'catalog',
  path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  kind media_kind NOT NULL DEFAULT 'image',
  alt TEXT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  locale locale,
  role media_role NOT NULL DEFAULT 'gallery',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS product_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  locale locale,
  note TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, version, locale)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  action audit_action NOT NULL,
  actor_id UUID,
  summary TEXT NOT NULL,
  diff JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_editorial_state ON products(editorial_state);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_translations_product ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_details_product ON product_details(product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_media_assets_kind ON media_assets(kind);
CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_asset ON product_media(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_product_revisions_product ON product_revisions(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS staff_members_updated_at ON staff_members;
CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS media_assets_updated_at ON media_assets;
CREATE TRIGGER media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION is_staff_member(min_role editorial_role DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
DECLARE
  current_role editorial_role;
BEGIN
  SELECT role
  INTO current_role
  FROM staff_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;

  IF current_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN CASE min_role
    WHEN 'viewer' THEN current_role IN ('viewer', 'editor', 'admin')
    WHEN 'editor' THEN current_role IN ('editor', 'admin')
    WHEN 'admin' THEN current_role = 'admin'
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "public_read_translations" ON product_translations;
CREATE POLICY "public_read_translations"
  ON product_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS "public_read_details" ON product_details;
CREATE POLICY "public_read_details"
  ON product_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS "public_read_features" ON product_features;
CREATE POLICY "public_read_features"
  ON product_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS "public_read_images" ON product_images;
CREATE POLICY "public_read_images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS "public_read_media_assets" ON media_assets;
CREATE POLICY "public_read_media_assets"
  ON media_assets FOR SELECT
  USING (kind IN ('image', 'video'));

DROP POLICY IF EXISTS "staff_manage_products" ON products;
CREATE POLICY "staff_manage_products"
  ON products FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_translations" ON product_translations;
CREATE POLICY "staff_manage_translations"
  ON product_translations FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_details" ON product_details;
CREATE POLICY "staff_manage_details"
  ON product_details FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_features" ON product_features;
CREATE POLICY "staff_manage_features"
  ON product_features FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_images" ON product_images;
CREATE POLICY "staff_manage_images"
  ON product_images FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_read_staff_members" ON staff_members;
CREATE POLICY "staff_read_staff_members"
  ON staff_members FOR SELECT
  USING (is_staff_member('viewer'));

DROP POLICY IF EXISTS "admin_manage_staff_members" ON staff_members;
CREATE POLICY "admin_manage_staff_members"
  ON staff_members FOR ALL
  USING (is_staff_member('admin'))
  WITH CHECK (is_staff_member('admin'));

DROP POLICY IF EXISTS "staff_manage_media_assets" ON media_assets;
CREATE POLICY "staff_manage_media_assets"
  ON media_assets FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_product_media" ON product_media;
CREATE POLICY "staff_manage_product_media"
  ON product_media FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_manage_product_revisions" ON product_revisions;
CREATE POLICY "staff_manage_product_revisions"
  ON product_revisions FOR ALL
  USING (is_staff_member('editor'))
  WITH CHECK (is_staff_member('editor'));

DROP POLICY IF EXISTS "staff_read_audit_logs" ON audit_logs;
CREATE POLICY "staff_read_audit_logs"
  ON audit_logs FOR SELECT
  USING (is_staff_member('viewer'));

DROP POLICY IF EXISTS "staff_insert_audit_logs" ON audit_logs;
CREATE POLICY "staff_insert_audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_staff_member('editor'));

-- Optional storage buckets for public project assets.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('catalog', 'catalog', true),
  ('equipment', 'equipment', true),
  ('academy', 'academy', true),
  ('b2b', 'b2b', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_catalog_storage" ON storage.objects;
CREATE POLICY "public_read_catalog_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('catalog', 'equipment', 'academy', 'b2b'));

DROP POLICY IF EXISTS "staff_manage_catalog_storage" ON storage.objects;
CREATE POLICY "staff_manage_catalog_storage"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('catalog', 'equipment', 'academy', 'b2b')
    AND is_staff_member('editor')
  )
  WITH CHECK (
    bucket_id IN ('catalog', 'equipment', 'academy', 'b2b')
    AND is_staff_member('editor')
  );
