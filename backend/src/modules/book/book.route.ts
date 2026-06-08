import { Router } from "express";
import { BookController } from "./book.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";
import { upload } from "../../shared/middleware/upload";

const router = Router();

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

export default router;