import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";

const router = Router();

router.use(auth);

router.get("/admin/dashboard", restrictTo("admin"), AnalyticsController.getAdminDashboard);

router.get("/vendor/dashboard", restrictTo("vendor"), AnalyticsController.getVendorDashboard);

export default router;
