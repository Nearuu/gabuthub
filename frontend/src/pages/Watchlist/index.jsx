import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, Star, Eye, Lock, KeyRound } from "lucide-react";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import { MOCK_CONTENTS } from "../../services/mockData";
import toast from "react-hot-toast";

const STATUS_TABS = ["Semua", "Plan to Watch", "Watching", "Completed", "Dropped"];

export default function Watchlist() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const getWatchlistKey = () => {
    if (!user) return "watchlist_guest";
    return `watchlist_user_${user.id || user.username || user.email}`;
  };

  const getValidPoster = (item) => {
    if (item.poster_url && item.poster_url.startsWith("http")) return item.poster_url;
    if (item.content?.poster_url && item.content.poster_url.startsWith("http")) return item.content.poster_url;
    
    // Match with MOCK_CONTENTS by ID or Title
    const targetId = item.content_id || item.id;
    const found = MOCK_CONTENTS.find((c) => c.id === parseInt(targetId) || c.title?.toLowerCase() === item.title?.toLowerCase());
    if (found && found.poster_url) return found.poster_url;

    // Default Fallback Posters based on title
    if (item.title?.toLowerCase().includes("queen")) return "https://image.tmdb.org/t/p/w500/1X7Uj0lq1w7qWvV8gWnJv1.jpg";
    if (item.title?.toLowerCase().includes("crash")) return "https://image.tmdb.org/t/p/w500/iS7Uj0lq1w7qWvV8gWnJv2.jpg";
    return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400";
  };

  const loadWatchlist = async () => {
    setLoading(true);
    const key = getWatchlistKey();

    try {
      const res = await API.get("/watchlist");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setWatchlist(res.data);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // Per-user local storage isolation
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
        setWatchlist([]);
      }
    } else {
      // If user is admin, seed initial admin watchlist, else empty for normal user
      if (user?.role === "admin" || user?.username === "admin") {
        const adminSeed = [
          {
            id: 1,
            content_id: 1,
            title: "Queen of Tears",
            type: "Drakor",
            poster_url: "https://image.tmdb.org/t/p/w500/1X7Uj0lq1w7qWvV8gWnJv1.jpg",
            pivot: { status: "Completed", personal_rating: 10 }
          },
          {
            id: 2,
            content_id: 2,
            title: "Crash Landing on You",
            type: "Drakor",
            poster_url: "https://image.tmdb.org/t/p/w500/iS7Uj0lq1w7qWvV8gWnJv2.jpg",
            pivot: { status: "Watching", personal_rating: 9 }
          }
        ];
        localStorage.setItem(key, JSON.stringify(adminSeed));
        setWatchlist(adminSeed);
      } else {
        localStorage.setItem(key, JSON.stringify([]));
        setWatchlist([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token && user) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
  }, [token, user?.username]);

  const handleDelete = async (contentId) => {
    try {
      await API.delete(`/watchlist/${contentId}`);
    } catch (e) {}

    const updated = watchlist.filter((item) => (item.content_id || item.id) !== contentId);
    setWatchlist(updated);
    localStorage.setItem(getWatchlistKey(), JSON.stringify(updated));
    toast.success("Berhasil dihapus dari Watchlist pribadi Anda!");
  };

  // ────── STATE: UNAUTHENTICATED (BELUM LOGIN) ──────
  if (!token || !user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-wm-accent/10 border border-wm-accent/30 text-wm-accent shadow-xl">
          <Lock size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-wm-texth">Watchlist Terkunci</h2>
          <p className="text-xs text-wm-text/60 leading-relaxed">
            Silakan masuk ke akun Anda terlebih dahulu untuk mengakses dan mengelola Watchlist pribadi Anda.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-2xl bg-wm-accent px-6 py-3 text-xs font-black text-black hover:bg-wm-accent-hover shadow-lg shadow-wm-accent/20 cursor-pointer transition"
        >
          <KeyRound size={15} /> Masuk Sekarang
        </Link>
      </div>
    );
  }

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
      <div className="border-b border-wm-border/50 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-2 text-wm-texth">
            <Heart className="text-wm-accent" size={24} fill="currentColor" />
            <span>Watchlist @{user.username}</span>
          </h2>
          <p className="text-xs text-wm-text/60">Koleksi tontonan pribadi yang Anda simpan di akun ini.</p>
        </div>
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
          {filteredList.map((item) => {
            const posterSrc = getValidPoster(item);
            return (
              <div
                key={item.id || item.content_id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-wm-border bg-wm-card p-4 shadow-sm transition hover:border-wm-accent/40"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={posterSrc}
                    alt={item.title || "Poster"}
                    className="h-28 w-20 rounded-xl object-cover border border-wm-border flex-shrink-0 bg-wm-bg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400";
                    }}
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
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-wm-border p-12 text-center text-wm-text/50">
          <Heart size={36} className="mx-auto mb-2 opacity-30 text-wm-accent" />
          <p className="text-sm font-semibold">Belum ada tontonan di Watchlist akun ini.</p>
          <Link to="/explore" className="mt-3 inline-block font-bold text-xs text-wm-accent hover:underline">
            Cari Film & Drakor di Explore →
          </Link>
        </div>
      )}
    </div>
  );
}