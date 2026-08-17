-- Sketo catalog schema
-- Run in Supabase SQL Editor or via: supabase db push

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE product_type AS ENUM ('coffee', 'equipment');
CREATE TYPE product_status AS ENUM ('in_stock', 'out_of_stock', 'preorder');
CREATE TYPE equipment_brand AS ENUM (
  'la-marzocco',
  'mahlkonig',
  'anfim',
  'mazzer',
  'balenare',
  'allround',
  'victoria-arduino'
);
CREATE TYPE equipment_type AS ENUM ('grinder', 'espresso-machine');
CREATE TYPE locale AS ENUM ('ru', 'en');
CREATE TYPE detail_kind AS ENUM ('detail', 'specification');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  type product_type NOT NULL,
  status product_status NOT NULL DEFAULT 'in_stock',
  name TEXT,
  price_display TEXT,
  price_amount INTEGER,
  price_currency TEXT DEFAULT 'KZT',
  image_url TEXT NOT NULL,
  brand equipment_brand,
  equipment_type equipment_type,
  filters TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  name TEXT,
  size TEXT,
  notes TEXT,
  description TEXT NOT NULL DEFAULT '',
  category TEXT,
  status_label TEXT,
  UNIQUE (product_id, locale)
);

CREATE TABLE product_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  kind detail_kind NOT NULL DEFAULT 'detail',
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_sort ON products(sort_order);
CREATE INDEX idx_product_translations_product ON product_translations(product_id);
CREATE INDEX idx_product_details_product ON product_details(product_id);
CREATE INDEX idx_product_features_product ON product_features(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (is_published = true);

CREATE POLICY "public_read_translations"
  ON product_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

CREATE POLICY "public_read_details"
  ON product_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

CREATE POLICY "public_read_features"
  ON product_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );

CREATE POLICY "public_read_images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_published = true
    )
  );
