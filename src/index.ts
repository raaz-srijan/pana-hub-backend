import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

// Infrastructure
import { connectDb } from "./infrastructure/connectDb";
import { ENV } from "./infrastructure/env";

// Routes
import appRouter from "./infrastructure/appRouter";


// Error Handler
import globalError from "./shared/error/globalError";

const app = express();
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
});