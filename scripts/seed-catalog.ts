import "dotenv/config";

import { catalogItems } from "../app/catalog/catalog-data";
import { equipmentItems } from "../app/catalog/equipment/equipment-data";
import { createAdminClient } from "../lib/supabase/admin";
import type { ProductStatus } from "../lib/db/schema";

const LOCALES = ["ru", "en"] as const;

function parsePrice(price: string) {
  const match = price.match(/^([A-Z]{3})\s*([\d,]+)/);

  if (!match) {
    return {
      priceDisplay: price,
      priceAmount: null,
      priceCurrency: "KZT",
    };
  }

  return {
    priceDisplay: price,
    priceAmount: Number.parseInt(match[2].replace(/,/g, ""), 10),
    priceCurrency: match[1],
  };
}

function mapEquipmentStatus(statusLabel: string): ProductStatus {
  const normalized = statusLabel.toLowerCase();

  if (
    normalized.includes("нет в наличии") ||
    normalized.includes("out of stock")
  ) {
    return "out_of_stock";
  }

  if (
    normalized.includes("под заказ") ||
    normalized.includes("on request") ||
    normalized.includes("preorder")
  ) {
    return "preorder";
  }

  return "in_stock";
}

async function clearCatalog(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase
    .from("products")
    .delete()
    .in("type", ["coffee", "equipment"]);

  if (error) {
    throw new Error(`Failed to clear catalog: ${error.message}`);
  }
}

async function seedCoffee(
  supabase: ReturnType<typeof createAdminClient>,
) {
  for (const [index, item] of catalogItems.entries()) {
    const price = parsePrice(item.price);
    const filters = item.filters.filter((filter) => filter !== "all");

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        slug: item.slug,
        type: "coffee",
        status: "in_stock",
        name: item.translations.ru.name,
        price_display: price.priceDisplay,
        price_amount: price.priceAmount,
        price_currency: price.priceCurrency,
        image_url: item.image,
        filters,
        sort_order: index,
        editorial_state: "published",
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw new Error(
        `Failed to insert coffee "${item.slug}": ${productError?.message}`,
      );
    }

    const translations = LOCALES.map((locale) => ({
      product_id: product.id,
      locale,
      name: item.translations[locale].name,
      size: item.translations[locale].size,
      notes: item.translations[locale].notes,
      description: item.translations[locale].description,
    }));

    const { error: translationsError } = await supabase
      .from("product_translations")
      .insert(translations);

    if (translationsError) {
      throw new Error(
        `Failed to insert coffee translations "${item.slug}": ${translationsError.message}`,
      );
    }

    const details = LOCALES.flatMap((locale) =>
      item.translations[locale].details.map((detail, detailIndex) => ({
        product_id: product.id,
        locale,
        kind: "detail" as const,
        label: detail.label,
        value: detail.value,
        sort_order: detailIndex,
      })),
    );

    const { error: detailsError } = await supabase
      .from("product_details")
      .insert(details);

    if (detailsError) {
      throw new Error(
        `Failed to insert coffee details "${item.slug}": ${detailsError.message}`,
      );
    }

    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: product.id,
      url: item.image,
      sort_order: 0,
      is_primary: true,
    });

    if (imageError) {
      throw new Error(
        `Failed to insert coffee image "${item.slug}": ${imageError.message}`,
      );
    }

    console.log(`  ✓ coffee: ${item.slug}`);
  }
}

async function seedEquipment(
  supabase: ReturnType<typeof createAdminClient>,
) {
  for (const [index, item] of equipmentItems.entries()) {
    const status = mapEquipmentStatus(item.translations.ru.status);

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        slug: item.slug,
        type: "equipment",
        status,
        name: item.name,
        image_url: item.image,
        brand: item.brand,
        equipment_type: item.type,
        sort_order: index,
        editorial_state: "published",
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw new Error(
        `Failed to insert equipment "${item.slug}": ${productError?.message}`,
      );
    }

    const translations = LOCALES.map((locale) => ({
      product_id: product.id,
      locale,
      category: item.translations[locale].category,
      status_label: item.translations[locale].status,
      description: item.translations[locale].description,
    }));

    const { error: translationsError } = await supabase
      .from("product_translations")
      .insert(translations);

    if (translationsError) {
      throw new Error(
        `Failed to insert equipment translations "${item.slug}": ${translationsError.message}`,
      );
    }

    const details = LOCALES.flatMap((locale) => [
      ...item.translations[locale].details.map((detail, detailIndex) => ({
        product_id: product.id,
        locale,
        kind: "detail" as const,
        label: detail.label,
        value: detail.value,
        sort_order: detailIndex,
      })),
      ...item.translations[locale].specifications.map((spec, specIndex) => ({
        product_id: product.id,
        locale,
        kind: "specification" as const,
        label: spec.label,
        value: spec.value,
        sort_order: specIndex,
      })),
    ]);

    const { error: detailsError } = await supabase
      .from("product_details")
      .insert(details);

    if (detailsError) {
      throw new Error(
        `Failed to insert equipment details "${item.slug}": ${detailsError.message}`,
      );
    }

    const features = LOCALES.flatMap((locale) =>
      item.translations[locale].features.map((feature, featureIndex) => ({
        product_id: product.id,
        locale,
        title: feature.title,
        description: feature.description,
        sort_order: featureIndex,
      })),
    );

    const { error: featuresError } = await supabase
      .from("product_features")
      .insert(features);

    if (featuresError) {
      throw new Error(
        `Failed to insert equipment features "${item.slug}": ${featuresError.message}`,
      );
    }

    const images = item.images.map((url, imageIndex) => ({
      product_id: product.id,
      url,
      sort_order: imageIndex,
      is_primary: url === item.image,
    }));

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(images);

    if (imagesError) {
      throw new Error(
        `Failed to insert equipment images "${item.slug}": ${imagesError.message}`,
      );
    }

    console.log(`  ✓ equipment: ${item.slug}`);
  }
}

async function main() {
  const shouldReset = process.argv.includes("--reset");
  const supabase = createAdminClient();

  console.log("Sketo catalog seed");
  console.log("==================");

  if (shouldReset) {
    console.log("Clearing existing catalog...");
    await clearCatalog(supabase);
  }

  console.log(`Seeding ${catalogItems.length} coffee items...`);
  await seedCoffee(supabase);

  console.log(`Seeding ${equipmentItems.length} equipment items...`);
  await seedEquipment(supabase);

  console.log("");
  console.log("Done.");
  console.log(`Total: ${catalogItems.length + equipmentItems.length} products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
