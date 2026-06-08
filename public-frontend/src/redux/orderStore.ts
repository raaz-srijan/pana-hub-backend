import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api/axiosInstance";
import { useCartStore } from "./cartStore"; // 👈 Import your cart store here

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderPayload {
  shippingAddress: Address;
  billingAddress: Address;
  deliveryCharge?: number;
}

interface OrderDetails {
  _id: string;
  userId: string;
  books: any[];
  deliveryCharge: number;
  grandTotal: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "failed";
  createdAt: string;
}

interface OrderState {
  currentOrder: OrderDetails | null;
  orderHistory: OrderDetails[];
  isLoading: boolean;
  error: string | null;

  createOrderFromCart: (orderData: OrderPayload) => Promise<{ success: boolean; order?: OrderDetails }>;
  initiateOrderPayment: (orderId: string, gateway: "khalti" | "esewa" | "cod") => Promise<{ success: boolean; paymentUrl?: string }>;
  fetchOrderHistory: () => Promise<void>;
  clearOrderError: () => void;
  resetCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  devtools(
    (set) => ({
      currentOrder: null,
      orderHistory: [],
      isLoading: false,
      error: null,

      createOrderFromCart: async (orderData) => {
        set({ isLoading: true, error: null }, false, "order/create_start");
        try {
          const normalizedPayload = {
            deliveryCharge: orderData.deliveryCharge || 0,
            shippingAddress: {
              state: orderData.shippingAddress.state,
              city: orderData.shippingAddress.city,
              tole: orderData.shippingAddress.street,
              country: orderData.shippingAddress.country,
              zipCode: orderData.shippingAddress.zipCode
            },
            billingAddress: {
              state: orderData.billingAddress.state,
              city: orderData.billingAddress.city,
              tole: orderData.billingAddress.street,
              country: orderData.billingAddress.country,
              zipCode: orderData.billingAddress.zipCode
            }
          };

          const response = await api.post("/orders/checkout", normalizedPayload);
          const newOrder = response.data?.order || response.data;

          set({ currentOrder: newOrder, isLoading: false }, false, "order/create_success");
          return { success: true, order: newOrder };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to place order. Please try again.";
          set({ error: errorMessage, isLoading: false }, false, "order/create_failure");
          return { success: false };
        }
      },

      initiateOrderPayment: async (orderId, paymentGateway) => {
        set({ isLoading: true, error: null }, false, "order/payment_initiate_start");
        try {
          const response = await api.post("/payment/initiate", { orderId, paymentGateway });

          if (paymentGateway === "cod" && response.data?.success) {
            // Immediately clear frontend layout cart store state for immediate UX response
            useCartStore.setState({
              cart: { items: [], grandTotal: 0, totalItems: 0 }
            });
          }

          set({ isLoading: false }, false, "order/payment_initiate_success");
          return { success: true, paymentUrl: response.data?.paymentUrl };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to initialize payment option.";
          set({ error: errorMessage, isLoading: false }, false, "order/payment_initiate_failure");
          return { success: false };
        }
      },

      fetchOrderHistory: async () => {
        set({ isLoading: true, error: null }, false, "order/fetch_history_start");
        try {
          const response = await api.get("/orders/my-orders");

          const ordersArray = response.data?.orders || (Array.isArray(response.data) ? response.data : []);

          set({ orderHistory: ordersArray, isLoading: false }, false, "order/fetch_history_success");
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to load order history";
          set({ error: errorMessage, isLoading: false }, false, "order/fetch_history_failure");
        }
      },

      clearOrderError: () => set({ error: null }, false, "order/clearError"),
      resetCurrentOrder: () => set({ currentOrder: null }, false, "order/resetCurrentOrder"),
    }),
    { name: "order" }
  )
);