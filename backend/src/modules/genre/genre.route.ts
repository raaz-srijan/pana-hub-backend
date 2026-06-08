import { Router } from "express";
import { GenreController } from "./genre.controller";
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";

const router = Router();

//PUBLIC ROUTES
router.get("/approved", GenreController.fetchAllGenre);
router.get("/name/:name", GenreController.getGenreName);

//VENDOR & ADMIN ROUTES
router.post("/request", auth, restrictTo("vendor", "admin"), GenreController.addGenre);
router.put("/:id", auth, restrictTo("vendor", "admin"), GenreController.updateGenre);

//ADMIN ONLY ROUTES
router.get("/requested", auth, restrictTo("admin"), GenreController.fetchRequestGenre);
router.patch("/:id/toggle-approve", auth, restrictTo("admin"), GenreController.toggleApprove);
router.delete("/:id", auth, restrictTo("admin"), GenreController.deleteGenre);

export default router;