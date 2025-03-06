import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8002/api/v1/products", // Confirmed as 8000 from your earlier tests
});

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  product: null,
  categories: [], // Store the full category tree
  pagination: {
    page: 1,
    limit: 25,
    total_count: 0,
  },

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/categories/parents-with-subcategories");
      set({ categories: Array.isArray(response.data) ? response.data : [] });
    } catch (err) {
      set({ error: "Failed to fetch categories" });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async (subSubcategoryId, page = 1, limit = 25) => {
    set({ loading: true });
    try {
      const response = await api.get(`/categories/${subSubcategoryId}/products`, {
        params: { page, limit },
      });
      set({
        products: Array.isArray(response.data.products) ? response.data.products : [],
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total_count: response.data.total_count,
        },
      });
      console.log(response.data);
    } catch (err) {
      set({ error: "Failed to fetch products" });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/products/${productId}`);
      set({ product: response.data });
    } catch (err) {
      set({ error: "Failed to fetch product" });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useProductStore;