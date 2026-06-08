import { useSearchParams, Link } from "react-router-dom";
import { FaExclamationTriangle, FaShoppingBag, FaRedo } from "react-icons/fa";

const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    
    // Extract error details if passed from the payment gateway redirect string
    const errorMessage = searchParams.get("msg") || "The transaction authorization request was explicitly declined or timed out by the gateway issuer.";
    const orderId = searchParams.get("order_id") || searchParams.get("purchase_order_id");

    return (
        <div className="min-h-screen bg-background font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-card-bg border border-slate-200/60 rounded-2xl p-8 text-center shadow-xs">
                <div className="h-16 w-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5">
                    <FaExclamationTriangle size={28} />
                </div>
                
                <h2 className="font-serif text-2xl font-bold text-heading mb-2">Transaction Declined</h2>
                <p className="text-sm text-ui-muted mb-6">
                    {errorMessage}
                </p>

                {orderId && (
                    <div className="bg-background border border-slate-200/50 rounded-xl p-3 mb-6 text-left text-xs flex justify-between items-center">
                        <span className="text-ui-muted">Targeted Order ID:</span>
                        <span className="font-mono font-semibold text-ui-dark">{orderId}</span>
                    </div>
                )}

                <div className="bg-rose-50/50 border border-rose-100/70 rounded-xl p-4 text-xs text-rose-800 text-left mb-6 space-y-1">
                    <p className="font-semibold">Why did this happen?</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-ui-muted">
                        <li>The payment transaction session timed out.</li>
                        <li>Insufficient wallet balance or account credit.</li>
                        <li>The OTP verification code typed was invalid.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to="/checkout" className="flex items-center justify-center gap-2 w-full text-center bg-ui-dark text-card-bg text-sm font-medium py-3 rounded-xl hover:bg-heading transition-colors shadow-xs">
                        <FaRedo size={12} /> Retry Checkout
                    </Link>
                    <Link to="/all-books" className="flex items-center justify-center gap-2 w-full text-center bg-background border border-slate-200 text-ui-dark text-sm font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-xs">
                        <FaShoppingBag size={12} /> Return to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage;