import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IInventory extends Document {
    vendorId: Types.ObjectId;
    bookId: Types.ObjectId;
    price: number;
    stock: number;
    isActive:boolean;
    stockReminder: number;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema: Schema<IInventory> = new Schema({
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true,
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
        min:0,
    },
    stock: {
        type: Number,
        required: true,
        min:0,
        default: 0,
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    stockReminder: {
        type: Number,
        required: true,
        min:0,
        default: 5, 
    }
}, { timestamps: true });

inventorySchema.index({ vendorId: 1, bookId: 1 }, { unique: true });

export const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", inventorySchema);