import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Edit3, Star, AlignLeft, Eye } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

const STATUS_TABS = ["Semua", "Plan to Watch", "Watching", "Completed", "Dropped"];

export default function Watchlist() {
  const { token } = useAuthStore();

  const [watchlist, setWatchlist] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const loadWatchlist = async () => {
    try {
      const res = await API.get("/watchlist");
      setWatchlist(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [token]);

  const handleDelete = async (contentId) => {
    try {
      await API.delete(`/watchlist/${contentId}`);
      toast.success("Berhasil dihapus dari watchlist");
      loadWatchlist();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus item");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent"></div>
      </div>
    );
  }

  const listToUse = Array.isArray(watchlist) ? watchlist : [];

  // Filter watchlist based on tab
  const filteredList = listToUse.filter((item) => {
    if (!item) return false;
    if (selectedTab === "Semua") return true;
    return item.pivot?.status === selectedTab || item.status === selectedTab;
  });

  return (
    <div className="pb-20 text-wm-text max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-wm-border/50 pb-4">
        <h2 className="text-2xl font-black tracking-wide flex items-center gap-2 text-wm-texth">
          <Heart className="text-wm-accent" size={24} fill="currentColor" />
          <span>Watchlist Saya</span>
        </h2>
        <p className="text-xs text-wm-text/60">Koleksi tontonan yang disimpan, sedang ditonton, atau sudah selesai.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition cursor-pointer ${
              selectedTab === tab
                ? "bg-wm-accent border-wm-accent text-black font-bold"
                : "border-wm-border bg-wm-card text-wm-text hover:text-wm-texth"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => (
            <div
              key={item.id || item.content_id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-wm-border bg-wm-card p-4 shadow-sm transition hover:border-wm-accent/40"
            >
              <div className="flex gap-4 items-start">
                <img
                  src={item.poster_url || item.content?.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300"}
                  alt=""
                  className="h-28 w-20 rounded-xl object-cover border border-wm-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block rounded bg-wm-accent/10 border border-wm-accent/20 px-2 py-0.5 text-[9px] font-bold text-wm-accent uppercase">
                    {item.pivot?.status || item.status || "Plan to Watch"}
                  </span>
                  <h3 className="truncate text-base font-black text-wm-texth">{item.title || item.content?.title || "Judul Konten"}</h3>
                  <div className="flex items-center gap-1 text-xs text-wm-yellow font-bold">
                    <Star size={12} fill="currentColor" />
                    <span>{item.pivot?.personal_rating || item.personal_rating || item.avg_rating || "10"}/10</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-wm-border/50 pt-3 text-xs">
                <Link
                  to={`/detail/${item.content_id || item.id}`}
                  className="flex items-center gap-1 font-bold text-wm-accent hover:underline"
                >
                  <Eye size={14} /> Detail Film
                </Link>
                <button
                  onClick={() => handleDelete(item.content_id || item.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded-lg transition cursor-pointer"
                  title="Hapus dari Watchlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-wm-border p-12 text-center text-wm-text/50">
          <Heart size={36} className="mx-auto mb-2 opacity-30 text-wm-accent" />
          <p className="text-sm font-semibold">Belum ada tontonan di kategori ini.</p>
          <Link to="/explore" className="mt-3 inline-block font-bold text-xs text-wm-accent hover:underline">
            Cari Film & Drakor di Explore →
          </Link>
        </div>
      )}
    </div>
  );
}