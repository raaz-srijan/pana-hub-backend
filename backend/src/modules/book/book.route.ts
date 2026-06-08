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


router.use(auth);


router.get("/admin/all", restrictTo("admin", "vendor"), BookController.getAllBooks);
router.get("/admin/unverified", restrictTo("admin"), BookController.getUnVerifiedBooks);
router.get("/admin/trash", restrictTo("admin"), BookController.getTrashedBooks);

router.post("/", restrictTo("vendor", "admin"), upload.single("coverImage"), BookController.addBook);


router.patch("/:id/verify", restrictTo("admin"), BookController.toggleVerification);
router.delete("/:id/permanent", restrictTo("admin"), BookController.permanentlyDeleteBook);

router.get("/:id", restrictTo("admin", "vendor"), BookController.getBookById);
router.put("/:id", restrictTo("vendor", "admin"), upload.single("coverImage"), BookController.updateBook);
router.delete("/:id", restrictTo("vendor", "admin"), BookController.deleteBook);

export default router;