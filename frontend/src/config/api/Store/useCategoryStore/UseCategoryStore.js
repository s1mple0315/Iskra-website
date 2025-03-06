import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8002/api/v1/products",
});

const useCategoryStore = create((set) => ({
  parentCategories: [],
  parentCategoryName: "",
  parentCategoryId: "",
  childCategories: [],
  loading: false,
  error: null,

  fetchParentCategories: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/categories/parents-with-subcategories");
      set({ parentCategories: Array.isArray(response.data) ? response.data : [] });
    } catch (err) {
      set({ error: "Failed to fetch parent categories" });
      console.error(err);
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
      set({ parentCategoryId: response.data.id });
      console.log(response.data);
    } catch (err) {
      set({ error: "Failed to fetch child categories" });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCategoryStore;
