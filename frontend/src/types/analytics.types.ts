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

export interface SalesOverTimePoint {
  period: string;
  revenue: string;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  slug: string;
  unitsSold: number;
  revenue: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}