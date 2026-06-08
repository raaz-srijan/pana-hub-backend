import { Router } from "express";
import { CategoryController } from "./category.controller";
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";

const router = Router();

//PUBLIC ROUTES
router.get("/approved", CategoryController.fetchAllCat);
router.get("/name/:name", CategoryController.getCatName);

//VENDOR & ADMIN ROUTES
router.post("/request", auth, restrictTo("vendor", "admin"), CategoryController.addCat);
router.put("/:id", auth, restrictTo("vendor", "admin"), CategoryController.updateCat);

//ADMIN ONLY ROUTES
router.get("/requested", auth, restrictTo("admin"), CategoryController.fetchRequestCat);
router.patch("/:id/toggle-approve", auth, restrictTo("admin"), CategoryController.toggleApprove);
router.delete("/:id", auth, restrictTo("admin"), CategoryController.deleteCat);

export default router;