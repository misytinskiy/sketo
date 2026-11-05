import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
const rollback = new Error('rollback-verification');
try {
  await sql.begin(async tx => {
    await tx`SET LOCAL statement_timeout = '8s'`;
    const owner = randomUUID();
    const other = randomUUID();
    // Transaction-local fixtures; the transaction is always rolled back.
    await tx`INSERT INTO auth.users (id) VALUES (${owner}::uuid), (${other}::uuid)`;
    await tx`INSERT INTO public.customer_profiles (user_id, full_name, phone) VALUES (${other}::uuid, 'RLS fixture', '+77000000000')`;
    await tx`SET LOCAL ROLE authenticated`;
    await tx`SELECT set_config('request.jwt.claim.sub', ${owner}, true)`;
    assert.equal((await tx`SELECT * FROM public.customer_profiles`).length, 0);
    await tx`INSERT INTO public.customer_profiles (user_id, full_name, phone) VALUES (${owner}::uuid, 'Own fixture', '+77000000001')`;
    assert.equal((await tx`SELECT * FROM public.customer_profiles`).length, 1);
    assert.equal((await tx`UPDATE public.customer_profiles SET full_name = 'Forbidden' WHERE user_id = ${other}::uuid RETURNING user_id`).length, 0);
    await assert.rejects(tx.savepoint(async sp => {
      await sp`UPDATE public.customer_profiles SET user_id = ${randomUUID()}::uuid WHERE user_id = ${owner}::uuid`;
    }), error => error.code === '42501');
    await tx`UPDATE public.customer_profiles SET account_type = 'business', company_name = 'Test company', bin = '123456789012' WHERE user_id = ${owner}::uuid`;
    assert.equal((await tx`SELECT account_type FROM public.customer_profiles`)[0].account_type, 'business');
    await tx`SET LOCAL ROLE anon`;
    await assert.rejects(tx.savepoint(async sp => { await sp`SELECT * FROM public.customer_profiles`; }), error => error.code === '42501');
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
  console.log('PASS: own read/write, B2B save, cross-account read/update/ownership denial, anonymous denial. Fixtures rolled back.');
} finally { await sql.end({ timeout: 5 }); }
