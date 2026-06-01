import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { UserService } from "./user.service";
import { AppError } from "../../shared/error/appError";


export class UserController {

    //REGISTER
    static register = catchAsync(async (req: Request, res: Response) => {
        const user = await UserService.createUser(req.body);

        return res.status(201).json({ success: true, message: "User registered successfully", data: user });
    });


    //UPDATE
    static updateUser = catchAsync(async (req: Request, res: Response) => {

        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        //FROM MIDDLEWARE
        const userId = req.user.id;

        if (!userId)
            throw new AppError("Please login", 403);

        const user = await UserService.updateSelf(userId, req.body);
        return res.status(200).json({ success: true, message: "User updated successfully", data: user });
    });
}