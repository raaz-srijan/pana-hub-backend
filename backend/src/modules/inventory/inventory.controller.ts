import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { InventoryService } from "./inventory.service";
import { AppError } from "../../shared/error/appError";

export class InventoryController {

    private static getVendorIdOrThrow(req: Request): string {
        const vendorId = req.vendorId;
        if (!vendorId) {
            throw new AppError("Access Denied. Please log in as a valid vendor.", 401);
        }
        return vendorId;
    }


    // ADD ITEM TO INVENTORY
    static addItem = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);

        const result = await InventoryService.addItem(vendorId, req.body);

        res.status(201).json(result);
    });


    // UPDATE ITEM IN INVENTORY
    static updateItem = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);
        const { id } = req.params; // Expecting /api/v1/inventory/:id

        const result = await InventoryService.updateItem(vendorId, id, req.body);

        res.status(200).json(result);
    });


    // DELETE ITEM (SOFT DELETE)
    static deleteItem = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);
        const { id } = req.params; // Expecting /api/v1/inventory/:id

        const result = await InventoryService.deleteItem(vendorId, id);

        res.status(200).json(result);
    });


   // FETCH ACTIVE ITEMS (?search=...)
    static fetchActive = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);
        const search = req.query.search as string | undefined;

        const result = await InventoryService.fetchActive(vendorId, search);
        res.status(200).json(result);
    });

    
    // FETCH INACTIVE ITEMS (?search=...)
    static fetchInactive = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);
        const search = req.query.search as string | undefined;

        const result = await InventoryService.fetchInactive(vendorId, search);
        res.status(200).json(result);
    });


    // FETCH ALL ITEMS (search)
    static fetchAll = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);
        const search = req.query.search as string | undefined;

        const result = await InventoryService.fetchAll(vendorId, search);
        res.status(200).json(result);
    });


    // FETCH PUBLIC STOREFRONT ITEMS (?search=...)
    static fetchPublicStorefront = catchAsync(async (req: Request, res: Response) => {
        const { vendorId } = req.params;
        const search = req.query.search as string | undefined;

        if (!vendorId) {
            throw new AppError("Vendor ID parameter is required", 400);
        }

        const result = await InventoryService.fetchPublicStorefront(vendorId, search);
        res.status(200).json(result);
    });
}