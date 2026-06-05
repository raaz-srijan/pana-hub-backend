import { Router } from "express";
import { initiatePayment, verifyKhaltiPayment, verifyEsewaPayment } from "./payment.controller";
import { auth } from "../../shared/middleware/auth";
import { restrictTo } from "../../shared/middleware/rbac";

const router = Router();

// Secure checkout initiation route
router.post("/initiate", auth, restrictTo("customer"), initiatePayment);

router.post("/verify/khalti", auth, verifyKhaltiPayment);
router.get("/verify/esewa", auth, verifyEsewaPayment);

export default router;