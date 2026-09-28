import { query, withTransaction } from "../config/database";
import { slugify } from "../utils/slugify.util";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { getSellerRatingSummary } from "./sellerReview.service";

export interface ListingListItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  condition: string;
  region: string;
  city: string;
  status: string;
  created_at: string;
  primary_image: string | null;
}

export interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ListingDetail extends ListingListItem {
  description: string | null;
  views_count: number;
  updated_at: string;
  category: { id: string; name: string; slug: string };
  images: ListingImage[];
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    memberSince: string;
    averageRating: string;
    reviewCount: number;
  };
}

export interface SellerContact {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
}

export interface ListListingsFilters {
  category?: string;
  search?: string;
  region?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: "new" | "used";
  sort?: "newest" | "price_asc" | "price_desc";
}

interface ListingDetailRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  condition: string;
  region: string;
  city: string;
  status: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  seller_id: string;
  first_name: string;
  last_name: string;
  seller_created_at: string;
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;
  for (;;) {
    const result = await query("SELECT id FROM listings WHERE slug = $1", [candidate]);
    const clash = (result.rows as { id: string }[])[0];
    if (!clash || clash.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function listListings(
  rawQuery: Record<string, unknown>,
  filters: ListListingsFilters
): Promise<{ items: ListingListItem[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions: string[] = ["l.status = 'active'"];
  const params: unknown[] = [];
  let i = 1;

  if (filters.category) {
    conditions.push(
      `EXISTS (SELECT 1 FROM categories c WHERE c.id = l.category_id AND c.slug = $${i})`
    );
    params.push(filters.category);
    i += 1;
  }
  if (filters.search) {
    conditions.push(`(l.title ILIKE $${i} OR l.description ILIKE $${i})`);
    params.push(`%${filters.search}%`);
    i += 1;
  }
  if (filters.region) {
    conditions.push(`l.region = $${i}`);
    params.push(filters.region);
    i += 1;
  }
  if (filters.city) {
    conditions.push(`l.city = $${i}`);
    params.push(filters.city);
    i += 1;
  }
  if (filters.minPrice !== undefined) {
    conditions.push(`l.price >= $${i}`);
    params.push(filters.minPrice);
    i += 1;
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(`l.price <= $${i}`);
    params.push(filters.maxPrice);
    i += 1;
  }
  if (filters.condition) {
    conditions.push(`l.condition = $${i}::listing_condition`);
    params.push(filters.condition);
    i += 1;
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const sortMap: Record<string, string> = {
    newest: "l.created_at DESC",
    price_asc: "l.price ASC",
    price_desc: "l.price DESC",
  };
  const orderBy = sortMap[filters.sort ?? "newest"] ?? sortMap.newest;

  const countResult = await query(
    `SELECT COUNT(*)::text as count FROM listings l ${whereClause}`,
    params
  );
  const totalItems = parseInt((countResult.rows as { count: string }[])[0].count, 10);

  const itemsResult = await query(
    `SELECT
       l.id, l.title, l.slug, l.price::text, l.condition, l.region, l.city, l.status, l.created_at,
       (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
     FROM listings l
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows as ListingListItem[],
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export async function getListingBySlug(slug: string, requireActive = true): Promise<ListingDetail> {
  const result = await query(
    `SELECT
       l.id, l.title, l.slug, l.description, l.price::text, l.condition, l.region, l.city,
       l.status, l.views_count, l.created_at, l.updated_at,
       c.id as category_id, c.name as category_name, c.slug as category_slug,
       u.id as seller_id, u.first_name, u.last_name, u.created_at as seller_created_at
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.user_id
     WHERE l.slug = $1`,
    [slug]
  );
  const row = (result.rows as ListingDetailRow[])[0];
  if (!row || (requireActive && row.status !== "active")) {
    throw ApiError.notFound("Listing not found");
  }

  const imagesResult = await query(
    `SELECT id, image_url, is_primary, display_order FROM listing_images
     WHERE listing_id = $1 ORDER BY display_order ASC`,
    [row.id]
  );
  const images = imagesResult.rows as ListingImage[];
  const primary = images.find((img) => img.is_primary) ?? images[0];
  const rating = await getSellerRatingSummary(row.seller_id);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: row.price,
    condition: row.condition,
    region: row.region,
    city: row.city,
    status: row.status,
    views_count: row.views_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    primary_image: primary ? primary.image_url : null,
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    images,
    seller: {
      id: row.seller_id,
      firstName: row.first_name,
      lastName: row.last_name,
      memberSince: row.seller_created_at,
      averageRating: rating.averageRating,
      reviewCount: rating.reviewCount,
    },
  };
}

/**
 * Contact details are only handed out through this function (behind
 * authentication and a rate limit), never on the public listing response.
 */
export async function getSellerContact(listingId: string): Promise<SellerContact> {
  const result = await query(
    `SELECT u.first_name, u.last_name, u.phone, u.email
     FROM listings l
     JOIN users u ON u.id = l.user_id
     WHERE l.id = $1 AND l.status = 'active'`,
    [listingId]
  );
  const row = (result.rows as {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string;
  }[])[0];
  if (!row) {
    throw ApiError.notFound("Listing not found");
  }
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
  };
}

export async function incrementListingViews(id: string): Promise<void> {
  await query("UPDATE listings SET views_count = views_count + 1 WHERE id = $1", [id]);
}

export async function createListing(
  userId: string,
  input: {
    title: string;
    description?: string;
    price: number;
    condition: "new" | "used";
    region: string;
    city: string;
    categoryId: string;
    imageUrl?: string;
  }
): Promise<ListingDetail> {
  const category = await query("SELECT id FROM categories WHERE id = $1", [input.categoryId]);
  if ((category.rows as unknown[]).length === 0) {
    throw ApiError.badRequest("categoryId does not reference an existing category");
  }

  const slug = await generateUniqueSlug(input.title);

  const listingId = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO listings (user_id, category_id, title, slug, description, price, condition, region, city, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::listing_condition, $8, $9, 'active')
       RETURNING id`,
      [
        userId,
        input.categoryId,
        input.title,
        slug,
        input.description ?? null,
        input.price,
        input.condition,
        input.region,
        input.city,
      ]
    );
    const id = (result.rows as { id: string }[])[0].id;

    if (input.imageUrl) {
      await client.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary, display_order)
         VALUES ($1::uuid, $2::varchar, true, 0)`,
        [id, input.imageUrl]
      );
    }

    return id;
  });

  return getListingById(listingId);
}

async function getListingById(id: string): Promise<ListingDetail> {
  const result = await query("SELECT slug FROM listings WHERE id = $1", [id]);
  return getListingBySlug((result.rows as { slug: string }[])[0].slug, false);
}

async function assertOwnership(userId: string, listingId: string): Promise<void> {
  const result = await query("SELECT user_id FROM listings WHERE id = $1", [listingId]);
  const row = (result.rows as { user_id: string }[])[0];
  if (!row) throw ApiError.notFound("Listing not found");
  if (row.user_id !== userId) throw ApiError.forbidden("You can only manage your own listings");
}

export async function updateListing(
  userId: string,
  listingId: string,
  input: {
    title?: string;
    description?: string;
    price?: number;
    condition?: "new" | "used";
    region?: string;
    city?: string;
    categoryId?: string;
    status?: "active" | "sold" | "expired" | "removed";
  }
): Promise<ListingDetail> {
  await assertOwnership(userId, listingId);

  const slug = input.title ? await generateUniqueSlug(input.title, listingId) : undefined;

  await query(
    `UPDATE listings SET
       title = COALESCE($1, title),
       slug = COALESCE($2, slug),
       description = COALESCE($3, description),
       price = COALESCE($4, price),
       condition = COALESCE($5::listing_condition, condition),
       region = COALESCE($6, region),
       city = COALESCE($7, city),
       category_id = COALESCE($8, category_id),
       status = COALESCE($9::listing_status, status),
       updated_at = NOW()
     WHERE id = $10`,
    [
      input.title,
      slug,
      input.description,
      input.price,
      input.condition,
      input.region,
      input.city,
      input.categoryId,
      input.status,
      listingId,
    ]
  );

  return getListingById(listingId);
}

export async function deleteListing(userId: string, listingId: string): Promise<void> {
  await assertOwnership(userId, listingId);
  await query("UPDATE listings SET status = 'removed' WHERE id = $1", [listingId]);
}

export async function listMyListings(userId: string): Promise<ListingListItem[]> {
  const result = await query(
    `SELECT
       l.id, l.title, l.slug, l.price::text, l.condition, l.region, l.city, l.status, l.created_at,
       (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
     FROM listings l
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows as ListingListItem[];
}