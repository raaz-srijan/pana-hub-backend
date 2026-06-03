import { Router } from "express";
import { InventoryController } from "./inventory.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { requireVendor } from "../../shared/middleware/requireVendor";

const router = Router();

router.get("/store/:vendorId", InventoryController.fetchPublicStorefront);

router.use(auth, restrictTo("vendor"), requireVendor);

router.post("/", InventoryController.addItem);
router.get("/", InventoryController.fetchAll);

router.get("/active", InventoryController.fetchActive);
router.get("/inactive", InventoryController.fetchInactive);

router.patch("/:id", InventoryController.updateItem);
router.delete("/:id", InventoryController.deleteItem);

export default router;