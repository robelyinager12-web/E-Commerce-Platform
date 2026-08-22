import { query } from "../config/database";
import { slugify } from "../utils/slugify.util";
import { ApiError } from "../utils/apiError.util";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  // Keep trying until we find a slug not used by any *other* category.
  for (;;) {
    const result = await query<{ id: string }>(
      "SELECT id FROM categories WHERE slug = $1",
      [candidate]
    );
    const clash = result.rows[0];
    if (!clash || clash.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function listCategories(): Promise<CategoryRow[]> {
  const result = await query<CategoryRow>(
    `SELECT id, name, slug, parent_id, description, image_url, is_active, created_at
     FROM categories
     WHERE is_active = true
     ORDER BY name ASC`
  );
  return result.rows;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow> {
  const result = await query<CategoryRow>(
    `SELECT id, name, slug, parent_id, description, image_url, is_active, created_at
     FROM categories WHERE slug = $1`,
    [slug]
  );
  const category = result.rows[0];
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
}

export async function createCategory(input: {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}): Promise<CategoryRow> {
  if (input.parentId) {
    const parent = await query("SELECT id FROM categories WHERE id = $1", [input.parentId]);
    if (parent.rows.length === 0) {
      throw ApiError.badRequest("parentId does not reference an existing category");
    }
  }

  const slug = await generateUniqueSlug(input.name);

  const result = await query<CategoryRow>(
    `INSERT INTO categories (name, slug, description, image_url, parent_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, slug, parent_id, description, image_url, is_active, created_at`,
    [input.name, slug, input.description ?? null, input.imageUrl ?? null, input.parentId ?? null]
  );

  return result.rows[0];
}

export async function updateCategory(
  id: string,
  input: {
    name?: string;
    description?: string;
    imageUrl?: string;
    parentId?: string | null;
    isActive?: boolean;
  }
): Promise<CategoryRow> {
  const existing = await query<CategoryRow>("SELECT * FROM categories WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    throw ApiError.notFound("Category not found");
  }

  if (input.parentId === id) {
    throw ApiError.badRequest("A category cannot be its own parent");
  }

  const current = existing.rows[0];
  const newName = input.name ?? current.name;
  const slug = input.name ? await generateUniqueSlug(input.name, id) : current.slug;

  const result = await query<CategoryRow>(
    `UPDATE categories SET
       name = $1,
       slug = $2,
       description = COALESCE($3, description),
       image_url = COALESCE($4, image_url),
       parent_id = $5,
       is_active = COALESCE($6, is_active)
     WHERE id = $7
     RETURNING id, name, slug, parent_id, description, image_url, is_active, created_at`,
    [
      newName,
      slug,
      input.description,
      input.imageUrl,
      input.parentId === undefined ? current.parent_id : input.parentId,
      input.isActive,
      id,
    ]
  );

  return result.rows[0];
}

export async function deleteCategory(id: string): Promise<void> {
  const result = await query("SELECT id FROM categories WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw ApiError.notFound("Category not found");
  }

  // Soft delete: deactivate rather than hard-delete, to preserve
  // historical product-category associations and order history.
  await query("UPDATE categories SET is_active = false WHERE id = $1", [id]);
}