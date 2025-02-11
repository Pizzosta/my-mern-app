import { create } from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct: async (newProduct) => {
        try {
            // Validate fields
            if (
                !newProduct.name ||
                !newProduct.price ||
                !newProduct.description ||
                !newProduct.image ||
                !newProduct.startTime ||
                !newProduct.endTime
            ) {
                return { success: false, message: "Please provide all required fields" };
            }

            // Define the timeout duration (5 seconds)
            const timeoutDuration = 5000;

            // Create an AbortController instance
            const controller = new AbortController();
            const { signal } = controller;

            // Set a timeout to abort the fetch request if it takes too long
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, timeoutDuration);

            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct),
                    signal, // Pass the signal to the fetch request
                });

                clearTimeout(timeoutId); // Clear the timeout if the request completes

                const data = await res.json();

                if (res.ok) {
                    set((state) => ({ products: [...state.products, data.data] }));
                    return { success: true, message: "Product Created Successfully" };
                } else {
                    // Handle HTTP errors
                    return { success: false, message: data.message || "Failed to create product" };
                }
            } catch (error) {
                clearTimeout(timeoutId); // Clear the timeout if an error occurs

                if (error.name === 'AbortError') {
                    return { success: false, message: "Request timed out. Please try again." };
                } else {
                    // Handle network errors
                    return { success: false, message: "Network error. Please try again." };
                }
            }
        } catch (error) {
            // Handle other unexpected errors
            return { success: false, message: "An unexpected error occurred. Please try again." };
        }
    },
}));