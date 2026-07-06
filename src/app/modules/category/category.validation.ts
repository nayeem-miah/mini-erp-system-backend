import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema: createCategorySchema, // reuse since validation is the same
};
