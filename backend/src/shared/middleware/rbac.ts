import { Response, NextFunction } from "express";
import { AppError } from "../../shared/error/appError";
import { AuthenticatedRequest } from "./auth";

export const restrictTo = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("You are not logged in. Please log in to get access.", 401));
        }

        if (!req.user.role) {
            return next(new AppError("Invalid or missing user role architecture.", 401));
        }

        const lowerCaseRoles = roles.map(role => role.toLowerCase());
        const userRole = req.user.role.toLowerCase();
            
        if (!lowerCaseRoles.includes(userRole)) {
            return next(
                new AppError(`Forbidden. Required role: [${roles}]. Your role: [${req.user.role}]`, 403)
            );
        }

        next();
    };
};