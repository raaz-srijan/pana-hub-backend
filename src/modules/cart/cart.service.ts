import { Types } from "mongoose";
import { AppError } from "../../shared/error/appError";
import { Cart } from "./cart.model";
import { InventoryService } from "../inventory/inventory.service";

interface IAddCartItemInput {
    inventoryId: string | Types.ObjectId;
    quantity: number;
}

class CartPayload {
    public readonly items: {
        inventoryId: Types.ObjectId;
        quantity: number;
    }[];

    constructor(data: { items?: IAddCartItemInput[] }) {
        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
            throw new AppError("Cart items are required", 400);
        }

        this.items = data.items.map((item, index) => {
            if (!item.inventoryId) {
                throw new AppError(`Missing inventoryId at item index ${index}`, 400);
            }
            if (item.quantity === undefined || item.quantity < 1) {
                throw new AppError(`Invalid or missing quantity at item index ${index}. Must be at least 1.`, 400);
            }

            return {
                inventoryId: typeof item.inventoryId === "string"
                    ? new Types.ObjectId(item.inventoryId)
                    : item.inventoryId,
                quantity: Number(item.quantity)
            };
        });
    }
}

export class CartService {

    //ADD TO CART
    static async addToCart(userId: string, data: { items?: IAddCartItemInput[] }) {
        const input = new CartPayload(data);

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        for (const inputItem of input.items) {
            const inventory = await InventoryService.findInventoryById(inputItem.inventoryId.toString());

            if (!inventory.isActive) {
                throw new AppError(`Item is currently unavailable`, 400);
            }

            const existingItemIndex = cart.items.findIndex(
                (item) => item.inventoryId.toString() === inputItem.inventoryId.toString()
            );

            if (existingItemIndex > -1) {
                const targetQuantity = cart.items[existingItemIndex].quantity + inputItem.quantity;

                if (targetQuantity > inventory.stock) {
                    throw new AppError(`Cannot add more items. Only ${inventory.stock} units left in stock.`, 400);
                }

                cart.items[existingItemIndex].quantity = targetQuantity;
            } else {
                if (inputItem.quantity > inventory.stock) {
                    throw new AppError(`Requested quantity exceeds available stock (${inventory.stock} available).`, 400);
                }

                cart.items.push({
                    inventoryId: inputItem.inventoryId,
                    quantity: inputItem.quantity
                });
            }
        }

        await cart.save();

        return { success: true, message: "Cart updated successfully", cart };
    }


    //UPDATE CART ITEMS
    static async updateCartItem(userId: string, inventoryId: string, quantity: number) {
        if (!inventoryId) {
            throw new AppError("Inventory ID is required", 400);
        }
        if (quantity === undefined || isNaN(quantity)) {
            throw new AppError("A valid quantity must be provided", 400);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.inventoryId.toString() === inventoryId
        );

        if (itemIndex === -1) {
            throw new AppError("Item not found in your cart", 404);
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
            return { success: true, message: "Item removed from cart", cart };
        }

        const inventory = await InventoryService.findInventoryById(inventoryId);

        if (!inventory.isActive) {
            throw new AppError("This item is no longer available", 400);
        }

        if (quantity > inventory.stock) {
            throw new AppError(`Cannot update quantity. Only ${inventory.stock} units are available.`, 400);
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return {
            success: true,
            message: "Cart item updated successfully",
            cart
        };
    }


    //REMOVE A SINGLE ITEM ENTIRELY FROM THE CART
    static async removeItem(userId: string, inventoryId: string) {
        if (!inventoryId) {
            throw new AppError("Inventory ID is required", 400);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.inventoryId.toString() === inventoryId
        );

        if (itemIndex === -1) {
            throw new AppError("Item not found in your cart", 404);
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return {
            success: true,
            message: "Item removed from cart successfully",
            cart
        };
    }


    // CLEAR THE ENTIRE CART
    static async clearCart(userId: string) {
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        return {
            success: true,
            message: "Cart cleared successfully",
            cart
        };
    }


    //FETCH OWN CART
    static async fetchOwnCart(userId: string) {
        const cart = await Cart.findOne({ userId }).populate({
            path: "items.inventoryId",
            populate: [
                {
                    path: "bookId",
                    select: "name isbn coverImage author",
                    populate: { path: "author", select: "name" }
                },
                {
                    path: "vendorId",
                    select: "vendorName"
                }
            ]
        });

        if (!cart || cart.items.length === 0) {
            return {
                success: true,
                message: "Cart is empty",
                data: {
                    items: [],
                    grandTotal: 0,
                    totalItems: 0
                }
            };
        }

        let grandTotal = 0;
        let totalItems = 0;

        const formattedItems = cart.items.map((item) => {
            const inventory = item.inventoryId as any;

            if (!inventory) {
                return null;
            }

            const unitPrice = inventory.price;
            const subTotal = unitPrice * item.quantity;

            grandTotal += subTotal;
            totalItems += item.quantity;

            return {
                inventoryId: inventory._id,
                bookDetails: inventory.bookId,
                vendorDetails: inventory.vendorId,
                unitPrice,
                quantity: item.quantity,
                subTotal,
                inStock: inventory.stock,
                isAvailable: inventory.isActive && inventory.stock > 0
            };
        }).filter(item => item !== null);

        return {
            success: true,
            message: "Cart fetched successfully",
            data: {
                items: formattedItems,
                grandTotal: Number(grandTotal.toFixed(2)),
                totalItems
            }
        };
    }
}