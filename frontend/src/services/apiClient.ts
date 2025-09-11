// src/services/apiClient.ts
import axios, { type AxiosInstance, AxiosError } from "axios";

/**
 * logout handler type:
 * the store will set this to a function that clears auth state.
 * We keep it as a setter to avoid circular imports between store <-> apiClient.
 */
type LogoutHandler = () => void;

/** runtime holder for the logout handler */
let logoutHandler: LogoutHandler | null = null;

/**
 * Allows the app (store) to provide a logout function that will be
 * invoked automatically when the API client detects a 401 Unauthorized.
 * Wiring example (in store/index.ts): setLogoutHandler(() => store.dispatch(logout()));
 */
export const setLogoutHandler = (fn: LogoutHandler) => {
  logoutHandler = fn;
};

/**
 * Base URL configuration:
 * - Prefer Vite env var VITE_API_BASE_URL, fallback to localhost:5000/api.
 * - Using an env var makes it easy to switch between local, staging, prod.
 */
const baseURL = (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:5000/api";

/** create axios instance */
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor:
 * - Reads token from localStorage and attaches Authorization header.
 * - Wrap in try/catch to avoid throwing in environments where localStorage is inaccessible.
 */
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // Non-fatal: if localStorage is not available, we proceed without token.
      // Log only in development.
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.warn("[apiClient] localStorage.getItem failed", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor:
 * - If server returns 401 (Unauthorized), invoke logout handler (if set).
 * - We still forward the error to callers so components can show messages.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      if (logoutHandler) {
        try {
          logoutHandler();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[apiClient] logoutHandler threw an error", e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
