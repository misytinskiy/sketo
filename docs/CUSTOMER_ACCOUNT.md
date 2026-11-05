# Customer account — iteration 1

Customer routes live under `/account`; staff routes and their membership checks remain separate.
Registration, email confirmation, sign-in/out, recovery, email changes and B2C/B2B contact details use Supabase Auth and RLS.

## Setup

1. Apply `supabase/migrations/20261027010000_customer_profiles.sql` before deploying these routes.
2. Set `SITE_URL` to the site's public origin (development defaults to `http://localhost:3000`).
3. Enable email/password signup and email confirmation in Supabase Auth. Configure SMTP for production delivery.
4. Add exact redirect URLs for each supported origin to Supabase Auth: `/auth/customer` and `/auth/customer?recovery=1`. Keep the existing staff `/auth/recovery` URL.
5. Use the standard PKCE email confirmation/recovery flow. Open the email in the browser that requested it. Custom email templates must retain the confirmation URL and redirect parameters.
6. Enable secure email change (confirmation at old and new addresses). The application also asks for the current password.

No production Auth settings are changed by the code. The profile is created on the first successful profile save, allowing interrupted onboarding to resume.
The migration was applied to the configured Supabase project on 2026-10-27. Public Auth settings confirm email signup and email confirmation are enabled. SMTP delivery and redirect allowlists still require an end-to-end email check.
Self-declared business type confers no wholesale or loyalty rights. Phone numbers are unverified contact information, not proof of ownership of a Poster client. Do not match existing Poster balances by this field without verification.
Profile reads/writes use the signed-in Supabase client, not a service key; RLS restricts ownership. Company details are in the same row so changing buyer type is atomic. Email comes from Auth to avoid stale copies.

## Acceptance checks

Automated checks: 38 tests for customer auth/profile, staff auth/recovery and cart passed; TypeScript and targeted ESLint passed. `node scripts/verify-customer-rls.mjs` verified real database ownership isolation, B2B persistence and anonymous denial; all fixture writes were rolled back.
Production build passed with `SITE_URL=http://localhost:3000 npm run build -- --webpack` (the sandboxed Turbopack build stalled and was stopped). Local HTTP checks: login/register return 200, anonymous `/account` returns 307 to `/account/login`. This does not replace the email round-trip and visual mobile checks below.

- Anonymous `/account` redirects to `/account/login`; direct anonymous writes fail.
- Register, confirm email, sign in, save a personal profile, reload and sign out.
- Switch to business, save company/BIN, reload; return to personal and verify company fields clear.
- Use a second account: neither profile may read or edit the other through the REST API.
- Request recovery, follow the email in the same browser, reset once; invalid and expired links cannot change a password.
- Change email using the current password; confirm the required emails and sign in with the new address.
- Verify mobile layout and RU/EN/KZ; existing staff login and recovery remain usable.

Orders are an explicit empty state until iteration 3. No fabricated balances, orders or repeat-order buttons are displayed. Iteration 2: inspect Poster access and product/client mapping; iteration 3: persistent orders and reliable forwarding; loyalty and USD pricing await business rules and prices.
