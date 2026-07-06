import { Product } from "@prisma/client";

export interface IDashboardInsights {
  totalProducts: number;
  totalSalesCount: number;
  totalSalesRevenue: number;
  lowStockProducts: Product[];
  lowStockProductsCount: number;
}
