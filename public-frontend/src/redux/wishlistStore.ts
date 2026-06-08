import { create } from "zustand";
import api from "../api/axiosInstance";

interface IWishlistItem {
  _id: string;
  bookId: { _id: string } | string | null;
}

interface WishlistState {
  wishlistedBookIds: Set<string>;
  loading: boolean;
  fetchWishlistIds: () => Promise<void>;
  addToWishlist: (bookId: string) => Promise<boolean>;
  removeFromWishlist: (bookId: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlistedBookIds: new Set<string>(),
  loading: false,

  fetchWishlistIds: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/wishlist");
      const dataPayload = res.data?.data !== undefined ? res.data.data : res.data;
      const items: IWishlistItem[] = dataPayload?.books || [];
      
      const ids = new Set<string>();
      items.forEach((item) => {
        if (item.bookId) {
          const id = typeof item.bookId === "object" ? item.bookId._id : item.bookId;
          ids.add(id);
        }
      });
      
      set({ wishlistedBookIds: ids });
    } catch (err) {
      console.error("Failed to sync global wishlist matrix:", err);
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (bookId: string) => {
    try {
      const res = await api.post(`/wishlist/add/${bookId}`);
      if (res.data?.success) {
        set((state) => {
          const updated = new Set(state.wishlistedBookIds);
          updated.add(bookId);
          return { wishlistedBookIds: updated };
        });
        return true;
      }
    } catch (err) {
      console.error("Error adding node to wishlist store:", err);
    }
    return false;
  },

  removeFromWishlist: async (bookId: string) => {
    try {
      const res = await api.delete(`/wishlist/remove/${bookId}`);
      if (res.data?.success) {
        set((state) => {
          const updated = new Set(state.wishlistedBookIds);
          updated.delete(bookId);
          return { wishlistedBookIds: updated };
        });
        return true;
      }
    } catch (err) {
      console.error("Error dropping node from wishlist store:", err);
    }
    return false;
  },

  clearWishlist: async () => {
    try {
      const res = await api.delete("/wishlist/clear");
      if (res.data?.success) {
        set({ wishlistedBookIds: new Set() });
      }
    } catch (err) {
      console.error("Error resetting wishlist state store:", err);
    }
  },
}));