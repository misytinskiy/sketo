import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const docxImport = process.argv.includes('--docx');
const manifest = JSON.parse(readFileSync(new URL(docxImport
  ? '../supabase/imports/20261104_equipment_docx_prices.json'
  : '../supabase/imports/20261104_equipment_eur_prices.json', import.meta.url), 'utf8'));
if (docxImport) {
  assert.match(manifest.rateKztPerEur, /^\d+\.\d{2}$/);
  const rateHundredths = BigInt(manifest.rateKztPerEur.replace('.', ''));
  assert.ok(rateHundredths > 0n);
  assert.equal(manifest.pending.length, 0, 'Resolve pending prices before importing');
  for (const item of manifest.items) {
    assert.ok(Number.isSafeInteger(item.kzt) && item.kzt > 0);
    // KZT whole units / (rateHundredths / 100) * 100 = EUR cents.
    const numerator = BigInt(item.kzt) * 10000n;
    const cents = (numerator * 2n + rateHundredths) / (2n * rateHundredths);
    item.eur = `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
  }
}
const migration = readFileSync(new URL('../supabase/migrations/20261104010000_equipment_eur_prices.sql', import.meta.url), 'utf8');
assert.equal(new Set(manifest.items.map(item => item.slug)).size, manifest.items.length);
for (const item of manifest.items) {
  assert.match(item.eur, /^\d{1,10}\.\d{2}$/);
  assert.ok(Number(item.eur) > 0);
  assert.equal(typeof item.from, 'boolean');
}
const apply = process.argv.includes('--apply');
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
const dryRun = new Error('dry-run');
try {
  await sql.begin(async tx => {
    await tx`SET LOCAL lock_timeout = '10s'`;
    await tx`SET LOCAL statement_timeout = '30s'`;
    await tx`SELECT pg_advisory_xact_lock(20261104, 1)`;
    const columns = await tx`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name IN ('equipment_price_eur','equipment_price_from')`;
    if (columns.length === 0) await tx.unsafe(migration);
    else assert.equal(columns.length, 2, 'Incomplete EUR price migration');
    const rows = await tx`SELECT id,slug,type,equipment_price_eur,equipment_price_from FROM public.products WHERE slug IN ${tx(manifest.items.map(item => item.slug))} FOR UPDATE`;
    assert.equal(rows.length, manifest.items.length, 'Some target products are missing');
    let changed = 0;
    const skipped = new Set();
    for (const item of manifest.items) {
      const row = rows.find(row => row.slug === item.slug);
      assert.equal(row.type, 'equipment');
      if (row.equipment_price_eur !== null) {
        if (docxImport) { skipped.add(item.slug); continue; }
        assert.equal(row.equipment_price_eur, item.eur, `Existing price differs for ${item.slug}; refusing to overwrite`);
        assert.equal(row.equipment_price_from, item.from, `Existing price type differs for ${item.slug}`);
        continue;
      }
      await tx`UPDATE public.products SET equipment_price_eur=${item.eur}, equipment_price_from=${item.from}, updated_at=GREATEST(clock_timestamp(),updated_at + interval '1 millisecond') WHERE id=${row.id}`;
      await tx`INSERT INTO public.audit_logs (entity_type,entity_id,action,summary,diff) VALUES ('product',${row.id},'update',${`Импорт цены EUR из ${docxImport ? 'DOCX' : 'ProCoffeeLine'}: ${item.slug}`},${tx.json({ source: item.source ?? manifest.source, sheet: manifest.sheet, cell: item.cell, table: item.table, row: item.row, sourceKzt: item.kzt, sourceTotalKzt: item.sourceTotalKzt, sourceQuantity: item.sourceQuantity, rateKztPerEur: manifest.rateKztPerEur, rateDate: manifest.rateDate, rateSource: manifest.rateSource, marketSources: item.marketSources, note: item.note ?? null, before: { equipmentPriceEur: row.equipment_price_eur, equipmentPriceFrom: row.equipment_price_from }, after: { equipmentPriceEur: item.eur, equipmentPriceFrom: item.from } })})`;
      changed++;
    }
    const verified = await tx`SELECT slug,equipment_price_eur,equipment_price_from FROM public.products WHERE slug IN ${tx(manifest.items.map(item => item.slug))} ORDER BY slug`;
    for (const row of verified) {
      if (skipped.has(row.slug)) {
        const before = rows.find(item => item.slug === row.slug);
        assert.equal(row.equipment_price_eur, before.equipment_price_eur);
        assert.equal(row.equipment_price_from, before.equipment_price_from);
        continue;
      }
      const expected = manifest.items.find(item => item.slug === row.slug);
      assert.equal(row.equipment_price_eur, expected.eur);
      assert.equal(row.equipment_price_from, expected.from);
    }
    console.table(verified);
    console.log(`${apply ? 'Apply' : 'Dry run'}: ${changed} prices updated; ${verified.length} verified; ${skipped.size} existing prices preserved.`);
    if (!apply) throw dryRun;
  });
  console.log('Transaction committed.');
} catch (error) {
  if (error === dryRun) console.log('Dry run rolled back (including schema changes).');
  else { console.error('Import failed:', error.code ?? '', error.message); process.exitCode = 1; }
} finally {
  await sql.end({ timeout: 5 });
}
