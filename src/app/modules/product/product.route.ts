import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { fileUpload } from "../../utils/fileUpload";
import { ProductController } from "./product.controller";
import { ProductValidation } from "./product.validation";

const router = express.Router();


router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  ProductController.getAllProducts
);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  ProductController.getProductById
);


router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  fileUpload.upload.single("image"),
  validateRequest(ProductValidation.createProductSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  fileUpload.upload.single("image"),
  validateRequest(ProductValidation.updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MANAGER),
  ProductController.deleteProduct
);

export const ProductRoutes = router;
