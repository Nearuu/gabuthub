import { create } from "zustand";

const initialDark = typeof localStorage !== "undefined" && localStorage.getItem("darkMode") === "true";

const useThemeStore = create((set, get) => ({
  darkMode: initialDark,
  sidebarOpen: true,

  toggleTheme: () => {
    const nextState = !get().darkMode;
    set({ darkMode: nextState });
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("darkMode", nextState);
    }
    if (typeof document !== "undefined") {
      if (nextState) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
}));

// Apply theme class immediately on load
if (typeof document !== "undefined") {
  if (initialDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default useThemeStore;
