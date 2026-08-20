import axios from "axios";

// Native Production Railway Cloud Backend URL connected to Neon Cloud Postgres
const RAILWAY_BACKEND_URL = "https://gabuthub-production.up.railway.app/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || RAILWAY_BACKEND_URL,
  timeout: 10000,
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

// PURE DIRECT NETWORK PIPELINE TO LIVE ONLINE DATABASE
// Request is directly sent to Railway Laravel & Neon Postgres Cloud Database
export default API;
