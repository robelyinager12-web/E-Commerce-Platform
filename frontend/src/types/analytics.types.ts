export interface OverviewStats {
  activeListings: number;
  totalListingsAllTime: number;
  totalUsers: number;
  newUsers30d: number;
  pendingReports: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  categorySlug: string;
  listingCount: number;
}

export interface TopSeller {
  sellerId: string;
  sellerName: string;
  activeListings: number;
  totalViews: number;
  averageRating: string;
}