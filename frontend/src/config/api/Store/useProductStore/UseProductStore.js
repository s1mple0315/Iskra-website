import { create } from "zustand";
import axios from "axios";

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  product: null, // Initialize the product state for storing a single product
  pagination: {
    page: 1,
    limit: 25,
    total_count: 0,
  },

  fetchProducts: async (subcategory_id, page = 1, limit = 25) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `http://localhost:8002/api/v1/products/categories/${subcategory_id}/products`,
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      set({
        products: Array.isArray(response.data.products)
          ? response.data.products
          : [],
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
      const response = await axios.get(
        `http://localhost:8002/api/v1/products/products/${productId}`
      );
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
