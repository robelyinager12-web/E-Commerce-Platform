/* eslint-disable @typescript-eslint/no-var-requires */
exports.shorthands = undefined;

/**
 * Adds an explicit display order to categories so the storefront can show them
 * in a fixed order (Vehicles, Property, Phones & Tablets, ...) instead of A-Z.
 * Categories created later (e.g. from the admin panel) default to 1000 and
 * therefore appear after the seeded ones.
 */
exports.up = (pgm) => {
  pgm.addColumn("categories", {
    sort_order: { type: "integer", notNull: true, default: 1000 },
  });
  pgm.createIndex("categories", ["parent_id", "sort_order"], {
    name: "idx_categories_parent_sort",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("categories", ["parent_id", "sort_order"], { name: "idx_categories_parent_sort" });
  pgm.dropColumn("categories", "sort_order");
};