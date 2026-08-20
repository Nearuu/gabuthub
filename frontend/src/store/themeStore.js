import { create } from "zustand";

const useThemeStore = create((set, get) => ({
  darkMode: false, // Default to Clean Soft Balanced Theme
  sidebarOpen: true,

  toggleTheme: () => {
    const nextState = !get().darkMode;
    set({ darkMode: nextState });
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

export default useThemeStore;
