import { query } from "../config/database";

/**
 * Orders only count toward revenue once payment has actually been
 * confirmed. A "pending" order hasn't been paid yet, a "cancelled" order
 * never completed, and a "refunded" order had its revenue reversed - none
 * of those should inflate reported revenue.
 */
const REVENUE_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

interface DateRange {
  from?: string;
  to?: string;
}

function resolveRange(range: DateRange): { from: string; to: string } {
  const to = range.to ? new Date(range.to) : new Date();
  const from = range.from ? new Date(range.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export interface OverviewStats {
  totalRevenue: string;
  totalOrders: number;
  revenueOrders: number;
  averageOrderValue: string;
  totalCustomers: number;
  newCustomers: number;
  lowStockCount: number;
  rangeFrom: string;
  rangeTo: string;
}

export async function getOverview(range: DateRange): Promise<OverviewStats> {
  const { from, to } = resolveRange(range);

  const [revenueResult, orderCountResult, customerResult, newCustomerResult, lowStockResult] =
    await Promise.all([
      query<{ total_revenue: string; revenue_orders: string }>(
        `SELECT COALESCE(SUM(total_amount), 0)::text as total_revenue, COUNT(*)::text as revenue_orders
         FROM orders
         WHERE status = ANY($1::order_status[]) AND created_at BETWEEN $2 AND $3`,
        [REVENUE_STATUSES, from, to]
      ),
      query<{ count: string }>(
        "SELECT COUNT(*)::text as count FROM orders WHERE created_at BETWEEN $1 AND $2",
        [from, to]
      ),
      query<{ count: string }>(
        "SELECT COUNT(*)::text as count FROM users WHERE role = 'customer'"
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM users
         WHERE role = 'customer' AND created_at BETWEEN $1 AND $2`,
        [from, to]
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM products
         WHERE is_active = true AND stock_quantity <= low_stock_threshold`
      ),
    ]);

  const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue);
  const revenueOrders = parseInt(revenueResult.rows[0].revenue_orders, 10);
  const totalOrders = parseInt(orderCountResult.rows[0].count, 10);
  const averageOrderValue = revenueOrders > 0 ? totalRevenue / revenueOrders : 0;

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    revenueOrders,
    averageOrderValue: averageOrderValue.toFixed(2),
    totalCustomers: parseInt(customerResult.rows[0].count, 10),
    newCustomers: parseInt(newCustomerResult.rows[0].count, 10),
    lowStockCount: parseInt(lowStockResult.rows[0].count, 10),
    rangeFrom: from,
    rangeTo: to,
  };
}

export interface SalesOverTimePoint {
  period: string;
  revenue: string;
  orderCount: number;
}

export async function getSalesOverTime(
  range: DateRange,
  interval: "day" | "week" | "month" = "day"
): Promise<SalesOverTimePoint[]> {
  const { from, to } = resolveRange(range);

  const result = await query<{ period: string; revenue: string; order_count: string }>(
    `SELECT
       date_trunc($1, created_at)::date::text as period,
       SUM(total_amount)::text as revenue,
       COUNT(*)::text as order_count
     FROM orders
     WHERE status = ANY($2::order_status[]) AND created_at BETWEEN $3 AND $4
     GROUP BY period
     ORDER BY period ASC`,
    [interval, REVENUE_STATUSES, from, to]
  );

  return result.rows.map((row) => ({
    period: row.period,
    revenue: row.revenue,
    orderCount: parseInt(row.order_count, 10),
  }));
}

export interface TopProduct {
  productId: string;
  name: string;
  slug: string;
  unitsSold: number;
  revenue: string;
}

export async function getTopProducts(range: DateRange, limit = 10): Promise<TopProduct[]> {
  const { from, to } = resolveRange(range);

  const result = await query<{
    product_id: string;
    name: string;
    slug: string;
    units_sold: string;
    revenue: string;
  }>(
    `SELECT
       oi.product_id, oi.product_name_snapshot as name, p.slug,
       SUM(oi.quantity)::text as units_sold,
       SUM(oi.subtotal)::text as revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status = ANY($1::order_status[]) AND o.created_at BETWEEN $2 AND $3
     GROUP BY oi.product_id, oi.product_name_snapshot, p.slug
     ORDER BY SUM(oi.quantity) DESC
     LIMIT $4`,
    [REVENUE_STATUSES, from, to, limit]
  );

  return result.rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    slug: row.slug,
    unitsSold: parseInt(row.units_sold, 10),
    revenue: row.revenue,
  }));
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export async function getLowStockProducts(threshold?: number): Promise<LowStockProduct[]> {
  const result = await query<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
  }>(
    threshold !== undefined
      ? `SELECT id, name, slug, sku, stock_quantity, low_stock_threshold
         FROM products WHERE is_active = true AND stock_quantity <= $1
         ORDER BY stock_quantity ASC`
      : `SELECT id, name, slug, sku, stock_quantity, low_stock_threshold
         FROM products WHERE is_active = true AND stock_quantity <= low_stock_threshold
         ORDER BY stock_quantity ASC`,
    threshold !== undefined ? [threshold] : []
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
  }));
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export async function getOrderStatusBreakdown(range: DateRange): Promise<OrderStatusCount[]> {
  const { from, to } = resolveRange(range);

  const result = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::text as count
     FROM orders
     WHERE created_at BETWEEN $1 AND $2
     GROUP BY status
     ORDER BY count DESC`,
    [from, to]
  );

  return result.rows.map((row) => ({ status: row.status, count: parseInt(row.count, 10) }));
}