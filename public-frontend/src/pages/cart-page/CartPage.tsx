import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../redux/cartStore";
import CartItemRow, { type ICartItem } from "./components/CartItemRow";
import { FaArrowLeft, FaShoppingBag, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

const CartPage = () => {
  const { cart, isLoading, error, fetchCart, updateCartItem, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (inventoryId: string, currentQty: number, change: number, stockLimit: number) => {
    const targetQty = currentQty + change;
    if (targetQty > stockLimit || targetQty < 1) return;
    await updateCartItem(inventoryId, targetQty);
  };

  const hasUnavailableItems = cart?.items?.some((item: ICartItem) => !item.isAvailable) || false;
  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isLoading && isCartEmpty) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-gray-200 rounded-2xl w-full" />
            <div className="h-32 bg-gray-200 rounded-2xl w-full" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl w-full" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Action Strip */}
        <div className="mb-6">
          <Link to="/all-books" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 transition group">
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={10} />
            Back to Book Grid
          </Link>
        </div>

        <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight mb-8">
          Shopping Cart
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm flex items-center gap-3 shadow-3xs animate-fade-in">
            <FaExclamationTriangle className="flex-shrink-0 text-red-500" size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isCartEmpty ? (
          /* Empty State View */
          <div className="bg-white border border-gray-200/60 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm mt-12">
            <div className="h-16 w-16 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-3xs">
              <FaShoppingBag size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-1.5">Your cart is clear</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Looks like you haven't added any books to your allocation list yet.</p>
            <Link to="/all-books" className="block w-full text-center bg-gray-900 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-gray-800 transition shadow-xs">
              Explore Available Books
            </Link>
          </div>
        ) : (
          /* Operational Master Layout Split Column */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Primary Item Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {cart?.totalItems || 0} {cart?.totalItems === 1 ? "Item Checked" : "Items Selected"}
                </span>
                <button
                  onClick={() => clearCart()}
                  className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  Empty Entire Cart
                </button>
              </div>

              <div className="space-y-3.5">
                {cart.items?.map((item: ICartItem) => (
                  <CartItemRow
                    key={item.inventoryId}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemoveItem={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar Summary Placement */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-4 mb-4">
                  Order Evaluation
                </h2>

                <div className="space-y-3 text-sm pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Base Subtotal</span>
                    <span className="font-semibold text-gray-900">Rs. {(cart?.grandTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping Allocation</span>
                    <span className="text-emerald-600 font-bold uppercase text-[11px] tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-center font-serif font-bold text-gray-900 text-lg my-5">
                  <span>Grand Total</span>
                  <span className="font-sans text-xl">Rs. {(cart?.grandTotal || 0).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={hasUnavailableItems}
                  className="w-full block text-center bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 shadow-xs cursor-pointer"
                >
                  Proceed to Checkout
                </button>

                {hasUnavailableItems && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mt-3">
                    <FaExclamationTriangle className="shrink-0 mt-0.5" size={12} />
                    <p className="text-[11px] font-medium leading-normal">
                      Please remove unavailable catalog selections to allow payment computation to unlock.
                    </p>
                  </div>
                )}
              </div>

              {/* Security trust note to lower abandonment rates */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
                <FaShieldAlt size={12} className="text-gray-300" />
                <span>Secure Multi-Vendor Fulfillment Infrastructure</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;