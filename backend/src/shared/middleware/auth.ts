import { NextFunction, Request, Response } from "express";
import { PayloadTypes, verifyAccessToken } from "../generateToken";
import { catchAsync } from "../error/catchAsync";
import { AppError } from "../error/appError";

export interface AuthenticatedRequest extends Request {
    user?: PayloadTypes;
}

export const auth = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) 
        token = req.headers.authorization.split(" ")[1];

    if (!token) 
        throw new AppError("You are not logged in. Please log in to get access.", 401);

    try {
        const decoded = verifyAccessToken(token) as PayloadTypes;

        req.user = decoded;

        next();
    } catch (error: any) {
        
        if (error.name === "TokenExpiredError") 
            throw new AppError("Your token has expired. Please log in again.", 401);

        throw new AppError("Invalid token. Please log in again.", 401);
    }
});