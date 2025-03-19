import { create } from "zustand";

// Define the timeout duration (5 seconds)
const REQUEST_TIMEOUT = 5000;

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (userData) => set({
    user: userData,
    isAuthenticated: !!userData
  }),

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

    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
        signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);
      const data = res.ok || res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : { message: "Unexpected server response" };

      if (res.ok) {
        set((state) => ({
          ...state,
          user: data.data.user,
          isAuthenticated: true
        }));
        return { success: true, message: "User Created Successfully", user: data.data.user };
      }
      return { success: false, message: data.message || "Failed to create user", user: null };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.log("Request aborted due to timeout");
        return { success: false, message: "Signup Request timed out. Please try again.", user: null };
      }
      return { success: false, message: "Network error. Please try again.", user: null };
    }
  },
}));