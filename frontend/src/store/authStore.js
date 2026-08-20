import { create } from "zustand";
import API from "../services/api";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,

  login: async (loginVal, password) => {
    set({ loading: true });
    try {
      const response = await API.post("/login", { login: loginVal, password });
      const { user, access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      set({ user, token: access_token, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Check details.",
      };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const response = await API.post("/register", { username, email, password });
      const { user, access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      set({ user, token: access_token, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(" ")
          : "Registration failed. Try again.",
      };
    }
  },

  logout: async () => {
    try {
      await API.post("/logout");
    } catch (e) {
      // Even if API logout fails, clear local state
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    if (!get().token) return;
    try {
      const response = await API.get("/user");
      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (error) {
      // If unauthorized, interceptor clears token
    }
  },

  updateProfile: async (bio, avatar) => {
    try {
      const response = await API.post("/user/profile", { bio, avatar });
      const { user } = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(" ")
          : "Failed to update profile",
      };
    }
  },
}));

export default useAuthStore;
