import { create } from "zustand";
import axios from "axios";

const useProfileStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get("/api/v1/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateProfile: async (full_name, role) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.put(
        "/api/v1/auth/profile",
        { full_name, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ user: response.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearProfile: () => {
    set({ user: null, error: null });
    localStorage.removeItem("token");
  },
}));

export default useProfileStore;
