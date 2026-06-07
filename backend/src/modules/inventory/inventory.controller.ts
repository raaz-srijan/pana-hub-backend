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


    // FETCH ACTIVE ITEMS
    static fetchActive = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);

        const result = await InventoryService.fetchActive(vendorId);

        res.status(200).json(result);
    });


    // FETCH INACTIVE ITEMS
    static fetchInactive = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);

        const result = await InventoryService.fetchInactive(vendorId);

        res.status(200).json(result);
    });


    // FETCH ALL ITEMS
    static fetchAll = catchAsync(async (req: Request, res: Response) => {
        const vendorId = InventoryController.getVendorIdOrThrow(req);

        const result = await InventoryService.fetchAll(vendorId);

        res.status(200).json(result);
    });


    // FETCH PUBLIC STOREFRONT ITEMS
    static fetchPublicStorefront = catchAsync(async (req: Request, res: Response) => {
        const { vendorId } = req.params;

        if (!vendorId) {
            throw new AppError("Vendor ID parameter is required", 400);
        }

        const result = await InventoryService.fetchPublicStorefront(vendorId);

        res.status(200).json(result);
    });
}