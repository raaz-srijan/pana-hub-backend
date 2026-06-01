import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../shared/middleware/auth";

const router = Router();

router.post("/register", UserController.register);

router.use(auth);
router.patch("/update", UserController.updateUser);

export default router;