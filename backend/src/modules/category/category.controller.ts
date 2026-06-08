import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { CategoryService } from "./category.service";

export class CategoryController {

    // REQUEST / ADD CATEGORY
    static addCat = catchAsync(async (req: Request, res: Response) => {
        const result = await CategoryService.requestCat(req.body);
        return res.status(201).json(result);
    });


    // UPDATE CATEGORY
    static updateCat = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await CategoryService.updateCat(id, req.body);
        return res.status(200).json(result);
    });


    // DELETE CATEGORY
    static deleteCat = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await CategoryService.deleteCat(id);
        return res.status(200).json(result);
    });


    // FETCH REQUESTED CATEGORIES (PAGINATED & SEARCHABLE)
    static fetchRequestCat = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const search = req.query.search as string | undefined;

        const result = await CategoryService.fetchRequestCat(page, limit, search);
        return res.status(200).json(result);
    });


    // TOGGLE APPROVAL
    static toggleApprove = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await CategoryService.toggleApprove(id);
        return res.status(200).json(result);
    });


    // FETCH APPROVED CATEGORIES (PAGINATED & SEARCHABLE)
    static fetchAllCat = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const search = req.query.search as string | undefined;

        const result = await CategoryService.fetchAllCat(page, limit, search);
        return res.status(200).json(result);
    });

    // GET CATEGORY BY NAME
    static getCatName = catchAsync(async (req: Request, res: Response) => {
        const { name } = req.params;
        const result = await CategoryService.getCatName(name);
        return res.status(200).json(result);
    });
}