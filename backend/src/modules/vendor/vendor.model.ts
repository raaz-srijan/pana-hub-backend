import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IVendor extends Document {
    userId: Types.ObjectId;
    vendorName: string;
    licenseNo: string;
    address: {
        state: string;
        city: string;
        tole: string;
    },
    isVerified: boolean;
    isPending: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const vendorSchema: Schema<IVendor> = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    vendorName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    licenseNo: {
        type: String,
        unique: true,
        trim: true,
    },

    address: {
        state: { type: String, required: true },
        city: { type: String, required: true },
        tole: { type: String, required: true },
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    isPending: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

export const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", vendorSchema);