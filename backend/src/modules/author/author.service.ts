import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../../infrastructure/imageHandler";
import { AppError } from "../../shared/error/appError";
import { Author, IAuthor } from "./author.model";
<<<<<<< HEAD
=======
import { paginate, PaginationOptions } from "../../shared/helper/pagination";
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31

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
<<<<<<< HEAD

=======
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
        const newAuthor = await Author.create({
            name: input.name,
            bio: input.bio,
            image: imageData,
            isVerified: false
        });

        return { success: true, message: "Request sent successfully", newAuthor };
    }

<<<<<<< HEAD
    // UPDATE AUTHOR (Fixed: Handles partial updates correctly without crashing)
=======
    // UPDATE AUTHOR
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
    static async updateAuthor(id: string, data: Partial<IAuthor>, file: any) {
        const findAuthor = await Author.findById(id);
        if (!findAuthor) throw new AppError("Author not found", 404);

<<<<<<< HEAD
        const updateData: any = { isVerified: false };

        if (data.name) updateData.name = data.name.trim().toLowerCase();
        if (data.bio) updateData.bio = data.bio.trim();

        if (file) {
            if (findAuthor.image?.publicUrl) {
                await deleteImage(findAuthor.image.publicUrl);
            }
=======
        const input = new AuthorPayload(data);
        const updateData: any = { isVerified: false };

        if (input.name) updateData.name = input.name;
        if (input.bio) updateData.bio = input.bio;

        if (file) {
            if (findAuthor.image?.publicUrl)
                await deleteImage(findAuthor.image.publicUrl);

>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
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

<<<<<<< HEAD
        if (author.image?.publicUrl) {
            await deleteImage(author.image.publicUrl);
        }
        return { success: true, message: "Author deleted successfully" };
    }

    // PRIVATE GENERIC FETCH
    private static async genericFetch(filter: mongoose.QueryFilter<IAuthor> = {}) {
        const authors = await Author.find(filter);
        return { success: true, message: authors.length ? "Authors fetched successfully" : "No authors available", authors };
    }

    // FETCH VERIFIED AUTHORS
    static async fetchVerifiedAuthors() {
        return await AuthorService.genericFetch({ isVerified: true });
    }

    // FETCH UNVERIFIED AUTHORS
    static async fetchUnverifiedAuthors() {
        return await AuthorService.genericFetch({ isVerified: false });
    }

    // NEW / REFACTORED: FETCH EVERY AUTHOR (Explicit execution scope)
    static async fetchAllAuthors() {
        return await AuthorService.genericFetch();
=======
        if (author.image?.publicUrl) await deleteImage(author.image.publicUrl);
        return { success: true, message: "Author deleted successfully" };
    }

    // UPDATED: CENTRALIZED GENERIC FETCH WITH SEARCH SUPPORT
    private static async genericFetch(
        filter: mongoose.QueryFilter<IAuthor> = {}, 
        options: PaginationOptions = {},
        search?: string
    ) {
        // Create a shallow copy of the base filter to safely add properties
        const query: any = { ...filter };

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { bio: searchRegex }
            ];
        }

        const result = await paginate<IAuthor>(Author, query, options);
        
        return {
            success: result.success,
            message: result.data.length ? "Authors fetched successfully" : "No authors available",
            meta: result.meta,
            authors: result.data 
        };
    }

    // UPDATED WITH SEARCH PARAMETER
    static async fetchVerifiedAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({ isVerified: true }, { page, limit }, search);
    }

    // UPDATED WITH SEARCH PARAMETER
    static async fetchAllAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({}, { page, limit }, search);
    }

    // UPDATED WITH SEARCH PARAMETER
    static async fetchUnverifiedAuthors(page?: number, limit?: number, search?: string) {
        return await this.genericFetch({ isVerified: false }, { page, limit }, search);
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
    }

    // FETCH BY ID
    static async fetchAuthorById(id: string) {
        const author = await Author.findById(id);
        if (!author) throw new AppError("Author not found", 404);
<<<<<<< HEAD
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

    // GET AUTHOR BY NAME / ID (Internal lookups)
    static async getAuthorName(identifier: string) {
        const query = mongoose.Types.ObjectId.isValid(identifier) 
            ? { _id: identifier } 
            : { name: identifier.trim().toLowerCase() };

        const author = await Author.findOne(query);
=======

        return { success: true, message: "Author fetched successfully", author };
    }

    // TOGGLE VERIFICATION
    static async toggleVerification(id: string) {
        const response = await this.fetchAuthorById(id);
        const authorDoc = response.author;

        authorDoc.isVerified = !authorDoc.isVerified;
        await authorDoc.save();

        return { success: true, message: authorDoc.isVerified ? "Author request accepted" : "Author rejected", authorDoc };
    }

    // FETCH AUTHOR NAME
    static async getAuthorName(name: string) {
        const author = await Author.findOne({ name: name.trim().toLowerCase() });
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
        if (!author) throw new AppError("Author not found", 404);
        return author;
    }
}