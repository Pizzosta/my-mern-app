import { create } from "zustand";

const API_BASE = "/api/users";
const AUTH_API_BASE = "/api/auth";
const REQUEST_TIMEOUT = 10000; //10 secs

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (userData) => set({
    user: userData,
    isAuthenticated: !!userData,
  }),

  // Unified API request handler with file support
  apiRequest: async (endpoint, method = "GET", body = null, isAuthRoute = false, retry = true) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const isFileUpload = body instanceof FormData;
      const headers = isFileUpload ? {} : { "Content-Type": "application/json" };
      const requestBody = isFileUpload ? body : body ? JSON.stringify(body) : null;

      const res = await fetch(`${isAuthRoute ? AUTH_API_BASE : API_BASE}${endpoint}`, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && retry && !endpoint.includes("/refresh")) {
          const refreshData = await get().apiRequest("/refresh", "POST", null, true, false);
          if (refreshData.success) {
            return get().apiRequest(endpoint, method, body, isAuthRoute, false);
          } else {
            get().setUser(null);
            throw new Error("Session expired. Please login.");
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
      throw error;
    }
  },

  createUser: async (newUser, profilePictureFile) => {
    const requiredFields = ["firstName", "lastName", "phone", "username", "email", "password"];
    for (const field of requiredFields) {
      if (!newUser[field]) {
        return { success: false, message: `Missing required field: ${field}` };
      }
    }

    try {
      const formData = new FormData();
      for (const key in newUser) {
        formData.append(key, newUser[key]);
      }
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const data = await get().apiRequest("/signup", "POST", formData, false);
      set((state) => ({
        ...state,
        user: data.data.user,
        isAuthenticated: true,
      }));
      return { success: true, message: data.message || "User Created Successfully", data: { user: data.data.user } };
    } catch (error) {
      return { success: false, message: error.message || "Failed to create user" };
    }
  },

  updateUser: async (userId, updates, profilePictureFile) => {
    if (!userId) {
      return { success: false, message: "User ID is required" };
    }
    if ((!updates || Object.keys(updates).length === 0) && !profilePictureFile) {
      return { success: false, message: "No updates or profile picture provided" };
    }

    try {
      const formData = new FormData();
      for (const key in updates) {
        formData.append(key, updates[key]);
      }
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const data = await get().apiRequest(`/${userId}`, "PUT", formData, false);
      if (get().user?._id === userId) {
        set((state) => ({
          ...state,
          user: data.data.user,
          isAuthenticated: true,
        }));
      }
      return { success: true, message: data.message || "User updated successfully", data: { user: data.data.user } };
    } catch (error) {
      return { success: false, message: error.message || "Failed to update user" };
    }
  },

  // ... (other methods like currentUser, login, logout remain unchanged)
}));