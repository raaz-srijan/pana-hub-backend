import { Router } from "express";
import { BookController } from "./book.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { upload } from "../../shared/middleware/upload";

const router = Router();

<<<<<<< HEAD
// 1. LITERAL / STATIC PATHS FIRST (Protected or Public)
router.get("/search", BookController.searchBook); 
router.get("/public", BookController.publicFetchBooks);
router.get("/all", auth, restrictTo("admin", "vendors"), BookController.getAllBooks); // Fixed inline
router.get("/", BookController.getVerifiedBooks);

// 2. DYNAMIC PATH PARAMETERS LAST
router.get("/:id", BookController.getBookById); 


// 3. MIDDLEWARE BARRIER FOR EVERYTHING BELOW
router.use(auth);

// ADMIN ONLY SYSTEM MANAGEMENT
router.get("/admin/unverified", restrictTo("admin"), BookController.getUnVerifiedBooks);
router.get("/admin/trash", restrictTo("admin"), BookController.getTrashedBooks);
router.patch("/:id/verify", restrictTo("admin"), BookController.toggleVerification);
router.delete("/:id/permanent", restrictTo("admin"), BookController.permanentlyDeleteBook);

// VENDOR & ADMIN DATA MUTATIONS
router.post("/", restrictTo("vendor", "admin"), upload.single("image"), BookController.addBook);
router.put("/:id", restrictTo("vendor", "admin"), upload.single("image"), BookController.updateBook);
router.delete("/:id", restrictTo("vendor", "admin"), BookController.deleteBook); 
=======
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
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31

export default router;