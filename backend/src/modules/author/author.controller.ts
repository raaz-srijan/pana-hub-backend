import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AuthorService } from "./author.service";

export class AuthorController {

    static addAuthor = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthorService.requestAuthor(req.body, req.file);
        return res.status(201).json(result);
    });

    static updateAuthor = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.updateAuthor(id, req.body, req.file);
        return res.status(200).json(result);
    });

    static deleteAuthor = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.deleteAuthor(id);
        return res.status(200).json(result);
    });

    static getVerifiedAuthors = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthorService.fetchVerifiedAuthors();
        return res.status(200).json(result);
    });

    static getUnverifiedAuthors = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthorService.fetchUnverifiedAuthors();
        return res.status(200).json(result);
    });

    static getAllAuthors = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthorService.fetchAllAuthors();
        return res.status(200).json(result);
    });

    static getAuthorById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.fetchAuthorById(id);
        return res.status(200).json(result);
    });

    static toggleVerification = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await AuthorService.toggleVerification(id);
        return res.status(200).json(result);
    });
}