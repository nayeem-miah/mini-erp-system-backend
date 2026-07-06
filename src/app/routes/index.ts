import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.route";
import { SaleRoutes } from "../modules/sale/sale.route";
import { DashboardRoutes } from "../modules/dashboard/dashboard.route";

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/products", ProductRoutes);
router.use("/sales", SaleRoutes);
router.use("/dashboard", DashboardRoutes);

export default router;