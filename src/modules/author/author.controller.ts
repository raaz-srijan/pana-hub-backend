import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AuthorService } from "./author.service";
import { AppError } from "../../shared/error/appError";

export class AuthorController {

    // ADD AUTHOR
    static addAuthor = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthorService.requestAuthor(req.body, req.file);
        return res.status(201).json(result);
    });

    // UPDATE AUTHOR
    static updateAuthor = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new AppError("Invalid id", 404);

        const result = await AuthorService.updateAuthor(id, req.body, req.file);
        return res.status(200).json(result);
    });

    // DELETE AUTHOR
    static deleteAuthor = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new AppError("Invalid id", 404);

        const result = await AuthorService.deleteAuthor(id);
        return res.status(200).json(result);
    });

    // GET ALL AUTHORS (With Pagination Context)
    static getAllAuthors = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await AuthorService.fetchAllAuthors(page, limit);
        return res.status(200).json(result);
    });

    // GET VERIFIED AUTHORS (With Pagination Context)
    static getVerifiedAuthors = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await AuthorService.fetchVerifiedAuthors(page, limit);
        return res.status(200).json(result);
    });

    // GET UNVERIFIED AUTHORS (With Pagination Context)
    static getUnverifiedAuthors = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await AuthorService.fetchUnverifiedAuthors(page, limit);
        return res.status(200).json(result);
    });

    // GET AUTHOR BY ID
    static getAuthorById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.fetchAuthorById(id);
        return res.status(200).json(result);
    });

    // TOGGLE VERIFICATION (Approve / Reject)
    static toggleVerification = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.toggleVerification(id);
        return res.status(200).json(result);
    });
}