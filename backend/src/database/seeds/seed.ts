import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../../config/database";
import { logger } from "../../config/logger";

/**
 * Seeds the database with a baseline admin user, product categories,
 * sample products with variants/images, and a starter coupon so the
 * app has real data to develop and test against locally.
 *
 * Idempotent: safe to run multiple times. Uses ON CONFLICT DO NOTHING
 * on unique columns (email, slug, sku, code) so re-running the seed
 * will not create duplicates or throw errors.
 */
async function seed(): Promise<void> {
  logger.info("Starting database seed...");

  await withTransaction(async (client) => {
    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@ecommerce-platform.local";
    const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 12);

    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, is_email_verified)
       VALUES ($1, $2, $3, $4, 'super_admin', true, true)
       ON CONFLICT (email) DO NOTHING`,
      ["Store", "Admin", adminEmail, adminPasswordHash]
    );
    logger.info(`Admin user ensured: ${adminEmail}`);

    // --- Categories ---
    const categories = [
      { name: "Electronics", slug: "electronics", description: "Phones, laptops, and gadgets" },
      { name: "Clothing", slug: "clothing", description: "Men's and women's apparel" },
      { name: "Home & Kitchen", slug: "home-kitchen", description: "Furniture, appliances, and decor" },
      { name: "Books", slug: "books", description: "Fiction, non-fiction, and educational" },
    ];

    const categoryIds: Record<string, string> = {};

    for (const cat of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.description]
      );
      categoryIds[result.rows[0].slug] = result.rows[0].id;
    }
    logger.info(`Seeded ${categories.length} categories`);

    // --- Subcategory example (Smartphones under Electronics) ---
    const smartphonesResult = await client.query(
      `INSERT INTO categories (name, slug, description, parent_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug`,
      ["Smartphones", "smartphones", "Mobile phones and accessories", categoryIds["electronics"]]
    );
    categoryIds["smartphones"] = smartphonesResult.rows[0].id;

    // --- Sample products ---
    const products = [
      {
        name: "Aurora Wireless Headphones",
        slug: "aurora-wireless-headphones",
        description: "Over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
        base_price: 89.99,
        sku: "SKU-AUD-1001",
        stock_quantity: 150,
        category: "electronics",
        image: "https://picsum.photos/seed/aurora-headphones/600/600",
        variants: [
          { variant_name: "Color", variant_value: "Black", price_adjustment: 0, stock_quantity: 80 },
          { variant_name: "Color", variant_value: "White", price_adjustment: 0, stock_quantity: 70 },
        ],
      },
      {
        name: "Nimbus Smartphone 128GB",
        slug: "nimbus-smartphone-128gb",
        description: "6.5-inch display, 128GB storage, triple camera system.",
        base_price: 499.0,
        sku: "SKU-PHN-2001",
        stock_quantity: 60,
        category: "smartphones",
        image: "https://picsum.photos/seed/nimbus-phone/600/600",
        variants: [
          { variant_name: "Storage", variant_value: "128GB", price_adjustment: 0, stock_quantity: 40 },
          { variant_name: "Storage", variant_value: "256GB", price_adjustment: 80, stock_quantity: 20 },
        ],
      },
      {
        name: "Classic Cotton T-Shirt",
        slug: "classic-cotton-t-shirt",
        description: "100% organic cotton, breathable everyday t-shirt.",
        base_price: 19.99,
        sku: "SKU-CLT-3001",
        stock_quantity: 300,
        category: "clothing",
        image: "https://picsum.photos/seed/cotton-tshirt/600/600",
        variants: [
          { variant_name: "Size", variant_value: "S", price_adjustment: 0, stock_quantity: 100 },
          { variant_name: "Size", variant_value: "M", price_adjustment: 0, stock_quantity: 100 },
          { variant_name: "Size", variant_value: "L", price_adjustment: 0, stock_quantity: 100 },
        ],
      },
      {
        name: "Ember Stainless Steel Cookware Set",
        slug: "ember-stainless-steel-cookware-set",
        description: "10-piece stainless steel cookware set, dishwasher safe.",
        base_price: 149.5,
        sku: "SKU-HOM-4001",
        stock_quantity: 40,
        category: "home-kitchen",
        image: "https://picsum.photos/seed/ember-cookware/600/600",
        variants: [],
      },
      {
        name: "The Long Horizon (Novel)",
        slug: "the-long-horizon-novel",
        description: "A gripping science-fiction novel about humanity's first interstellar colony.",
        base_price: 14.99,
        sku: "SKU-BK-5001",
        stock_quantity: 200,
        category: "books",
        image: "https://picsum.photos/seed/long-horizon-book/600/600",
        variants: [],
      },
    ];

    for (const product of products) {
      const productResult = await client.query(
        `INSERT INTO products (name, slug, description, base_price, sku, stock_quantity, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           base_price = EXCLUDED.base_price
         RETURNING id`,
        [
          product.name,
          product.slug,
          product.description,
          product.base_price,
          product.sku,
          product.stock_quantity,
        ]
      );
      const productId = productResult.rows[0].id;

      // Link to category
      await client.query(
        `INSERT INTO product_categories (product_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [productId, categoryIds[product.category]]
      );

      // Primary image
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
         SELECT $1::uuid, $2::varchar, true, 0
         WHERE NOT EXISTS (
           SELECT 1 FROM product_images WHERE product_id = $1::uuid AND is_primary = true
         )`,
        [productId, product.image]
      );

      // Variants
      // Note: parameters are explicitly cast (::uuid, ::varchar, etc.) because
      // mixing a bare "SELECT $n" with a "WHERE NOT EXISTS" subquery that also
      // references the same $n confuses PostgreSQL's parameter type inference
      // ("inconsistent types deduced for parameter") without the casts.
      for (const variant of product.variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, variant_name, variant_value, price_adjustment, stock_quantity)
           SELECT $1::uuid, $2::varchar, $3::varchar, $4::decimal, $5::integer
           WHERE NOT EXISTS (
             SELECT 1 FROM product_variants
             WHERE product_id = $1::uuid AND variant_name = $2::varchar AND variant_value = $3::varchar
           )`,
          [productId, variant.variant_name, variant.variant_value, variant.price_adjustment, variant.stock_quantity]
        );
      }
    }
    logger.info(`Seeded ${products.length} products with categories, images, and variants`);

    // --- Starter coupon ---
    await client.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active)
       VALUES ($1, 'percentage', 10, 25.00, 100, NOW(), NOW() + INTERVAL '90 days', true)
       ON CONFLICT (code) DO NOTHING`,
      ["WELCOME10"]
    );
    logger.info("Seeded starter coupon: WELCOME10 (10% off, min order $25)");
  });

  logger.info("Database seed completed successfully.");
}

seed()
  .then(() => pool.end())
  .catch(async (err) => {
    logger.error(`Seed failed: ${err.message}`);
    await pool.end();
    process.exit(1);
  });