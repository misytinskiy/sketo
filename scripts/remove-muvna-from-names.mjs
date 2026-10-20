// Default: read-only preview. --apply: transactional update with a local backup.
import env from '@next/env';
import postgres from 'postgres';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

env.loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const stock = process.argv.includes('--all-in-stock');
const capitalizeOnly = process.argv.includes('--capitalize-only');
function clean(name) {
  if (capitalizeOnly) return name.replace(/^(\s*[«„“"'([{]*)(\p{Ll})/u, (_, prefix, letter) => prefix + letter.toUpperCase());
  if (!/\bmuvna\b/i.test(name)) return name;
  return name.replace(/\bmuvna\b/gi, '').replace(/\s+/g, ' ').trim().replace(/^[—–-]\s*/, '').replace(/\s*[—–-]$/, '').trim();
}
const db = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 5 });
try {
  await db.begin(apply ? 'read write' : 'read only', async tx => {
    await tx.unsafe("SET LOCAL statement_timeout = '15s'");
    await tx.unsafe("SET LOCAL lock_timeout = '3s'");
    // Lock parents first, matching the staff editor's lock order.
    if (stock && apply) await tx`SELECT id FROM public.accessory_products ORDER BY id FOR UPDATE`;
    const variants = stock ? await tx.unsafe(`SELECT id,product_id,availability FROM public.accessory_variants WHERE availability IS DISTINCT FROM 'in_stock' ORDER BY id ${apply ? 'FOR UPDATE' : ''}`) : [];
    const defaults = stock ? await tx`SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='accessory_variants' AND column_name='availability'` : [];
    const products = await tx.unsafe(`SELECT id,slug,name,updated_at::text AS version FROM public.accessory_products
      WHERE lower(btrim(brand))='muvna' ORDER BY id ${apply ? 'FOR UPDATE' : ''}`);
    const translations = await tx.unsafe(`SELECT t.product_id,t.locale::text AS locale,t.name
      FROM public.accessory_translations t JOIN public.accessory_products p ON p.id=t.product_id
      WHERE lower(btrim(p.brand))='muvna' ORDER BY t.product_id,t.locale ${apply ? 'FOR UPDATE OF t' : ''}`);
    const productChanges = products.filter(p => clean(p.name) !== p.name).map(p => ({ ...p, next: clean(p.name) }));
    const translationChanges = translations.filter(t => clean(t.name) !== t.name).map(t => ({ ...t, next: clean(t.name) }));
    if ([...productChanges, ...translationChanges].some(p => !p.next)) throw new Error('EMPTY_NAME');
    const affected = [...new Set([...productChanges.map(p => p.id), ...translationChanges.map(t => t.product_id)])];
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', products: productChanges.length,
      translations: translationChanges.length, locales: Object.fromEntries(['ru','en','kz'].map(locale => [locale, translationChanges.filter(t => t.locale === locale).length])),
      affectedProducts: affected.length, samples: translationChanges.slice(0, 6).map(t => ({ locale: t.locale, before: t.name, after: t.next })) }));
    console.log(JSON.stringify({ availabilityChanges: variants.length, previousDefault: defaults[0]?.column_default }));
    if (!apply || (!affected.length && !stock)) return;
    const folder = resolve('.local-backups');
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    const backup = resolve(folder, `muvna-names-${Date.now()}.json`);
    writeFileSync(backup, JSON.stringify({ createdAt: new Date().toISOString(), productChanges, translationChanges, variants, defaults }, null, 2), { flag: 'wx', mode: 0o600 });
    // Parameterised updates, restricted to the locked snapshot. No other fields are touched.
    let count = 0;
    if (productChanges.length) {
      const rows = await tx`UPDATE public.accessory_products p SET name=c.next
        FROM jsonb_to_recordset(${tx.json(productChanges)}::jsonb) AS c(id uuid,name text,next text)
        WHERE p.id=c.id AND p.name=c.name RETURNING p.id`;
      if (rows.length !== productChanges.length) throw new Error('CONCURRENT_CHANGE');
      count += rows.length;
    }
    if (translationChanges.length) {
      const rows = await tx`UPDATE public.accessory_translations t SET name=c.next
        FROM jsonb_to_recordset(${tx.json(translationChanges)}::jsonb) AS c(product_id uuid,locale text,name text,next text)
        WHERE t.product_id=c.product_id AND t.locale=c.locale::public.locale AND t.name=c.name RETURNING t.product_id`;
      if (rows.length !== translationChanges.length) throw new Error('CONCURRENT_CHANGE');
      count += rows.length;
    }
    // Invalidate optimistic editor versions also when only a translation changed.
    if (stock) {
      await tx`ALTER TABLE public.accessory_variants ALTER COLUMN availability SET DEFAULT 'in_stock'`;
      if (variants.length) {
        const rows = await tx`UPDATE public.accessory_variants SET availability='in_stock' WHERE id IN ${tx(variants.map(v => v.id))} RETURNING id`;
        if (rows.length !== variants.length) throw new Error('CONCURRENT_CHANGE');
      }
    }
    const touched = [...new Set([...affected, ...variants.map(v => v.product_id)])];
    if (touched.length) await tx`UPDATE public.accessory_products SET updated_at=clock_timestamp() WHERE id IN ${tx(touched)}`;
    console.log(JSON.stringify({ updatedRows: count, backup }));
  });
  console.log(JSON.stringify({ status: apply ? 'committed' : 'preview_complete' }));
} catch (error) {
  console.error(JSON.stringify({ error: error.code ?? error.cause?.code ?? 'failed', message: ['EMPTY_NAME','CONCURRENT_CHANGE'].includes(error.message) ? error.message : 'Operation failed; transaction not committed.' }));
  process.exitCode = 1;
} finally { await db.end({ timeout: 1 }); }
