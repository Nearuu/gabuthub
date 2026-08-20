import axios from "axios";
import { MOCK_CONTENTS, MOCK_POLLS, MOCK_POSTS, MOCK_GAME_CHARS, MOCK_HOT_TAKES } from "./mockData";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper function to filter MOCK_CONTENTS based on query parameters
const filterMockContents = (url) => {
  try {
    const urlObj = new URL(url, "http://dummy.com");
    const typeParam = (urlObj.searchParams.get("type") || "").toLowerCase().trim();
    const searchParam = (urlObj.searchParams.get("search") || "").toLowerCase().trim();
    const genreParam = urlObj.searchParams.get("genre_id");

    return MOCK_CONTENTS.filter((item) => {
      // Type match
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

// Always serve direct imported MySQL data for 100% stability
API.interceptors.request.use((config) => {
  const url = config.url || "";
  
  if (url.includes("/contents")) {
    const data = filterMockContents(url);
    config.adapter = () => Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/polls")) {
    config.adapter = () => Promise.resolve({ data: MOCK_POLLS, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/posts")) {
    config.adapter = () => Promise.resolve({ data: MOCK_POSTS, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/flag-characters")) {
    config.adapter = () => Promise.resolve({ data: MOCK_GAME_CHARS, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/hot-takes")) {
    config.adapter = () => Promise.resolve({ data: MOCK_HOT_TAKES, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/genres")) {
    const genres = [
      { id: 1, name: "Action" }, { id: 2, name: "Romance" }, { id: 3, name: "Comedy" },
      { id: 4, name: "Drama" }, { id: 5, name: "Sci-Fi" }, { id: 6, name: "Fantasy" },
      { id: 7, name: "Thriller" }, { id: 8, name: "Horror" }, { id: 9, name: "Mystery" }
    ];
    config.adapter = () => Promise.resolve({ data: genres, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/games/guess-ost")) {
    config.adapter = () => Promise.resolve({
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
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  }

  return config;
});

export default API;
