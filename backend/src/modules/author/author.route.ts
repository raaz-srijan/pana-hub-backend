import { Router } from "express";
import { AuthorController } from "./author.controller";
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";
import { upload } from "../../shared/middleware/upload";

const router = Router();

router.get("/verified", AuthorController.getVerifiedAuthors);


router.use(auth);

router.get("/all", restrictTo("admin", "vendor"), AuthorController.getAllAuthors);
router.get("/unverified", restrictTo("admin"), AuthorController.getUnverifiedAuthors);
router.post("/request", restrictTo("vendor", "admin"), upload.single("image"), AuthorController.addAuthor);


router.get("/:id", AuthorController.getAuthorById);
router.put("/:id", restrictTo("vendor", "admin"), upload.single("image"), AuthorController.updateAuthor);
router.patch("/:id/verify", restrictTo("admin"), AuthorController.toggleVerification);
router.delete("/:id", restrictTo("admin"), AuthorController.deleteAuthor);

export default router;