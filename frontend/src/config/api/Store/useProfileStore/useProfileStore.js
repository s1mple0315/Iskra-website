import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = "/api";

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}:${month}:${year}`;
};

const useProfileStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      console.log(token);
      
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`http://localhost:8001/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        "Access-Control-Allow-Origin": "*",
      });

      set({ user: response.data, loading: false });
    } catch (err) {
      console.error("Profile Fetch Error:", err.response || err.message);
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  updateProfile: async (name, surname, lastname, birthdate) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (surname !== undefined) updateData.surname = surname;
      if (lastname !== undefined) updateData.lastname = lastname;
      if (birthdate !== undefined)
        updateData.birthdate = formatDateToDDMMYYYY(birthdate);

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields to update");
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/auth/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ user: response.data, loading: false });
    } catch (err) {
      console.error("Profile Update Error:", err.response || err.message);
      set({ error: err.response?.data?.detail || err.message, loading: false });
    }
  },

  clearProfile: () => {
    set({ user: null, error: null });
    localStorage.removeItem("token");
  },
}));

export default useProfileStore;
