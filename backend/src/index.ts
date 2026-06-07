import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Infrastructure
import { connectDb } from "./infrastructure/connectDb";
import { ENV } from "./infrastructure/env";

// Routes
import appRouter from "./infrastructure/appRouter";


// Error Handler
import globalError from "./shared/error/globalError";
import { cloudinaryConfig } from "./infrastructure/cloudinaryConfig";

const app = express();

app.use(cors({
    origin: ENV.FRONTEND_URL,
    credentials:true,
    methods: ["POST", "PUT", "PATCH", "GET", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = ENV.PORT;


// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());


// ROUTES
app.use("/api/v1", appRouter);


//GLOBAL ERROR HANDLER
app.use(globalError);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDb();
    cloudinaryConfig();
});