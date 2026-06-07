import mongoose, { Types } from "mongoose";
import { Order, IOrder } from "./order.model";
import { Inventory } from "../inventory/inventory.model";
import { Cart } from "../cart/cart.model";
import { AppError } from "../../shared/error/appError";

export class OrderService {

    // helper validator for Address
    private static validateAddress(address: any, fieldName: string) {
        if (!address || !address.state || !address.city || !address.tole) {
            throw new AppError(`Please provide a complete ${fieldName} with state, city, and tole.`, 400);
        }
        return {
            state: address.state.trim(),
            city: address.city.trim(),
            tole: address.tole.trim()
        };
    }

    //PLACE ORDER FROM CART (Customer)
    static async createOrderFromCart(
        userId: string,
        shippingAddress: any,
        billingAddress: any,
        deliveryCharge: number = 0
    ) {
        const validatedShipping = this.validateAddress(shippingAddress, "shipping address");
        const validatedBilling = this.validateAddress(billingAddress, "billing address");

        if (deliveryCharge < 0) {
            throw new AppError("Delivery charge cannot be negative.", 400);
        }

        // Retrieve user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new AppError("Your cart is empty.", 400);
        }

        const orderItemsToCreate: any[] = [];
        let calculatedSubTotal = 0;

        // Verify stock and calculate details
        for (const item of cart.items) {
            const inventory = await Inventory.findById(item.inventoryId).populate("bookId");
            if (!inventory) {
                throw new AppError("One of the items in your cart is no longer available.", 404);
            }
            if (!inventory.isActive) {
                throw new AppError(`Item "${(inventory.bookId as any)?.name || 'Book'}" is currently unavailable.`, 400);
            }
            if (inventory.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for "${(inventory.bookId as any)?.name || 'Book'}". Only ${inventory.stock} units left.`,
                    400
                );
            }

            const itemSubTotal = inventory.price * item.quantity;
            calculatedSubTotal += itemSubTotal;

            orderItemsToCreate.push({
                inventoryId: inventory._id,
                bookId: inventory.bookId._id,
                vendorId: inventory.vendorId,
                quantity: item.quantity,
                price: inventory.price,
                subTotal: itemSubTotal,
                bookName: (inventory.bookId as any)?.name
            });
        }

        // Deduct inventory stock atomically
        const updatedInventories: { inventoryId: Types.ObjectId; quantity: number }[] = [];
        try {
            for (const item of orderItemsToCreate) {
                const updated = await Inventory.findOneAndUpdate(
                    { _id: item.inventoryId, stock: { $gte: item.quantity }, isActive: true },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                if (!updated) {
                    throw new AppError(`Insufficient stock or item unavailable for "${item.bookName}".`, 400);
                }
                updatedInventories.push({ inventoryId: item.inventoryId, quantity: item.quantity });
            }
        } catch (error) {
            // Rollback already updated inventories
            for (const roll of updatedInventories) {
                await Inventory.findByIdAndUpdate(roll.inventoryId, { $inc: { stock: roll.quantity } });
            }
            throw error;
        }

        // Create the Order
        const grandTotal = Number((calculatedSubTotal + deliveryCharge).toFixed(2));
        const newOrder = await Order.create({
            userId,
            shippingAddress: validatedShipping,
            billingAddress: validatedBilling,
            books: orderItemsToCreate.map(({ bookName, ...rest }) => rest),
            deliveryCharge,
            grandTotal,
            orderStatus: "pending",
            paymentStatus: "unpaid"
        });

        // Clear the user's cart
        await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

        return {
            success: true,
            message: "Order placed successfully from cart.",
            order: newOrder
        };
    }


    //PLACE DIRECT ORDER (Customer)
    static async createDirectOrder(
        userId: string,
        items: { inventoryId: string; quantity: number }[],
        shippingAddress: any,
        billingAddress: any,
        deliveryCharge: number = 0
    ) {
        const validatedShipping = this.validateAddress(shippingAddress, "shipping address");
        const validatedBilling = this.validateAddress(billingAddress, "billing address");

        if (deliveryCharge < 0) {
            throw new AppError("Delivery charge cannot be negative.", 400);
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new AppError("Order items are required.", 400);
        }

        const orderItemsToCreate: any[] = [];
        let calculatedSubTotal = 0;

        // Validate stock and calculate prices
        for (const item of items) {
            if (!item.inventoryId) {
                throw new AppError("Missing inventoryId for one of the items.", 400);
            }
            if (item.quantity === undefined || item.quantity < 1) {
                throw new AppError("Invalid or missing quantity. Must be at least 1.", 400);
            }

            const inventory = await Inventory.findById(item.inventoryId).populate("bookId");
            if (!inventory) {
                throw new AppError("Requested book inventory item does not exist.", 404);
            }
            if (!inventory.isActive) {
                throw new AppError(`Item "${(inventory.bookId as any)?.name || 'Book'}" is currently unavailable.`, 400);
            }
            if (inventory.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for "${(inventory.bookId as any)?.name || 'Book'}". Only ${inventory.stock} units left.`,
                    400
                );
            }

