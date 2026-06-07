import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { GenreService } from "./genre.service";

export class GenreController {

    // REQUEST / ADD GENRE
    static addGenre = catchAsync(async (req: Request, res: Response) => {
        const result = await GenreService.requestGenre(req.body);
        res.status(201).json(result);
    });

    // UPDATE GENRE
    static updateGenre = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await GenreService.updateGenre(id, req.body);
        res.status(200).json(result);
    });

    // DELETE GENRE
    static deleteGenre = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await GenreService.deleteGenre(id);
        res.status(200).json(result);
    });

    // FETCH REQUESTED GENRES (PAGINATED)
    static fetchRequestGenre = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await GenreService.fetchRequestGenre(page, limit);
        res.status(200).json(result);
    });

    // TOGGLE APPROVAL
    static toggleApprove = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await GenreService.toggleApprove(id);
        res.status(200).json(result);
    });

    // FETCH APPROVED GENRES (PAGINATED)
    static fetchAllGenre = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await GenreService.fetchAllGenre(page, limit);
        res.status(200).json(result);
    });

    // GET GENRE BY NAME
    static getGenreName = catchAsync(async (req: Request, res: Response) => {
        const { name } = req.params;
        const result = await GenreService.getGenreName(name);
        res.status(200).json(result);
    });
}