/*
import { create } from "zustand";

// Define the timeout duration (5 seconds)
const REQUEST_TIMEOUT = 5000;

export const useUserStore = create((set) => ({
    users: [],
    user: null, // Add current user to state
    isAuthenticated: false,

    // Set multiple users (for admin purposes)
    setUsers: (users) => set({ users }),

    // Set current authenticated user
    setUser: (userData) => set({
        user: userData,
        isAuthenticated: !!userData
    }),

    createUser: async (newUser) => {
        try {
            // Validate fields
            if (
                !newUser.firstName ||
                !newUser.lastName ||
                !newUser.phone ||
                !newUser.username ||
                !newUser.email ||
                !newUser.password
            ) {
                return { success: false, message: "Please provide all required fields" };
            }

            // Create an AbortController instance
            const controller = new AbortController();
            const { signal } = controller;

            // Set a timeout to abort the fetch request if it takes too long
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, REQUEST_TIMEOUT);

            try {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser),
                    signal, // Pass the signal to the fetch request
                    credentials: "include", // Important for sending/receiving cookies
                });

                clearTimeout(timeoutId); // Clear the timeout if the request completes

                const data = await res.json();

                if (res.ok) {
                    set((state) => ({
                        users: [...state.users, data.data.user],
                        user: data.data.user,          // Set current user
                        isAuthenticated: true          // Update auth status
                    }));
                    return { success: true, message: "User Created Successfully", user: data.data.user };
                } else {
                    // Handle HTTP errors
                    return { success: false, message: data.message || "Failed to create user" };
                }
            } catch (error) {
                clearTimeout(timeoutId); // Clear the timeout if an error occurs

                if (error.name === "AbortError") {
                    return { success: false, message: "Signup Request timed out. Please try again." };
                } else {
                    // Handle network errors
                    return { success: false, message: "Network error. Please try again." };
                }
            }
        } catch (error) {
            return { success: false, message: "An unexpected error occurred. Please try again." };
        }
    },
    /*
    fetchUsers: async () => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch('/api/users', { signal });

            if (!res.ok) { // Check response status first
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch users");
            }

            const data = await res.json();
            set({ products: data.data });
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, message: "Fetch Users Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },
    deleteUser: async (id) => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE', signal });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (res.ok) {
                set((state) => ({
                    users: state.users.filter((user) => user._id !== id),
                }));
                return { success: true, message: "User Deleted Successfully" };
            } else {
                // Handle HTTP errors
                return { success: false, message: data.message || "Failed to delete user" };
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, message: "Delete User Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },
    updateUser: async (id, updatedUser) => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
                signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("Failed to update user");

            const data = await res.json();

            set((state) => ({
                products: state.products.map(product =>
                    product._id === id ? data.data : product
                )
            }));

            return {
                success: true,
                message: data.message || "User updated successfully"
            };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return { success: false, message: "Update User Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },*/


import { create } from "zustand";

const API_BASE = "/api/users";
const AUTH_API_BASE = "/api/auth";
const REQUEST_TIMEOUT = 10000; //10 secs

export const useUserStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,

    setUser: (userData) => set({
        user: userData,
        isAuthenticated: !!userData
    }),

    // Unified API request handler
    apiRequest: async (endpoint, method = "GET", body = null, isAuthRoute = false, retry = true) => {
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
                if (res.status === 401 && retry && !endpoint.includes('/refresh')) {
                    // Attempt token refresh
                    const refreshData = await get().apiRequest('/refresh', 'POST', null, true, false);
                    if (refreshData.success) {
                        // Retry original request
                        return get().apiRequest(endpoint, method, body, isAuthRoute, false);
                    } else {
                        get().setUser(null);
                        throw new Error('Session expired. Please login.');
                    }
                }
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
            set({ user: null, isAuthenticated: false });
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
}));