            const itemSubTotal = inventory.price * item.quantity;
            calculatedSubTotal += itemSubTotal;

            orderItemsToCreate.push({
                inventoryId: inventory._id,
                bookId: inventory.bookId._id,
                vendorId: inventory.vendorId,
                quantity: item.quantity,
                price: inventory.price,
                subTotal: itemSubTotal,
                bookName: (inventory.bookId as any)?.name
            });
        }

        // Deduct inventory stock atomically
        const updatedInventories: { inventoryId: Types.ObjectId; quantity: number }[] = [];
        try {
            for (const item of orderItemsToCreate) {
                const updated = await Inventory.findOneAndUpdate(
                    { _id: item.inventoryId, stock: { $gte: item.quantity }, isActive: true },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                if (!updated) {
                    throw new AppError(`Insufficient stock or item unavailable for "${item.bookName}".`, 400);
                }
                updatedInventories.push({ inventoryId: item.inventoryId, quantity: item.quantity });
            }
        } catch (error) {
            // Rollback already updated inventories
            for (const roll of updatedInventories) {
                await Inventory.findByIdAndUpdate(roll.inventoryId, { $inc: { stock: roll.quantity } });
            }
            throw error;
        }

        // Create the Order
        const grandTotal = Number((calculatedSubTotal + deliveryCharge).toFixed(2));
        const newOrder = await Order.create({
            userId,
            shippingAddress: validatedShipping,
            billingAddress: validatedBilling,
            books: orderItemsToCreate.map(({ bookName, ...rest }) => rest),
            deliveryCharge,
            grandTotal,
            orderStatus: "pending",
            paymentStatus: "unpaid"
        });

        return {
            success: true,
            message: "Direct order placed successfully.",
            order: newOrder
        };
    }


    //FETCH OWN ORDERS (Customer)
    static async fetchOwnOrders(userId: string, page: number = 1, limit: number = 10) {
        const sanitizedPage = Math.max(1, parseInt(page as any) || 1);
        const sanitizedLimit = Math.max(1, parseInt(limit as any) || 10);
        const skip = (sanitizedPage - 1) * sanitizedLimit;

        const filter = { userId };

        const [totalOrders, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .populate({
                    path: "books.bookId",
                    select: "name isbn coverImage author",
                    populate: { path: "author", select: "name" }
                })
                .populate({
                    path: "books.vendorId",
                    select: "vendorName"
                })
                .skip(skip)
                .limit(sanitizedLimit)
                .sort({ createdAt: -1 })
        ]);

        const totalPages = Math.ceil(totalOrders / sanitizedLimit);

        return {
            success: true,
            message: orders.length ? "Orders fetched successfully." : "No orders found.",
            pagination: {
                totalItems: totalOrders,
                totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit,
                hasNextPage: sanitizedPage < totalPages,
                hasPrevPage: sanitizedPage > 1
            },
            orders
        };
    }


    //FETCH OWN ORDER BY ID (Customer)
    static async fetchOwnOrderById(userId: string, orderId: string) {
        if (!orderId || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid or missing order ID.", 400);
        }

        const order = await Order.findOne({ _id: orderId, userId })
            .populate({
                path: "books.bookId",
                select: "name isbn coverImage author category",
                populate: [
                    { path: "author", select: "name" },
                    { path: "category", select: "name" }
                ]
            })
            .populate({
                path: "books.vendorId",
                select: "vendorName address"
            });

        if (!order) {
            throw new AppError("Order not found or access denied.", 404);
        }

        return {
            success: true,
            message: "Order details fetched successfully.",
            order
        };
    }


    //CANCEL OWN ORDER (Customer)
    static async cancelOwnOrder(userId: string, orderId: string) {
        if (!orderId || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid or missing order ID.", 400);
        }

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            throw new AppError("Order not found or access denied.", 404);
        }

        if (order.orderStatus !== "pending") {
            throw new AppError(`Cannot cancel order. Order is currently in "${order.orderStatus}" status. Only pending orders can be cancelled.`, 400);
        }

        order.orderStatus = "cancelled";
        await order.save();

        // Release/restore stock back to inventory
        for (const item of order.books) {
            await Inventory.findByIdAndUpdate(item.inventoryId, {
                $inc: { stock: item.quantity }
            });
        }

        return {
            success: true,
            message: "Order cancelled successfully.",
            order
        };
    }

    //FETCH VENDOR ORDERS (Vendor)
    static async fetchVendorOrders(vendorId: string, page: number = 1, limit: number = 10) {
        const sanitizedPage = Math.max(1, parseInt(page as any) || 1);
        const sanitizedLimit = Math.max(1, parseInt(limit as any) || 10);
        const skip = (sanitizedPage - 1) * sanitizedLimit;

        const filter = { "books.vendorId": vendorId };

        const [totalOrders, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .populate("userId", "name email")
                .populate({
                    path: "books.bookId",
                    select: "name isbn coverImage author",
                    populate: { path: "author", select: "name" }
                })
                .skip(skip)
                .limit(sanitizedLimit)
                .sort({ createdAt: -1 })
        ]);

        // Filter response to only include items belonging to this vendor for privacy
        const formattedOrders = orders.map((order) => {
            const vendorItems = order.books.filter((b) => b.vendorId.toString() === vendorId.toString());
            const vendorSubTotal = vendorItems.reduce((acc, curr) => acc + curr.subTotal, 0);

            return {
                _id: order._id,
                userId: order.userId,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                books: vendorItems,
                vendorSubTotal: Number(vendorSubTotal.toFixed(2)),
                deliveryCharge: order.deliveryCharge,
                grandTotal: order.grandTotal,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                createdAt: (order as any).createdAt,
                updatedAt: (order as any).updatedAt
            };
        });

        const totalPages = Math.ceil(totalOrders / sanitizedLimit);

        return {
            success: true,
            message: formattedOrders.length ? "Vendor orders fetched successfully." : "No orders found for your storefront.",
            pagination: {
                totalItems: totalOrders,
                totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit,
                hasNextPage: sanitizedPage < totalPages,
                hasPrevPage: sanitizedPage > 1
            },
            orders: formattedOrders
        };
    }

    //FETCH ALL ORDERS (Admin)
    static async fetchAdminOrders(
        page: number = 1,
        limit: number = 10,
        orderStatus?: string,
        paymentStatus?: string
    ) {
        const sanitizedPage = Math.max(1, parseInt(page as any) || 1);
        const sanitizedLimit = Math.max(1, parseInt(limit as any) || 10);
        const skip = (sanitizedPage - 1) * sanitizedLimit;

        const filter: any = {};
        if (orderStatus) filter.orderStatus = orderStatus;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const [totalOrders, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .populate("userId", "name email")
                .populate({
                    path: "books.bookId",
                    select: "name isbn coverImage author",
                    populate: { path: "author", select: "name" }
                })
                .populate({
                    path: "books.vendorId",
                    select: "vendorName"
                })
                .skip(skip)
                .limit(sanitizedLimit)
                .sort({ createdAt: -1 })
        ]);

        const totalPages = Math.ceil(totalOrders / sanitizedLimit);

        return {
            success: true,
            message: orders.length ? "Admin orders fetched successfully." : "No orders found.",
            pagination: {
                totalItems: totalOrders,
                totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit,
                hasNextPage: sanitizedPage < totalPages,
                hasPrevPage: sanitizedPage > 1
            },
            orders
        };
    }

    //FETCH ADMIN ORDER BY ID (Admin)
    static async fetchAdminOrderById(orderId: string) {
        if (!orderId || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid or missing order ID.", 400);
        }

        const order = await Order.findById(orderId)
            .populate("userId", "name email")
            .populate({
                path: "books.bookId",
                select: "name isbn coverImage author category",
                populate: [
                    { path: "author", select: "name" },
                    { path: "category", select: "name" }
                ]
            })
            .populate({
                path: "books.vendorId",
                select: "vendorName address"
            });

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        return {
            success: true,
            message: "Order details retrieved successfully.",
            order
        };
    }

    //UPDATE ORDER STATUS (Admin)
    static async updateOrderStatus(orderId: string, orderStatus: IOrder["orderStatus"]) {
        if (!orderId || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid or missing order ID.", 400);
        }

        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            throw new AppError(`Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`, 400);
        }

        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        const previousStatus = order.orderStatus;

        if (previousStatus === orderStatus) {
            return {
                success: true,
                message: `Order status is already "${orderStatus}".`,
                order
            };
        }

        order.orderStatus = orderStatus;
        await order.save();

        // If status changed to cancelled and was not cancelled before, restore stock
        if (orderStatus === "cancelled" && previousStatus !== "cancelled") {
            for (const item of order.books) {
                await Inventory.findByIdAndUpdate(item.inventoryId, {
                    $inc: { stock: item.quantity }
                });
            }
        }
        // If status changed from cancelled back to something else (unlikely but possible), decrease stock
        else if (previousStatus === "cancelled" && orderStatus !== "cancelled") {
            const updatedInventories: { inventoryId: Types.ObjectId; quantity: number }[] = [];
            try {
                for (const item of order.books) {
                    const updated = await Inventory.findOneAndUpdate(
                        { _id: item.inventoryId, stock: { $gte: item.quantity }, isActive: true },
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                    if (!updated) {
                        throw new AppError(`Cannot re-activate order. Insufficient stock in inventory for item ID ${item.inventoryId}.`, 400);
                    }
                    updatedInventories.push({ inventoryId: item.inventoryId, quantity: item.quantity });
                }
            } catch (error) {
                // Rollback and reset status
                for (const roll of updatedInventories) {
                    await Inventory.findByIdAndUpdate(roll.inventoryId, { $inc: { stock: roll.quantity } });
                }
                order.orderStatus = "cancelled";
                await order.save();
                throw error;
            }
        }

        return {
            success: true,
            message: `Order status updated to "${orderStatus}" successfully.`,
            order
        };
    }

    //UPDATE PAYMENT STATUS (Admin)
    static async updatePaymentStatus(orderId: string, paymentStatus: IOrder["paymentStatus"]) {
        if (!orderId || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid or missing order ID.", 400);
        }

        const validStatuses = ["unpaid", "paid", "failed", "refunded"];
        if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
            throw new AppError(`Invalid payment status. Allowed values are: ${validStatuses.join(", ")}`, 400);
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { paymentStatus } },
            { new: true, runValidators: true }
        );

        if (!order) {
            throw new AppError("Order not found.", 404);
        }

        return {
            success: true,
            message: `Payment status updated to "${paymentStatus}" successfully.`,
            order
        };
    }
}
