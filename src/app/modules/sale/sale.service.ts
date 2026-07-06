/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { IPopulatedSale, ISaleWithUser } from "./sale.interface";


const populateProductsForSales = async (sales: ISaleWithUser[]): Promise<IPopulatedSale[]> => {
  const productIds = new Set<string>();
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      productIds.add(item.productId);
    });
  });

  const productsList = await prisma.product.findMany({
    where: {
      id: {
        in: Array.from(productIds),
      },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      image: true,
    },
  });

  const productMap: Record<string, { name: string; sku: string; image: string }> = {};
  productsList.forEach((prod) => {
    productMap[prod.id] = {
      name: prod.name,
      sku: prod.sku,
      image: prod.image,
    };
  });

  return sales.map((sale) => {
    const populatedItems = sale.items.map((item) => {
      const details = productMap[item.productId] || {
        name: "Unknown Product",
        sku: "N/A",
        image: "",
      };
      return {
        ...item,
        productName: details.name,
        productSku: details.sku,
        productImage: details.image,
      };
    });

    return {
      ...sale,
      items: populatedItems,
    };
  });
};

const createSale = async (
  userId: string,
  payload: {
    items: {
      productId: string;
      quantity: number;
    }[];
  }
) => {
  return await prisma.$transaction(async (tx) => {
    let grandTotal = 0;
    const saleItems = [];

    for (const item of payload.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(404, `Product not found with ID: ${item.productId}`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        );
      }

      const itemTotal = product.sellingPrice * item.quantity;
      grandTotal += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.sellingPrice,
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    const sale = await tx.sale.create({
      data: {
        userId,
        items: saleItems,
        grandTotal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sale;
  });
};

const getAllSales = async (query: {
  page?: string;
  limit?: string;
  searchTerm?: string;
  dateFilter?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { searchTerm, dateFilter } = query;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { id: { contains: searchTerm, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      andConditions.push({
        createdAt: {
          gte: today,
        },
      });
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      andConditions.push({
        createdAt: {
          gte: oneWeekAgo,
        },
      });
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      andConditions.push({
        createdAt: {
          gte: oneMonthAgo,
        },
      });
    }
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.sale.count({
      where: whereConditions,
    }),
  ]);

  const allFilteredSales = await prisma.sale.findMany({
    where: whereConditions,
    select: {
      grandTotal: true,
    },
  });

  const totalRevenue = allFilteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalTransactions = allFilteredSales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const totalPages = Math.ceil(total / limit);
  const populated = await populateProductsForSales(sales);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      totalRevenue,
      avgOrderValue,
    },
    data: populated,
  };
};

const getMySales = async (
  userId: string,
  query: {
    page?: string;
    limit?: string;
    searchTerm?: string;
    dateFilter?: string;
  }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { searchTerm, dateFilter } = query;
  const andConditions: any[] = [{ userId }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { id: { contains: searchTerm, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      andConditions.push({
        createdAt: {
          gte: today,
        },
      });
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      andConditions.push({
        createdAt: {
          gte: oneWeekAgo,
        },
      });
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      andConditions.push({
        createdAt: {
          gte: oneMonthAgo,
        },
      });
    }
  }

  const whereConditions = { AND: andConditions };

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.sale.count({
      where: whereConditions,
    }),
  ]);

  const allFilteredSales = await prisma.sale.findMany({
    where: whereConditions,
    select: {
      grandTotal: true,
    },
  });

  const totalRevenue = allFilteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalTransactions = allFilteredSales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const totalPages = Math.ceil(total / limit);
  const populated = await populateProductsForSales(sales);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      totalRevenue,
      avgOrderValue,
    },
    data: populated,
  };
};

const getSaleById = async (id: string): Promise<IPopulatedSale> => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!sale) {
    throw new ApiError(404, "Sale record not found");
  }

  const populated = await populateProductsForSales([sale]);
  return populated[0];
};

export const SaleService = {
  createSale,
  getAllSales,
  getMySales,
  getSaleById,
};
