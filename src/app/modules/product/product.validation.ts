import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Product Name cannot be empty"),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID format"),
  purchasePrice: z.preprocess(
    (val) => Number(val),
    z.number().positive("Purchase Price must be positive")
  ),
  sellingPrice: z.preprocess(
    (val) => Number(val),
    z.number().positive("Selling Price must be positive")
  ),
  stockQuantity: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative("Stock Quantity must be non-negative")
  ),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  purchasePrice: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  sellingPrice: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().positive().optional()
  ),
  stockQuantity: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().int().nonnegative().optional()
  ),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
};
