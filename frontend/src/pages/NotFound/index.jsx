import { Link } from "react-router-dom";
import { House, Compass, Tv, Popcorn } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <h1 className="text-8xl font-black text-wm-accent tracking-tighter drop-shadow-lg">404</h1>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-wm-card border border-wm-border px-4 py-1 rounded-full text-xs font-bold text-wm-texth uppercase tracking-widest shadow-md">
          Halaman Tidak Ditemukan
        </div>
      </motion.div>

      <p className="max-w-md text-xs text-wm-text/70 font-medium leading-relaxed">
        Waduh, sepertinya drakor atau halaman yang kamu cari sudah pindah dimensi atau jalurnya tersesat!
      </p>

      <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-wm-accent px-6 py-2.5 text-xs font-black text-black hover:scale-105 transition cursor-pointer shadow-md shadow-wm-accent/20"
        >
          <House size={15} /> Ke Beranda
        </Link>
        <Link
          to="/explore"
          className="flex items-center gap-2 rounded-full bg-wm-card border border-wm-border px-6 py-2.5 text-xs font-bold text-wm-texth hover:border-wm-accent/40 transition cursor-pointer"
        >
          <Compass size={15} /> Jelajahi Konten
        </Link>
      </div>
    </div>
  );
}