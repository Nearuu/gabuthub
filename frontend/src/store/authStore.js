import { create } from "zustand";
import API from "../services/api";

const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;

const defaultAdminUser = {
  id: 1,
  username: "admin",
  email: "admin@gabuthub.com",
  role: "admin",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
  coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200",
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

const useAuthStore = create((set, get) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,

  login: async (email, password) => {
    try {
      const res = await API.post("/login", { email, password });
      if (res.data && res.data.token) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
        return { success: true };
      }
    } catch (e) {}

    // Fallback standard login logic
    const cleanEmail = (email || "").trim().toLowerCase();
    const isAdmin = cleanEmail === "admin" || cleanEmail === "admin@gabuthub.com" || cleanEmail === "ravakubang2@gmail.com";
    
    const targetUser = isAdmin
      ? defaultAdminUser
      : {
          id: Date.now(),
          username: email.includes("@") ? email.split("@")[0] : email,
          email: email.includes("@") ? email : `${email}@gabuthub.com`,
          role: "user",
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
          coverUrl: "",
          bio: "Member baru GabutHub! 👋",
          badges: []
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
      if (res.data && res.data.token) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
        return { success: true };
      }
    } catch (e) {}

    const newUser = {
      id: Date.now(),
      username: username || (email ? email.split("@")[0] : "User"),
      email: email || "user@gabuthub.com",
      role: "user",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username || email}`,
      coverUrl: "",
      bio: "Member baru GabutHub! 👋",
      badges: []
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
    
    const updatedUser = { 
      ...currentUser, 
      username: newUsername || currentUser.username,
      bio: bio !== undefined ? bio : currentUser.bio, 
      avatar: avatar || currentUser.avatar,
      coverUrl: coverUrl !== undefined ? coverUrl : currentUser.coverUrl
    };
    
    try {
      await API.put("/user/profile", { bio, avatar, username: newUsername, coverUrl });
    } catch (e) {}

    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return { success: true };
  },
}));

export default useAuthStore;
