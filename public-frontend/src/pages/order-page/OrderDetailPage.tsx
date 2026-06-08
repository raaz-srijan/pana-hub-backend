import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FaArrowLeft, 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaCreditCard, 
    FaShippingFast, 
    FaBook, 
    FaCheckCircle,
    FaStore
} from "react-icons/fa";
import { useOrderStore } from "../../redux/orderStore";

const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    
    // Using currentOrder state and local tracking states
    const { currentOrder, isLoading, error, resetCurrentOrder } = useOrderStore();
    const [localLoading, setLocalLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrderDetails = async () => {
            if (!orderId) return;
            setLocalLoading(true);
            setLocalError(null);
            
            try {
                // Pin direct API data retrieval fallback if store context sync drops out
                // If your store doesn't have an explicit fetchById, we can call your API layout directly:
                // or safely use your existing state parameters
                await useOrderStore.getState().fetchOrderHistory();
                
                // Safely pinpoint target order from history array cache
                const history = useOrderStore.getState().orderHistory;
                const match = history.find(o => o._id === orderId);
                
                if (match) {
                    useOrderStore.setState({ currentOrder: match });
                } else {
                    setLocalError("Requested order record could not be located in your history profiles.");
                }
            } catch (err: any) {
                setLocalError(err.message || "Failed to parse order context.");
            } finally {
                setLocalLoading(false);
            }
        };

        loadOrderDetails();

        // Cleanup current active selection context on screen exit
        return () => {
            resetCurrentOrder();
        };
    }, [orderId, resetCurrentOrder]);

    // Badge styling lookups
    const getOrderStatusColor = (status: string) => {
        const maps: Record<string, string> = {
            pending: "bg-amber-100 text-amber-800 border-amber-200",
            processing: "bg-blue-100 text-blue-800 border-blue-200",
            shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
            delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
            cancelled: "bg-rose-100 text-rose-800 border-rose-200",
        };
        return maps[status] || "bg-slate-100 text-slate-800";
    };

    if (localLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-dark mb-3"></div>
                <p className="text-xs text-ui-muted">Compiling line item invoice records...</p>
            </div>
        );
    }

    const displayError = localError || error;
    if (displayError || !currentOrder) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl mb-4 text-sm w-full">
                    {displayError || "Order context matching failed."}
                </div>
                <button 
                    onClick={() => navigate("/profile/orders")}
                    className="flex items-center gap-2 text-xs font-semibold text-ui-dark hover:underline"
                >
                    <FaArrowLeft size={10} /> Back to Order History
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10 px-4 max-w-4xl mx-auto font-sans">
            
            {/* TOP NAVIGATION HEADERS */}
            <button 
                onClick={() => navigate("/profile/orders")}
                className="flex items-center gap-2 text-xs font-semibold text-ui-muted hover:text-heading transition-colors mb-6 group"
            >
                <FaArrowLeft size={10} className="transform group-hover:-translate-x-0.5 transition-transform" /> 
                Back to Order Tracking Index
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-heading">
                            Invoice Details
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getOrderStatusColor(currentOrder.orderStatus)}`}>
                            {currentOrder.orderStatus}
                        </span>
                    </div>
                    <p className="font-mono text-xs text-ui-muted mt-1">ID Ref: {currentOrder._id}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-ui-muted self-start md:self-auto bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl">
                    <FaCalendarAlt className="text-slate-400" />
                    <span>Placed: <b>{new Date(currentOrder.createdAt).toLocaleDateString()}</b></span>
                </div>
            </div>

            {/* MAIN CONTENT BLOCK SEGMENT SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT TWO-THIRDS PANEL: INVOICED VOLUME ITEMS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-5 md:p-6 space-y-4">
                        <h3 className="text-sm font-bold text-heading uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                            <FaBook className="text-slate-400" /> Ordered Volumes
                        </h3>
                        
                        <div className="divide-y divide-slate-100 space-y-4">
                            {currentOrder.books?.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 pt-4 first:pt-0 items-start">
                                    <img 
                                        src={item.bookId?.coverImage || "https://placehold.co/80x120?text=Book"} 
                                        alt={item.bookId?.name || "Volume Snapshot"} 
                                        className="w-14 h-20 object-cover bg-slate-50 rounded-lg border border-slate-200/60 flex-shrink-0 shadow-xs"
                                    />
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <h4 className="font-serif font-bold text-heading text-sm sm:text-base leading-snug truncate">
                                            {item.bookId?.name || "Book Title Missing"}
                                        </h4>
                                        <p className="text-xs text-ui-muted">
                                            ISBN: <span className="font-mono">{item.bookId?.isbn || "N/A"}</span>
                                        </p>
                                        
                                        {item.vendorId?.vendorName && (
                                            <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/60 border border-amber-100/50 px-1.5 py-0.5 rounded mt-1">
                                                <FaStore size={10} /> Fulfilled by: {item.vendorId.vendorName}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-heading">NPR {item.subTotal?.toFixed(2)}</p>
                                        <p className="text-[11px] text-ui-muted mt-0.5">{item.quantity} × NPR {item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT ONE-THIRD PANEL: SUMMARY LEDGER AND DESTINATIONS */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* FINANCIAL INVOICE OVERVIEW */}
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-xs">
                        <h3 className="text-xs font-bold text-heading uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                            <FaCreditCard className="text-slate-400" /> Account Summary
                        </h3>
                        <div className="text-xs space-y-2.5">
                            <div className="flex justify-between text-ui-muted">
                                <span>Fulfillment Status:</span>
                                <span className="font-medium text-ui-dark uppercase">{currentOrder.orderStatus}</span>
                            </div>
                            <div className="flex justify-between text-ui-muted">
                                <span>Payment Tracking:</span>
                                <span className="font-bold uppercase text-ui-dark text-[11px]">{currentOrder.paymentStatus}</span>
                            </div>
                            <div className="flex justify-between text-ui-muted">
                                <span>Shipping & Handling:</span>
                                <span>NPR {currentOrder.deliveryCharge?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline font-bold text-heading">
                                <span className="text-xs">Grand Invoice Total:</span>
                                <span className="text-base text-ui-dark">NPR {currentOrder.grandTotal?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* SHIPPING DESTINATION LOGISTICS ADDRESS CARD */}
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-5 space-y-3 shadow-xs">
                        <h3 className="text-xs font-bold text-heading uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-slate-400" /> Logistics Destination
                        </h3>
                        <div className="text-xs text-ui-muted leading-relaxed space-y-1">
                            <p className="font-semibold text-heading">Shipping Address:</p>
                            <p className="bg-background border border-slate-200/40 p-2.5 rounded-xl text-ui-dark mt-1">
                                {currentOrder.shippingAddress?.tole || "Street/Tole Info Missing"},<br />
                                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state}
                            </p>
                        </div>
                        {currentOrder.billingAddress && (
                            <div className="text-xs text-ui-muted leading-relaxed space-y-1 pt-2">
                                <p className="font-semibold text-heading">Billing Point:</p>
                                <p className="bg-background border border-slate-200/40 p-2.5 rounded-xl text-ui-dark mt-1">
                                    {currentOrder.billingAddress?.tole}, {currentOrder.billingAddress?.city}, {currentOrder.billingAddress?.state}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailPage;