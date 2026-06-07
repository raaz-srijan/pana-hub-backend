import { AppError } from "../../shared/error/appError";
import { Order } from "../order/order.model";
import { Payment } from "./payment.model";
import { Cart } from "../cart/cart.model";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "../../shared/helper/khalti";
import { initiateEsewaPayment } from "../../shared/helper/esewa";

export class PaymentService {

    // 1. INITIATE PAYMENT STEP (Creates context & forwards to Gateway)
    static async initiatePayment(userId: string, orderId: string, paymentGateway: "khalti" | "esewa" | "cod") {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            throw new AppError("Order not found or access denied.", 404);
        }

        if (order.paymentStatus === "paid") {
            throw new AppError("This order is already paid.", 400);
        }

        if (order.orderStatus === "cancelled") {
            throw new AppError("Cannot initiate payment for a cancelled order.", 400);
        }

        // Create or locate the tracking payment session document
        let payment = await Payment.findOne({ orderId: order._id, status: "pending" });
        if (!payment) {
            payment = await Payment.create({
                orderId: order._id,
                userId: order.userId,
                amount: order.grandTotal,
                currency: "NPR",
                paymentGateway: paymentGateway,
                status: "pending"
            });
        } else {
            payment.paymentGateway = paymentGateway;
            await payment.save();
        }

        const paymentIdStr = payment._id.toString();

        // --- GATEWAY ROUTING LOGIC ---
        if (paymentGateway === "khalti") {
            const paymentUrl = await initiateKhaltiPayment(
                order.grandTotal,
                paymentIdStr,
                `Order #${order._id.toString().substring(0, 8)}`
            );
            return {
                success: true,
                message: "Khalti payment initiated successfully",
                paymentUrl,
                payment
            };
        } 
        
        if (paymentGateway === "esewa") {
            const paymentUrl = await initiateEsewaPayment(
                order.grandTotal,
                paymentIdStr
            );
            return {
                success: true,
                message: "eSewa payment initiated successfully",
                paymentUrl,
                payment
            };
        } 
        
        if (paymentGateway === "cod") {
            // ✅ REBUILT COD LOGIC: Clean database alignment since there is no third-party redirect
            payment.status = "completed"; // COD tracking session is immediately handled
            payment.gatewayTransactionId = `COD-${order._id.toString().substring(0, 8)}`;
            await payment.save();

            // Keep paymentStatus as "unpaid" (since they pay at delivery), but verify the checkout order
            await Order.findByIdAndUpdate(order._id, { 
                $set: { orderStatus: "processing" } // Moves from "pending" directly to vendor processing!
            });

            // Cleanly wipe the user database cart layout right now
            await Cart.findOneAndUpdate(
                { userId: order.userId }, 
                { $set: { items: [], grandTotal: 0, totalItems: 0 } }
            );

            return {
                success: true,
                message: "Cash on Delivery order finalized successfully. Your cart has been cleared.",
                payment
            };
        }

        throw new AppError("Invalid payment gateway.", 400);
    }


    // 2. VERIFY KHALTI TRANSACTION (Delayed execution workflow)
    static async verifyKhalti(pidx: string, userId: string) {
        if (!pidx) {
            throw new AppError("pidx is required for Khalti verification", 400);
        }

        // Hit Khalti's verification lookup endpoint API
        const verificationData = await verifyKhaltiPayment(pidx);
        console.log("Khalti Verification Raw Data Payload:", verificationData);

        const externalOrderId = verificationData.purchase_order_id || verificationData.purchase_order_name;
        let payment = null;

        // Sequence structural fallbacks to find transaction safely without throwing casting errors
        payment = await Payment.findOne({ gatewayTransactionId: pidx });

        if (!payment) {
            payment = await Payment.findOne({ 
                userId: userId, 
                status: "pending", 
                paymentGateway: "khalti" 
            });
        }

        if (!payment && externalOrderId && externalOrderId.length === 24) {
            payment = await Payment.findOne({ orderId: externalOrderId });
        }

        if (!payment) {
            throw new AppError("Payment transaction context mapping failed. Record not found.", 404);
        }

        // Evaluate gateway validation responses
        if (verificationData.status === "Completed") {
            payment.status = "completed";
            payment.gatewayTransactionId = pidx;
            payment.gatewayResponse = verificationData;
            await payment.save();

            // ✅ Success execution updates: Mark Paid & clear target database cart safely
            await Order.findByIdAndUpdate(payment.orderId, { $set: { paymentStatus: "paid" } });
            await Cart.findOneAndUpdate(
                { userId: payment.userId }, 
                { $set: { items: [], grandTotal: 0, totalItems: 0 } }
            );

            return {
                success: true,
                message: "Payment verified successfully",
                payment
            };
        } else {
            // Failed execution updates
            payment.status = "failed";
            payment.gatewayResponse = verificationData;
            await payment.save();

            await Order.findByIdAndUpdate(payment.orderId, { $set: { paymentStatus: "failed" } });

            throw new AppError(`Payment verification failed. Gateway Status: ${verificationData.status}`, 400);
        }
    }


    // 3. VERIFY ESEWA TRANSACTION (Delayed execution workflow)
    static async verifyEsewa(data: string) {
        if (!data) {
            throw new AppError("Data payload is required for eSewa verification", 400);
        }

        let decodedData: any;
        try {
            const decodedString = Buffer.from(data, "base64").toString("utf-8");
            decodedData = JSON.parse(decodedString);
        } catch (error) {
            throw new AppError("Invalid eSewa response payload", 400);
        }

        const paymentId = decodedData.transaction_uuid;
        const status = decodedData.status;

        if (!paymentId || paymentId.length !== 24) {
            throw new AppError("Malformed tracking transaction ID payload returned from eSewa.", 400);
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new AppError("Payment record not found.", 404);
        }

        payment.gatewayResponse = decodedData;

        if (status === "COMPLETE") {
            payment.status = "completed";
            payment.gatewayTransactionId = decodedData.transaction_code;
            await payment.save();

            // ✅ Success execution updates: Mark Paid & clear target database cart safely
            await Order.findByIdAndUpdate(payment.orderId, { $set: { paymentStatus: "paid" } });
            await Cart.findOneAndUpdate(
                { userId: payment.userId }, 
                { $set: { items: [], grandTotal: 0, totalItems: 0 } }
            );

            return {
                success: true,
                message: "eSewa Payment verified successfully",
                payment
            };
        } else {
            payment.status = "failed";
            await payment.save();

            await Order.findByIdAndUpdate(payment.orderId, { $set: { paymentStatus: "failed" } });

            throw new AppError(`eSewa Payment failed. Status: ${status}`, 400);
        }
    }
}