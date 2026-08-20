import {
  House, Compass, Trophy, Vote, Users, Heart, User,
  Clapperboard, Tv, Popcorn, Music4, Gamepad2, X, Sun, Moon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useThemeStore from "../../store/themeStore";

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const { sidebarOpen, setSidebarOpen, darkMode, toggleTheme } = useThemeStore();

  const isExploreActive = location.pathname.startsWith("/explore");

  const mainMenus = [
    { title: "Home", icon: House, path: "/" },
    { title: "Explore", icon: Compass, path: "/explore" },
  ];

  const exploreSubMenus = [
    { title: "Film", icon: Clapperboard, path: "/explore?type=film" },
    { title: "Drakor", icon: Tv, path: "/explore?type=drakor" },
    { title: "Anime", icon: Popcorn, path: "/explore?type=anime" },
    { title: "OST", icon: Music4, path: "/explore?tab=osts" },
  ];

  const otherMenus = [
    { title: "Tier List", icon: Trophy, path: "/tierlist" },
    { title: "Voting", icon: Vote, path: "/voting" },
    { title: "Game", icon: Gamepad2, path: "/game" },
    { title: "Community", icon: Users, path: "/community" },
    { title: "Watchlist", icon: Heart, path: "/watchlist" },
    { title: "Profile", icon: User, path: "/profile" },
  ];

  const allMenusMobile = [
    ...mainMenus,
    ...otherMenus
  ];

  return (
    <>
      {/* ────── 1. DESKTOP SLIM SIDEBAR (MD LAYOUT) ────── */}
      <aside className="fixed top-16 left-0 bottom-0 h-[calc(100vh-64px)] w-[76px] flex-shrink-0 border-r border-wm-border bg-wm-card transition-all duration-300 hidden md:flex flex-col items-center select-none z-40">
        <nav className="w-full flex flex-col items-center gap-1 py-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {mainMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = menu.path === "/"
              ? location.pathname === "/"
              : currentPath === "/explore";

            return (
              <div key={menu.title} className="w-full flex flex-col items-center">
                <Link
                  to={menu.path}
                  className={`w-full flex flex-col items-center justify-center py-1.5 transition group cursor-pointer ${
                    isActive ? "text-wm-texth" : "text-wm-text hover:text-wm-texth"
                  }`}
                  title={menu.title}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-2xl transition duration-200 ${
                    isActive
                      ? "bg-wm-accent text-black shadow-md shadow-wm-accent/20"
                      : "bg-transparent group-hover:bg-wm-bg"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[9px] font-bold mt-1 leading-none ${
                    isActive ? "text-wm-accent font-black" : "text-wm-text/60 group-hover:text-wm-texth"
                  }`}>
                    {menu.title}
                  </span>
                </Link>

                {menu.title === "Explore" && isExploreActive && (
                  <div className="w-full flex flex-col items-center py-1 gap-1 my-0.5 border-y border-wm-border/40 bg-wm-bg/50">
                    {exploreSubMenus.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = currentPath === sub.path;

                      return (
                        <Link
                          key={sub.title}
                          to={sub.path}
                          className={`w-full flex flex-col items-center justify-center py-1 transition group cursor-pointer ${
                            isSubActive ? "text-wm-accent" : "text-wm-text/70 hover:text-wm-texth"
                          }`}
                          title={sub.title}
                        >
                          <div className={`flex items-center justify-center w-7 h-7 rounded-xl transition duration-150 ${
                            isSubActive
                              ? "bg-wm-accent/15 text-wm-accent border border-wm-accent/30 font-bold"
                              : "bg-transparent group-hover:bg-wm-card"
                          }`}>
                            <SubIcon size={14} />
                          </div>
                          <span className={`text-[8px] font-bold mt-0.5 leading-none ${
                            isSubActive ? "text-wm-accent font-black" : "text-wm-text/50 group-hover:text-wm-texth"
                          }`}>
                            {sub.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="w-8 h-[1px] bg-wm-border/60 my-1.5" />

          {otherMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname.startsWith(menu.path);

            return (
              <Link
                key={menu.title}
                to={menu.path}
                className={`w-full flex flex-col items-center justify-center py-1.5 transition group cursor-pointer ${
                  isActive ? "text-wm-texth" : "text-wm-text hover:text-wm-texth"
                }`}
                title={menu.title}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-2xl transition duration-200 ${
                  isActive
                    ? "bg-wm-accent text-black shadow-md shadow-wm-accent/20"
                    : "bg-transparent group-hover:bg-wm-bg"
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[9px] font-bold mt-1 leading-none ${
                  isActive ? "text-wm-accent font-black" : "text-wm-text/60 group-hover:text-wm-texth"
                }`}>
                  {menu.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ────── 2. MOBILE DRAWER SIDEBAR (HANYA DI HP SAAT HAMBURGER MENU DIKLIK) ────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-[9999] flex">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            />

            {/* Slide-over Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full bg-wm-card border-r border-wm-border flex flex-col justify-between p-5 z-10 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-wm-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-wm-accent text-black shadow-md">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                    <span className="font-black text-wm-texth text-base">GabutHub Menu</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-full hover:bg-wm-bg text-wm-text/60 hover:text-wm-texth transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                  {allMenusMobile.map((menu) => {
                    const Icon = menu.icon;
                    const isActive = menu.path === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(menu.path);

                    return (
                      <Link
                        key={menu.title}
                        to={menu.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                          isActive
                            ? "bg-wm-accent text-black shadow-md shadow-wm-accent/15"
                            : "text-wm-text hover:bg-wm-bg hover:text-wm-texth"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{menu.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Mobile Theme Switcher */}
              <div className="border-t border-wm-border pt-4">
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-wm-border bg-wm-bg text-xs font-bold text-wm-texth hover:border-wm-accent transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-600" />}
                    <span>{darkMode ? "Mode Terang" : "Mode Gelap"}</span>
                  </div>
                  <span className="text-[10px] text-wm-accent font-black uppercase">Switch</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}