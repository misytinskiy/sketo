-- Run only in a disposable test database after bootstrap, migration and import.
-- psql -v ON_ERROR_STOP=1 -f validate_muvna.sql
BEGIN;
DO $$ BEGIN
  ASSERT (SELECT count(*) = 110 FROM accessory_products), 'Product count';
  ASSERT (SELECT count(*) = 161 FROM accessory_variants), 'Variant count';
  ASSERT (SELECT count(*) = 161 FROM accessory_import_rows), 'Provenance count';
  ASSERT (SELECT count(DISTINCT product_id) = 1 FROM accessory_variants WHERE sku IN ('DC2397','DR2271','DR2274')), 'Dosing ring colours grouped';
  ASSERT (SELECT count(DISTINCT product_id) = 1 FROM accessory_variants WHERE sku IN ('SP2679','SP2680','SP2681')), 'Powder shaker colours grouped';
  ASSERT (SELECT color_code = 'gray' FROM accessory_variants WHERE sku = 'T2274L4'), 'Confirmed grey';
  ASSERT NOT EXISTS (SELECT 1 FROM accessory_products WHERE editorial_state <> 'draft'), 'Drafts only';
  ASSERT NOT EXISTS (SELECT 1 FROM accessory_variants WHERE price_verified OR inventory_verified), 'Unverified snapshots';
  ASSERT NOT EXISTS (SELECT 1 FROM accessory_variants GROUP BY product_id HAVING count(DISTINCT retail_price) <> 1), 'Same-price colours only';
  ASSERT NOT EXISTS (SELECT 1 FROM accessory_images), 'No unverified photos imported';
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT count(*) = 0 FROM accessory_products), 'Anon cannot see drafts';
  ASSERT (SELECT count(*) = 0 FROM accessory_variants), 'Anon cannot see draft variants';
  ASSERT (SELECT count(*) = 0 FROM accessory_translations), 'Anon cannot see draft translations';
  ASSERT NOT has_table_privilege('anon', 'accessory_import_rows', 'SELECT'), 'Private provenance';
END $$;
RESET ROLE;

-- Publish one test item and attach shared + variant photos; rolled back below.
UPDATE accessory_products SET editorial_state = 'published' WHERE slug = 'muvna-mammoth';
INSERT INTO accessory_images(product_id, variant_id, url, is_approved)
SELECT product_id, id, '/test/colour.jpg', true FROM accessory_variants WHERE sku = 'G2888';
INSERT INTO accessory_images(product_id, url, is_approved)
SELECT id, '/test/shared.jpg', true FROM accessory_products WHERE slug = 'muvna-mammoth';
INSERT INTO accessory_images(product_id, url, is_approved)
SELECT id, '/test/unapproved.jpg', false FROM accessory_products WHERE slug = 'muvna-mammoth';
DO $$ BEGIN
  BEGIN
    INSERT INTO accessory_images(product_id, variant_id, url)
    SELECT p.id, v.id, '/test/wrong-product.jpg' FROM accessory_products p
    CROSS JOIN accessory_variants v WHERE p.slug = 'muvna-mammoth' AND v.sku = 'MK2673';
    RAISE EXCEPTION 'Cross-product photo incorrectly accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT count(*) = 1 FROM accessory_products), 'Published product visible';
  ASSERT (SELECT count(*) = 1 FROM accessory_translations), 'Published translation visible';
  ASSERT (SELECT count(*) = 2 FROM accessory_variants), 'Published colours visible';
  ASSERT (SELECT count(*) = 2 FROM accessory_images), 'Approved photos only';
END $$;
RESET ROLE;
UPDATE accessory_variants SET is_active = false WHERE sku = 'G2888';
SET LOCAL ROLE anon;
DO $$ BEGIN
  ASSERT (SELECT count(*) = 1 FROM accessory_variants), 'Inactive colour hidden';
  ASSERT (SELECT count(*) = 1 FROM accessory_images), 'Inactive colour photo hidden; shared remains';
END $$;
RESET ROLE;

-- Simulated Supabase auth.uid() uses this claim in the local test fixture.
INSERT INTO staff_members(user_id, email, role)
VALUES ('00000000-0000-0000-0000-000000001111', 'muvna-test@example.invalid', 'viewer');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000001111', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  ASSERT (SELECT count(*) = 110 FROM accessory_products), 'Staff viewer sees drafts';
  ASSERT (SELECT count(*) = 161 FROM accessory_import_rows), 'Staff sees provenance';
  UPDATE accessory_products SET name = 'Should not change';
  ASSERT NOT FOUND, 'Viewer cannot update';
  BEGIN
    INSERT INTO accessory_products(slug,brand,category,name) VALUES ('unauthorised','muvna','test','test');
    RAISE EXCEPTION 'Viewer incorrectly allowed to insert';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
UPDATE staff_members SET role = 'editor' WHERE user_id = '00000000-0000-0000-0000-000000001111';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  UPDATE accessory_products SET name = 'Editor test' WHERE slug = 'muvna-mammoth';
  ASSERT FOUND, 'Editor can update';
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'MUVNA structure, grouping, RLS and image ownership checks passed' AS result;
