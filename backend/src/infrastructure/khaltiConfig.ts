import { ENV } from "./env";

export const khaltiConfig = {
    secretKey: process.env.KHALTI_SECRET_KEY || "test_secret_key",
    publicKey: process.env.KHALTI_PUBLIC_KEY || "test_public_key",
    paymentUrl: process.env.KHALTI_PAYMENT_URL || "https://a.khalti.com/api/v2/epayment/initiate/",
    verificationUrl: process.env.KHALTI_VERIFICATION_URL || "https://a.khalti.com/api/v2/epayment/lookup/",
    successUrl: `${ENV.FRONTEND_URL}/payment-success`,
    failureUrl: `${ENV.FRONTEND_URL}/payment-failed`,
    websiteUrl: ENV.FRONTEND_URL || "http://localhost:5173",
<<<<<<< HEAD
};
=======
};
>>>>>>> d2f16803441089d0f9cb6ca8822d8c1985f2ee31
