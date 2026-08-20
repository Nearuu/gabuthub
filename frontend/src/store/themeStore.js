import { create } from "zustand";

const useThemeStore = create((set, get) => ({
  darkMode: true, // ALWAYS DEFAULT TO BEAUTIFUL NIGHT DARK MODE
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

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

export default useThemeStore;
