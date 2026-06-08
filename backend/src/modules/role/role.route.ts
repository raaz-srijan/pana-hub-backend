import { Router } from "express";
import { RoleController } from "./role.controller";
import { auth } from "../../shared/middleware/auth";

const router = Router();

router.use(auth);

//GET
router.get("/", RoleController.fetchAllRoles);
router.get("/:id", RoleController.fetchRoleById);

//POST
router.post("/", RoleController.addRole);

//UPDATE
router.patch("/:id", RoleController.updateRole);

//DELETE
router.delete("/:id", RoleController.deleteRole);

export default router;