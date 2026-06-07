import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../../infrastructure/imageHandler";
import { AppError } from "../../shared/error/appError";
import { Author, IAuthor } from "./author.model";

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

    //REQUEST AUTHOR
    static async requestAuthor(data: Partial<IAuthor>, file: any) {
        const input = new AuthorPayload(data);

        let imageData = { imageUrl: "", publicUrl: "" };

        if (file) {
            const upload = await uploadImage(file.path);
            imageData = { imageUrl: upload.secure_url, publicUrl: upload.public_id };
        };
        const newAuthor = await Author.create({
            name: input.name,
            bio: input.bio,
            image: imageData,
            isVerified: false
        });

        return { success: true, message: "Request sent successfully", newAuthor };
    };


    //UPDATE AUTHOR
    static async updateAuthor(id: string, data: Partial<IAuthor>, file: any) {

        const findAuthor = await Author.findById(id);

        if (!findAuthor)
            throw new AppError("Author not found", 404);

        const input = new AuthorPayload(data);

        const updateData: any = { isVerified: false };

        if (input.name) updateData.name = input.name;
        if (input.bio) updateData.bio = input.bio;

        if (file) {
            if (findAuthor.image?.publicUrl)
                await deleteImage(findAuthor.image.publicUrl) //If there is image of an author previously

            const upload = await uploadImage(file.path);
            updateData.image = { imageUrl: upload.secure_url, publicUrl: upload.public_id }
        }

        const author = await Author.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        return { success: true, message: "Author updated successfully", author };
    };


    //DELETE AUTHOR
    static async deleteAuthor(id: string) {
        const author = await Author.findByIdAndDelete(id);

        if (!author)
            throw new AppError("Author not found", 404);

        if (author.image?.publicUrl)
            await deleteImage(author.image.publicUrl);

        return { success: true, message: "Author deleted successfully" };
    };


    //FILTER FOR FETCH
    private static async genericFetch(filter: mongoose.QueryFilter<IAuthor> = {}) {

        const authors = await Author.find(filter);

        return { success: true, message: authors.length ? "Authors fetched successfully" : "No authors available", authors }
    }


    //FETCH VERIFIED AUTHORS
    static async fetchVerifiedAuthors() {
        return await this.genericFetch({ isVerified: true });
    }


    //FETCH ALL AUTHORS
    static async fetchAllAuthors() {
        return await this.genericFetch();
    }


    //FETCH UNVERIFIED AUTHORS
    static async fetchUnverifiedAuthors() {
        return await this.genericFetch({ isVerified: false });
    }


    //FETCH BY ID
    static async fetchAuthorById(id: string) {
        const author = await Author.findById(id);

        if (!author)
            throw new AppError("Author not found", 404);

        return { success: true, message: "Author fetched successfully", author };
    }


    //TOGGLE VERIFICATION
    static async toggleVerification(id: string) {
        const response = await this.fetchAuthorById(id);

        const authorDoc = response.author;

        authorDoc.isVerified = !authorDoc.isVerified;
        await authorDoc.save();

        return { success: true, message: authorDoc.isVerified ? "Author request accepted" : "Author rejected", authorDoc };
    };


    //FETCH AUTHOR NAME
    static async getAuthorName(name:string) {
        const author = await Author.findOne({name:name.trim().toLowerCase()});
        if(!author)
            throw new AppError("Author not found", 404);
        return author;
    }
}