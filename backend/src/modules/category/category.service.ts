import { AppError } from "../../shared/error/appError";
import { Category, ICategory } from "./category.model";
import { paginate } from "../../shared/helper/pagination";

class CategoryPayload {
    public readonly name: string;
    public readonly desc?: string;

    constructor(data: Partial<ICategory>) {
        if (!data || !data.name) {
            throw new AppError("Please fill all the required fields", 400);
        }

        this.name = data.name.trim().toLowerCase();
        this.desc = data.desc?.trim();
    }
}

export class CategoryService {
    // REQUEST CATEGORY
    static async requestCat(data: ICategory) {
        const input = new CategoryPayload(data);

        const existCat = await Category.findOne({ name: input.name });
        if (existCat)
            throw new AppError("Category with same name already exists", 409);

        const newCat = await Category.create({ name: input.name, desc: input.desc, isApproved: false });

        return { success: true, message: "Category request sent", newCat };
    }

    // UPDATE CATEGORY
    static async updateCat(id: string, data: ICategory) {
        const input = new CategoryPayload(data);

        const findCat = await Category.findById(id);
        if (!findCat)
            throw new AppError("Category not found", 404);

        const check = await Category.findOne({ name: input.name, _id: { $ne: id } });
        if (check)
            throw new AppError("Category with same name already exists", 409);

        const updateData: Partial<ICategory> = { name: input.name, desc: input.desc, isApproved: false };

        const update = await Category.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        return { success: true, message: "Category updated successfully", update };
    }

    // DELETE CATEGORY
    static async deleteCat(id: string) {
        const category = await Category.findByIdAndDelete(id);

        if (!category)
            throw new AppError("Category not found", 404);
        return { success: true, message: "Category deleted successfully" };
    }

    // UPDATED: FETCH REQUESTED CATEGORIES WITH SEARCH
    static async fetchRequestCat(page: number = 1, limit: number = 10, search?: string) {
        const query: any = { isApproved: false };

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { desc: searchRegex }
            ];
        }

        const result = await paginate<ICategory>(Category, query, { page, limit });
        
        return { 
            success: true, 
            message: result.data.length ? "Categories fetched successfully" : "No categories found", 
            meta: result.meta,
            categories: result.data 
        };
    }

    // TOGGLE APPROVE
    static async toggleApprove(id: string) {
        const category = await Category.findById(id);

        if (!category)
            throw new AppError("Category not found", 404);

        category.isApproved = !category.isApproved;
        await category.save();

        const message = category.isApproved ? "Category approved" : "Category disapproved";
        return { success: true, message: message, category };
    }

    // UPDATED: FETCH APPROVED CATEGORIES WITH SEARCH
    static async fetchAllCat(page: number = 1, limit: number = 10, search?: string) {
        const query: any = { isApproved: true };

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { desc: searchRegex }
            ];
        }

        const result = await paginate<ICategory>(Category, query, { page, limit });

        return { 
            success: true, 
            message: result.data.length ? "Categories fetched successfully" : "No categories found", 
            meta: result.meta,
            categories: result.data 
        };
    }

    // GET CATEGORY NAME
    static async getCatName(name: string) {
        const category = await Category.findOne({ name: name.trim().toLowerCase() });

        if (!category)
            throw new AppError("Category not found", 404);
        return category;
    }
}