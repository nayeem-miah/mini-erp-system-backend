import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SaleController } from "./sale.controller";
import { SaleValidation } from "./sale.validation";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN),
  SaleController.getAllSales
);

router.get(
  "/my-sales",
  auth(UserRole.ADMIN),
  SaleController.getMySales
);

router.get(
  "/:id",
  auth(UserRole.ADMIN),
  SaleController.getSaleById
);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  validateRequest(SaleValidation.createSaleSchema),
  SaleController.createSale
);

export const SaleRoutes = router;
