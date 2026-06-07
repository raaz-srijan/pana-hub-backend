import { BookService } from "../book/book.service";
import { UserService } from "../user/user.service";
import { Wishlist } from "./wishlist.model";

export class WishlistService {

    //ADD TO WISHLIST
    static async addToWishlist(userId: string, bookId: string) {
        const user = await UserService.getUserId(userId);

        const bookResponse = await BookService.fetchById(bookId);
        const book = bookResponse.book;

        if (!user || !book) {
            throw new Error("User or Book metadata could not be found.");
        }

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId: user._id },
            { $addToSet: { books: { bookId: book._id } } },
            { new: true, upsert: true }
        );

        return {
            success: true,
            message: "Book added to wishlist successfully",
            data: updatedWishlist
        };
    }

    //REMOVE FROM WISHLIST
    static async removeFromWishlist(userId: string, bookId: string) {
        const user = await UserService.getUserId(userId);

        const bookResponse = await BookService.fetchById(bookId);
        const book = bookResponse.book;

        if (!user || !book) {
            throw new Error("User or Book metadata could not be found.");
        }

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId: user._id },
            { $pull: { books: { bookId: book._id } } },
            { new: true }
        );

        return {
            success: true,
            message: "Book removed from wishlist successfully",
            data: updatedWishlist
        };
    }

    //CLEAR THE ENTIRE WISHLIST
    static async clearWishlist(userId: string) {
        const user = await UserService.getUserId(userId);

        if (!user) {
            throw new Error("User metadata could not be found.");
        }

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId: user._id },
            { $set: { books: [] } },
            { new: true }
        );

        return {
            success: true,
            message: "Wishlist cleared completely",
            data: updatedWishlist
        };
    }


    //FETCH WISHLIST (With Document Population)
    static async fetchWishlist(userId: string) {
        const user = await UserService.getUserId(userId);

        if (!user) {
            throw new Error("User metadata could not be found.");
        }

        const wishlist = await Wishlist.findOne({ userId: user._id })
            .populate({
                path: "books.bookId",
                model: "Book"
            });

        return {
            success: true,
            message: "Wishlist fetched successfully",
            data: wishlist || { userId: user._id, books: [] }
        };
    }
}