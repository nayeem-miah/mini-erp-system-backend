import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = express.Router();


router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  CategoryController.getAllCategories
);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);


router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  CategoryController.deleteCategory
);



export const CategoryRoutes = router;
