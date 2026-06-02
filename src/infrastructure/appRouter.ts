import { Router } from "express";

import userRoute from "../modules/user/user.route.js";
import authRoute from "../modules/auth/auth.route.js";
import vendorRoute from "../modules/vendor/vendor.route.js";
import permissionRoute from "../modules/permission/permission.route.js";
import roleRoute from "../modules/role/role.route.js";
import categoryRoute from "../modules/category/category.route.js";
import genreRoute from "../modules/genre/genre.route.js";

const appRouter = Router();

appRouter.use("/user", userRoute);
appRouter.use("/auth", authRoute);
appRouter.use("/vendors", vendorRoute);
appRouter.use("/permissions", permissionRoute);
appRouter.use("/roles", roleRoute);
appRouter.use("/categories", categoryRoute);
appRouter.use("/genres", genreRoute);

export default appRouter;