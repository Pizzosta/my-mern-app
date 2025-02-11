import { create } from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct: async (newProduct) => {
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        })
        const data = await res.json();
        if (res.ok) {
            set((state) => ({ products: [...state.products, data.data] }));
            return { success: true, message: "Product Created Successfully" };
        }
    }
}));
