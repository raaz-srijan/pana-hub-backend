import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICartItem {
    inventoryId: Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema: Schema<ICart> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    items: [{
        inventoryId: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        subTotal: {
            type: Number,
            min: 0,
        }
    },
    ]
}, { timestamps: true });

export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);