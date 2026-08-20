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
      setWatchlist(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
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

  if (!token) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-wm-text/60">
        <Heart className="text-wm-text/30 mb-4" size={48} />
        <p className="text-sm">Silakan login untuk mengakses Watchlist pribadi Anda.</p>
        <Link to="/login" className="mt-4 rounded-xl bg-wm-coral px-6 py-2.5 text-xs font-bold text-white hover:bg-wm-coral/90 cursor-pointer shadow shadow-wm-coral/15 transition">
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-mint border-t-transparent"></div>
      </div>
    );
  }

  // Filter watchlist based on tab
  const filteredList = watchlist.filter((item) => {
    if (selectedTab === "Semua") return true;
    return item.pivot.status === selectedTab;
  });

  return (
    <div className="pb-20 text-wm-text max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-wm-border/50 pb-4">
        <h2 className="text-2xl font-black tracking-wide flex items-center gap-2 text-wm-texth">
          <Heart className="text-wm-coral" size={24} fill="currentColor" />
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
                ? "bg-wm-coral border-wm-coral text-white font-bold"
                : "border-wm-border bg-wm-card text-wm-text hover:text-wm-texth"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-wm-border bg-wm-card p-4 flex gap-4 shadow-sm relative group"
            >
              {/* Poster Thumbnail */}
              <Link to={`/detail/${item.id}`} className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-wm-bg border border-wm-border">
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
                />
              </Link>

              {/* Text Info */}
              <div className="flex-1 overflow-hidden flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-wm-mint/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wm-mint border border-wm-mint/20 capitalize">
                      {item.type}
                    </span>
                    <span className="rounded bg-wm-bg border border-wm-border px-2 py-0.5 text-[9px] font-bold text-wm-text">
                      {item.pivot.status}
                    </span>
                  </div>
                  <h4 className="truncate text-base font-bold text-wm-texth mt-1.5 hover:text-wm-coral transition">
                    <Link to={`/detail/${item.id}`}>{item.title}</Link>
                  </h4>
                  
                  {item.pivot.personal_rating && (
                    <div className="flex items-center gap-1.5 text-2xs text-wm-yellow mt-1 font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>Ratingmu: {item.pivot.personal_rating} / 10</span>
                    </div>
                  )}

                  {item.pivot.notes && (
                    <p className="text-2xs text-wm-text/70 leading-normal mt-1.5 flex items-start gap-1">
                      <AlignLeft size={12} className="flex-shrink-0 mt-0.5 text-wm-text/40" />
                      <span className="truncate max-w-[250px]">{item.pivot.notes}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-wm-border/40 pt-2 mt-2">
                  <Link
                    to={`/detail/${item.id}`}
                    className="text-3xs font-semibold text-wm-text/50 hover:text-wm-texth flex items-center gap-1 transition"
                  >
                    <Eye size={10} />
                    <span>Ubah/Detail</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-wm-text/50 hover:text-wm-coral p-1 rounded transition cursor-pointer"
                    title="Hapus dari watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/10 border-dashed text-wm-text/50">
          <p className="text-sm">Watchlist kosong dalam kategori ini.</p>
        </div>
      )}

    </div>
  );
}