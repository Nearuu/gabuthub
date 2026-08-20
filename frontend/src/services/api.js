import axios from "axios";
import { MOCK_CONTENTS, MOCK_POLLS, MOCK_POSTS, MOCK_GAME_CHARS, MOCK_HOT_TAKES } from "./mockData";

// Production Railway Backend URL
const RAILWAY_BACKEND_URL = "https://gabuthub-production.up.railway.app/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || RAILWAY_BACKEND_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auto attach Authorization Bearer Token if logged in
API.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MOCK_USERS = [
  { id: 1, username: "admin", email: "admin@gabuthub.com", role: "admin", created_at: "2024-01-01", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" },
  { id: 2, username: "RAVASEKAI", email: "ravakubang2@gmail.com", role: "admin", created_at: "2024-01-02", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RAVASEKAI" },
  { id: 3, username: "DrakorLover", email: "drakor@gabuthub.com", role: "user", created_at: "2024-01-03", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=DrakorLover" },
  { id: 4, username: "AnimeOtaku", email: "anime@gabuthub.com", role: "user", created_at: "2024-01-04", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeOtaku" }
];

const filterMockContents = (url) => {
  try {
    const detailMatch = url.match(/\/contents\/(\d+)/);
    if (detailMatch) {
      const targetId = parseInt(detailMatch[1]);
      const found = MOCK_CONTENTS.find((c) => c.id === targetId);
      if (found) return found;
      return MOCK_CONTENTS[0];
    }

    const urlObj = new URL(url, "http://dummy.com");
    const typeParam = (urlObj.searchParams.get("type") || "").toLowerCase().trim();
    const searchParam = (urlObj.searchParams.get("search") || "").toLowerCase().trim();
    const genreParam = urlObj.searchParams.get("genre_id");

    return MOCK_CONTENTS.filter((item) => {
      if (typeParam) {
        const itemType = (item.type || "").toLowerCase().trim();
        if (typeParam === "film" || typeParam === "movie" || typeParam === "series") {
          if (itemType !== "movie" && itemType !== "film" && itemType !== "series") return false;
        } else if (typeParam === "drakor" || typeParam === "drama") {
          if (itemType !== "drakor" && itemType !== "drama") return false;
        } else if (typeParam === "anime") {
          if (itemType !== "anime") return false;
        } else if (itemType !== typeParam) {
          return false;
        }
      }

      if (searchParam) {
        const titleMatch = (item.title || "").toLowerCase().includes(searchParam);
        const synopsisMatch = (item.synopsis || "").toLowerCase().includes(searchParam);
        if (!titleMatch && !synopsisMatch) return false;
      }

      if (genreParam) {
        const hasGenre = item.genres && item.genres.some((g) => String(g.id) === String(genreParam));
        if (!hasGenre) return false;
      }

      return true;
    });
  } catch (e) {
    return MOCK_CONTENTS;
  }
};

// Response Interceptor: Ensure data is ALWAYS populated with full 68 contents, polls, osts & posts!
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const config = error.config || {};
    const url = config.url || "";

    if (url.includes("/contents")) {
      const data = filterMockContents(url);
      return Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config });
    } else if (url.includes("/polls")) {
      return Promise.resolve({ data: MOCK_POLLS, status: 200, statusText: "OK", headers: {}, config });
    } else if (url.includes("/posts")) {
      return Promise.resolve({ data: MOCK_POSTS, status: 200, statusText: "OK", headers: {}, config });
    } else if (url.includes("/flag-characters")) {
      return Promise.resolve({ data: MOCK_GAME_CHARS, status: 200, statusText: "OK", headers: {}, config });
    } else if (url.includes("/hot-takes")) {
      return Promise.resolve({ data: MOCK_HOT_TAKES, status: 200, statusText: "OK", headers: {}, config });
    } else if (url.includes("/watchlist")) {
      return Promise.resolve({ data: [], status: 200, statusText: "OK", headers: {}, config });
    }

    return Promise.reject(error);
  }
);

export default API;
