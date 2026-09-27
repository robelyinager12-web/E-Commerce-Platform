import bcrypt from "bcryptjs";
import { pool, withTransaction } from "../../config/database";
import { logger } from "../../config/logger";

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

    // --- A regular seller user, for sample listings ---
    const sellerPasswordHash = await bcrypt.hash("SecurePass123", 12);
    const sellerResult = await client.query<{ id: string }>(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, is_active, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, 'customer', true, true)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ["Abebe", "Kebede", "abebe.seller@example.com", sellerPasswordHash, "+251911223344"]
    );
    const sellerId = sellerResult.rows[0].id;
    logger.info("Sample seller user ensured: abebe.seller@example.com");

    // --- Categories (Jiji-style top-level + one subcategory example) ---
    const categories = [
      { name: "Vehicles", slug: "vehicles", description: "Cars, motorcycles, and parts" },
      { name: "Property", slug: "property", description: "Houses and land for sale or rent" },
      { name: "Mobile Phones & Tablets", slug: "mobile-phones-tablets", description: "Phones, tablets, and accessories" },
      { name: "Electronics", slug: "electronics", description: "TVs, computers, and appliances" },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and accessories" },
      { name: "Home & Furniture", slug: "home-furniture", description: "Furniture and home goods" },
      { name: "Jobs", slug: "jobs", description: "Job vacancies and services" },
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

    // Subcategory example: Cars under Vehicles
    const carsResult = await client.query(
      `INSERT INTO categories (name, slug, description, parent_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug`,
      ["Cars", "cars", "Passenger cars", categoryIds["vehicles"]]
    );
    categoryIds["cars"] = carsResult.rows[0].id;

    // --- Sample listings ---
    const listings = [
      {
        title: "Toyota Corolla 2015, Excellent Condition",
        slug: "toyota-corolla-2015-excellent-condition",
        description: "Well maintained, single owner, low mileage. Serious buyers only.",
        price: 950000,
        condition: "used",
        region: "Addis Ababa",
        city: "Bole",
        category: "cars",
        image: "https://picsum.photos/seed/corolla-2015/600/600",
      },
      {
        title: "iPhone 13 Pro, 256GB",
        slug: "iphone-13-pro-256gb",
        description: "Barely used, comes with original box and charger.",
        price: 45000,
        condition: "used",
        region: "Addis Ababa",
        city: "Bole",
        category: "mobile-phones-tablets",
        image: "https://picsum.photos/seed/iphone13pro/600/600",
      },
      {
        title: "2-Bedroom Apartment for Rent",
        slug: "2-bedroom-apartment-for-rent",
        description: "Furnished apartment near Bole, water and electricity included.",
        price: 25000,
        condition: "used",
        region: "Addis Ababa",
        city: "Bole",
        category: "property",
        image: "https://picsum.photos/seed/apartment-bole/600/600",
      },
      {
        title: "Samsung 55-inch Smart TV",
        slug: "samsung-55-inch-smart-tv",
        description: "Brand new, sealed box, with warranty card.",
        price: 32000,
        condition: "new",
        region: "Oromia",
        city: "Adama",
        category: "electronics",
        image: "https://picsum.photos/seed/samsung-tv/600/600",
      },
    ];

    for (const listing of listings) {
      const result = await client.query<{ id: string }>(
        `INSERT INTO listings (user_id, category_id, title, slug, description, price, condition, region, city, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7::listing_condition, $8, $9, 'active')
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
         RETURNING id`,
        [
          sellerId,
          categoryIds[listing.category],
          listing.title,
          listing.slug,
          listing.description,
          listing.price,
          listing.condition,
          listing.region,
          listing.city,
        ]
      );
      const listingId = result.rows[0].id;

      await client.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary, display_order)
         SELECT $1::uuid, $2::varchar, true, 0
         WHERE NOT EXISTS (
           SELECT 1 FROM listing_images WHERE listing_id = $1::uuid AND is_primary = true
         )`,
        [listingId, listing.image]
      );
    }
    logger.info(`Seeded ${listings.length} sample listings`);
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