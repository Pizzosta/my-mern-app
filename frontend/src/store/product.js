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

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });

            const data = await res.json();

            if (res.ok) {
                set((state) => ({ products: [...state.products, data.data] }));
                return { success: true, message: "Product Created Successfully" };
            } else {
                // Handle HTTP errors (e.g., 400, 500)
                return { success: false, message: data.message || "Failed to create product" };
            }
        } catch (error) {
            // Handle network errors
            return { success: false, message: "Network error. Please try again." };
        }
    },
}));