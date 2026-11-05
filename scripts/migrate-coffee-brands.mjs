import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local', quiet: true });
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
const migration = readFileSync(new URL('../supabase/migrations/20261105010000_coffee_brands.sql', import.meta.url), 'utf8');
const apply = process.argv.includes('--apply');
const dryRun = new Error('dry-run');
try {
  await sql.begin(async tx => {
    await tx`SET LOCAL lock_timeout = '10s'`;
    await tx`SET LOCAL statement_timeout = '30s'`;
    await tx.unsafe(migration);
    console.log(JSON.stringify(await tx`SELECT coffee_brand, count(*)::int AS count FROM public.products WHERE type = 'coffee' GROUP BY coffee_brand ORDER BY coffee_brand`));
    if (!apply) throw dryRun;
  });
  console.log('Coffee brand migration applied.');
} catch (error) {
  if (error !== dryRun) throw error;
  console.log('Dry run rolled back.');
} finally { await sql.end(); }
