import { Router } from "express";
import { WishlistController } from "./wishlist.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";

const router = Router();

router.use(auth, restrictTo("customer"));

router.get("/", WishlistController.getWishlist);
router.post("/add/:bookId", WishlistController.addToWishlist);
router.delete("/remove/:bookId", WishlistController.removeFromWishlist);
router.delete("/clear", WishlistController.clearWishlist);

export default router;