import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BottomNavigation from "../components/BottomNavigation";
import Footer from "../components/Footer";
import MiniPlayer from "../components/MiniPlayer";
import useThemeStore from "../store/themeStore";

export default function MainLayout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="min-h-screen bg-wm-bg text-wm-text transition-colors duration-300 flex flex-col overflow-x-hidden pt-16 pb-16 md:pb-0">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1700px] mx-auto relative">
        <Sidebar />

        <main className={`flex-1 min-w-0 min-h-[calc(100vh-64px)] px-4 sm:px-6 md:px-8 py-6 transition-all duration-300 ${
          sidebarCollapsed ? "pl-4 sm:pl-6 md:pl-8" : "pl-4 sm:pl-6 md:pl-[108px]"
        }`}>
          <Outlet />
        </main>
      </div>

      <Footer />
      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}