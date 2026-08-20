import axios from "axios";
import { MOCK_CONTENTS, MOCK_POLLS, MOCK_POSTS, MOCK_GAME_CHARS, MOCK_HOT_TAKES } from "./mockData";

const getBaseUrl = () => {
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
    return "https://gabuthub-production.up.railway.app/api";
  }
  return "http://127.0.0.1:8000/api";
};

const API = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to filter MOCK_CONTENTS based on query parameters
const filterMockContents = (url) => {
  try {
    const urlObj = new URL(url, "http://dummy.com");
    const typeParam = (urlObj.searchParams.get("type") || "").toLowerCase().trim();
    const searchParam = (urlObj.searchParams.get("search") || "").toLowerCase().trim();
    const genreParam = urlObj.searchParams.get("genre_id");

    return MOCK_CONTENTS.filter((item) => {
      // Type match (e.g., film, movie, drakor, drama, anime)
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

      // Search match
      if (searchParam) {
        const titleMatch = (item.title || "").toLowerCase().includes(searchParam);
        const synopsisMatch = (item.synopsis || "").toLowerCase().includes(searchParam);
        if (!titleMatch && !synopsisMatch) return false;
      }

      // Genre match
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

// Response interceptor to handle token expiry / unauthenticated errors and cloud fallback
API.interceptors.response.use(
  (response) => {
    if (Array.isArray(response.data) && response.data.length === 0) {
      if (response.config.url.includes("/contents")) {
        const filtered = filterMockContents(response.config.url);
        return { ...response, data: filtered };
      }
      if (response.config.url.includes("/polls")) return { ...response, data: MOCK_POLLS };
      if (response.config.url.includes("/posts")) return { ...response, data: MOCK_POSTS };
      if (response.config.url.includes("/flag-characters")) return { ...response, data: MOCK_GAME_CHARS };
      if (response.config.url.includes("/hot-takes")) return { ...response, data: MOCK_HOT_TAKES };
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    if (!error.response || error.response.status === 404 || error.code === "ERR_NETWORK" || error.response.status === 502) {
      const url = error.config?.url || "";
      if (url.includes("/contents")) {
        const filtered = filterMockContents(url);
        return Promise.resolve({ data: filtered, status: 200 });
      }
      if (url.includes("/polls")) return Promise.resolve({ data: MOCK_POLLS, status: 200 });
      if (url.includes("/posts")) return Promise.resolve({ data: MOCK_POSTS, status: 200 });
      if (url.includes("/flag-characters")) return Promise.resolve({ data: MOCK_GAME_CHARS, status: 200 });
      if (url.includes("/hot-takes")) return Promise.resolve({ data: MOCK_HOT_TAKES, status: 200 });
      if (url.includes("/games/guess-ost")) {
        return Promise.resolve({
          data: {
            seconds_per_question: 15,
            questions: [
              {
                id: 1,
                preview_url: "https://www.youtube.com/watch?v=32wDFCM7iSI",
                options: [
                  { id: 1, text: "Give You My Heart - IU", is_correct: true },
                  { id: 2, text: "Love You With All My Heart - Crush", is_correct: false },
                  { id: 3, text: "Adrenaline - Solar", is_correct: false },
                  { id: 4, text: "Yuusha - YOASOBI", is_correct: false }
                ]
              }
            ]
          },
          status: 200
        });
      }
    }

    return Promise.reject(error);
  }
);

export default API;
