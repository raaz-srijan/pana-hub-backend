import { Router } from "express";
import { PermissionController } from "./permission.controller";

const router = Router();

router.get("/", PermissionController.getAllPermissions);
router.get("/:id", PermissionController.getPermissionById);
router.post("/", PermissionController.addPerm);
router.patch("/:id", PermissionController.updatePerm);
router.delete("/:id", PermissionController.deletePerm);

export default router;