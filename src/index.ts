import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

// Infrastructure
import { connectDb } from "./infrastructure/connectDb";
import { ENV } from "./infrastructure/env";

// Routes
import permissionRoute from "./modules/permission/permission.route";
import roleRoute from "./modules/role/role.route";
import authRoute from "./modules/auth/auth.route";
import userRoute from "./modules/user/user.route";

// Error Handler
import globalError from "./shared/error/globalError";

const app = express();
const PORT = ENV.PORT;

// MIDDLEWARE

app.use(express.json());
app.use(cookieParser());

// ROUTES

app.use("/api/v1/permissions", permissionRoute);
app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

//GLOBAL ERROR HANDLER

app.use(globalError);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDb();
});