/* eslint-disable @typescript-eslint/no-var-requires */
exports.shorthands = undefined;

/**
 * Creates the full initial schema for the E-Commerce Platform:
 * extensions, enums, all tables, foreign keys, indexes, and check
 * constraints as designed in Phase 5.
 */
exports.up = (pgm) => {
  // --- Extensions ---
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  // --- Enums ---
  pgm.createType("user_role", ["super_admin", "admin", "staff", "customer"]);
  pgm.createType("order_status", [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]);
  pgm.createType("payment_status", ["pending", "succeeded", "failed", "refunded"]);
  pgm.createType("discount_type", ["percentage", "fixed"]);

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

  // --- addresses ---
  pgm.createTable("addresses", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    label: { type: "varchar(50)" },
    street: { type: "varchar(255)", notNull: true },
    city: { type: "varchar(100)", notNull: true },
    state: { type: "varchar(100)" },
    postal_code: { type: "varchar(20)", notNull: true },
    country: { type: "varchar(100)", notNull: true },
    is_default: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("addresses", "user_id", { name: "idx_addresses_user_id" });

  // --- categories (self-referencing for subcategories) ---
  pgm.createTable("categories", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "varchar(150)", notNull: true },
    slug: { type: "varchar(150)", notNull: true, unique: true },
    parent_id: {
      type: "uuid",
      references: "categories",
      onDelete: "SET NULL",
    },
    description: { type: "text" },
    image_url: { type: "varchar(500)" },
    is_active: { type: "boolean", notNull: true, default: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("categories", "slug", { name: "idx_categories_slug" });

  // --- products ---
  pgm.createTable("products", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "varchar(255)", notNull: true },
    slug: { type: "varchar(255)", notNull: true, unique: true },
    description: { type: "text" },
    base_price: { type: "decimal(10,2)", notNull: true },
    sku: { type: "varchar(100)", notNull: true, unique: true },
    stock_quantity: { type: "integer", notNull: true, default: 0 },
    low_stock_threshold: { type: "integer", notNull: true, default: 5 },
    is_active: { type: "boolean", notNull: true, default: true },
    average_rating: { type: "decimal(2,1)", notNull: true, default: 0.0 },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("products", "chk_products_base_price", "CHECK (base_price >= 0)");
  pgm.addConstraint("products", "chk_products_stock_quantity", "CHECK (stock_quantity >= 0)");
  pgm.createIndex("products", "slug", { name: "idx_products_slug" });
  pgm.createIndex("products", "sku", { name: "idx_products_sku" });
  pgm.createIndex("products", "name", { name: "idx_products_name" });

  // --- product_categories (junction) ---
  pgm.createTable("product_categories", {
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    category_id: {
      type: "uuid",
      notNull: true,
      references: "categories",
      onDelete: "CASCADE",
    },
  });
  pgm.addConstraint("product_categories", "pk_product_categories", {
    primaryKey: ["product_id", "category_id"],
  });

  // --- product_variants ---
  pgm.createTable("product_variants", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    variant_name: { type: "varchar(100)", notNull: true },
    variant_value: { type: "varchar(100)", notNull: true },
    price_adjustment: { type: "decimal(10,2)", notNull: true, default: 0.0 },
    stock_quantity: { type: "integer", notNull: true, default: 0 },
    sku_suffix: { type: "varchar(50)" },
  });
  pgm.createIndex("product_variants", "product_id", { name: "idx_variants_product_id" });

  // --- product_images ---
  pgm.createTable("product_images", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    image_url: { type: "varchar(500)", notNull: true },
    is_primary: { type: "boolean", notNull: true, default: false },
    display_order: { type: "integer", notNull: true, default: 0 },
  });
  pgm.createIndex("product_images", "product_id", { name: "idx_images_product_id" });

  // --- cart ---
  pgm.createTable("cart", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      references: "users",
      onDelete: "CASCADE",
    },
    session_id: { type: "varchar(255)" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });

  // --- cart_items ---
  pgm.createTable("cart_items", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    cart_id: {
      type: "uuid",
      notNull: true,
      references: "cart",
      onDelete: "CASCADE",
    },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
    },
    variant_id: {
      type: "uuid",
      references: "product_variants",
    },
    quantity: { type: "integer", notNull: true },
    price_at_add: { type: "decimal(10,2)", notNull: true },
  });
  pgm.addConstraint("cart_items", "chk_cart_items_quantity", "CHECK (quantity > 0)");
  pgm.createIndex("cart_items", "cart_id", { name: "idx_cart_items_cart_id" });

  // --- wishlist_items ---
  pgm.createTable("wishlist_items", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("wishlist_items", "uq_wishlist_user_product", {
    unique: ["user_id", "product_id"],
  });

  // --- orders ---
  pgm.createTable("orders", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    order_number: { type: "varchar(50)", notNull: true, unique: true },
    user_id: {
      type: "uuid",
      references: "users",
    },
    guest_email: { type: "varchar(255)" },
    status: { type: "order_status", notNull: true, default: "pending" },
    subtotal: { type: "decimal(10,2)", notNull: true },
    discount_amount: { type: "decimal(10,2)", notNull: true, default: 0.0 },
    shipping_cost: { type: "decimal(10,2)", notNull: true, default: 0.0 },
    tax_amount: { type: "decimal(10,2)", notNull: true, default: 0.0 },
    total_amount: { type: "decimal(10,2)", notNull: true },
    shipping_address_id: {
      type: "uuid",
      references: "addresses",
    },
    billing_address_id: {
      type: "uuid",
      references: "addresses",
    },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("orders", "user_id", { name: "idx_orders_user_id" });
  pgm.createIndex("orders", "status", { name: "idx_orders_status" });
  pgm.createIndex("orders", "order_number", { name: "idx_orders_order_number" });

  // --- order_items ---
  pgm.createTable("order_items", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    order_id: {
      type: "uuid",
      notNull: true,
      references: "orders",
      onDelete: "CASCADE",
    },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
    },
    variant_id: {
      type: "uuid",
      references: "product_variants",
    },
    product_name_snapshot: { type: "varchar(255)", notNull: true },
    quantity: { type: "integer", notNull: true },
    unit_price: { type: "decimal(10,2)", notNull: true },
    subtotal: { type: "decimal(10,2)", notNull: true },
  });
  pgm.addConstraint("order_items", "chk_order_items_quantity", "CHECK (quantity > 0)");
  pgm.createIndex("order_items", "order_id", { name: "idx_order_items_order_id" });

  // --- order_status_history ---
  pgm.createTable("order_status_history", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    order_id: {
      type: "uuid",
      notNull: true,
      references: "orders",
      onDelete: "CASCADE",
    },
    status: { type: "varchar(50)", notNull: true },
    note: { type: "text" },
    changed_by: {
      type: "uuid",
      references: "users",
    },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("order_status_history", "order_id", { name: "idx_status_history_order_id" });

  // --- payments ---
  pgm.createTable("payments", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    order_id: {
      type: "uuid",
      notNull: true,
      references: "orders",
      onDelete: "CASCADE",
    },
    provider: { type: "varchar(50)", notNull: true },
    provider_transaction_id: { type: "varchar(255)" },
    amount: { type: "decimal(10,2)", notNull: true },
    currency: { type: "varchar(10)", notNull: true, default: "USD" },
    status: { type: "payment_status", notNull: true, default: "pending" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("payments", "order_id", { name: "idx_payments_order_id" });

  // --- reviews ---
  pgm.createTable("reviews", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    product_id: {
      type: "uuid",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    rating: { type: "smallint", notNull: true },
    comment: { type: "text" },
    is_verified_purchase: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("reviews", "chk_reviews_rating", "CHECK (rating BETWEEN 1 AND 5)");
  pgm.addConstraint("reviews", "uq_reviews_product_user", {
    unique: ["product_id", "user_id"],
  });
  pgm.createIndex("reviews", "product_id", { name: "idx_reviews_product_id" });

  // --- coupons ---
  pgm.createTable("coupons", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    code: { type: "varchar(50)", notNull: true, unique: true },
    discount_type: { type: "discount_type", notNull: true },
    discount_value: { type: "decimal(10,2)", notNull: true },
    min_order_amount: { type: "decimal(10,2)", notNull: true, default: 0.0 },
    max_uses: { type: "integer" },
    times_used: { type: "integer", notNull: true, default: 0 },
    valid_from: { type: "timestamp", notNull: true },
    valid_until: { type: "timestamp", notNull: true },
    is_active: { type: "boolean", notNull: true, default: true },
  });
  pgm.createIndex("coupons", "code", { name: "idx_coupons_code" });

  // --- order_coupons (junction) ---
  pgm.createTable("order_coupons", {
    order_id: {
      type: "uuid",
      notNull: true,
      references: "orders",
      onDelete: "CASCADE",
    },
    coupon_id: {
      type: "uuid",
      notNull: true,
      references: "coupons",
    },
  });
  pgm.addConstraint("order_coupons", "pk_order_coupons", {
    primaryKey: ["order_id", "coupon_id"],
  });

  // --- notifications ---
  pgm.createTable("notifications", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    type: { type: "varchar(50)", notNull: true },
    title: { type: "varchar(255)", notNull: true },
    message: { type: "text", notNull: true },
    is_read: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("notifications", "user_id", { name: "idx_notifications_user_id" });

  // --- audit_logs ---
  pgm.createTable("audit_logs", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      references: "users",
      onDelete: "SET NULL",
    },
    action: { type: "varchar(100)", notNull: true },
    entity_type: { type: "varchar(50)" },
    entity_id: { type: "uuid" },
    metadata: { type: "jsonb" },
    ip_address: { type: "varchar(45)" },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("audit_logs", ["entity_type", "entity_id"], { name: "idx_audit_logs_entity" });
};

/**
 * Drops everything created in up(), in reverse dependency order.
 */
exports.down = (pgm) => {
  pgm.dropTable("audit_logs");
  pgm.dropTable("notifications");
  pgm.dropTable("order_coupons");
  pgm.dropTable("coupons");
  pgm.dropTable("reviews");
  pgm.dropTable("payments");
  pgm.dropTable("order_status_history");
  pgm.dropTable("order_items");
  pgm.dropTable("orders");
  pgm.dropTable("wishlist_items");
  pgm.dropTable("cart_items");
  pgm.dropTable("cart");
  pgm.dropTable("product_images");
  pgm.dropTable("product_variants");
  pgm.dropTable("product_categories");
  pgm.dropTable("products");
  pgm.dropTable("categories");
  pgm.dropTable("addresses");
  pgm.dropTable("users");

  pgm.dropType("discount_type");
  pgm.dropType("payment_status");
  pgm.dropType("order_status");
  pgm.dropType("user_role");
};