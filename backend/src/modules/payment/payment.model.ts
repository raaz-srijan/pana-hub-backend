import mongoose, { Schema, Types, Model, Document } from "mongoose";

export interface IPayment extends Document {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    currency: string;
    paymentGateway: "khalti" | "esewa" | "cod"; 
    gatewayTransactionId?: string; 
    status: "pending" | "completed" | "failed" | "refunded";
    gatewayResponse?: Record<string, any>; 
}

const paymentSchema: Schema<IPayment> = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true 
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, "Payment amount cannot be negative."]
        },
        currency: {
            type: String,
            required: true,
            default: "NPR" 
        },
        paymentGateway: {
            type: String,
            required: true,
            enum: ["khalti", "esewa", "cod"]
        },
        gatewayTransactionId: {
            type: String,
            unique: true, 
            sparse: true  
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
            index: true
        },
        gatewayResponse: {
            type: Schema.Types.Map, 
            of: Schema.Types.Mixed
        }
    },
    { 
        timestamps: true 
    }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);