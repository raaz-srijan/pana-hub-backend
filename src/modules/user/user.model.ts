import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUser extends Document {
    name:string;
    email:string;
    password:string;
    isVerified:boolean;
    provider: "local" | "google";
    roleId:Types.ObjectId;
    createdAt:Date;
    updaedAt:Date;
}


const userSchema:Schema<IUser> = new Schema({

    name:{
        type:String,
        required:true,
        trim:true,
    },

    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
    },

    password: {
        type:String,
        required:true,
        minlength:6,
        select:false
    },

    isVerified:{
        type:Boolean,
        default:false,
    },

    roleId:{
        type:Schema.Types.ObjectId,
        ref:"Role",
        required:true,
    },

    provider:{
        type:String,
        enum:["local", "google"],
        default:"local",
    },
}, {timestamps:true});

export const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);