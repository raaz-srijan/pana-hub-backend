import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AuthService } from "./auth.services";
import { AppError } from "../../shared/error/appError";

export class AuthController {
    // LOGIN CONTROLLER
    static login = catchAsync(async (req: Request, res: Response) => {
        const user = await AuthService.loginUser(req.body);

        res.cookie("refreshToken", user.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json(user.payload);
    });


    //REFRESH TOKEN
    static refreshToken = catchAsync(async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;

        const { accessToken, refreshToken, user } = await AuthService.refresh(token);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: { accessToken, user }
        });
    });


    //LOGOUT
    static logout = catchAsync(async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully. Secure sessions terminated."
        });
    });

    //VERIFY-EMAIL
    static verifyEmail = catchAsync(async (req: Request, res: Response) => {
        const { accessToken } = req.params;

        if (!accessToken)
            throw new AppError("Invalid or expired token", 401);

        const verify = await AuthService.verifyToken(accessToken);

        return res.status(200).json(verify);
    });

}