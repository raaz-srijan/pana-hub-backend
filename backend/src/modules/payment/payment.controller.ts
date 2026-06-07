import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../shared/error/catchAsync";
import { AppError } from "../../shared/error/appError";

// INITIATE PAYMENT
export const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError("Please login", 401);
    }
    const userId = req.user.id;
    const { orderId, paymentGateway } = req.body;

    const result = await PaymentService.initiatePayment(userId, orderId, paymentGateway);

    res.status(200).json(result);
});

// VERIFY KHALTI PAYMENT
export const verifyKhaltiPayment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError("Authentication required for validation tracking.", 401);
    }
    const userId = req.user.id;
    const pidx = req.body.pidx || req.query.pidx;

    if (!pidx) {
        throw new AppError("pidx transaction parameter missing.", 400);
    }

    // Pass BOTH parameters to match the service layer function signature
    const result = await PaymentService.verifyKhalti(pidx as string, userId);

    res.status(200).json(result);
});

// VERIFY ESEWA PAYMENT
export const verifyEsewaPayment = catchAsync(async (req: Request, res: Response) => {
    const data = req.query.data || req.body.data;

    if (!data) {
        throw new AppError("Encoded eSewa base64 transaction payload parameter missing.", 400);
    }

    const result = await PaymentService.verifyEsewa(data as string);

    res.status(200).json(result);
});