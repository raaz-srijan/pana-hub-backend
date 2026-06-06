import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { BookService } from "./book.service";

export class BookController {

    // ADD/REQUEST BOOK
    static addBook = catchAsync(async (req: Request, res: Response) => {
        const result = await BookService.requestBook(req.body, req.file);
        return res.status(201).json(result);
    });

    // UPDATE BOOK
    static updateBook = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.updateBook(id, req.body, req.file);
        return res.status(200).json(result);
    });

    // SOFT DELETE
    static deleteBook = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.deleteBook(id);
        return res.status(200).json(result);
    });

    // PERMANENT DELETE 
    static permanentlyDeleteBook = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.permanentlyDeleteBook(id);
        return res.status(200).json(result);
    });

    // FETCH ALL BOOKS (With Pagination)
    static getAllBooks = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await BookService.fetchAllBooks(page, limit);
        return res.status(200).json(result);
    });

    // FETCH VERIFIED BOOKS (With Pagination)
    static getVerifiedBooks = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await BookService.fetchVerifiedBooks(page, limit);
        return res.status(200).json(result);
    });

    // FETCH UNVERIFIED BOOKS (With Pagination)
    static getUnVerifiedBooks = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await BookService.fetchUnVerifiedBooks(page, limit);
        return res.status(200).json(result);
    });

    // FETCH BY ID
    static getBookById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.fetchById(id);
        return res.status(200).json(result);
    });

    // TOGGLE VERIFICATION (Approve/Reject requests)
    static toggleVerification = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.toggleVerification(id);
        return res.status(200).json(result);
    });

    // SEARCH/FETCH BY NAME OR ISBN
    static searchBook = catchAsync(async (req: Request, res: Response) => {
        const name = req.query.name as string | undefined;
        const isbn = req.query.isbn as string | undefined;

        const result = await BookService.fetchBookBy(name, isbn);
        return res.status(200).json(result);
    });

    // FETCH SOFT DELETES (View Trash bin - With Pagination)
    static getTrashedBooks = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await BookService.fetchSoftDelete(page, limit);
        return res.status(200).json(result);
    });

    // FETCH BOOKS WITH INVENTORY DETAILS FOR PUBLIC (With Pagination)
    static publicFetchBooks = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await BookService.fetchBooksForPublic(page, limit);
        return res.status(200).json(result);
    });

    // FETCH A SINGLE BOOK WITH INVENTORY DETAILS FOR PUBLIC
    static publicFetchBookById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await BookService.fetchBookByIdForPublic(id);
        return res.status(200).json(result);
    });
}