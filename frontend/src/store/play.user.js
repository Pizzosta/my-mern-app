
import { create } from "zustand";

const API_BASE = "/api/users";
const AUTH_API_BASE = "/api/auth";
const REQUEST_TIMEOUT = 10000; //10 secs

export const useUserStore = create((set, get) => ({
    users: [],
    user: null,
    isAuthenticated: false,

    setUser: (userData) => set({
        user: userData,
        isAuthenticated: !!userData
    }),

    // Unified API request handler
    apiRequest: async (endpoint, method = "GET", body = null, isAuthRoute = false) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch(`${isAuthRoute ? AUTH_API_BASE : API_BASE}${endpoint}`, {
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
        }
    },

    createUser: async (newUser) => {
        const requiredFields = [
            "firstName",
            "lastName",
            "phone",
            "username",
            "email",
            "password",
          ];
      
          for (const field of requiredFields) {
            if (!newUser[field]) {
              return { success: false, message: `Missing required field: ${field}` };
            }
          }

        try {
            // Set isAuthRoute to false to use API_BASE instead of AUTH_API_BASE
            const data = await get().apiRequest("/signup", "POST", newUser, false);
            set((state) => ({
                ...state,
                user: data.data.user,
                isAuthenticated: true
            }));
            return { success: true, message: data.message || "User Created Successfully", data: { user: data.data.user } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to create user",
            };
        }
    },

    currentUser: async () => {
        try {
            const data = await get().apiRequest("/me", "GET", null, true);
            set((state) => ({
                ...state,
                user: data.data.user,
                isAuthenticated: true
            }));
            return { success: true, message: data.message || "Current user fetched successfully", data: { user: data.data.user } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to fetch current user",
            };
        }
    },

    login: async (credentials) => {
        try {
            const data = await get().apiRequest("/login", "POST", credentials, true);
            set((state) => ({
                ...state,
                user: data.data.user,
                isAuthenticated: true
            }));
            return { success: true, message: data.message || "Logged in successfully", data: { user: data.data.user } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Login failed",
            };
        }
    },

    logout: async () => {
        try {
            const data = await get().apiRequest("/logout", "POST", null, true);
            set((state) => ({
                ...state,
                user: null,
                isAuthenticated: false
            }));
            return { success: true, message: data.message || "Logged out successfully", data: null };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Logout failed",
            };
        }
    },

    // Fetch a specific user by ID
    fetchUser: async (userId) => {
        if (!userId) {
            return { success: false, message: "User ID is required" };
        }

        try {
            const data = await get().apiRequest(`/${userId}`, "GET", null, false);
            return { success: true, message: data.message || "User fetched successfully", data: { user: data.data.user } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to fetch user",
            };
        }
    },

    // Fetch all users
    fetchAllUsers: async () => {
        try {
            const data = await get().apiRequest("/", "GET", null, false);
            set({ users: data.data });
            return { success: true, message: data.message || "Users fetched successfully", data: { users: data.data } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to fetch users",
            };
        }
    },

    // Delete a user by ID
    deleteUser: async (userId) => {
        if (!userId) {
            return { success: false, message: "User ID is required" };
        }

        try {
            const data = await get().apiRequest(`/${userId}`, "DELETE", null, false);
            // If the current user is deleted, clear the state
            if (get().user?._id === userId) {
                set((state) => ({
                    ...state,
                    user: null,
                    isAuthenticated: false
                }));
            }
            return { success: true, message: data.message || "User deleted successfully", data: null };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to delete user",
            };
        }
    },

    // Update a user by ID
    updateUser: async (userId, updates) => {
        if (!userId) {
            return { success: false, message: "User ID is required" };
        }
        if (!updates || Object.keys(updates).length === 0) {
            return { success: false, message: "No updates provided" };
        }

        try {
            const data = await get().apiRequest(`/${userId}`, "PUT", updates, false);
            // If the current user is updated, update the state
            if (get().user?._id === userId) {
                set((state) => ({
                    ...state,
                    user: data.data.user,
                    isAuthenticated: true
                }));
            }
            return { success: true, message: data.message || "User updated successfully", data: { user: data.data.user } };
        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to update user",
            };
        }
    },

}));
