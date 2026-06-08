import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { PermissionService } from "./permission.service";
import { AppError } from "../../shared/error/appError";

export class PermissionController {

    // ADD
    static addPerm = catchAsync(async (req: Request, res: Response) => {
        const result = await PermissionService.createPerm(req.body);
        return res.status(201).json(result);
    });

    // UPDATE
    static updatePerm = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            throw new AppError("Invalid id", 400);
        }

        const result = await PermissionService.updatePerm(id.toString(), req.body);
        return res.status(200).json(result);
    });

    // DELETE
    static deletePerm = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            throw new AppError("Invalid id", 400);
        }

        const result = await PermissionService.deletePerm(id.toString());
        return res.status(200).json(result);
    });

    // REFACTORED: GET-ALL (PAGINATED)
    static getAllPermissions = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await PermissionService.fetchAllPerm(page, limit);
        return res.status(200).json(result);
    });

    // GET-ID
    static getPermissionById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            throw new AppError("Invalid id", 400);
        }

        const result = await PermissionService.fetchPermById(id.toString());
        return res.status(200).json(result);
    });
}