import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRegCreditCard, FaShippingFast, FaCheckCircle, FaExclamationTriangle, FaWallet } from "react-icons/fa";
import { useCartStore } from "../../redux/cartStore";
import { useOrderStore } from "../../redux/orderStore"; 

interface AddressForm {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

const initialAddressState: AddressForm = {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
};

type PaymentGateway = "khalti" | "esewa" | "cod";

const CheckoutPage = () => {
    const { cart } = useCartStore();
    const { 
        currentOrder, 
        isLoading, 
        error, 
        createOrderFromCart, 
        initiateOrderPayment, 
        clearOrderError, 
        resetCurrentOrder 
    } = useOrderStore();
    
    const navigate = useNavigate();

    // Form States
    const [shipping, setShipping] = useState<AddressForm>(initialAddressState);
    const [billing, setBilling] = useState<AddressForm>(initialAddressState);
    const [sameAsShipping, setSameAsShipping] = useState<boolean>(true);
    const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>("khalti");
    const [formError, setFormError] = useState<string | null>(null);

    const deliveryCharge = 0; 

    useEffect(() => {
        clearOrderError();
        if (!currentOrder && (!cart || !cart.items || cart.items.length === 0)) {
            navigate("/cart");
        }
        
        return () => {
            resetCurrentOrder();
        };
    }, [cart, navigate, currentOrder]);

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShipping(prev => ({ ...prev, [name]: value }));
        if (sameAsShipping) {
            setBilling(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBilling(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSameAsShipping(checked);
        if (checked) {
            setBilling(shipping);
        }
    };

    const validateForm = (addr: AddressForm) => {
        return addr.street && addr.city && addr.state && addr.zipCode && addr.country;
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm(shipping)) {
        setFormError("Please fill out all mandatory shipping address fields.");
        return;
    }

    if (!sameAsShipping && !validateForm(billing)) {
        setFormError("Please fill out all mandatory billing address fields.");
        return;
    }

    // Step 1: Create a pending order record to reserve items
    const orderResult = await createOrderFromCart({
        shippingAddress: shipping,
        billingAddress: sameAsShipping ? shipping : billing,
        deliveryCharge
    });

    if (orderResult.success && orderResult.order) {
        // Step 2: Attempt payment gateway orchestration
        const paymentResult = await initiateOrderPayment(orderResult.order._id, paymentGateway);
        
        if (paymentResult.success) {
            if (paymentGateway === "cod") {
                // Cash on Delivery is instantly approved, so we can clear cart here safely
                useCartStore.setState({ 
                    cart: { items: [], grandTotal: 0, totalItems: 0 } 
                });
            } else if (paymentResult.paymentUrl) {
                // Digital Payment: Leave cart intact! 
                // Redirect user to Khalti/eSewa. If they abandon, cart is still full when they come back.
                window.location.href = paymentResult.paymentUrl;
            }
        } else {
            setFormError("Order generated, but payment routing failed. Your cart has been saved. Please retry.");
        }
    }
};

    // Thank you interface (rendered automatically on a successful COD order checkout step completion)
    if (currentOrder) {
        return (
            <div className="min-h-screen bg-background font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-card-bg border border-slate-200/60 rounded-2xl p-8 text-center shadow-xs">
                    <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FaCheckCircle size={32} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-heading mb-2">Order Confirmed!</h2>
                    <p className="text-sm text-ui-muted mb-6">
                        {paymentGateway === "cod" 
                          ? "Your order has been logged successfully and will be packaged shortly. Please prepare payment on arrival."
                          : "Thank you for your order. It is currently placed under review pending secure payment validation."}
                    </p>
                    <div className="bg-background border border-slate-200/50 rounded-xl p-4 mb-6 text-left text-xs space-y-2">
                        <div className="flex justify-between"><span className="text-ui-muted">Order ID:</span> <span className="font-mono font-semibold text-ui-dark">{currentOrder._id}</span></div>
                        <div className="flex justify-between"><span className="text-ui-muted">Grand Total:</span> <span className="font-bold text-ui-dark">${currentOrder.grandTotal?.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-ui-muted">Method:</span> <span className="font-semibold text-ui-dark uppercase">{paymentGateway}</span></div>
                        <div className="flex justify-between"><span className="text-ui-muted">Payment Status:</span> <span className="font-semibold text-rose-600 uppercase tracking-wider text-[10px] bg-rose-50 px-1.5 py-0.5 rounded">{currentOrder.paymentStatus}</span></div>
                    </div>
                    <Link to="/all-books" className="block w-full text-center bg-ui-dark text-card-bg text-sm font-medium py-3 rounded-xl hover:bg-heading transition-colors shadow-xs">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                
                <div className="mb-6">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-ui-muted hover:text-ui-dark transition-colors group">
                        <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={12} />
                        Back to Cart
                    </Link>
                </div>

                <h1 className="font-serif text-3xl font-bold text-heading mb-8 tracking-tight">Checkout Desk</h1>

                {(error || formError) && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
                        <FaExclamationTriangle className="flex-shrink-0" />
                        <span>{formError || error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* SHIPPING, BILLING, AND PAYMENT SYSTEM CARDS */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* SHIPPING */}
                        <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
                                <FaShippingFast className="text-ui-muted" size={18} />
                                <h2 className="text-base font-bold text-heading">Shipping Logistics</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">Street Address</label>
                                    <input type="text" name="street" value={shipping.street} onChange={handleShippingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">City</label>
                                    <input type="text" name="city" value={shipping.city} onChange={handleShippingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">State / Province</label>
                                    <input type="text" name="state" value={shipping.state} onChange={handleShippingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">ZIP / Postal Code</label>
                                    <input type="text" name="zipCode" value={shipping.zipCode} onChange={handleShippingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">Country</label>
                                    <input type="text" name="country" value={shipping.country} onChange={handleShippingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                </div>
                            </div>
                        </div>

                        {/* TOGGLE ELEMENT */}
                        <div className="flex items-center gap-3 px-2">
                            <input type="checkbox" id="sameAsShipping" checked={sameAsShipping} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-300 text-ui-dark focus:ring-ui-dark accent-ui-dark cursor-pointer" />
                            <label htmlFor="sameAsShipping" className="text-sm font-medium text-heading select-none cursor-pointer">
                                Billing details match shipping address
                            </label>
                        </div>

                        {/* BILLING */}
                        {!sameAsShipping && (
                            <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all">
                                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
                                    <FaRegCreditCard className="text-ui-muted" size={16} />
                                    <h2 className="text-base font-bold text-heading">Billing Information</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">Street Address</label>
                                        <input type="text" name="street" value={billing.street} onChange={handleBillingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">City</label>
                                        <input type="text" name="city" value={billing.city} onChange={handleBillingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">State / Province</label>
                                        <input type="text" name="state" value={billing.state} onChange={handleBillingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">ZIP / Postal Code</label>
                                        <input type="text" name="zipCode" value={billing.zipCode} onChange={handleBillingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ui-muted uppercase mb-1.5">Country</label>
                                        <input type="text" name="country" value={billing.country} onChange={handleBillingChange} className="w-full bg-background border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:border-ui-dark transition-colors" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NEW: INTEGRATED GATEWAY SELECTOR PANEL */}
                        <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
                                <FaWallet className="text-ui-muted" size={16} />
                                <h2 className="text-base font-bold text-heading">Payment System Selection</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentGateway === "khalti" ? "border-purple-600 bg-purple-50/40 text-purple-900" : "border-slate-250 bg-background hover:border-slate-350"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold">Khalti Wallet</span>
                                        <input type="radio" name="gateway" checked={paymentGateway === "khalti"} onChange={() => setPaymentGateway("khalti")} className="h-4 w-4 accent-purple-600" />
                                    </div>
                                    <span className="text-[11px] text-ui-muted">Instant validation via digital payment voucher.</span>
                                </label>

                                <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentGateway === "esewa" ? "border-emerald-600 bg-emerald-50/40 text-emerald-900" : "border-slate-250 bg-background hover:border-slate-350"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold">eSewa Mobile</span>
                                        <input type="radio" name="gateway" checked={paymentGateway === "esewa"} onChange={() => setPaymentGateway("esewa")} className="h-4 w-4 accent-emerald-600" />
                                    </div>
                                    <span className="text-[11px] text-ui-muted">Secure transaction handling using standard credentials.</span>
                                </label>

                                <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentGateway === "cod" ? "border-slate-700 bg-slate-50 text-slate-900" : "border-slate-250 bg-background hover:border-slate-350"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold">Cash On Delivery</span>
                                        <input type="radio" name="gateway" checked={paymentGateway === "cod"} onChange={() => setPaymentGateway("cod")} className="h-4 w-4 accent-slate-800" />
                                    </div>
                                    <span className="text-[11px] text-ui-muted">Verify books at your doorstep prior to settling balance.</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* BILL DETAILS DECK */}
                    <div className="bg-card-bg border border-slate-200/60 rounded-2xl p-6 shadow-xs lg:sticky lg:top-24">
                        <h2 className="text-base font-bold text-heading border-b border-slate-100 pb-4 mb-4">
                            Review Items
                        </h2>

                        <div className="max-h-48 overflow-y-auto mb-4 pr-1 space-y-3 divide-y divide-slate-100/70">
                            {cart?.items?.map((item, idx) => (
                                <div key={item.inventoryId} className={`flex gap-3 pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                                    <div className="h-14 w-10 bg-slate-50 border border-slate-100 rounded overflow-hidden flex-shrink-0">
                                        {item.bookDetails?.coverImage?.imageUrl ? (
                                            <img src={item.bookDetails.coverImage.imageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[8px] text-ui-muted text-center p-0.5">No Cover</div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-medium text-heading truncate">{item.bookDetails?.name || "Unknown Title"}</h4>
                                        <p className="text-[11px] text-ui-muted">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-ui-dark">${(item.subTotal || 0).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm pb-4 border-t border-b border-slate-100 pt-4">
                            <div className="flex justify-between text-ui-muted">
                                <span>Items Subtotal</span>
                                <span>${(cart?.grandTotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-ui-muted">
                                <span>Shipping Fees</span>
                                <span className={deliveryCharge === 0 ? "text-emerald-600 font-medium" : ""}>
                                    {deliveryCharge === 0 ? "Free" : `$${deliveryCharge.toFixed(2)}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center font-bold text-heading text-base my-4">
                            <span>Grand Total</span>
                            <span className="text-lg">${((cart?.grandTotal || 0) + deliveryCharge).toFixed(2)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || cart?.items?.some(item => !item.isAvailable)}
                            className="w-full bg-ui-dark text-card-bg text-sm font-semibold py-3 rounded-xl hover:bg-heading transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading 
                              ? "Processing Order Pipeline..." 
                              : paymentGateway === "cod" 
                                ? "Confirm Order (COD)" 
                                : `Proceed to ${paymentGateway === "khalti" ? "Khalti Portal" : "eSewa Portal"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;