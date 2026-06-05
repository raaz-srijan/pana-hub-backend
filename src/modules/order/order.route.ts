import { Router } from "express";
import { OrderController } from "./order.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { requireVendor } from "../../shared/middleware/requireVendor";

const router = Router();

// All order endpoints require authentication
router.use(auth);

// Customer endpoints
router.post("/checkout", restrictTo("customer"), OrderController.createOrder);
router.post("/direct", restrictTo("customer"), OrderController.createDirectOrder);
router.get("/my-orders", restrictTo("customer"), OrderController.getOwnOrders);
router.get("/my-orders/:id", restrictTo("customer"), OrderController.getOwnOrderById);
router.patch("/my-orders/:id/cancel", restrictTo("customer"), OrderController.cancelOwnOrder);

// Vendor endpoints
router.get("/vendor", restrictTo("vendor"), requireVendor, OrderController.getVendorOrders);

// Admin endpoints
router.get("/admin", restrictTo("admin"), OrderController.getAllOrders);
router.get("/admin/:id", restrictTo("admin"), OrderController.getOrderById);
router.patch("/admin/:id/status", restrictTo("admin"), OrderController.updateOrderStatus);
router.patch("/admin/:id/payment", restrictTo("admin"), OrderController.updatePaymentStatus);

export default router;
