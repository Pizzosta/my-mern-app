import { create } from "zustand";

const API_BASE = "/api/auth";
const REQUEST_TIMEOUT = 5000;

export const useUserStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,

    setUser: (userData) => set({
        user: userData,
        isAuthenticated: !!userData
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
                console.error("Request aborted due to timeout");
                throw new Error("Request timed out. Please try again.");
            }
            throw error; // Rethrow other errors
        } finally {
            controller.abort();
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
            return { success: false, message: "Please provide all required fields", user: null };
        }

        try {
            const data = await get().apiRequest("/signup", "POST", newUser);
            set((state) => ({
                ...state,
                user: data.data.user,
                isAuthenticated: true
            }));
            return { success: true, message: "User Created Successfully", user: data.data.user };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || "Failed to create user", 
                user: null 
            };
        }
    },

    currentUser: async () => {
        try {
            const data = await get().apiRequest("/me", "GET");
            set((state) => ({
                ...state,
                user: data.data,
                isAuthenticated: true
            }));
            return { success: true, message: "Current user fetched successfully", user: data.data.user };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || "Failed to fetch current user", 
                user: null 
            };
        }
    },

    login: async (credentials) => {
        try {
            const data = await get().apiRequest("/login", "POST", credentials);
            set((state) => ({
                ...state,
                user: data.data.user,
                isAuthenticated: true
            }));
            return { success: true, message: "Logged in successfully", user: data.data.user };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || "Login failed", 
                user: null 
            };
        }
    },

    logout: async () => {
        try {
            await get().apiRequest("/logout", "POST");
            set((state) => ({
                ...state,
                user: null,
                isAuthenticated: false
            }));
            return { success: true, message: "Logged out successfully", user: null };
        } catch (error) {
            return { 
                success: false, 
                message: error.message || "Logout failed", 
                user: null 
            };
        }
    },
}));