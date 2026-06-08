import { khaltiConfig } from "../../infrastructure/khaltiConfig";
import { AppError } from "../error/appError";

interface IKhaltiPaymentData {
    amount: number;
    mobile?: string;
    product_identity: string;
    product_name: string;
    return_url: string;
    failure_url: string;
    public_key: string;
    website_url: string;
    purchase_order_id: string;
    purchase_order_name: string;
}

export async function initiateKhaltiPayment(
    amount: number,
    productId: string,
    productName: string,
    customerPhone?: string
): Promise<string> {
    const paymentData: IKhaltiPaymentData = {
        amount: Math.round(amount * 100), 
        mobile: customerPhone,
        product_identity: productId,
        product_name: productName,
        return_url: khaltiConfig.successUrl,
        failure_url: khaltiConfig.failureUrl,
        public_key: khaltiConfig.publicKey,
        website_url: khaltiConfig.websiteUrl,
        purchase_order_id: productId,
        purchase_order_name: productName,
    };

    try {
        const response = await fetch(khaltiConfig.paymentUrl, {
            method: "POST",
            headers: {
                "Authorization": `Key ${khaltiConfig.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || JSON.stringify(errorData);
            } catch (e) {
            }
            throw new AppError(`Khalti payment initiation failed: ${errorMessage}`, 400);
        }

        const data = await response.json();

        if (data && data.payment_url) {
            return data.payment_url;
        }

        throw new AppError("Payment URL is missing in Khalti response", 500);
    } catch (error: any) {
        throw new AppError(error.message || "Failed to initiate payment with Khalti", 500);
    }
}


export async function verifyKhaltiPayment(pidx: string): Promise<any> {
    if (!pidx) {
        throw new AppError("pidx is required for Khalti payment verification", 400);
    }

    try {
        const response = await fetch(khaltiConfig.verificationUrl, {
            method: "POST",
            headers: {
                "Authorization": `Key ${khaltiConfig.secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pidx }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 400) {
                 return data; 
            }
            throw new AppError(`Khalti payment verification failed: ${data.detail || response.statusText}`, response.status);
        }

        return data;
    } catch (error: any) {
        throw new AppError(error.message || "Failed to verify payment with Khalti", 500);
    }
}
