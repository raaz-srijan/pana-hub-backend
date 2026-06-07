import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom"; // 🧠 Added useNavigate
import { FaCheckCircle, FaBookOpen, FaReceipt } from "react-icons/fa";
import api from "../../api/axiosInstance";
import { useCartStore } from "../../redux/cartStore";

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // 🧠 Initialize navigation controls
    const [isVerifying, setIsVerifying] = useState<boolean>(true);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<{ orderId: string; amount?: number } | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const pidx = searchParams.get("pidx");
                const esewaData = searchParams.get("data");
                
                // 🔥 KHALTI CANCELLATION REDIRECT GUARD
                // If Khalti appends a canceled string parameter, catch it immediately
                const khaltiStatus = searchParams.get("status");
                const purchaseOrderId = searchParams.get("purchase_order_id");

                if (khaltiStatus === "User canceled" || searchParams.get("status") === "Canceled") {
                    // Send them straight to your failure page with a clean message query string
                    navigate(
                        `/payment-failed?msg=The transaction was explicitly aborted by the user inside Khalti.&purchase_order_id=${purchaseOrderId || "N/A"}`, 
                        { replace: true }
                    );
                    return; // Stop code execution right here! Do not hit the backend verification API.
                }

                if (!pidx && !esewaData) {
                    setIsVerifying(false);
                    return;
                }

                let verificationSuccess = false;
                let detectedOrderId = "N/A";
                let verifiedAmount = 0;

                if (pidx) {
                    const response = await api.post("/payment/verify/khalti", { pidx });
                    if (response.data?.success) {
                        detectedOrderId = response.data?.payment?.orderId || "N/A";
                        verifiedAmount = response.data?.payment?.amount || 0;
                        verificationSuccess = true;
                    } else {
                        setVerificationError(response.data?.message || "Payment verification was rejected.");
                    }
                } else if (esewaData) {
                    const response = await api.get(`/payment/verify/esewa?data=${esewaData}`);
                    if (response.data?.success) {
                        detectedOrderId = response.data?.payment?.orderId || "N/A";
                        verifiedAmount = response.data?.payment?.amount || 0;
                        verificationSuccess = true;
                    } else {
                        setVerificationError(response.data?.message || "eSewa verification was rejected.");
                    }
                }

                if (verificationSuccess) {
                    setOrderDetails({
                        orderId: detectedOrderId,
                        amount: verifiedAmount
                    });

                    useCartStore.setState({ 
                        cart: { items: [], grandTotal: 0, totalItems: 0 } 
                    });

                    window.history.replaceState({}, document.title, window.location.pathname);
                }

            } catch (err: any) {
                console.error("Payment validation checkpoint error:", err);
                
                // Refresh safeguard
                const serverMessage = err.response?.data?.message || "";
                if (serverMessage.toLowerCase().includes("already paid") || serverMessage.toLowerCase().includes("completed")) {
                    setVerificationError(null); 
                } else {
                    setVerificationError(serverMessage || "Transaction authorization failed.");
                }
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-dark mb-4"></div>
                <h2 className="text-base font-semibold text-heading">Verifying payment authorization security matrix...</h2>
                <p className="text-xs text-ui-muted mt-1">Please do not close or refresh this browser window.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-card-bg border border-slate-200/60 rounded-2xl p-8 text-center shadow-xs">
                {verificationError ? (
                    <>
                        <div className="h-16 w-16 bg-amber-50 border border-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FaReceipt size={28} />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-heading mb-2">Sync Pending</h2>
                        <p className="text-sm text-ui-muted mb-6">{verificationError}</p>
                    </>
                ) : (
                    <>
                        <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FaCheckCircle size={32} />
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-heading mb-2">Payment Successful!</h2>
                        <p className="text-sm text-ui-muted mb-6">
                            Your payment token cleared security validation successfully. Your books are being pulled from inventory now.
                        </p>
                    </>
                )}

                {orderDetails && (
                    <div className="bg-background border border-slate-200/50 rounded-xl p-4 mb-6 text-left text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-ui-muted">Order Reference:</span> 
                            <span className="font-mono font-semibold text-ui-dark">{orderDetails.orderId}</span>
                        </div>
                        
                        {(orderDetails.amount ?? 0) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-ui-muted">Amount Paid:</span> 
                                <span className="font-semibold text-ui-dark">NPR {orderDetails.amount?.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between">
                            <span className="text-ui-muted">Transaction Status:</span> 
                            <span className="font-semibold text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">Paid</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to="/all-books" className="flex items-center justify-center gap-2 w-full text-center bg-ui-dark text-card-bg text-sm font-medium py-3 rounded-xl hover:bg-heading transition-colors shadow-xs">
                        View Digital Library
                    </Link>
                    <Link to="/profile/orders" className="flex items-center justify-center gap-2 w-full text-center bg-background border border-slate-200 text-ui-dark text-sm font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-xs">
                        View Order Status
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;