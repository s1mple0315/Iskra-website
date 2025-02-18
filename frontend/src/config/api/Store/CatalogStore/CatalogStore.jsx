import { create } from "zustand";
import axios from "axios";

const useCatalogStore = create((set) => ({
  categories: [],
  fetchCategories: async () => {
    try {
      const response = await axios.get("http://localhost:8002/api/v1/products/categories/parents");
      set({ categories: response.data });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },
}));

export default useCatalogStore;
