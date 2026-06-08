import { Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { AppError } from "../../shared/error/appError";
import { AuthenticatedRequest } from "../../shared/middleware/auth";
import { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
    static getAdminDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        const startDateStr = req.query.startDate as string | undefined;
        const endDateStr = req.query.endDate as string | undefined;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (startDateStr) {
            startDate = new Date(startDateStr);
            if (isNaN(startDate.getTime())) {
                throw new AppError("Invalid startDate format. Use YYYY-MM-DD.", 400);
            }
        }

        if (endDateStr) {
            endDate = new Date(endDateStr);
            if (isNaN(endDate.getTime())) {
                throw new AppError("Invalid endDate format. Use YYYY-MM-DD.", 400);
            }
        }

        const result = await AnalyticsService.getAdminDashboard(startDate, endDate);
        return res.status(200).json(result);
    });

    static getVendorDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new AppError("User authentication context is missing.", 401);
        }

        const startDateStr = req.query.startDate as string | undefined;
        const endDateStr = req.query.endDate as string | undefined;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (startDateStr) {
            startDate = new Date(startDateStr);
            if (isNaN(startDate.getTime())) {
                throw new AppError("Invalid startDate format. Use YYYY-MM-DD.", 400);
            }
        }

        if (endDateStr) {
            endDate = new Date(endDateStr);
            if (isNaN(endDate.getTime())) {
                throw new AppError("Invalid endDate format. Use YYYY-MM-DD.", 400);
            }
        }

        const result = await AnalyticsService.getVendorDashboard(req.user.id, startDate, endDate);
        return res.status(200).json(result);
    });
}
