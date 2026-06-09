import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { useAuthStore } from "../redux/authStore";

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isRefreshCall = 
            originalRequest.url?.includes("auth/refresh") || 
            originalRequest.url?.includes("/refresh");

        if (isRefreshCall) {
            useAuthStore.getState().logoutStateOnly();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest); 
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const responseDataEnvelope = response.data;
                const innerData = responseDataEnvelope?.data;
                const accessToken = innerData?.accessToken;
                const profilePayload = innerData?.user;

                if (!accessToken) {
                    throw new Error("Missing access token inside returned data envelope path structure.");
                }

                // Update global state and localStorage
                useAuthStore.setState({ accessToken: accessToken, user: profilePayload || null });
                localStorage.setItem("token", accessToken);
                if (profilePayload) {
                    localStorage.setItem("user", JSON.stringify(profilePayload));
                }

                // Update the authorization header for the original failed request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                useAuthStore.getState().logoutStateOnly();
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;