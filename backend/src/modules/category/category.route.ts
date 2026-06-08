import { Router } from "express";
import { CategoryController } from "./category.controller";
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";

const router = Router();

router.get("/approved", CategoryController.fetchAllCat);
router.get("/name/:name", CategoryController.getCatName);


router.use(auth); 

router.get("/all", restrictTo("admin", "vendor"), CategoryController.fetchEveryCat);

router.get("/requested", restrictTo("admin"), CategoryController.fetchRequestCat);

router.post("/request", restrictTo("vendor", "admin"), CategoryController.addCat);


router.put("/:id", restrictTo("vendor", "admin"), CategoryController.updateCat);
router.patch("/:id/toggle-approve", restrictTo("admin"), CategoryController.toggleApprove);
router.delete("/:id", restrictTo("admin"), CategoryController.deleteCat);

export default router;