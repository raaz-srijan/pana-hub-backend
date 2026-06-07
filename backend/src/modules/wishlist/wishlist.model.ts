import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IWishlist extends Document {
    userId: Types.ObjectId;
    books: {
        bookId: Types.ObjectId;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const wishlistSchema: Schema<IWishlist> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        books: [
            {
                bookId: {
                    type: Schema.Types.ObjectId,
                    ref: "Book",
                },
                _id: false
            },
        ],
    },
    { timestamps: true }
);

export const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);