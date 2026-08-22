import { query, withTransaction } from "../config/database";
import { slugify } from "../utils/slugify.util";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  sku: string;
  stock_quantity: number;
  average_rating: string;
  primary_image: string | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  is_active: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string; slug: string }[];
  images: { id: string; image_url: string; is_primary: boolean; display_order: number }[];
  variants: {
    id: string;
    variant_name: string;
    variant_value: string;
    price_adjustment: string;
    stock_quantity: number;
  }[];
}

export interface ListProductsFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  for (;;) {
    const result = await query<{ id: string }>("SELECT id FROM products WHERE slug = $1", [
      candidate,
    ]);
    const clash = result.rows[0];
    if (!clash || clash.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function listProducts(
  rawQuery: Record<string, unknown>,
  filters: ListProductsFilters
): Promise<{ items: ProductListItem[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions: string[] = ["p.is_active = true"];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.category) {
    conditions.push(
      `EXISTS (
         SELECT 1 FROM product_categories pc
         JOIN categories c ON c.id = pc.category_id
         WHERE pc.product_id = p.id AND c.slug = $${paramIndex}
       )`
    );
    params.push(filters.category);
    paramIndex += 1;
  }

  if (filters.search) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex += 1;
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`p.base_price >= $${paramIndex}`);
    params.push(filters.minPrice);
    paramIndex += 1;
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`p.base_price <= $${paramIndex}`);
    params.push(filters.maxPrice);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortMap: Record<string, string> = {
    newest: "p.created_at DESC",
    price_asc: "p.base_price ASC",
    price_desc: "p.base_price DESC",
    name_asc: "p.name ASC",
  };
  const orderBy = sortMap[filters.sort ?? "newest"] ?? sortMap.newest;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM products p ${whereClause}`,
    params
  );
  const totalItems = parseInt(countResult.rows[0].count, 10);

  const dataParams = [...params, limit, offset];
  const itemsResult = await query<ProductListItem>(
    `SELECT
       p.id, p.name, p.slug, p.base_price::text, p.sku, p.stock_quantity,
       p.average_rating::text,
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
     FROM products p
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    dataParams
  );

  return {
    items: itemsResult.rows,
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export async function getProductBySlug(
  slug: string,
  requireActive = true
): Promise<ProductDetail> {
  const productResult = await query<ProductDetail>(
    `SELECT
       id, name, slug, description, base_price::text, sku, stock_quantity,
       low_stock_threshold, is_active, average_rating::text, created_at, updated_at,
       (SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = true LIMIT 1) as primary_image
     FROM products WHERE slug = $1`,
    [slug]
  );

  const product = productResult.rows[0];
  if (!product || (requireActive && !product.is_active)) {
    throw ApiError.notFound("Product not found");
  }

  const [categoriesResult, imagesResult, variantsResult] = await Promise.all([
    query<{ id: string; name: string; slug: string }>(
      `SELECT c.id, c.name, c.slug FROM categories c
       JOIN product_categories pc ON pc.category_id = c.id
       WHERE pc.product_id = $1`,
      [product.id]
    ),
    query<{ id: string; image_url: string; is_primary: boolean; display_order: number }>(
      `SELECT id, image_url, is_primary, display_order FROM product_images
       WHERE product_id = $1 ORDER BY display_order ASC`,
      [product.id]
    ),
    query<{
      id: string;
      variant_name: string;
      variant_value: string;
      price_adjustment: string;
      stock_quantity: number;
    }>(
      `SELECT id, variant_name, variant_value, price_adjustment::text, stock_quantity
       FROM product_variants WHERE product_id = $1`,
      [product.id]
    ),
  ]);

  return {
    ...product,
    categories: categoriesResult.rows,
    images: imagesResult.rows,
    variants: variantsResult.rows,
  };
}

export async function createProduct(input: {
  name: string;
  description?: string;
  basePrice: number;
  sku: string;
  stockQuantity?: number;
  categoryIds?: string[];
  imageUrl?: string;
}): Promise<ProductDetail> {
  const existingSku = await query("SELECT id FROM products WHERE sku = $1", [input.sku]);
  if (existingSku.rows.length > 0) {
    throw ApiError.conflict("A product with this SKU already exists");
  }

  const slug = await generateUniqueSlug(input.name);

  const productId = await withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `INSERT INTO products (name, slug, description, base_price, sku, stock_quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id`,
      [
        input.name,
        slug,
        input.description ?? null,
        input.basePrice,
        input.sku,
        input.stockQuantity ?? 0,
      ]
    );
    const id = result.rows[0].id;

    if (input.categoryIds && input.categoryIds.length > 0) {
      for (const categoryId of input.categoryIds) {
        await client.query(
          `INSERT INTO product_categories (product_id, category_id)
           VALUES ($1::uuid, $2::uuid)
           ON CONFLICT DO NOTHING`,
          [id, categoryId]
        );
      }
    }

    if (input.imageUrl) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
         VALUES ($1::uuid, $2::varchar, true, 0)`,
        [id, input.imageUrl]
      );
    }

    return id;
  });

  return getProductById(productId);
}

async function getProductById(id: string): Promise<ProductDetail> {
  const result = await query<{ slug: string }>("SELECT slug FROM products WHERE id = $1", [id]);
  return getProductBySlug(result.rows[0].slug, false);
}

export async function updateProduct(
  id: string,
  input: {
    name?: string;
    description?: string;
    basePrice?: number;
    stockQuantity?: number;
    isActive?: boolean;
    categoryIds?: string[];
  }
): Promise<ProductDetail> {
  const existing = await query<{ id: string; name: string; slug: string }>(
    "SELECT id, name, slug FROM products WHERE id = $1",
    [id]
  );
  if (existing.rows.length === 0) {
    throw ApiError.notFound("Product not found");
  }

  const current = existing.rows[0];
  const slug = input.name ? await generateUniqueSlug(input.name, id) : current.slug;

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         slug = $2,
         description = COALESCE($3, description),
         base_price = COALESCE($4, base_price),
         stock_quantity = COALESCE($5, stock_quantity),
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
       WHERE id = $7`,
      [
        input.name,
        slug,
        input.description,
        input.basePrice,
        input.stockQuantity,
        input.isActive,
        id,
      ]
    );

    if (input.categoryIds) {
      await client.query("DELETE FROM product_categories WHERE product_id = $1", [id]);
      for (const categoryId of input.categoryIds) {
        await client.query(
          `INSERT INTO product_categories (product_id, category_id)
           VALUES ($1::uuid, $2::uuid)
           ON CONFLICT DO NOTHING`,
          [id, categoryId]
        );
      }
    }
  });

  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<void> {
  const result = await query("SELECT id FROM products WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw ApiError.notFound("Product not found");
  }

  // Soft delete: keep the row (and its order history references intact)
  // but hide it from the public catalog.
  await query("UPDATE products SET is_active = false WHERE id = $1", [id]);
}