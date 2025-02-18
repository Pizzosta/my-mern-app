import { create } from "zustand";

// Define the timeout duration (5 seconds)
const REQUEST_TIMEOUT = 5000;

export const useUserStore = create((set) => ({
    users: null,
    setUsers: (users) => set({ users }),
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
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser),
                    signal, // Pass the signal to the fetch request
                });

                clearTimeout(timeoutId); // Clear the timeout if the request completes

                const data = await res.json();

                if (res.ok) {
                    set((state) => ({ users: [...state.users, data.data] }));
                    return { success: true, message: "User Created Successfully" };
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

    /*login: async (credentials) => {
        try {
            // Validate fields
            if (!credentials.email || !credentials.password) {
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
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(credentials),
                    signal, // Pass the signal to the fetch request
                });

                clearTimeout(timeoutId); // Clear the timeout if the request completes

                const data = await res.json();

                if (res.ok) {
                    set({ user: data.data });
                    return { success: true, message: "Logged in successfully" };
                } else {
                    // Handle HTTP errors
                    return { success: false, message: data.message || "Failed to login" };
                }
            } catch (error) {
                clearTimeout(timeoutId); // Clear the timeout if an error occurs

                if (error.name === "AbortError") {
                    return { success: false, message: "Login request timed out. Please try again." };
                } else {
                    // Handle network errors
                    return { success: false, message: "Network error. Please try again." };
                }
            }
        } catch (error) {
            return { success: false, message: "An unexpected error occurred. Please try again." };
        }
    },
    logout: async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                set({ user: null });
                return { success: true, message: "Logged out successfully" };
            } else {
                const data = await res.json();
                return { success: false, message: data.message || "Failed to logout" };
            }
        } catch (error) {
            return { success: false, message: "An unexpected error occurred. Please try again." };
        }
    },*/
}));