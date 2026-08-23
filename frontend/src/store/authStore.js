import { create } from "zustand";
import API from "../services/api";

const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
const savedUser = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;

const useAuthStore = create((set, get) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  loading: false,

  login: async (loginVal, password) => {
    set({ loading: true });
    try {
      const res = await API.post("/login", {
        login: (loginVal || "").trim(),
        email: (loginVal || "").trim(),
        password,
      });

      const data = res.data;
      const token = data?.token || data?.access_token;
      const user = data?.user || data?.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        // Also write cookie for fast server-side compatibility
        document.cookie = `gabuthub_auth_token=${token}; path=/; max-age=2592000`;
        set({ token, user, loading: false });
        return { success: true, user };
      } else {
        set({ loading: false });
        return { success: false, message: "Gagal mendapatkan data login dari server." };
      }
    } catch (error) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.login?.[0] ||
        error?.response?.data?.errors?.password?.[0] ||
        "Email/Username atau password salah!";
      return { success: false, message: msg };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const res = await API.post("/register", {
        username: (username || "").trim(),
        email: (email || "").trim().toLowerCase(),
        password,
      });

      const data = res.data;
      const token = data?.token || data?.access_token;
      const user = data?.user || data?.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        document.cookie = `gabuthub_auth_token=${token}; path=/; max-age=2592000`;
        set({ token, user, loading: false });
        return { success: true, user };
      } else {
        set({ loading: false });
        return { success: false, message: "Gagal membuat akun." };
      }
    } catch (error) {
      set({ loading: false });
      const errors = error?.response?.data?.errors;
      const firstError =
        errors?.username?.[0] ||
        errors?.email?.[0] ||
        errors?.password?.[0] ||
        error?.response?.data?.message ||
        "Gagal mendaftar akun baru!";
      return { success: false, message: firstError };
    }
  },

  logout: async () => {
    try {
      await API.post("/logout");
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "gabuthub_auth_token=; path=/; max-age=0";
    set({ token: null, user: null, loading: false });
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await API.get("/user");
      if (res.data && res.data.id) {
        localStorage.setItem("user", JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch (e) {
      // If unauthorized, token is expired
      if (e?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
      }
    }
  },

  updateProfile: async (bio, avatar, newUsername, coverUrl) => {
    const currentUser = get().user;
    if (!currentUser) return { success: false, message: "User tidak ditemukan" };

    try {
      const res = await API.post("/user/profile", {
        email: currentUser.email,
        username: newUsername || currentUser.username,
        bio: bio !== undefined ? bio : currentUser.bio,
        avatar: avatar || currentUser.avatar,
        coverUrl,
      });

      const updatedUser = res.data?.user || {
        ...currentUser,
        username: newUsername || currentUser.username,
        bio: bio !== undefined ? bio : currentUser.bio,
        avatar: avatar || currentUser.avatar,
        coverUrl: coverUrl !== undefined ? coverUrl : currentUser.coverUrl,
      };

      set({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      const msg = error?.response?.data?.message || "Gagal memperbarui profil di database.";
      return { success: false, message: msg };
    }
  },
}));

export default useAuthStore;
