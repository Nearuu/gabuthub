import { Link, useLocation } from "react-router-dom";
import { House, Compass, Gamepad2, Heart, User } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { title: "Home", icon: House, path: "/" },
    { title: "Explore", icon: Compass, path: "/explore" },
    { title: "Game", icon: Gamepad2, path: "/game" },
    { title: "Watchlist", icon: Heart, path: "/watchlist" },
    { title: "Profil", icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-wm-border bg-wm-card/95 backdrop-blur-md md:hidden px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.title}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 transition ${
              isActive ? "text-wm-accent" : "text-wm-text/60 hover:text-wm-texth"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${isActive ? "bg-wm-accent/15 text-wm-accent font-black" : "bg-transparent"}`}>
              <Icon size={18} />
            </div>
            <span className={`text-[9px] font-extrabold leading-none mt-0.5 ${isActive ? "text-wm-accent font-black" : "text-wm-text/50"}`}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
