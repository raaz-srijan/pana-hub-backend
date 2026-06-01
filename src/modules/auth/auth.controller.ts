import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AuthService } from "./auth.services";
import { generateAccessToken, generateRefreshToken } from "../../shared/generateToken";
import { AppError } from "../../shared/error/appError";

export class AuthController {
    //LOGIN
    static login = catchAsync(async(req:Request, res:Response) => {
        const user = await AuthService.loginUser(req.body);

        const refreshToken = await generateRefreshToken({id:user._id.toString(), role:user.roleId?._id.toString()});
        const accessToken = await generateAccessToken({id:user._id.toString(), role:user.roleId?._id.toString()});

        res.cookie("refreshToken", refreshToken, {httpOnly:true, secure:false, sameSite:"lax", maxAge: 7*24*60*1000});

        return res.status(200).json({success:true, message:"Login successful", data:{user:{id:user._id, email:user.email, role:user.roleId._id, accessToken}}});
    });


    //REFRESH-TOKEN
    static refreshToken = catchAsync(async(req:Request, res:Response) => {

        const token = req.cookies.refreshToken;

        
        const user = await AuthService.refresh(token);

        return res.status(200).json({success:true, message:"Token refreshed successfully", data:user});
    });


    //VERIFY-EMAIL
    static verifyEmail = catchAsync(async(req:Request, res:Response) => {
        const {accessToken} = req.params;

        if(!accessToken)
            throw new AppError("Invalid or expired token", 401);

        const verify = await AuthService.verifyToken(accessToken);

        return res.status(200).json(verify);
    });

}