import { Router } from "express";
import { BookController } from "./book.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { upload } from "../../shared/middleware/upload";

const router = Router();

router.get("/search", BookController.searchBook);

router.get("/public", BookController.publicFetchBooks);

router.get("/public/:id", BookController.publicFetchBookById);
router.get("/", BookController.getVerifiedBooks);
router.get("/:id", BookController.getBookById);

router.use(auth);

router.get("/admin/all", restrictTo("admin"), BookController.getAllBooks);
router.get("/admin/unverified", restrictTo("admin"), BookController.getUnVerifiedBooks);
router.get("/admin/trash", restrictTo("admin"), BookController.getTrashedBooks);

router.patch("/:id/verify", restrictTo("admin"), BookController.toggleVerification);
router.delete("/:id/permanent", restrictTo("admin"), BookController.permanentlyDeleteBook);

router.post("/", restrictTo("vendors", "admin"), upload.single("image"), BookController.addBook);
router.put("/:id", restrictTo("vendors", "admin"), upload.single("image"), BookController.updateBook);
router.delete("/:id", restrictTo("vendors", "admin"), BookController.deleteBook);

export default router;