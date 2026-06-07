import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../api/axiosInstance";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
}

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: Record<string, string>) => Promise<boolean>;
  logout: () => void;
  logoutStateOnly: () => void;
  clearError: () => void;
}

const getSafeLocalStorageUser = (): UserPayload | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return null;
  }
  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Corrupted user payload found in localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      accessToken: localStorage.getItem("token"),
      user: getSafeLocalStorageUser(), 
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null }, false, "auth/login_start");
        
        try {
          const response = await api.post("/auth/login", credentials);
          const payload = response.data; 
          const accessToken = payload?.accessToken;

          if (!accessToken) {
            throw new Error("No access token returned from backend");
          }

          const { accessToken: _, ...user } = payload;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          set({ accessToken, user, isLoading: false }, false, "auth/login_success");
          return true;
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Authentication failed";
          set({ error: errorMessage, isLoading: false }, false, "auth/login_failure");
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true }, false, "auth/logout_start");
        try {
          await api.post("/auth/logout");
        } catch (err) {
          console.warn("Backend cookie clearance passed or skipped:", err);
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          set({ accessToken: null, user: null, error: null, isLoading: false }, false, "auth/logout_success");
        }
      },

      logoutStateOnly: () => {
        set({ accessToken: null, user: null, error: null, isLoading: false }, false, "auth/silent_logout_success");
      },

      clearError: () => set({ error: null }, false, "auth/clearError"),
    }),
    { name: "auth" }
  )
);