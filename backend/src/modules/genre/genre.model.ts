import { Schema, model, Document } from "mongoose";

export interface IGenre extends Document {
    name: string;
    desc?: string;
    isApproved: boolean;
}

const genreSchema = new Schema<IGenre>(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true, 
            lowercase: true 
        },
        desc: { 
            type: String, 
            trim: true 
        },
        isApproved: { 
            type: Boolean, 
            default: false 
        }
    },
    { timestamps: true }
);

export const Genre = model<IGenre>("Genre", genreSchema);