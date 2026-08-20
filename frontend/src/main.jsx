import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes";

import "./index.css";
import "@fontsource/plus-jakarta-sans";
import useThemeStore from "./store/themeStore";
import useWatchlistStore from "./store/watchlistStore";

// Initialize theme class and fetch watchlist on page load
useThemeStore.getState().init();
useWatchlistStore.getState().fetchWatchlist();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);