import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../../infrastructure/imageHandler";
import { AppError } from "../../shared/error/appError";
import { Author, IAuthor } from "./author.model";
import { paginate, PaginationOptions } from "../../shared/helper/pagination";

export class AuthorPayload {
    public readonly name: string;
    public readonly bio?: string;

    constructor(data: Partial<IAuthor>) {
        if (!data || !data.name) {
            throw new AppError("Please fill all the required fields", 400);
        }
        this.name = data.name.trim().toLowerCase();
        this.bio = data.bio?.trim();
    }
}

export class AuthorService {

    // REQUEST AUTHOR
    static async requestAuthor(data: Partial<IAuthor>, file: any) {
        const input = new AuthorPayload(data);
        let imageData = { imageUrl: "", publicUrl: "" };

        if (file) {
            const upload = await uploadImage(file.path);
            imageData = { imageUrl: upload.secure_url, publicUrl: upload.public_id };
        }
        const newAuthor = await Author.create({
            name: input.name,
            bio: input.bio,
            image: imageData,
            isVerified: false
        });

        return { success: true, message: "Request sent successfully", newAuthor };
    }

    // UPDATE AUTHOR (Fixed: Combines partial updates safety with the original Payload constraints)
    static async updateAuthor(id: string, data: Partial<IAuthor>, file: any) {
        const findAuthor = await Author.findById(id);
        if (!findAuthor) throw new AppError("Author not found", 404);

        const updateData: any = { isVerified: false };

        if (data.name) updateData.name = data.name.trim().toLowerCase();
        if (data.bio) updateData.bio = data.bio.trim();

        if (file) {
            if (findAuthor.image?.publicUrl) {
                await deleteImage(findAuthor.image.publicUrl);
            }
            const upload = await uploadImage(file.path);
            updateData.image = { imageUrl: upload.secure_url, publicUrl: upload.public_id };
        }

        const author = await Author.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        return { success: true, message: "Author updated successfully", author };
    }

    // DELETE AUTHOR
    static async deleteAuthor(id: string) {
        const author = await Author.findByIdAndDelete(id);
        if (!author) throw new AppError("Author not found", 404);

        if (author.image?.publicUrl) {
            await deleteImage(author.image.publicUrl);
        }
        return { success: true, message: "Author deleted successfully" };
    }

    // CENTRALIZED GENERIC FETCH WITH PAGINATION AND SEARCH SUPPORT
    private static async genericFetch(
    filter: mongoose.QueryFilter<IAuthor> = {}, 
    options: PaginationOptions = {},
    search?: string
) {
    const query: any = { ...filter };

    if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
            { name: searchRegex },
            { bio: searchRegex }
        ];
    }

    const result = await paginate<IAuthor>(Author, query, {
        ...options,
        select: "name bio image isVerified createdAt updatedAt" 
    });
    
    return {
        success: result.success,
        message: result.data.length ? "Authors fetched successfully" : "No authors available",
        meta: result.meta,
        authors: result.data 
    };
}

    // FETCH VERIFIED AUTHORS WITH SEARCH & PAGINATION
    static async fetchVerifiedAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({ isVerified: true }, { page, limit }, search);
    }

    // FETCH UNVERIFIED AUTHORS WITH SEARCH & PAGINATION
    static async fetchUnverifiedAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({ isVerified: false }, { page, limit }, search);
    }

    // FETCH EVERY AUTHOR WITH SEARCH & PAGINATION
    static async fetchAllAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({}, { page, limit }, search);
    }

    // FETCH BY ID
    static async fetchAuthorById(id: string) {
        const author = await Author.findById(id);
        if (!author) throw new AppError("Author not found", 404);
        return { success: true, message: "Author fetched successfully", author };
    }

    // TOGGLE VERIFICATION (Safe instance tracking)
    static async toggleVerification(id: string) {
        const author = await Author.findById(id);
        if (!author) throw new AppError("Author not found", 404);

        author.isVerified = !author.isVerified;
        await author.save();

        return { success: true, message: author.isVerified ? "Author request accepted" : "Author rejected", author };
    }

    // GET AUTHOR BY NAME / ID (Kept the advanced dynamic internal lookups from HEAD)
    static async getAuthorName(identifier: string) {
        const query = mongoose.Types.ObjectId.isValid(identifier) 
            ? { _id: identifier } 
            : { name: identifier.trim().toLowerCase() };

        const author = await Author.findOne(query);
        if (!author) throw new AppError("Author not found", 404);
        return author;
    }
}