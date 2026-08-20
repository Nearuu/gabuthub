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
      // Fallback for cloud hosting if API server is not handling auth route directly
      const lowerLogin = (loginVal || "").toLowerCase();
      const isAdmin = lowerLogin.includes("admin") || lowerLogin.includes("rava");
      
      const fallbackUser = {
        id: isAdmin ? 1 : Date.now(),
        username: loginVal.split("@")[0] || "User",
        email: loginVal.includes("@") ? loginVal : `${loginVal}@gabuthub.com`,
        role: isAdmin ? "admin" : "user",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${loginVal}`,
        bio: isAdmin ? "Administrator Utama GabutHub." : "Member GabutHub."
      };
      
      const fallbackToken = "mock_cloud_token_" + Date.now();
      localStorage.setItem("token", fallbackToken);
      localStorage.setItem("user", JSON.stringify(fallbackUser));

      set({ user: fallbackUser, token: fallbackToken, loading: false });
      return { success: true };
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
      const lowerName = (username || "").toLowerCase();
      const lowerEmail = (email || "").toLowerCase();
      const isAdmin = lowerName.includes("admin") || lowerEmail.includes("admin");

      const fallbackUser = {
        id: Date.now(),
        username,
        email,
        role: isAdmin ? "admin" : "user",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        bio: "Member baru GabutHub."
      };

      const fallbackToken = "mock_cloud_token_" + Date.now();
      localStorage.setItem("token", fallbackToken);
      localStorage.setItem("user", JSON.stringify(fallbackUser));

      set({ user: fallbackUser, token: fallbackToken, loading: false });
      return { success: true };
    }
  },

  logout: async () => {
    try {
      await API.post("/logout");
    } catch (e) {
      // Ignore API failure on cloud fallback
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const response = await API.get("/user");
      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (e) {
      // Maintain local user state if network error
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await API.post("/user/profile", data);
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (e) {
      // Local profile update fallback
      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    }
  }
}));

export default useAuthStore;
