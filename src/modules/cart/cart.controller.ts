import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AppError } from "../../shared/error/appError";
import { CartService } from "./cart.service";

export class CartController {

    //ADD TO CART
    static addToCart = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Authentication required. Please login.", 401);
        }
        
        const userId = req.user.id;
        const result = await CartService.addToCart(userId, req.body);

        res.status(200).json(result);
    });


    //FETCH OWN CART
    static fetchOwnCart = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Authentication required. Please login.", 401);
        }

        const userId = req.user.id;
        const result = await CartService.fetchOwnCart(userId);

        res.status(200).json(result);
    });


    //UPDATE CART ITEM QUANTITY
    static updateCartItem = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Authentication required. Please login.", 401);
        }

        const userId = req.user.id;
        const { inventoryId } = req.params;
        const { quantity } = req.body;

        const result = await CartService.updateCartItem(userId, inventoryId, quantity);

        res.status(200).json(result);
    });

    
    //REMOVE A SINGLE ITEM ENTIRELY
    static removeItem = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Authentication required. Please login.", 401);
        }

        const userId = req.user.id;
        const { inventoryId } = req.params;

        const result = await CartService.removeItem(userId, inventoryId);

        res.status(200).json(result);
    });


    //CLEAR ENTIRE CART
    static clearCart = catchAsync(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError("Authentication required. Please login.", 401);
        }

        const userId = req.user.id;
        const result = await CartService.clearCart(userId);

        res.status(200).json(result);
    });
}