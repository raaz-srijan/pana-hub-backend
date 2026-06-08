import { Router } from "express";
import { AuthorController } from "./author.controller";
<<<<<<< HEAD
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";
=======
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
import { upload } from "../../shared/middleware/upload";

const router = Router();

<<<<<<< HEAD
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
=======
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
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
