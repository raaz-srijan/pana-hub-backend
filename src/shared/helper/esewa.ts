import crypto from "crypto";
import { esewaConfig } from "../../infrastructure/esewaConfig";
import { AppError } from "../error/appError";

export function generateHmacSha256Hash(data: string, secret: string): string {
    if (!data || !secret) {
        throw new Error("Both data and secret are required to generate a hash.");
    }
    return crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("base64");
}

export function safeStringify(obj: any): string {
    const cache = new Set();
    const jsonString = JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (cache.has(value)) {
                return; 
            }
            cache.add(value);
        }
        return value;
    });
    return jsonString;
}

interface IEsewaPaymentData {
    amount: string;
    failure_url: string;
    product_delivery_charge: string;
    product_service_charge: string;
    product_code: string;
    signed_field_names: string;
    success_url: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    signature?: string;
}

export async function initiateEsewaPayment(amount: number, productId: string): Promise<string> {
    const amountStr = String(amount);

    const paymentData: IEsewaPaymentData = {
        amount: amountStr,
        failure_url: esewaConfig.failureUrl,
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: esewaConfig.merchantId,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: esewaConfig.successUrl,
        tax_amount: "0",
        total_amount: amountStr,
        transaction_uuid: productId,
    };

    const signatureData = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(signatureData, esewaConfig.secret);

    paymentData.signature = signature;

    try {
        const url = new URL(esewaConfig.esewaPaymentUrl);
        Object.entries(paymentData).forEach(([key, val]) => {
            url.searchParams.append(key, val as string);
        });

        const response = await fetch(url.toString(), {
            method: "POST"
        });

        if (!response.ok) {
            throw new AppError(`eSewa payment initiation failed with status ${response.status}`, 400);
        }

        return response.url;
    } catch (error: any) {
        throw new AppError(error.message || "Failed to initiate payment with eSewa", 500);
    }
}
