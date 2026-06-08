import { Router } from "express";
import { GenreController } from "./genre.controller";
import { restrictTo } from "../../shared/middleware/rbac";
import { auth } from "../../shared/middleware/auth";

const router = Router();

// PUBLIC ROUTES
router.get("/approved", GenreController.fetchAllGenre);
router.get("/name/:name", GenreController.getGenreName);


// PROTECTED ROUTES (Requires Authentication)
router.use(auth);

router.get("/all", restrictTo("admin", "vendor"), GenreController.fetchEveryGenre);

router.get("/requested", restrictTo("admin"), GenreController.fetchRequestGenre);

router.post("/request", restrictTo("vendor", "admin"), GenreController.addGenre);


router.put("/:id", restrictTo("vendor", "admin"), GenreController.updateGenre);
router.patch("/:id/toggle-approve", restrictTo("admin"), GenreController.toggleApprove);
router.delete("/:id", restrictTo("admin"), GenreController.deleteGenre);

export default router;