import axios from "axios";
import { MOCK_CONTENTS, MOCK_POLLS, MOCK_POSTS, MOCK_GAME_CHARS, MOCK_HOT_TAKES } from "./mockData";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const MOCK_USERS = [
  { id: 1, username: "admin", email: "admin@gabuthub.com", role: "admin", created_at: "2024-01-01", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" },
  { id: 2, username: "RAVASEKAI", email: "ravakubang2@gmail.com", role: "admin", created_at: "2024-01-02", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RAVASEKAI" },
  { id: 3, username: "DrakorLover", email: "drakor@gabuthub.com", role: "user", created_at: "2024-01-03", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=DrakorLover" },
  { id: 4, username: "AnimeOtaku", email: "anime@gabuthub.com", role: "user", created_at: "2024-01-04", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeOtaku" }
];

const MOCK_WATCHLIST = [
  { id: 1, content_id: 1, title: "Queen of Tears", type: "Drakor", poster_url: "https://image.tmdb.org/t/p/w500/1X7Uj0lq1w7qWvV8gWnJv1.jpg", pivot: { status: "Completed", personal_rating: 10 } },
  { id: 2, content_id: 2, title: "Crash Landing on You", type: "Drakor", poster_url: "https://image.tmdb.org/t/p/w500/iS7Uj0lq1w7qWvV8gWnJv2.jpg", pivot: { status: "Watching", personal_rating: 9 } }
];

const MOCK_TIER_LISTS = [
  { id: 1, title: "Tier Drakor Romance Terbaik 2024", user: { username: "admin" }, tiers: { S: ["Queen of Tears", "Crash Landing on You"], A: ["The Glory", "Lovely Runner"], B: ["Goblin"] } }
];

// Helper function to filter MOCK_CONTENTS based on query parameters or ID
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
  } else if (url.includes("/watchlist")) {
    config.adapter = () => Promise.resolve({ data: MOCK_WATCHLIST, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/tier-lists") || url.includes("/tierlist")) {
    config.adapter = () => Promise.resolve({ data: MOCK_TIER_LISTS, status: 200, statusText: "OK", headers: {}, config });
  } else if (url.includes("/users") || url.includes("/admin/users")) {
    config.adapter = () => Promise.resolve({ data: MOCK_USERS, status: 200, statusText: "OK", headers: {}, config });
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
  } else {
    // Default mock success adapter for any POST/PUT/DELETE
    config.adapter = () => Promise.resolve({ data: { message: "Berhasil" }, status: 200, statusText: "OK", headers: {}, config });
  }

  return config;
});

export default API;
