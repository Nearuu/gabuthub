import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BottomNavigation from "../components/BottomNavigation";
import Footer from "../components/Footer";
import MiniPlayer from "../components/MiniPlayer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-wm-bg text-wm-text transition-colors duration-300 flex flex-col overflow-x-hidden pt-16 pb-16 md:pb-0">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1700px] mx-auto relative">
        <Sidebar />

        <main className="flex-1 min-w-0 min-h-[calc(100vh-64px)] px-4 sm:px-6 md:px-8 md:pl-[96px] py-6 transition-all duration-300">
          <Outlet />
        </main>
      </div>

      <Footer />
      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}