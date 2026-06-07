import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

export const uploadImage = async (imagePath: string) => {
    const result = await cloudinary.uploader.upload(imagePath, { folder: "pana-hub" });
    await fs.unlink(imagePath); // Cleans up local file
    return result;
};

export const deleteImage = async (publicId: string) => {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
        throw new Error(`Cloudinary delete failed: ${result.result}`);
    }
    return result;
};