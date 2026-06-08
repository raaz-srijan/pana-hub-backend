import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AppError } from "../../shared/error/appError";
import { VendorService } from "./vendor.service";

export class VendorController {

    // VENDOR CREATION
    static createVendor = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError("Please login", 401);

        const result = await VendorService.requestVendor(req.user.id, req.body);
        return res.status(201).json(result);
    });

    // SELF DETAIL UPDATE
    static updateSelf = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError("Please login", 401);

        const result = await VendorService.updateVendor(req.user.id, req.body);
        return res.status(200).json(result);
    });

    // GET VENDORS REQUEST
    static getVendorsRequest = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await VendorService.fetchVendorRequests(page, limit);
        return res.status(200).json(result);
    });

    // GET VENDOR BY ID
    static getVendorById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new AppError("Invalid id", 400);

        const result = await VendorService.fetchVendorByID(id);
        return res.status(200).json(result);
    });

    // TOGGLE VERIFICATION
    static toggleVerification = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new AppError("Invalid id", 400);

        const result = await VendorService.toggleVerification(id);
        return res.status(200).json(result);
    });

    // REFACTORED: FETCH VENDORS (VERIFIED & PAGINATED)
    static GetVerifiedVendors = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await VendorService.fetchVerifiedVendors(page, limit);
        return res.status(200).json(result);
    });

    // SELF PROFILE
    static myProfile = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError("Please login", 401);

        const result = await VendorService.getMyVendorProfile(req.user.id);
        return res.status(200).json(result);
    });

    // DELETE
    static deleteVendor = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new AppError("Invalid id", 400);

        const result = await VendorService.deleteVendor(id);
        return res.status(200).json(result);
    });
}