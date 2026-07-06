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

const getAllSales = async (): Promise<IPopulatedSale[]> => {
  const sales = await prisma.sale.findMany({
    orderBy: {
      createdAt: "desc",
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

  return await populateProductsForSales(sales);
};

const getMySales = async (userId: string): Promise<IPopulatedSale[]> => {
  const sales = await prisma.sale.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
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

  return await populateProductsForSales(sales);
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
