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
    fetchProducts: async () => {
        try {
            const res = await fetch('/api/products');

            if (!res.ok) { // Check response status first
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch products");
            }

            const data = await res.json();
            set({ products: data.data });

        } catch (error) {
            // Handle network errors
            console.error("Network error. Please try again.");
        }
    },
    deleteProduct: async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
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
            // Handle network errors
            return { success: false, message: "Network error. Please try again." };
        }
    },
    updateProduct: async (id, updatedProduct) => {
		const res = await fetch(`/api/products/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedProduct),
		});
		const data = await res.json();
		if (!data.success) return { success: false, message: data.message };

		// update the ui immediately, without needing a refresh
		set((state) => ({
			products: state.products.map((product) => (product._id === id ? data.data : product)),
		}));

		return { success: true, message: data.message };
	},
    /*updateProduct: async (id, updatedProduct) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProduct),
            });
            const data = await res.json();
            if (!data.success) return { success: false, message: data.message };

            // update the ui immediately, without needing a refresh
            set((state) => ({
                products: state.products.map((product) => (product._id === id ? data.data : product)),
            }));

            return { success: true, message: data.message };
        } catch (error) {
            // Handle network errors
            return { success: false, message: "Network error. Please try again." };
        }
    },*/
    // IN product.js (Zustand store)
    /* updateProduct: async (id, updatedProduct) => {
         try {
             const res = await fetch(`/api/products/${id}`, {
                 method: "PUT",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(updatedProduct)
             });
 
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
             return {
                 success: false,
                 message: error.message || "Network error. Please try again."
             };
         }
     },*/
}));