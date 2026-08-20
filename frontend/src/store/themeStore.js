import { create } from "zustand";

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem("theme") !== "light", // Default to dark (Teal/Coral mode)
  sidebarCollapsed: localStorage.getItem("sb_collapsed") === "true",

  init: () => {
    const isDark = localStorage.getItem("theme") !== "light";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleTheme: () => {
    set((state) => {
      const nextDark = !state.darkMode;
      localStorage.setItem("theme", nextDark ? "dark" : "light");
      if (nextDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { darkMode: nextDark };
    });
  },

  toggleSidebar: () => {
    set((state) => {
      const nextCollapsed = !state.sidebarCollapsed;
      localStorage.setItem("sb_collapsed", String(nextCollapsed));
      return { sidebarCollapsed: nextCollapsed };
    });
  },
  
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem("sb_collapsed", String(collapsed));
    set({ sidebarCollapsed: collapsed });
  }
}));

export default useThemeStore;
