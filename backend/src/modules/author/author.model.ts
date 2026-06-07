import mongoose, { Model, Schema } from "mongoose";

export interface IAuthor extends Document {
    name: string;
    bio?: string;
    image?: {
        imageUrl: string;
        publicUrl: string;
    };
    isVerified: boolean;
    createdAt:Date;
    updatedAt:Date;
}

const authorSchema:Schema<IAuthor> = new Schema({

    name:{
        type:String,
        required:true,
        trim:true,
    },

    bio:{
        type:String,
        trim:true,
        maxlength:20000,
    },

    image:{
        imageUrl:String,
        publicUrl:String,
    },

    isVerified:{
        type:Boolean,
        default:false,
    },
}, {timestamps:true});


export const Author:Model<IAuthor> = mongoose.models.Author || mongoose.model<IAuthor>("Author", authorSchema);