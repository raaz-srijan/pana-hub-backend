import mongoose, { Types } from "mongoose";
import { VendorService } from "../vendor/vendor.service";
import { IInventory, Inventory } from "./inventory.model";
import { AppError } from "../../shared/error/appError";
import { BookService } from "../book/book.service";

class InventoryPayload {
    public readonly bookName?: string;
    public readonly bookIsbn?: string;
    public readonly price: number;
    public readonly stock: number;
    public readonly stockReminder?: number;

    constructor(data: any) {
        if (!data || data.price === undefined || data.stock === undefined) {
            throw new AppError("Please fill all the required fields (price and stock)", 400);
        }

        const hasName = data.bookName && data.bookName.trim() !== "";
        const hasIsbn = data.bookIsbn && data.bookIsbn.trim() !== "";

        if (!hasName && !hasIsbn) {
            throw new AppError("Please provide either a valid book name or an ISBN", 400);
        }

        this.bookName = data.bookName?.trim();
        this.bookIsbn = data.bookIsbn?.trim();
        this.price = data.price;
        this.stock = data.stock;
        this.stockReminder = data.stockReminder;
    }
}

export class InventoryService {

    //ADD-ITEMS
    static async addItem(vendorId: string, data: Partial<IInventory> & { bookName?: string; bookIsbn?: string }) {

        const findVendor = await VendorService.fetchVendorByID(vendorId);

        const input = new InventoryPayload(data);

        const book = await BookService.fetchBookBy(input.bookName, input.bookIsbn);

        const inventoryData: Partial<IInventory> = { vendorId: findVendor._id, bookId: book._id, price: input.price, stock: input.stock };

        if (input.stockReminder !== undefined) {
            inventoryData.stockReminder = input.stockReminder;
        }

        const newInventory = await Inventory.create(inventoryData);

        return { success: true, message: "Item added successfully", newInventory };
    }


    // FIND BY ID
    static async findInventoryById(id: string) {
        const inventory = await Inventory.findById(id);
        if (!inventory) {
            throw new AppError("Item not found", 404);
        }
        return inventory;
    }


    // UPDATE-ITEMS
    static async updateItem(vendorId: string, id: string, data: Partial<IInventory>) {
        const vendor = await VendorService.fetchVendorByID(vendorId);

        const existInventory = await this.findInventoryById(id);

        if (existInventory.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("You do not have permission to update this item", 403);
        }

        const updateData: Partial<IInventory> = {};

        if (data.stock !== undefined) {
            if (data.stock < 0) throw new AppError("Stock cannot be negative", 400);
            updateData.stock = data.stock;
        }

        if (data.stockReminder !== undefined) {
            if (data.stockReminder < 0) throw new AppError("Stock reminder cannot be negative", 400);
            updateData.stockReminder = data.stockReminder;
        }

        if (data.price !== undefined) {
            if (data.price < 0) throw new AppError("Price cannot be negative", 400);
            updateData.price = data.price;
        }

        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError("No valid fields provided for update", 400);
        }

        const update = await Inventory.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        return { success: true, message: "Item updated successfully", update };
    }


    // DELETE ITEM ( Soft Delete )
    static async deleteItem(vendorId: string, id: string) {
        const vendor = await VendorService.fetchVendorByID(vendorId);
        const inventory = await this.findInventoryById(id);

        if (inventory.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("You do not have permission to delete this item", 403);
        }

        await Inventory.findByIdAndUpdate(inventory._id, { $set: { isActive: false, stock: 0 } }, { new: true });

        return { success: true, message: "Item deactivated and removed from store view successfully" };
    };


    // FETCH FOR FILTER
    private static async itemFilter(vendorId: string, filter: Record<string, any> = {}) {
        const query = { vendorId, ...filter };

        const items = await Inventory.find(query)
            .populate([
                {
                    path: "bookId",
                    select: "name isbn coverImage author category",
                    populate: [
                        { path: "author", select: "name" },
                        { path: "category", select: "name" }
                    ]
                }
            ])
            .sort({ createdAt: -1 });

        return { success: true, message: items.length ? "Items fetched successfully" : "No items available", data: items };
    }


    // FETCH INACTIVE ITEMS
    static async fetchInactive(vendorId: string) {
        await VendorService.fetchVendorByID(vendorId);
        return await this.itemFilter(vendorId, { isActive: false });
    }


    // FETCH ACTIVE ITEMS
    static async fetchActive(vendorId: string) {
        await VendorService.fetchVendorByID(vendorId);
        return await this.itemFilter(vendorId, { isActive: true });
    }


    // FETCH ALL ITEMS
    static async fetchAll(vendorId: string) {
        await VendorService.fetchVendorByID(vendorId);
        return await this.itemFilter(vendorId, {});
    }


    // FETCH PUBLIC STOREFRONT
    static async fetchPublicStorefront(vendorId: string) {
        const vendor = await VendorService.fetchVendorByID(vendorId);
        if (!vendor.isVerified) {
            throw new AppError("Storefront is currently unavailable", 404);
        }

        //Fetch only active items with stock greater than 0
        const items = await Inventory.find({
            vendorId: vendor._id,
            isActive: true,
            stock: { $gt: 0 }
        })
            .populate([
                {
                    path: "bookId",
                    select: "name isbn coverImage author category",
                    populate: [
                        { path: "author", select: "name" },
                        { path: "category", select: "name" }
                    ]
                }
            ])
            .select("-stockReminder -createdAt -updatedAt")
            .sort({ createdAt: -1 });

        return {
            success: true, message: "Storefront items retrieved successfully", storeName: vendor.vendorName, address: vendor.address, data: items
        };
    }
}