import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { Request } from "express";

const uploadDir = path.join(__dirname, "..", "uploads");

async function ensureUploadDir() {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error("Error creating uploads directory:", error);
    }
}

ensureUploadDir();

const storage = multer.diskStorage({
    //Define where the file should be saved
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, uploadDir); 
    }, 
    //Define what the file should be named
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Generates a unique name: timestamp-random_number-original_name.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension);
        
        cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
    }
});


// Create the upload middleware instance
export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
     fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed!") as any, false);
        }
        cb(null, true);
    }
});