import { create } from "zustand";
import axios from "axios";

const useCategoryStore = create((set) => ({
  parentCategories: [],
  parentCategoryName: "",
  childCategories: [],
  loading: false,
  error: null,

  fetchParentCategories: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(
        "http://localhost:8002/api/v1/products/categories/parents"
      );
      set({ parentCategories: response.data });
    } catch (err) {
      set({ error: "Failed to fetch parent categories" });
    } finally {
      set({ loading: false });
    }
  },

  fetchChildCategories: async (parentId) => {
    set({ loading: true });
    try {
      const response = await axios.get(
        `http://localhost:8002/api/v1/products/categories/parents/${parentId}`
      );
      set({ childCategories: response.data.subcategories });
      set({ parentCategoryName: response.data.name });
      console.log(response.data);
    } catch (err) {
      set({ error: "Failed to fetch child categories" });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCategoryStore;
