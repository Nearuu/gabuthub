import {
  House, Compass, Trophy, Vote, Users, Heart, User,
  Clapperboard, Tv, Popcorn, Music4, Gamepad2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useThemeStore from "../../store/themeStore";

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const { sidebarCollapsed } = useThemeStore();

  const isExploreActive = location.pathname.startsWith("/explore");

  // Jika sidebarCollapsed = true (tombol garis 3 diklik), sembunyikan sidebar
  if (sidebarCollapsed) {
    return null;
  }

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

  return (
    <aside className="fixed top-16 left-0 bottom-0 h-[calc(100vh-64px)] w-[76px] flex-shrink-0 border-r border-wm-border bg-wm-card transition-all duration-300 hidden md:flex flex-col items-center select-none z-40">
      {/* Menu Navigasi Utama dengan Sticky Locking */}
      <nav className="w-full flex flex-col items-center gap-1 py-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        
        {/* Home & Explore */}
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

              {/* Sub-menu Movies, Drakor, Anime, OST (Muncul otomatis saat di Halaman Explore atau Explore diklik) */}
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

        {/* Menu Lainnya */}
        {otherMenus.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentPath.startsWith(menu.path);

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
  );
}