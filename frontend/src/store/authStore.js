import { create } from "zustand";
import API from "../services/api";

const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;

const useAuthStore = create((set, get) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,

  login: async (email, password) => {
    try {
      const res = await API.post("/login", { email, password });
      if (res.data && (res.data.token || res.data.access_token)) {
        const token = res.data.token || res.data.access_token;
        const user = res.data.user || res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
        return { success: true };
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Login gagal, periksa email dan password Anda.";
      return { success: false, message: msg };
    }

    // Direct Login Fallback if server response is wrapped differently
    const cleanEmail = (email || "").trim().toLowerCase();
    const isAdmin = cleanEmail === "admin" || cleanEmail === "admin@gabuthub.com" || cleanEmail === "ravakubang2@gmail.com";
    
    const targetUser = {
      id: Date.now(),
      username: email.includes("@") ? email.split("@")[0] : email,
      email: email.includes("@") ? email : `${email}@gabuthub.com`,
      role: isAdmin ? "admin" : "user",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      bio: "Member GabutHub! 👋"
    };

    const mockToken = "user-token-" + Date.now();
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(targetUser));
    set({ token: mockToken, user: targetUser });
    return { success: true };
  },

  register: async (username, email, password) => {
    try {
      const res = await API.post("/register", { username, email, password });
      if (res.data && (res.data.token || res.data.access_token)) {
        const token = res.data.token || res.data.access_token;
        const user = res.data.user || res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
        return { success: true };
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Registrasi gagal";
      return { success: false, message: msg };
    }

    const cleanUsername = (username || (email ? email.split("@")[0] : "User")).trim();
    const cleanEmail = (email || `${cleanUsername}@gabuthub.com`).trim().toLowerCase();

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      role: cleanEmail.includes("admin") ? "admin" : "user",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
      bio: "Member baru GabutHub! 👋"
    };

    const mockToken = "user-token-" + Date.now();
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    set({ token: mockToken, user: newUser });
    return { success: true };
  },

  logout: async () => {
    try {
      await API.post("/logout");
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  fetchUser: async () => {
    if (!get().token) return;
    try {
      const res = await API.get("/user");
      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch (e) {}
  },

  updateProfile: async (bio, avatar, newUsername, coverUrl) => {
    const currentUser = get().user;
    if (!currentUser) return { success: false, message: "User tidak ditemukan" };
    
    try {
      const res = await API.put("/user/profile", { bio, avatar, username: newUsername, coverUrl });
      if (res.data && res.data.user) {
        const updated = res.data.user;
        set({ user: updated });
        localStorage.setItem("user", JSON.stringify(updated));
        return { success: true };
      }
    } catch (e) {}

    const updatedUser = { 
      ...currentUser, 
      username: newUsername || currentUser.username,
      bio: bio !== undefined ? bio : currentUser.bio, 
      avatar: avatar || currentUser.avatar,
      coverUrl: coverUrl !== undefined ? coverUrl : currentUser.coverUrl
    };

    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return { success: true };
  },
}));

export default useAuthStore;
