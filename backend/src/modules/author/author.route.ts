import { Router } from "express";
import { AuthorController } from "./author.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { upload } from "../../shared/middleware/upload";

const router = Router();

router.get(
  "/unverified",
  auth,
  restrictTo("admin", "vendors"),
  AuthorController.getUnverifiedAuthors,
);

router.post(
  "/",
  auth,
  restrictTo("admin", "vendors"),
  upload.single("image"),
  AuthorController.addAuthor,
);

router.put(
  "/:id",
  auth,
  restrictTo("admin", "vendors"),
  upload.single("image"),
  AuthorController.updateAuthor,
);

router.delete("/:id", auth, restrictTo("admin"), AuthorController.deleteAuthor);

router.patch(
  "/:id/toggle-verify",
  auth,
  restrictTo("admin"),
  AuthorController.toggleVerification,
);

router.get("/", AuthorController.getAllAuthors);

router.get("/verified", AuthorController.getVerifiedAuthors);

router.get("/:id", AuthorController.getAuthorById);

export default router;
