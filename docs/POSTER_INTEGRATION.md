# Poster integration — iteration 2

Read-only connection verified on 2026-10-27 against account `sketo`, currency `KZT`.
Credentials are taken from `.env.local`, then `.env`, and are never included in diagnostic output.
`POSTER_ACCOUNT` accepts `sketo` or `https://sketo.joinposter.com/` (including an admin path).
The API destination is fixed to `https://joinposter.com/api/`; the account is validated against `settings.getAllSettings.COMPANY_ID` before inspecting the catalog.

## Implemented

- `lib/poster/client.ts`: bounded, uncached read-only requests, redirects rejected, sanitized errors, response shape checks, account/token identity check.
- `lib/poster/server.ts`: server-only import for Next.js callers.
- `node --import tsx scripts/inspect-poster.ts`: locations, categories, groups and catalog counts. Add `--products` for product and modifier details.
- `node --import tsx scripts/compare-poster-catalog.ts`: read-only comparison with the website database. Add `--details` to print all SKU-in-name candidates.
- `tests/poster-client.test.mjs`: account URL validation, trusted token destination, account mismatch, secret redaction, read method/response checks.

No orders or customers were created in Poster. No prices, balances, groups or mappings were changed. Website runtime is not yet connected to these read methods; this is the transport and diagnostic foundation.

## Observed account structure

| Location | spot_id | Attached storage IDs |
| --- | --- | --- |
| Sketo Astana | 1 | 4 (shop products), 5 (bar inventory), 6 (B2B equipment) |
| Sketo Almaty | 2 | 7 (shop products), 8 (inventory) |

The owner confirmed on 2026-10-27 that website orders should initially go only to Sketo Astana (`spot_id=1`). Almaty will be added later. This is recorded in `lib/poster/routing.ts`; the diagnostic script validates that this destination exists in the configured account. Delivery city must not automatically route to Almaty. Actual order forwarding is still pending implementation.
Poster currently returns 284 products/dishes, 107 with dish modifier groups, and zero populated base-product `product_code` fields.
The website has 26 published coffee cards, 36 equipment cards, 92 accessory cards and 148 active accessory variants.

Existing customer groups:

| Group | ID | API loyalty_type | Percentage |
| --- | --- | --- | --- |
| Sketo Family | 1 | 1 (bonus) | 8 |
| Сотрудники 0% | 3 | 1 (bonus) | 0 |

These are observed settings, not approval to apply them to website customers or B2B. Loyalty remains pending business rules.

## Catalog correspondence

Strict name/SKU-field comparisons produce candidates for only three website coffee cards. This does **not** mean other products are absent: naming, language and packaging differ, and SKUs can be embedded in modifier names.
SKU token matching inside modifier names finds one candidate for each of 73 accessory variants, zero ambiguous matches, and no candidate for 75 variants. Candidates have not been activated; they require colour, size, visibility and price checks.

Examples for review:

| Website SKU | Poster product_id | dish_modification_id | Poster label |
| --- | --- | --- | --- |
| P2092 | 419 | 1245 | P2092 питчер 350мл нержа |
| P2095 | 419 | 1244 | P2095 питчер 350мл черный |
| P2017 | 419 | 1246 | P2017 питчер 600мл черная |
| P2019 | 419 | 1247 | P2019 питчер 600мл сатин |
| P2011 | 419 | 1251 | P2011 питчер 600мл нержа |

The `Latino Profile 2.0` name matches modifiers under three different parent products (243, 178, 162), including beverage contexts. Never select a mapping using name alone. Two Massimo drip names match modifiers under parent 241; pack/unit pricing still needs review.

MUVNA products include generic parents such as `Термосы MUVNA` (418), whose base price is zero; the actual item and price live in a dish modifier. Do not interpret zero parent price as a free item.
For example, parent 418 has modifiers 1231 (`BZ2614`, black 260ml, 14,000 KZT) and 1232 (`BZ2615`, black 450ml, 15,500 KZT). These prices are observations, not approved replacement prices for the site.

## Next implementation boundaries

1. Use the approved Astana destination (`spot_id=1`) when implementing forwarding. Add Almaty only in a later agreed phase.
2. Review mappings for each purchasable `(kind, slug, variantId, volumeId)`; preserve parent ID and modifier kind. Product modifications use `modificator_id`; dish modifications use the `modification` payload. They are different APIs.
3. Confirm which system controls checkout price. Base/spot product prices are minor units, dish modifier prices are major currency units; normalize explicitly.
4. Persist website orders, verify catalog selections/prices server-side, then forward unpaid orders using `incomingOrders.createIncomingOrder`. Omit `payment` for unpaid orders.
5. Before a real test order, resolve an exact mapped test item. Routing is confirmed as Astana. There is no sandbox write test in this iteration.
6. Customer link ownership must be verified. A phone typed into a profile is not proof of ownership of an existing Poster customer; do not expose balances/history using phone matching alone.
7. Automatic accepted/canceled/closed status updates require a webhook strategy. Poster documentation describes a developer application for webhook integration; a personal token alone has not established that capability. Earlier advice that developer apps are only needed for public marketplace apps was too broad.

## Sources

- [Poster website integration guide](https://github.com/joinposter/docs/blob/master/en/market/guidelines/e-commerce.md)
- [Account settings](https://github.com/joinposter/docs/blob/master/en/web/settings/getAllSettings.md)
- [Locations](https://github.com/joinposter/docs/blob/master/en/web/access/getSpots.md)
- [Products and modifiers](https://github.com/joinposter/docs/blob/master/en/web/menu/getProducts.md)
- [Customer groups](https://github.com/joinposter/docs/blob/master/en/web/clients/getGroups.md)
- [Incoming orders](https://github.com/joinposter/docs/blob/master/en/web/incomingOrders/createIncomingOrder.md)
