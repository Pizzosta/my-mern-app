import create from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
    updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => (p._id === product._id ? product : p)),
    })),
    deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p._id !== id),
    })),
    }));