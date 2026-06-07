import mongoose, { Schema, Types, Model, Document } from "mongoose";

export interface IOrder extends Document {
    userId: Types.ObjectId;
    shippingAddress: {
        state: string;
        city: string;
        tole: string;
    };
    billingAddress: {
        state: string;
        city: string;
        tole: string;
    };
    books: {
        inventoryId: Types.ObjectId;
        bookId: Types.ObjectId;
        vendorId: Types.ObjectId;
        quantity: number;
        price: number;
        subTotal: number;
    }[];
    deliveryCharge: number;
    grandTotal: number;
    orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
}

const addressSchema = new Schema({
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    tole: { type: String, required: true, trim: true }
}, { _id: false });

const orderItemSchema = new Schema({
    inventoryId: {
        type: Schema.Types.ObjectId,
        ref: "Inventory",
        required: true
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity cannot be less than 1."]
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative."]
    },
    subTotal: {
        type: Number,
        required: true,
        min: [0, "Subtotal cannot be negative."]
    }
}, { _id: false });

const orderSchema: Schema<IOrder> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        shippingAddress: {
            type: addressSchema,
            required: true
        },
        billingAddress: {
            type: addressSchema,
            required: true
        },
        books: {
            type: [orderItemSchema],
            validate: {
                validator: function (val: any[]) {
                    return val && val.length > 0;
                },
                message: "An order must contain at least one purchased item."
            }
        },
        deliveryCharge: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        grandTotal: {
            type: Number,
            required: true,
            min: 0
        },
        orderStatus: {
            type: String,
            required: true,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
            index: true
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ["unpaid", "paid", "failed", "refunded"],
            default: "unpaid",
            index: true
        }
    }, { timestamps: true });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);