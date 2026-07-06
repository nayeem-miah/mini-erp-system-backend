import { z } from "zod";

const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z
          .string({
            message: "Product ID is required",
          })
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"),
        quantity: z
          .number({
            message: "Quantity is required",
          })
          .int("Quantity must be an integer")
          .positive("Quantity must be a positive number"),
      }),
      {
        message: "Sale items are required",
      }
    )
    .nonempty("Sale must contain at least one item"),
});

export const SaleValidation = {
  createSaleSchema,
};
