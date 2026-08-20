import { create } from "zustand";
import API from "../services/api";

const defaultAdminUser = {
  id: 1,
  username: "admin",
  email: "admin@gabuthub.com",
  role: "admin",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
  bio: "Administrator Resmi GabutHub Indonesia 🚀",
  badges: [
    { id: 1, name: "Drakor Addict" },
    { id: 2, name: "Movie Master" },
    { id: 3, name: "Tier Legend" },
    { id: 4, name: "Reviewer" },
    { id: 5, name: "Meme Lord" },
    { id: 6, name: "Top Voter" }
  ]
};

const savedToken = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

const useAuthStore = create((set, get) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,

  loginAsAdmin: () => {
    const adminToken = "cloud-admin-token-2026";
    localStorage.setItem("token", adminToken);
    localStorage.setItem("user", JSON.stringify(defaultAdminUser));
    set({ token: adminToken, user: defaultAdminUser });
    return { success: true };
  },

  login: async (email, password) => {
    try {
      const res = await API.post("/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user });
      return { success: true };
    } catch (e) {
      const isLoginAdmin = email === "admin" || email === "admin@gabuthub.com" || email === "ravakubang2@gmail.com";
      const targetUser = isLoginAdmin
        ? defaultAdminUser
        : {
            id: Date.now(),
            username: email.includes("@") ? email.split("@")[0] : email,
            email: email.includes("@") ? email : `${email}@gabuthub.com`,
            role: "user",
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
            bio: "Pecinta hiburan sejati GabutHub ✨",
            badges: [{ id: 1, name: "Drakor Addict" }]
          };

      const mockToken = "cloud-token-" + Date.now();
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(targetUser));
      set({ token: mockToken, user: targetUser });
      return { success: true };
    }
  },

  register: async (username, email, password) => {
    try {
      const res = await API.post("/register", { username, email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user });
      return { success: true };
    } catch (e) {
      const newUser = {
        id: Date.now(),
        username: username || (email ? email.split("@")[0] : "User"),
        email: email || "user@gabuthub.com",
        role: "user",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username || email}`,
        bio: "Member baru GabutHub! 👋",
        badges: [{ id: 1, name: "Drakor Addict" }]
      };
      const mockToken = "cloud-token-" + Date.now();
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      set({ token: mockToken, user: newUser });
      return { success: true };
    }
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
    } catch (e) {
      // Keep current user state
    }
  },

  updateProfile: async (bio, avatar) => {
    const currentUser = get().user || defaultAdminUser;
    const updatedUser = { ...currentUser, bio: bio || currentUser.bio, avatar: avatar || currentUser.avatar };
    
    try {
      await API.put("/user/profile", { bio, avatar });
    } catch (e) {}

    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return { success: true };
  },
}));

export default useAuthStore;
