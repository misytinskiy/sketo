import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { asc, desc, eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

async function main() {
  loadEnvConfig(process.cwd());
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
  try {
    const database = drizzle(client, { schema });
    await database.transaction(async (db) => {
      const { products, productTranslations, productDetails, productFeatures, productImages } = schema;
      const [sample] = await db.select({ id: products.id }).from(products).limit(1);
      if (!sample) { console.log("No products available for measurement."); return; }
      const oldRead = async () => {
        const product = await db.query.products.findFirst({ where: eq(products.id, sample.id) });
        if (!product) throw new Error("Sample missing");
        const [translations, details, features, images] = await Promise.all([
          db.select().from(productTranslations).where(eq(productTranslations.productId, product.id)).orderBy(asc(productTranslations.locale)),
          db.select().from(productDetails).where(eq(productDetails.productId, product.id)).orderBy(asc(productDetails.locale), asc(productDetails.kind), asc(productDetails.sortOrder), asc(productDetails.id)),
          db.select().from(productFeatures).where(eq(productFeatures.productId, product.id)).orderBy(asc(productFeatures.locale), asc(productFeatures.sortOrder), asc(productFeatures.id)),
          db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder), asc(productImages.id)),
        ]);
        return { ...product, translations, details, features, images };
      };
      const newRead = () => db.query.products.findFirst({ where: eq(products.id, sample.id), with: {
        translations: { orderBy: [asc(productTranslations.locale)] },
        details: { orderBy: [asc(productDetails.locale), asc(productDetails.kind), asc(productDetails.sortOrder), asc(productDetails.id)] },
        features: { orderBy: [asc(productFeatures.locale), asc(productFeatures.sortOrder), asc(productFeatures.id)] },
        images: { orderBy: [desc(productImages.isPrimary), asc(productImages.sortOrder), asc(productImages.id)] },
      } });
      const previous = await oldRead();
      const current = await newRead();
      if (JSON.stringify(previous) !== JSON.stringify(current)) throw new Error("Read results differ");
      const oldMs: number[] = [], newMs: number[] = [];
      for (let i = 0; i < 5; i++) {
        for (const [run, durations] of (i % 2 ? [[newRead, newMs], [oldRead, oldMs]] : [[oldRead, oldMs], [newRead, newMs]]) as Array<[() => Promise<unknown>, number[]]>) {
          const start = performance.now(); await run(); durations.push(performance.now() - start);
        }
      }
      const median = (values: number[]) => Math.round([...values].sort((a, b) => a - b)[2]);
      console.log(JSON.stringify({ readOnly: true, resultsMatch: true, samples: 5, previousQueries: 5, currentQueries: 1, previousMedianMs: median(oldMs), currentMedianMs: median(newMs) }));
    }, { accessMode: "read only" });
  } finally { await client.end({ timeout: 1 }); }
}
main().catch((error) => {
  console.error("Benchmark failed:", error.code ?? error.cause?.code ?? error.message);
  process.exitCode = 1;
});
