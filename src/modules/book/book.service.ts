import mongoose, { Types } from "mongoose";
import { AppError } from "../../shared/error/appError";
import { Book, IBook } from "./book.model";
import { deleteImage, uploadImage } from "../../infrastructure/imageHandler";
import { CategoryService } from "../category/category.service";
import { GenreService } from "../genre/genre.service";
import { AuthorService } from "../author/author.service";


class BookPayload {
    public readonly name: string;
    public readonly isbn: string;
    public readonly category: Types.ObjectId;
    public readonly genre: Types.ObjectId[];
    public readonly author: Types.ObjectId;
    public readonly publisher?: string;
    public readonly publishedDate?: Date;

    constructor(data: Partial<IBook>) {
        if (!data || !data.name || !data.isbn || !data.category || !Array.isArray(data.genre) || !data.author) {
            throw new AppError("Please fill all the required fields", 400);
        }
        this.name = data.name.trim().toLowerCase();
        this.isbn = data.isbn.trim().toLowerCase();
        this.category = data.category;
        this.genre = data.genre;
        this.author = data.author;
        this.publisher = data.publisher;
        this.publishedDate = data.publishedDate;
    }
};


export class BookService {

    // ADD BOOK
    static async requestBook(data: IBook, file: any) {
        const input = new BookPayload(data);

        //Only look for active books with this ISBN
        const existBook = await Book.findOne({ isbn: input.isbn, deletedAt: null });

        if (existBook)
            throw new AppError("Book is already registered", 409);

        let imageData: any = { imageUrl: "", publicId: "" };

        if (file) {
            const upload = await uploadImage(file.path);
            imageData = { imageUrl: upload.secure_url, publicId: upload.public_id };
        }

        const category = await CategoryService.getCatName(input.category.toString());
        const genre = await GenreService.validateGenre(input.genre);
        const author = await AuthorService.getAuthorName(input.author.toString());

        const newBook = await Book.create({
            name: input.name,
            isbn: input.isbn,
            category: category._id,
            genre: genre,
            author: author._id,
            publisher: input.publisher,
            publishedDate: input.publishedDate,
            coverImage: { imageUrl: imageData.imageUrl, publicId: imageData.publicId },
            isVerified: false
        });

        return { success: true, message: "Book added successfully", newBook };
    }


    // UPDATE BOOK
    static async updateBook(id: string, data: Partial<IBook>, file: any) {
        const existBook = await Book.findOne({ _id: id, deletedAt: null });

        if (!existBook)
            throw new AppError("Book not found", 404);

        const updateData: any = { isVerified: false };

        if (data.name) updateData.name = data.name.trim().toLowerCase();

        if (data.isbn) {
            const formattedIsbn = data.isbn.trim().toLowerCase();
            const duplicate = await Book.findOne({ isbn: formattedIsbn, _id: { $ne: id }, deletedAt: null });
            if (duplicate)
                throw new AppError("Book with same isbn already exists", 409);

            updateData.isbn = formattedIsbn;
        }

        if (data.author) {
            await AuthorService.getAuthorName(data.author.toString());
            updateData.author = data.author;
        }

        if (data.category) {
            await CategoryService.getCatName(data.category.toString());
            updateData.category = data.category;
        }

        if (data.genre) {
            const genre = await GenreService.validateGenre(data.genre);
            updateData.genre = genre;
        }

        if (file) {
            if (existBook.coverImage?.publicId) {
                await deleteImage(existBook.coverImage.publicId);
            }

            const upload = await uploadImage(file.path);
            updateData.coverImage = { imageUrl: upload.secure_url, publicId: upload.public_id };
        }

        if (data.publisher) updateData.publisher = data.publisher;

        if (data.publishedDate !== undefined) updateData.publishedDate = data.publishedDate;

        const update = await Book.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        return { success: true, message: `${update?.name || "Book"} updated successfully`, update };
    }


    // SOFT DELETE BOOK
    static async deleteBook(id: string) {
        const book = await Book.findOne({ _id: id, deletedAt: null });

        if (!book)
            throw new AppError("Book not found or already in trash", 404);

        book.deletedAt = new Date();
        await book.save();

        return { success: true, message: "Book moved to trash successfully" };
    }


    // PERMANENT DELETE BOOK (Erase completely)
    static async permanentlyDeleteBook(id: string) {
        // Find it regardless of soft-delete status
        const book = await Book.findById(id);

        if (!book)
            throw new AppError("Book not found in system", 404);

        if (book.coverImage?.publicId) {
            await deleteImage(book.coverImage.publicId);
        }

        await Book.findByIdAndDelete(id);
        return { success: true, message: "Book permanently erased from database" };
    }


    // FILTER FOR FETCH
    private static async bookFilter(filter: any = {}) {
        const safeFilter = { ...filter, deletedAt: null };
        const books = await Book.find(safeFilter);
        return { success: true, message: books.length ? "Books fetched successfully" : "No books available", books };
    }


    // FETCH VERIFIED BOOKS
    static async fetchVerifiedBooks() {
        return await this.bookFilter({ isVerified: true });
    }


    // FETCH UNVERIFIED BOOKS
    static async fetchUnVerifiedBooks() {
        return await this.bookFilter({ isVerified: false });
    }


    // FETCH ALL BOOKS
    static async fetchAllBooks() {
        return await this.bookFilter();
    }


    // FETCH BY ID
    static async fetchById(id: string) {
        const book = await Book.findOne({ _id: id, deletedAt: null });

        if (!book)
            throw new AppError("Book not found", 404);

        return { success: true, message: "Book fetched successfully", book };
    }


    // TOGGLE VERIFICATION
    static async toggleVerification(id: string) {
        const res = await this.fetchById(id);
        const book = res.book;

        book.isVerified = !book.isVerified;
        await book.save();

        return { success: true, message: book.isVerified ? "Book request accepted" : "Book rejected", book };
    }


    // FETCH BY NAME OR ISBN
    static async fetchBookBy(name?: string, isbn?: string) {
        const query: any = { deletedAt: null };

        if (name && name.trim() !== "") {
            query.name = name.trim().toLowerCase();
        }

        if (isbn && isbn.trim() !== "") {
            query.isbn = isbn.trim().toLowerCase();
        }

        // Must have at least one search key besides deletedAt
        if (Object.keys(query).length === 1) {
            throw new AppError("At least one search parameter must be provided", 400);
        }

        const book = await Book.findOne(query);

        if (!book) {
            throw new AppError("Book not found", 404);
        }

        return { success: true, message: "Book fetched successfully", book };
    }


    // FETCH SOFT DELETES 
    static async fetchSoftDelete() {
        const books = await Book.find({ deletedAt: { $ne: null } });

        return { success: true, message: books.length ? "Trashed books fetched successfully" : "Trash is empty", books };
    }
}