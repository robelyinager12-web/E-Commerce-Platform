/* eslint-disable @typescript-eslint/no-var-requires */
exports.shorthands = undefined;

/**
 * Classifieds marketplace schema: any user can post listings; buyers
 * contact sellers directly (no cart/checkout/orders/payments).
 */
exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createType("user_role", ["super_admin", "admin", "staff", "customer"]);
  pgm.createType("listing_condition", ["new", "used"]);
  pgm.createType("listing_status", ["active", "sold", "expired", "removed"]);

  // --- users ---
  pgm.createTable("users", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    first_name: { type: "varchar(100)", notNull: true },
    last_name: { type: "varchar(100)", notNull: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    password_hash: { type: "varchar(255)", notNull: true },
    phone: { type: "varchar(20)" },
    role: { type: "user_role", notNull: true, default: "customer" },
    is_active: { type: "boolean", notNull: true, default: true },
    is_email_verified: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("users", "email", { name: "idx_users_email" });

  // --- categories (supports subcategories via parent_id) ---
  pgm.createTable("categories", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "varchar(150)", notNull: true },
    slug: { type: "varchar(150)", notNull: true, unique: true },
    parent_id: { type: "uuid", references: "categories", onDelete: "SET NULL" },
    description: { type: "text" },
    image_url: { type: "varchar(500)" },
    is_active: { type: "boolean", notNull: true, default: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("categories", "slug", { name: "idx_categories_slug" });

  // --- listings (the core entity: any user's ad) ---
  pgm.createTable("listings", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    category_id: { type: "uuid", notNull: true, references: "categories" },
    title: { type: "varchar(255)", notNull: true },
    slug: { type: "varchar(255)", notNull: true, unique: true },
    description: { type: "text" },
    price: { type: "decimal(12,2)", notNull: true },
    condition: { type: "listing_condition", notNull: true, default: "used" },
    region: { type: "varchar(100)", notNull: true },
    city: { type: "varchar(100)", notNull: true },
    status: { type: "listing_status", notNull: true, default: "active" },
    views_count: { type: "integer", notNull: true, default: 0 },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("listings", "chk_listings_price", "CHECK (price >= 0)");
  pgm.createIndex("listings", "user_id", { name: "idx_listings_user_id" });
  pgm.createIndex("listings", "category_id", { name: "idx_listings_category_id" });
  pgm.createIndex("listings", "status", { name: "idx_listings_status" });
  pgm.createIndex("listings", ["region", "city"], { name: "idx_listings_region_city" });
  pgm.createIndex("listings", "title", { name: "idx_listings_title" });

  // --- listing_images ---
  pgm.createTable("listing_images", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    listing_id: { type: "uuid", notNull: true, references: "listings", onDelete: "CASCADE" },
    image_url: { type: "varchar(500)", notNull: true },
    is_primary: { type: "boolean", notNull: true, default: false },
    display_order: { type: "integer", notNull: true, default: 0 },
  });
  pgm.createIndex("listing_images", "listing_id", { name: "idx_listing_images_listing_id" });

  // --- saved_listings (replaces wishlist) ---
  pgm.createTable("saved_listings", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    listing_id: { type: "uuid", notNull: true, references: "listings", onDelete: "CASCADE" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("saved_listings", "uq_saved_listings_user_listing", {
    unique: ["user_id", "listing_id"],
  });

  // --- seller_reviews (replaces product reviews; rates the SELLER) ---
  pgm.createTable("seller_reviews", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    seller_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    reviewer_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    rating: { type: "smallint", notNull: true },
    comment: { type: "text" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("seller_reviews", "chk_seller_reviews_rating", "CHECK (rating BETWEEN 1 AND 5)");
  pgm.addConstraint("seller_reviews", "uq_seller_reviews_seller_reviewer", {
    unique: ["seller_id", "reviewer_id"],
  });
  pgm.createIndex("seller_reviews", "seller_id", { name: "idx_seller_reviews_seller_id" });

  // --- listing_reports (moderation: users flag bad listings) ---
  pgm.createTable("listing_reports", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    listing_id: { type: "uuid", notNull: true, references: "listings", onDelete: "CASCADE" },
    reporter_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    reason: { type: "varchar(100)", notNull: true },
    details: { type: "text" },
    status: { type: "varchar(50)", notNull: true, default: "pending" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("listing_reports", "listing_id", { name: "idx_listing_reports_listing_id" });
  pgm.createIndex("listing_reports", "status", { name: "idx_listing_reports_status" });

  // --- notifications (kept: "your listing was approved", etc.) ---
  pgm.createTable("notifications", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    type: { type: "varchar(50)", notNull: true },
    title: { type: "varchar(255)", notNull: true },
    message: { type: "text", notNull: true },
    is_read: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("notifications", "user_id", { name: "idx_notifications_user_id" });

  // --- audit_logs (kept: admin moderation actions) ---
  pgm.createTable("audit_logs", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", references: "users", onDelete: "SET NULL" },
    action: { type: "varchar(100)", notNull: true },
    entity_type: { type: "varchar(50)" },
    entity_id: { type: "uuid" },
    metadata: { type: "jsonb" },
    ip_address: { type: "varchar(45)" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("audit_logs", ["entity_type", "entity_id"], { name: "idx_audit_logs_entity" });
};

exports.down = (pgm) => {
  pgm.dropTable("audit_logs");
  pgm.dropTable("notifications");
  pgm.dropTable("listing_reports");
  pgm.dropTable("seller_reviews");
  pgm.dropTable("saved_listings");
  pgm.dropTable("listing_images");
  pgm.dropTable("listings");
  pgm.dropTable("categories");
  pgm.dropTable("users");

  pgm.dropType("listing_status");
  pgm.dropType("listing_condition");
  pgm.dropType("user_role");
};