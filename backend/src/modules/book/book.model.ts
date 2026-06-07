import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBook extends Document {
    name: string;
    isbn: string;
    category: Types.ObjectId;
    genre: Types.ObjectId[];
    author: Types.ObjectId;
    coverImage: {
        imageUrl: string;
        publicId: string;
    };
    publisher?: string;
    publishedDate?: Date;
    isVerified: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema: Schema<IBook> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    isbn: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    genre: [{
        type: Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
    }],
    coverImage: {
        imageUrl: String,
        publicId: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "Author",
        required: true,
    },
    publisher: {
        type: String,
    },
    publishedDate: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

//Partial index ensures you can re-use an ISBN if the previous book was soft-deleted
bookSchema.index({ isbn: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>("Book", bookSchema);