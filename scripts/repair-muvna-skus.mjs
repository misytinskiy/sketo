// Read-only by default; --apply changes only verified SKU fields in one transaction.
import env from '@next/env';
import postgres from 'postgres';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

env.loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const source = JSON.parse(readFileSync('supabase/imports/20261012_muvna_source.json', 'utf8'));
if (createHash('sha256').update(readFileSync('Muvna.pdf')).digest('hex') !== source.sha256) throw new Error('Source PDF changed');
const corrections = [
  ['muvna-mobius-58-18-titanium', 'c620f4b3-2ba8-4d92-a0f4-e34c029815ea', 'Натуральный', 'FB2298'],
  ['muvna-b-type-600', 'c2b25c57-5340-4532-bfda-fadccba47547', 'Натуральный', 'P2011'],
  ['muvna-b-type-350-natural', 'c26e1dad-33b1-4cae-aa8f-ffa10ab062e8', 'Черный', 'P2095'],
  ['muvna-gyro-drop-58-natural', 'c3f79e93-5f5b-4d02-9eb2-04127cfb1de3', 'Серый', 'DR2605'],
  ['muvna-gyro-drop-58-natural', '28679a2d-796b-49c5-915e-d642c28c8288', 'Черный', 'DR2604'],
  ['muvna-bean-plate-black', '03529e66-2097-4b25-a97a-ac7259c8539d', 'Белый', 'ES2687'],
  ['muvna-bean-plate-black', 'c6034f1d-d53b-44be-aad0-e5e4048a6b89', 'Орех', 'ES2634'],
  ['muvna-psyche-mini', 'd36dc945-f95a-483e-b38a-0f22f1446190', 'Белый', 'ES2420'],
  ['muvna-li-v60-colorful', '8bc293ff-0303-479a-a7eb-48c9640b2180', 'Прозрачная', 'FC2717'],
  ['muvna-electric-kettle-600-uk-white', '8151c444-8cb3-4783-8d7f-23f038a52466', 'Черный', 'BK2779'],
  ['muvna-four-paddle-58', '9c21d001-e5a0-475b-b3bc-a987c5202e38', 'Серебристый', 'T2207L4'],
];
const volumePlans = [
  { slug: 'muvna-tivat', unit: 'мл', colors: { 'Серый': { 160: 'BZ2282', 220: 'BZ2283', 320: 'BZ2284' } } },
  { slug: 'muvna-storage-black', unit: 'г', colors: { 'Чёрный': { 250: 'GC2299', 500: 'GC2300', 750: 'GC2301' }, 'Серый': { 250: 'GC2314', 500: 'GC2315' } } },
];
const db = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 8 });
try {
  await db.begin(apply ? 'read write' : 'read only', async tx => {
    await tx.unsafe("SET LOCAL statement_timeout='15s'");
    await tx.unsafe("SET LOCAL lock_timeout='3s'");
    const slugs = [...new Set([...corrections.map(c => c[0]), ...volumePlans.map(p => p.slug), 'muvna-mobius-58-18-natural'])];
    const products = apply
      ? await tx`SELECT id,slug,name,editorial_state,volume_options,updated_at FROM accessory_products WHERE slug IN ${tx(slugs)} ORDER BY id FOR UPDATE`
      : await tx`SELECT id,slug,name,editorial_state,volume_options,updated_at FROM accessory_products WHERE slug IN ${tx(slugs)} ORDER BY id`;
    if (products.length !== slugs.length) throw new Error('Product set changed');
    const ids = products.map(p => p.id);
    const variants = apply
      ? await tx`SELECT id,product_id,sku,color_label,retail_price FROM accessory_variants WHERE product_id IN ${tx(ids)} ORDER BY id FOR UPDATE`
      : await tx`SELECT id,product_id,sku,color_label,retail_price FROM accessory_variants WHERE product_id IN ${tx(ids)} ORDER BY id`;
    const changes = [];
    const archived = products.find(p => p.slug === 'muvna-mobius-58-18-natural');
    const archivedVariant = variants.find(v => v.id === '0a87dd61-0ab0-4cae-bb33-15e7dbb74226' && v.product_id === archived.id);
    const retiredSku = 'FB2298-ARCHIVED-0a87dd61-0ab0-4cae-bb33-15e7dbb74226';
    if (archived.editorial_state !== 'archived' || !archivedVariant || !['FB2298', retiredSku].includes(archivedVariant.sku)) throw new Error('Archived Mobius changed');
    if (archivedVariant.sku !== retiredSku) changes.push({ id: archivedVariant.id, productId: archived.id, before: archivedVariant.sku, after: retiredSku });
    for (const [slug, id, color, sku] of corrections) {
      const product = products.find(p => p.slug === slug);
      const variant = variants.find(v => v.id === id && v.product_id === product.id);
      const row = source.rows.find(r => r.sku === sku);
      if (!variant || variant.color_label !== color || !row || Number(variant.retail_price) !== row.retail) throw new Error(`Variant changed: ${slug}/${color}`);
      if (variant.sku === sku) continue;
      if (variant.sku !== `ACC-${id}`) throw new Error(`SKU changed: ${slug}/${color}`);
      changes.push({ id, productId: product.id, before: variant.sku, after: sku });
    }
    // The grey container's base SKU corresponds to its original 250 g option.
    const grey = variants.find(v => v.id === '3158862e-b968-46ba-b399-995235020112');
    if (!grey || grey.color_label !== 'Серый') throw new Error('Grey container changed');
    if (grey.sku !== 'GC2314') {
      if (grey.sku !== `ACC-${grey.id}`) throw new Error('Grey SKU changed');
      changes.push({ id: grey.id, productId: grey.product_id, before: grey.sku, after: 'GC2314' });
    }
    const volumeChanges = [];
    for (const plan of volumePlans) {
      const product = products.find(p => p.slug === plan.slug);
      const colors = variants.filter(v => v.product_id === product.id);
      if (colors.length !== Object.keys(plan.colors).length || !product.volume_options.length) throw new Error(`Options changed: ${plan.slug}`);
      const next = product.volume_options.map(volume => {
        if (volume.unit !== plan.unit) throw new Error('Volume unit changed');
        const skuByVariant = {};
        for (const variant of colors) {
          if (!plan.colors[variant.color_label]) throw new Error('Unknown colour');
          const sku = plan.colors[variant.color_label][Number(volume.value)];
          // No grey 750 g exists in the PDF: leave this combination explicitly unmapped.
          if (!sku && plan.slug === 'muvna-storage-black' && variant.color_label === 'Серый' && Number(volume.value) === 750) continue;
          const row = source.rows.find(r => r.sku === sku);
          if (!row || row.retail !== Number(volume.price)) throw new Error(`Volume changed: ${plan.slug}/${volume.value}`);
          skuByVariant[variant.id] = sku;
        }
        return { ...volume, skuByVariant };
      });
      if (!isDeepStrictEqual(next, product.volume_options)) volumeChanges.push({ id: product.id, before: product.volume_options, after: next });
    }
    for (const change of changes) {
      const occupied = await tx`SELECT id FROM accessory_variants WHERE sku=${change.after} AND id<>${change.id}::uuid`;
      if (occupied.some(v => !changes.some(c => c.id === v.id && c.before === change.after))) throw new Error(`SKU already in use: ${change.after}`);
    }
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', changes, volumeChanges }, null, 2));
    if (!apply || (!changes.length && !volumeChanges.length)) return;
    mkdirSync('.local-backups', { recursive: true, mode: 0o700 });
    const backup = `.local-backups/muvna-skus-${Date.now()}.json`;
    writeFileSync(backup, JSON.stringify({ products, variants, changes, volumeChanges }, null, 2), { flag: 'wx', mode: 0o600 });
    for (const change of changes) {
      await tx`UPDATE accessory_variants SET sku=${change.after} WHERE id=${change.id}::uuid AND sku=${change.before}`;
    }
    for (const change of volumeChanges) {
      await tx`UPDATE accessory_products SET volume_options=${tx.json(change.after)}::jsonb WHERE id=${change.id}::uuid`;
    }
    const touched = [...new Set([...changes.map(c => c.productId), ...volumeChanges.map(c => c.id)])];
    await tx`UPDATE accessory_products SET updated_at=clock_timestamp() WHERE id IN ${tx(touched)}`;
    console.log(JSON.stringify({ backup, updatedVariants: changes.length, updatedVolumeProducts: volumeChanges.length }));
  });
  console.log(apply ? 'Committed' : 'Preview complete');
} catch (error) {
  console.error(error.code ?? error.message);
  process.exitCode = 1;
} finally { await db.end({ timeout: 1 }); }
