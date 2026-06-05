import { Router } from "express";
import { auth } from "../../shared/middleware/auth";
import { CartController } from "./cart.controller";
import { restrictTo } from "../../shared/middleware/rbac";

const router = Router();

router.use(auth, restrictTo("customer"));

router.get("/", CartController.fetchOwnCart);
router.post("/", CartController.addToCart);
router.delete("/", CartController.clearCart);

router.patch("/items/:inventoryId", CartController.updateCartItem);
router.delete("/items/:inventoryId", CartController.removeItem);

export default router;