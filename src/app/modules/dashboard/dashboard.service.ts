import { prisma } from "../../prisma/prisma";
import { IDashboardInsights } from "./dashboard.interface";

const getDashboardInsights = async (): Promise<IDashboardInsights> => {
  const [totalProducts, sales, lowStockProducts] = await Promise.all([

    prisma.product.count(),

    prisma.sale.findMany({
      select: {
        grandTotal: true,
      },
    }),

    prisma.product.findMany({
      where: {
        stockQuantity: {
          lt: 5,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stockQuantity: "asc",
      },
    }),
  ]);

  const totalSalesCount = sales.length;
  const totalSalesRevenue = sales.reduce((acc, sale) => acc + sale.grandTotal, 0);
  const lowStockProductsCount = lowStockProducts.length;

  return {
    totalProducts,
    totalSalesCount,
    totalSalesRevenue,
    lowStockProducts,
    lowStockProductsCount,
  };
};

export const DashboardService = {
  getDashboardInsights,
};
