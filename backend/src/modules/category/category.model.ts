import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name:string;
    desc?:string;
    isApproved:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const categorySchema:Schema<ICategory> = new Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
    },

    desc:{
        type:String,
        maxlength:2000,
        trim:true,
    },

    isApproved:{
        type:Boolean,
        default:false,
    }
}, {timestamps:true});


export const Category:Model<ICategory>=mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);