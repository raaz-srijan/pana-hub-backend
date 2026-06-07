import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDb = () => {
    try {
        mongoose.connect(ENV.MONGO_URI)
        console.log("Database connection successfully")
    } catch (error: any) {
        throw new Error("Database connection failed", error);
    }
}