import ApiError from "../../errors/apiError";
import { prisma } from "../../prisma/prisma";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isExist) {
    throw new ApiError(409, "Category already exists!");
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(404, "Category not found");
  }

  const isNameExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isNameExist && isNameExist.id !== id) {
    throw new ApiError(409, "Category name already exists!");
  }

  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteCategory = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new ApiError(404, "Category not found");
  }

  const productCount = await prisma.product.count({
    where: {
      categoryId: id,
    },
  });

  if (productCount > 0) {
    throw new ApiError(400, "Cannot delete category because it is used by one or more products.");
  }

  const result = await prisma.category.delete({
    where: { id },
  });

  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
