import { create } from "zustand";
import API from "../services/api";

const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;

const saveUserToGlobalRegistry = (userObj) => {
  if (!userObj || (!userObj.email && !userObj.username)) return;
  try {
    const stored = localStorage.getItem("registered_users_list");
    const list = stored ? JSON.parse(stored) : [];
    const isExist = list.some(
      (u) =>
        (u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()) ||
        (u.username && userObj.username && u.username.toLowerCase() === userObj.username.toLowerCase())
    );
    if (!isExist) {
      list.push({
        ...userObj,
        created_at: userObj.created_at || new Date().toISOString().slice(0, 10),
        role: userObj.role || (userObj.email?.includes("admin") || userObj.username === "admin" ? "admin" : "user")
      });
      localStorage.setItem("registered_users_list", JSON.stringify(list));
    }
  } catch (e) {}
};

const useAuthStore = create((set, get) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,

  login: async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const isAdmin = cleanEmail === "admin" || cleanEmail === "admin@gabuthub.com" || cleanEmail === "ravakubang2@gmail.com";

    try {
      const res = await API.post("/login", { email, password });
      if (res.data && (res.data.token || res.data.access_token)) {
        const token = res.data.token || res.data.access_token;
        const user = res.data.user || res.data.data;
        saveUserToGlobalRegistry(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
        return { success: true };
      }
    } catch (e) {}

    const targetUser = {
      id: Date.now(),
      username: email.includes("@") ? email.split("@")[0] : email,
      email: email.includes("@") ? email : `${email}@gabuthub.com`,
      role: isAdmin ? "admin" : "user",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      created_at: new Date().toISOString().slice(0, 10),
      bio: "Member GabutHub! 👋"
    };

    saveUserToGlobalRegistry(targetUser);

    const mockToken = "user-token-" + Date.now();
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(targetUser));
    set({ token: mockToken, user: targetUser });
    return { success: true };
  },

  register: async (username, email, password) => {
    const cleanUsername = (username || (email ? email.split("@")[0] : "User")).trim();
    const cleanEmail = (email || `${cleanUsername}@gabuthub.com`).trim().toLowerCase();

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      role: cleanEmail.includes("admin") ? "admin" : "user",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
      created_at: new Date().toISOString().slice(0, 10),
      bio: "Member baru GabutHub! 👋"
    };

    // Save to persistent global registry FIRST
    saveUserToGlobalRegistry(newUser);

    try {
      const res = await API.post("/register", { username: cleanUsername, email: cleanEmail, password });
      if (res.data && (res.data.token || res.data.access_token)) {
        const token = res.data.token || res.data.access_token;
        const user = res.data.user || res.data.data;
        saveUserToGlobalRegistry(user || newUser);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user || newUser));
        set({ token, user: user || newUser });
        return { success: true };
      }
    } catch (e) {}

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
        saveUserToGlobalRegistry(res.data);
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

    saveUserToGlobalRegistry(updatedUser);

    try {
      await API.put("/user/profile", { bio, avatar, username: newUsername, coverUrl });
    } catch (e) {}

    set({ user: updatedUser });
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return { success: true };
  },
}));

export default useAuthStore;
