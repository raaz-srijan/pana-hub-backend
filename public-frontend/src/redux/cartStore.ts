import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api/axiosInstance";

interface BookDetails {
    _id: string;
    name: string;
    isbn: string;
    coverImage?: {
        imageUrl: string;
        publicId: string;
    };
    author: {
        _id: string;
        name: string;
    };
}

interface VendorDetails {
    _id: string;
    vendorName: string;
}

interface CartItem {
    inventoryId: string;
    bookDetails: BookDetails;
    vendorDetails: VendorDetails;
    unitPrice: number;
    quantity: number;
    subTotal: number;
    inStock: number;
    isAvailable: boolean;
}

interface CartData {
    items: CartItem[];
    grandTotal: number;
    totalItems: number;
}

interface CartState {
    cart: CartData | null;
    isLoading: boolean;
    error: string | null;

    fetchCart: () => Promise<void>;
    addToCart: (inventoryId: string, quantity: number) => Promise<boolean>;
    updateCartItem: (inventoryId: string, quantity: number) => Promise<boolean>;
    removeItem: (inventoryId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    
    clearCartError: () => void;
}

const initialCartData: CartData = {
    items: [],
    grandTotal: 0,
    totalItems: 0,
};

export const useCartStore = create<CartState>()(
  devtools(
    (set) => ({
      cart: initialCartData,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null }, false, "cart/fetch_start");
        try {
          const response = await api.get("/cart");
          
          const cartData = response.data?.cart || response.data?.data || initialCartData;
          
          set({ cart: cartData, isLoading: false }, false, "cart/fetch_success");
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to load cart";
          set({ error: errorMessage, isLoading: false }, false, "cart/fetch_failure");
        }
      },

      addToCart: async (inventoryId, quantity) => {
        set({ isLoading: true, error: null }, false, "cart/add_start");
        try {
          await api.post("/cart", { items: [{ inventoryId, quantity }] });
          set({ isLoading: false }, false, "cart/add_success");
          
          const store = useCartStore.getState();
          await store.fetchCart();
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to add item to cart";
          set({ error: errorMessage, isLoading: false }, false, "cart/add_failure");
          return false;
        }
      },

      updateCartItem: async (inventoryId, quantity) => {
        set({ isLoading: true, error: null }, false, "cart/update_start");
        try {
          await api.patch(`/cart/items/${inventoryId}`, { quantity });
          set({ isLoading: false }, false, "cart/update_success");
          
          const store = useCartStore.getState();
          await store.fetchCart();
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to update item quantity";
          set({ error: errorMessage, isLoading: false }, false, "cart/update_failure");
          return false;
        }
      },

      removeItem: async (inventoryId) => {
        set({ isLoading: true, error: null }, false, "cart/remove_item_start");
        try {
          await api.delete(`/cart/items/${inventoryId}`);
          set({ isLoading: false }, false, "cart/remove_item_success");
          
          const store = useCartStore.getState();
          await store.fetchCart();
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to remove item from cart";
          set({ error: errorMessage, isLoading: false }, false, "cart/remove_item_failure");
          return false;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null }, false, "cart/clear_start");
        try {
          await api.delete("/cart");
          
          // Set cleanly to empty defaults right away on success
          set({ cart: initialCartData, isLoading: false }, false, "cart/clear_success");
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to clear cart";
          set({ error: errorMessage, isLoading: false }, false, "cart/clear_failure");
          return false;
        }
      },

      clearCartError: () => set({ error: null }, false, "cart/clearError"),
    }),
    { name: "cart" }
  )
);