import { Request, Response } from "express";
import { catchAsync } from "../../shared/error/catchAsync";
import { OrderService } from "./order.service";
import { AppError } from "../../shared/error/appError";

export class OrderController {

    private static getVendorIdOrThrow(req: Request): string {
        const vendorId = req.vendorId;
        if (!vendorId) {
            throw new AppError("Access Denied. Please log in as a valid vendor.", 401);
        }
        return vendorId;
    }

    private static getUserIdOrThrow(req: Request): string {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Authentication required. Please log in.", 401);
        }
        return userId;
    }


    //PLACE ORDER FROM CART (Customer)
    static createOrder = catchAsync(async (req: Request, res: Response) => {
        const userId = OrderController.getUserIdOrThrow(req);
        const { shippingAddress, billingAddress, deliveryCharge } = req.body;

        const result = await OrderService.createOrderFromCart(
            userId,
            shippingAddress,
            billingAddress,
            deliveryCharge
        );

        res.status(201).json(result);
    });


    //PLACE DIRECT ORDER (Customer)
    static createDirectOrder = catchAsync(async (req: Request, res: Response) => {
        const userId = OrderController.getUserIdOrThrow(req);
        const { items, shippingAddress, billingAddress, deliveryCharge } = req.body;

        const result = await OrderService.createDirectOrder(
            userId,
            items,
            shippingAddress,
            billingAddress,
            deliveryCharge
        );

        res.status(201).json(result);
    });


    //FETCH OWN ORDERS (Customer)
    static getOwnOrders = catchAsync(async (req: Request, res: Response) => {
        const userId = OrderController.getUserIdOrThrow(req);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await OrderService.fetchOwnOrders(userId, page, limit);

        res.status(200).json(result);
    });


    //FETCH OWN ORDER BY ID (Customer)
    static getOwnOrderById = catchAsync(async (req: Request, res: Response) => {
        const userId = OrderController.getUserIdOrThrow(req);
        const { id } = req.params;

        const result = await OrderService.fetchOwnOrderById(userId, id);

        res.status(200).json(result);
    });


    //CANCEL OWN ORDER (Customer)
    static cancelOwnOrder = catchAsync(async (req: Request, res: Response) => {
        const userId = OrderController.getUserIdOrThrow(req);
        const { id } = req.params;

        const result = await OrderService.cancelOwnOrder(userId, id);

        res.status(200).json(result);
    });


    //FETCH VENDOR ORDERS (Vendor)
    static getVendorOrders = catchAsync(async (req: Request, res: Response) => {
        const vendorId = OrderController.getVendorIdOrThrow(req);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await OrderService.fetchVendorOrders(vendorId, page, limit);

        res.status(200).json(result);
    });


    //FETCH ALL ORDERS (Admin)
    static getAllOrders = catchAsync(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const orderStatus = req.query.orderStatus as string;
        const paymentStatus = req.query.paymentStatus as string;

        const result = await OrderService.fetchAdminOrders(
            page,
            limit,
            orderStatus,
            paymentStatus
        );

        res.status(200).json(result);
    });


    //FETCH ADMIN ORDER BY ID (Admin)
    static getOrderById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await OrderService.fetchAdminOrderById(id);

        res.status(200).json(result);
    });


    //UPDATE ORDER STATUS (Admin)
    static updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus) {
            throw new AppError("Order status is required.", 400);
        }

        const result = await OrderService.updateOrderStatus(id, orderStatus);

        res.status(200).json(result);
    });

    
    //UPDATE PAYMENT STATUS (Admin)
    static updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            throw new AppError("Payment status is required.", 400);
        }

        const result = await OrderService.updatePaymentStatus(id, paymentStatus);

        res.status(200).json(result);
    });
}
