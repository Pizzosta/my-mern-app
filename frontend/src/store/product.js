import { create } from 'zustand';

// Define the timeout duration (5 seconds)
const REQUEST_TIMEOUT = 5000;

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

            // Create an AbortController instance
            const controller = new AbortController();
            const { signal } = controller;

            // Set a timeout to abort the fetch request if it takes too long
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, REQUEST_TIMEOUT);

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
                    return { success: false, message: "Create Product Request timed out. Please try again." };
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
    fetchProducts: async () => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch('/api/products', { signal });

            if (!res.ok) { // Check response status first
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch products");
            }

            const data = await res.json();
            set({ products: data.data });
            /*
                        const productsWithUsers = data.data.map(product => ({
                            ...product,
                            winner: product.winner ? {
                                id: product.winner._id,
                                username: product.winner.username
                            } : null,
                            seller: product.seller ? {
                                id: product.seller._id,
                                username: product.seller.username
                            } : null
                        }));
                        set({ products: productsWithUsers});
                        */

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, message: "Fetch Products Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },
    deleteProduct: async (id) => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE', signal });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (res.ok) {
                set((state) => ({
                    products: state.products.filter((product) => product._id !== id),
                }));
                return { success: true, message: "Product Deleted Successfully" };
            } else {
                // Handle HTTP errors
                return { success: false, message: data.message || "Failed to delete product" };
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return { success: false, message: "Delete Product Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },
    updateProduct: async (id, updatedProduct) => {
        const controller = new AbortController();
        const { signal } = controller;
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
                signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("Failed to update product");

            const data = await res.json();

            set((state) => ({
                products: state.products.map(product =>
                    product._id === id ? data.data : product
                )
            }));

            return {
                success: true,
                message: data.message || "Product updated successfully"
            };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return { success: false, message: "Update Product Request timed out. Please try again." };
            } else if (error instanceof Error && error.message.includes('Network Error')) {
                // Handle network errors
                return { success: false, message: "Network error. Please try again." };
            } else {
                // Handle other errors
                return { success: false, message: "An unexpected error occurred. Please try again." };
            }
        }
    },
}));