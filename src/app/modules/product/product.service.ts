import { Prisma } from "@prisma/client";
import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { ICreateProductPayload, IProductQuery, IUpdateProductPayload } from "./product.interface";

const generateSKU = async (productName: string, categoryId: string): Promise<string> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Sanitized uppercase prefixes
  const catPrefix = category.name
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase() || "CAT";

  const prodPrefix = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase() || "PRD";

  const count = await prisma.product.count({
    where: {
      sku: {
        startsWith: `${catPrefix}-${prodPrefix}-`,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  const sku = `${catPrefix}-${prodPrefix}-${sequence}`;

  const isExist = await prisma.product.findUnique({ where: { sku } });
  if (isExist) {
    return `${catPrefix}-${prodPrefix}-${sequence}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return sku;
};

const createProduct = async (payload: ICreateProductPayload) => {
  const sku = await generateSKU(payload.name, payload.categoryId);

  const result = await prisma.product.create({
    data: {
      ...payload,
      sku,
    },
    include: {
      category: true,
    },
  });

  return result;
};

const getAllProducts = async (query: IProductQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { searchTerm, categoryId, sortBy, sortOrder } = query;

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const sortConditions: Prisma.ProductOrderByWithRelationInput = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy as keyof Prisma.ProductOrderByWithRelationInput] = sortOrder;
  } else {
    sortConditions.createdAt = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereConditions,
      orderBy: sortConditions,
      skip,
      take: limit,
      include: {
        category: true,
      },
    }),
    prisma.product.count({
      where: whereConditions,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: products,
  };
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

const updateProduct = async (
  id: string,
  payload: IUpdateProductPayload
) => {
  const isExist = await prisma.product.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(404, "Product not found");
  }

  const result = await prisma.product.update({
    where: { id },
    data: payload,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteProduct = async (id: string) => {
  const isExist = await prisma.product.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(404, "Product not found");
  }

  const result = await prisma.product.delete({
    where: { id },
  });

  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
