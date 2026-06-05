import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { WishlistService } from "./wishlist.service";
import { AppError } from "../../shared/error/appError";

export class WishlistController {
    
    //ADD TO WISHLIST
    static addToWishlist = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Please login to manage your wishlist.", 401);
        }

        const bookId = req.params.bookId;
        const result = await WishlistService.addToWishlist(req.user.id, bookId);

        return res.status(200).json(result);
    });


    //REMOVE FROM WISHLIST
    static removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Please login to manage your wishlist.", 401);
        }

        const bookId = req.params.bookId;
        const result = await WishlistService.removeFromWishlist(req.user.id, bookId);

        return res.status(200).json(result);
    });


    //CLEAR THE ENTIRE WISHLIST
    static clearWishlist = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Please login to manage your wishlist.", 401);
        }

        const result = await WishlistService.clearWishlist(req.user.id);

        return res.status(200).json(result);
    });


    //FETCH WISHLIST
    static getWishlist = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError("Please login to view your wishlist.", 401);
    }

    const result = await WishlistService.fetchWishlist(req.user.id);
    return res.status(200).json(result);
});
}