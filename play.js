import { create } from "zustand";

const API_BASE = "/api/auth";
const REQUEST_TIMEOUT = 5000;

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (userData) => set({
    user: userData,
    isAuthenticated: !!userData,
  }),

  // Unified API request handler
  apiRequest: async (endpoint, method = "GET", body = null) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  },

  createUser: async (newUser) => {
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.phone ||
      !newUser.username ||
      !newUser.email ||
      !newUser.password
    ) {
      return {
        success: false,
        message: "Please provide all required fields",
      };
    }

    try {
      const data = await get().apiRequest("/signup", "POST", newUser);
      set((state) => ({
        ...state,
        user: data.data.user,
        isAuthenticated: true,
      }));
      return {
        success: true,
        message: data.message || "User created successfully",
        data: { user: data.data.user },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to create user",
      };
    }
  },

  currentUser: async () => {
    try {
      const data = await get().apiRequest("/me", "GET");
      set((state) => ({
        ...state,
        user: data.data.user,
        isAuthenticated: true,
      }));
      return {
        success: true,
        message: data.message || "Current user fetched successfully",
        data: { user: data.data.user },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to fetch current user",
      };
    }
  },

  login: async (credentials) => {
    try {
      const data = await get().apiRequest("/login", "POST", credentials);
      set((state) => ({
        ...state,
        user: data.data.user,
        isAuthenticated: true,
      }));
      return {
        success: true,
        message: data.message || "Logged in successfully",
        data: { user: data.data.user },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  },

  logout: async () => {
    try {
      const data = await get().apiRequest("/logout", "POST");
      set((state) => ({
        ...state,
        user: null,
        isAuthenticated: false,
      }));
      return {
        success: true,
        message: data.message || "Logged out successfully",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Logout failed",
      };
    }
  },
}));