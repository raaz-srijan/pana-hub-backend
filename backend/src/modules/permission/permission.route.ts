import { Router } from "express";
import { PermissionController } from "./permission.controller";
import { auth } from "../../shared/middleware/auth";

const router = Router();

router.use(auth);

//GET
router.get("/", PermissionController.getAllPermissions);
router.get("/:id", PermissionController.getPermissionById);

//POST
router.post("/", PermissionController.addPerm);

//UPDATE
router.patch("/:id", PermissionController.updatePerm);

//DELETE
router.delete("/:id", PermissionController.deletePerm);

export default router;