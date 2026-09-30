import { query } from "../config/database";

export interface OverviewStats {
  activeListings: number;
  totalListingsAllTime: number;
  totalUsers: number;
  newUsers30d: number;
  pendingReports: number;
}

export async function getOverview(): Promise<OverviewStats> {
  const [active, total, users, newUsers, reports] = await Promise.all([
    query("SELECT COUNT(*)::text as count FROM listings WHERE status = 'active'"),
    query("SELECT COUNT(*)::text as count FROM listings"),
    query("SELECT COUNT(*)::text as count FROM users WHERE role = 'customer'"),
    query(
      "SELECT COUNT(*)::text as count FROM users WHERE role = 'customer' AND created_at >= NOW() - INTERVAL '30 days'"
    ),
    query("SELECT COUNT(*)::text as count FROM listing_reports WHERE status = 'pending'"),
  ]);

  const n = (r: { rows: unknown[] }) => parseInt((r.rows as { count: string }[])[0].count, 10);

  return {
    activeListings: n(active),
    totalListingsAllTime: n(total),
    totalUsers: n(users),
    newUsers30d: n(newUsers),
    pendingReports: n(reports),
  };
}

export interface CategoryBreakdown {
  categoryName: string;
  categorySlug: string;
  listingCount: number;
}

export async function getListingsByCategory(): Promise<CategoryBreakdown[]> {
  const result = await query(
    `SELECT c.name as category_name, c.slug as category_slug, COUNT(l.id)::text as listing_count
     FROM categories c
     LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
     WHERE c.parent_id IS NULL
     GROUP BY c.id, c.name, c.slug
     ORDER BY COUNT(l.id) DESC`
  );
  return (result.rows as { category_name: string; category_slug: string; listing_count: string }[]).map(
    (row) => ({
      categoryName: row.category_name,
      categorySlug: row.category_slug,
      listingCount: parseInt(row.listing_count, 10),
    })
  );
}

export interface TopSeller {
  sellerId: string;
  sellerName: string;
  activeListings: number;
  totalViews: number;
  averageRating: string;
}

export async function getTopSellers(limit = 10): Promise<TopSeller[]> {
  const result = await query(
    `SELECT
       u.id as seller_id, CONCAT(u.first_name, ' ', u.last_name) as seller_name,
       COUNT(l.id)::text as active_listings,
       COALESCE(SUM(l.views_count), 0)::text as total_views,
       COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM seller_reviews r WHERE r.seller_id = u.id), 0)::text as average_rating
     FROM users u
     JOIN listings l ON l.user_id = u.id AND l.status = 'active'
     GROUP BY u.id, u.first_name, u.last_name
     ORDER BY COUNT(l.id) DESC
     LIMIT $1`,
    [limit]
  );
  return (
    result.rows as {
      seller_id: string;
      seller_name: string;
      active_listings: string;
      total_views: string;
      average_rating: string;
    }[]
  ).map((row) => ({
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    activeListings: parseInt(row.active_listings, 10),
    totalViews: parseInt(row.total_views, 10),
    averageRating: row.average_rating,
  }));
}