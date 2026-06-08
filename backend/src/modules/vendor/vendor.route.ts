import { Router } from "express";
import { VendorController } from "./vendor.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";

const router = Router();

router.get("/verified", VendorController.GetVerifiedVendors);

router.use(auth);

router.post("/request", VendorController.createVendor);
router.get("/me", VendorController.myProfile);
router.put("/update", VendorController.updateSelf);

router.use(restrictTo("admin"));

router.get("/all", VendorController.fetchAllVendors); 
router.get("/requests", VendorController.getVendorsRequest);

router.patch("/:id/toggle-verification", VendorController.toggleVerification);
router.get("/:id", VendorController.getVendorById); // "all" won't fall down to here anymore!
router.delete("/:id", VendorController.deleteVendor);

export default router;