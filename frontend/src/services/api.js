import axios from "axios";
import { MOCK_CONTENTS, MOCK_POLLS } from "./mockData";

const getBaseUrl = () => {
  if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
    return "/api";
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

// Response interceptor to handle token expiry / unauthenticated errors and cloud fallback
API.interceptors.response.use(
  (response) => {
    // If response data is empty array on Vercel, serve fallback mock data
    if (Array.isArray(response.data) && response.data.length === 0) {
      if (response.config.url.includes("/contents")) {
        return { ...response, data: MOCK_CONTENTS };
      }
      if (response.config.url.includes("/polls")) {
        return { ...response, data: MOCK_POLLS };
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    // Fallback strategy for network/404 errors on cloud hosting
    if (!error.response || error.response.status === 404 || error.code === "ERR_NETWORK") {
      const url = error.config?.url || "";
      if (url.includes("/contents")) {
        return Promise.resolve({ data: MOCK_CONTENTS, status: 200 });
      }
      if (url.includes("/polls")) {
        return Promise.resolve({ data: MOCK_POLLS, status: 200 });
      }
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

// Export API instance
export default API;
