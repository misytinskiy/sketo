-- Sketo editor foundation
-- Adds workflow, staff roles, media library, and audit tables for staff CRUD.

CREATE TYPE editorial_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE editorial_state AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE media_kind AS ENUM ('image', 'video', 'document');
CREATE TYPE media_role AS ENUM ('thumbnail', 'gallery', 'hero', 'attachment');
CREATE TYPE audit_entity_type AS ENUM ('product', 'media', 'staff', 'translation');
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

ALTER TABLE products
  ADD COLUMN editorial_state editorial_state NOT NULL DEFAULT 'published',
  ADD COLUMN sku TEXT,
  ADD COLUMN subtitle TEXT,
  ADD COLUMN excerpt TEXT,
  ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN published_at TIMESTAMPTZ,
  ADD COLUMN archived_at TIMESTAMPTZ,
  ADD COLUMN created_by UUID,
  ADD COLUMN updated_by UUID;

ALTER TABLE product_translations
  ADD COLUMN seo_title TEXT,
  ADD COLUMN seo_description TEXT;

CREATE TABLE staff_members (
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

CREATE TABLE media_assets (
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

CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  locale locale,
  role media_role NOT NULL DEFAULT 'gallery',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE product_revisions (
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

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  action audit_action NOT NULL,
  actor_id UUID,
  summary TEXT NOT NULL,
  diff JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_editorial_state ON products(editorial_state);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_staff_members_role ON staff_members(role);
CREATE INDEX idx_media_assets_kind ON media_assets(kind);
CREATE INDEX idx_product_media_product ON product_media(product_id);
CREATE INDEX idx_product_media_asset ON product_media(media_asset_id);
CREATE INDEX idx_product_revisions_product ON product_revisions(product_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);

CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_media_assets"
  ON media_assets FOR SELECT
  USING (kind IN ('image', 'video'));
