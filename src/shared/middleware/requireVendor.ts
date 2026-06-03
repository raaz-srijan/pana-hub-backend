import { Request, Response, NextFunction } from "express";
import { AppError } from "../error/appError";
import { VendorService } from "../../modules/vendor/vendor.service";

export const requireVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new AppError("Authentication required. Please log in.", 401);
        }

        const vendorProfile = await VendorService.findByUserId(req.user.id);

        if (vendorProfile.isPending) {
            throw new AppError("Your merchant profile application is currently pending admin approval.", 403);
        }

        if (!vendorProfile.isVerified) {
            throw new AppError("Your merchant account has been suspended or rejected by administration.",403);
        }

        req.vendorId = vendorProfile._id.toString();

        next();
    } catch (error) {
        next(error);
    }
};