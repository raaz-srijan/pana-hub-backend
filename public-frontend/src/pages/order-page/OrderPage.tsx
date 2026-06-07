import React, { useEffect, useState } from "react";
import { 
    FaShoppingBag, 
    FaCalendarAlt, 
    FaClock, 
    FaBoxOpen,
    FaRegFileAlt
} from "react-icons/fa";
import { useOrderStore } from "../../redux/orderStore";
import { useNavigate } from "react-router-dom";

const OrderPage = () => {
    const { orderHistory, isLoading, error, fetchOrderHistory } = useOrderStore();
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const navigate = useNavigate();

    // Fetch order list on component mounting loop
    useEffect(() => {
        fetchOrderHistory();
    }, [fetchOrderHistory]);

    // Helper: Style Order Status Badge
    const getOrderStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            processing: "bg-blue-50 text-blue-700 border-blue-200",
            shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
            delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
            cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        };
        return `px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${variants[status] || "bg-slate-50 text-slate-700"}`;
    };

    // Helper: Style Payment Status Badge
    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            unpaid: "bg-rose-50 text-rose-600 border-rose-100",
            paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
            failed: "bg-red-100 text-red-700 border-red-200",
        };
        return `px-2 py-0.5 rounded text-[11px] font-semibold border uppercase ${variants[status] || "bg-slate-50 text-slate-600"}`;
    };

    if (isLoading && orderHistory.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ui-dark mb-3"></div>
                <p className="text-sm text-ui-muted font-medium">Retrieving your order purchase tracking records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans py-10 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: ORDER HISTORY INDEX LIST */}
            <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-slate-100 text-ui-dark rounded-xl flex items-center justify-center">
                        <FaShoppingBag size={18} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-heading">Your Purchase Orders</h1>
                        <p className="text-xs text-ui-muted">Track and review your storefront checkout cycles.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm p-4 rounded-xl">
                        {error}
                    </div>
                )}

                {orderHistory.length === 0 ? (
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-10 text-center">
                        <FaBoxOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="font-serif text-lg font-bold text-heading mb-1">No orders discovered</h3>
                        <p className="text-sm text-ui-muted max-w-sm mx-auto mb-4">You haven't initialized or processed any purchases inside your digital book profile yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Array.isArray(orderHistory) && orderHistory.map((order: any) => (
                            <div 
                                key={order._id}
                                onClick={() => {
                                    // ✅ FIXED: Actions combined cleanly in a valid execution block statement
                                    setSelectedOrder(order);
                                    navigate(`/my-orders/${order._id}`);
                                }}
                                className={`bg-card-bg border rounded-2xl p-5 transition-all cursor-pointer hover:shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${selectedOrder?._id === order._id ? 'border-ui-dark ring-1 ring-ui-dark/10' : 'border-slate-200/60'}`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold text-ui-dark">
                                            #{order._id.substring(0, 8).toUpperCase()}...
                                        </span>
                                        <span className={getOrderStatusBadge(order.orderStatus)}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-ui-muted">
                                        <span className="flex items-center gap-1">
                                            <FaCalendarAlt size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaRegFileAlt size={12} /> {order.books?.length || 0} Items
                                        </span>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                                    <div className="font-semibold text-heading text-base mb-1">
                                        NPR {order.grandTotal.toFixed(2)}
                                    </div>
                                    <span className={getPaymentStatusBadge(order.paymentStatus)}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: ACTIVE CONTEXT SELECTED ORDER SIDE-DRAWER PANEL */}
            <div className="lg:col-span-1">
                {selectedOrder ? (
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-6 sticky top-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-serif font-bold text-lg text-heading">Order Breakdown</h3>
                                <p className="font-mono text-[11px] text-ui-muted mt-0.5">ID: {selectedOrder._id}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-xs text-ui-muted hover:text-heading transition-colors bg-slate-50 border border-slate-200 px-2 py-1 rounded-md"
                            >
                                Close
                            </button>
                        </div>

                        {/* Order Trajectory Manifest */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-heading uppercase tracking-wider">Manifest Logistics</h4>
                            <div className="grid grid-cols-2 gap-3 text-xs bg-background border border-slate-200/50 rounded-xl p-3">
                                <div>
                                    <p className="text-ui-muted mb-0.5">Delivery Track:</p>
                                    <span className="font-medium text-ui-dark uppercase">{selectedOrder.orderStatus}</span>
                                </div>
                                <div>
                                    <p className="text-ui-muted mb-0.5">Payment State:</p>
                                    <span className="font-medium text-ui-dark uppercase">{selectedOrder.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Populated Book Line Items */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-heading uppercase tracking-wider">Books Purchased</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                {selectedOrder.books?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 bg-background border border-slate-200/40 p-2.5 rounded-xl text-xs items-center">
                                        <img 
                                            src={item.bookId?.coverImage || "https://placehold.co/40x60?text=Book"} 
                                            alt={item.bookId?.name || "Book"}
                                            className="w-10 h-14 object-cover bg-slate-100 rounded border border-slate-200/60 flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-heading truncate">{item.bookId?.name || "Unknown Volume"}</p>
                                            <p className="text-[11px] text-ui-muted mt-0.5">Qty: {item.quantity} × NPR {item.price}</p>
                                        </div>
                                        <div className="font-semibold text-ui-dark whitespace-nowrap">
                                            NPR {item.subTotal}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipment Address Breakdown */}
                        <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                            <h4 className="font-semibold text-heading uppercase tracking-wider text-[11px]">Shipping Destination</h4>
                            <p className="text-ui-muted bg-background border border-slate-200/40 rounded-xl p-3 leading-relaxed">
                                {selectedOrder.shippingAddress?.tole}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                            </p>
                        </div>

                        {/* Ledger Pricing Balancing Sheet */}
                        <div className="border-t border-slate-100 pt-4 text-xs space-y-2">
                            <div className="flex justify-between text-ui-muted">
                                <span>Delivery Fee:</span>
                                <span>NPR {selectedOrder.deliveryCharge?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="flex justify-between font-bold text-heading text-sm pt-2 border-t border-dashed border-slate-200">
                                <span>Total Account Invoice:</span>
                                <span>NPR {selectedOrder.grandTotal?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center h-[350px] sticky top-6">
                        <FaClock size={28} className="text-slate-300 mb-3" />
                        <h4 className="font-serif font-bold text-heading text-base mb-1">Select an order</h4>
                        <p className="text-xs text-ui-muted max-w-[200px]">Click any transaction record on the left to pull live tracking metadata updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderPage;