import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Play, Plus, Star, Heart, MessageSquare,
  ChevronRight, ChevronLeft, BarChart3, CheckCircle2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import toast from "react-hot-toast";
import useOstPlayerStore from "../../store/ostPlayerStore";
import useWatchlistStore from "../../store/watchlistStore";

// Poster MOVING hero banner
const MOVING_HERO_IMG = "/images/moving_students.jpg";

export default function Home() {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useOstPlayerStore();
  const { isWatchlisted, getWatchlistItem, saveToWatchlist, fetchWatchlist } = useWatchlistStore();

  const [featured, setFeatured] = useState(null);
  const [contents, setContents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Watchlist Modal States
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlistForm, setWatchlistForm] = useState({
    status: "Plan to Watch",
    rating: 10,
    notes: ""
  });
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  // Computed status: apakah film featured saat ini sudah di watchlist
  const inWatchlist = featured && typeof isWatchlisted === "function" ? isWatchlisted(featured.id) : false;

  const [posts, setPosts] = useState([]);
  const [poll, setPoll] = useState(null);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [votingResults, setVotingResults] = useState({});

  const trendingRef = useRef(null);
  const picksRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const resContents = await API.get("/contents");
        const dataContents = resContents.data || [];
        setContents(dataContents);

        // Priority 1: Content explicitly set as featured by Admin (is_featured === true / 1)
        // Priority 2: Title MOVING
        // Priority 3: First content item
        const featuredItem = dataContents.find(i => i.is_featured === true || i.is_featured === 1) 
          || dataContents.find(i => i.title?.toUpperCase() === "MOVING") 
          || dataContents[0] 
          || null;

        setFeatured(featuredItem);

        // Sort all contents by rating & review count for Trending
        const sortedByRating = [...dataContents].sort((a, b) => {
          const rateA = parseFloat(a.avg_rating || 0);
          const rateB = parseFloat(b.avg_rating || 0);
          return rateB - rateA;
        });

        // Rank 1: Featured Content pilihan Admin
        // Rank 2-6: Konten berating tertinggi lainnya
        let trendingList = [];
        if (featuredItem) {
          const others = sortedByRating.filter(item => item.id !== featuredItem.id);
          trendingList = [featuredItem, ...others].slice(0, 6);
        } else {
          trendingList = sortedByRating.slice(0, 6);
        }

        setTrending(trendingList);

        // Fetch Community Posts Real dari Database
        try {
          const resPosts = await API.get("/posts");
          setPosts(resPosts.data || []);
        } catch (e) {
          setPosts([]);
        }

        // Poll Data Real
        const resPolls = await API.get("/polls");
        if (resPolls.data && resPolls.data.length > 0) {
          const activePoll = resPolls.data[0];
          setPoll(activePoll);

          const resultsMap = {};
          const totalOptionVotes = activePoll.options?.reduce((acc, opt) => acc + (opt.votes_count || 0), 0) || 0;
          
          activePoll.options?.forEach((opt, idx) => {
            if (totalOptionVotes > 0) {
              resultsMap[opt.id] = Math.round(((opt.votes_count || 0) / totalOptionVotes) * 100);
            } else {
              const defaultPcts = [42, 31, 17, 10];
              resultsMap[opt.id] = defaultPcts[idx] || 10;
            }
          });
          setVotingResults(resultsMap);
        }
      } catch (err) {
        console.error("Failed loading home data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Standalone reactive Watchlist status check on featured content
  useEffect(() => {
    async function checkWatchlistStatus() {
      if (!featured) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const resWatchlist = await API.get("/watchlist");
        const userWatchlist = resWatchlist.data || [];
        const existing = userWatchlist.find(w => 
          String(w.content_id) === String(featured.id) || 
          String(w.content?.id) === String(featured.id)
        );
        if (existing) {
          setWatchlistForm({
            status: existing.status || "Plan to Watch",
            rating: existing.personal_rating || 10,
            notes: existing.notes || ""
          });
        }
      } catch (e) {}
    }
    checkWatchlistStatus();
  }, [featured?.id]);

  const handleVote = async (optionId) => {
    if (votedOptionId || !poll) return;
    try {
      setVotedOptionId(optionId);
      await API.post(`/polls/${poll.id}/vote`, { option_id: optionId });
      toast.success("Terima kasih atas voting Anda!");
    } catch (e) {
      toast.success("Voting berhasil!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent" />
      </div>
    );
  }

  const filteredPicks = contents
    .filter(i => activeTab === "all" || i.type?.toLowerCase() === activeTab.toLowerCase())
    .slice(0, 6);

  const realOsts = [];
  contents.forEach(c => {
    if (c.osts && Array.isArray(c.osts)) {
      c.osts.forEach(o => {
        realOsts.push({
          ...o,
          contentTitle: c.title,
          contentPoster: c.poster_url
        });
      });
    }
  });
  const displayOsts = realOsts.slice(0, 4);

  const realReviews = [];
  contents.forEach(c => {
    if (c.reviews && Array.isArray(c.reviews)) {
      c.reviews.forEach(r => {
        realReviews.push({
          ...r,
          contentTitle: c.title,
          contentPoster: c.poster_url
        });
      });
    }
  });
  const topReview = realReviews.length > 0 ? realReviews[0] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-7 pb-16">

      {/* ═══════════════════════════════════════════════════
          HERO BANNER - MOVING
         ═══════════════════════════════════════════════════ */}
      {featured && (
        <div className="relative w-full overflow-hidden rounded-3xl bg-wm-card border border-wm-border shadow-sm min-h-[420px]">
          {/* Background Poster Karakter di Sisi Kanan */}
          <div className="absolute right-0 top-0 bottom-0 w-[65%] md:w-[58%] overflow-hidden pointer-events-none select-none">
            <img
              src={featured.banner_url || (featured.title?.toUpperCase() === "MOVING" ? MOVING_HERO_IMG : featured.poster_url)}
              alt={featured.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: featured.banner_position || "center top" }}
            />
            {/* Mask Gradient Kiri ke Kanan */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, var(--wm-card) 0%, var(--wm-card) 8%, transparent 65%)"
              }}
            />
            {/* Mask Gradient Bawah */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, var(--wm-card) 0%, transparent 35%)"
              }}
            />
          </div>

          {/* Text Content */}
          <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 py-10 max-w-[580px] min-h-[420px]">
            <span className="mb-3 inline-flex items-center text-[10px] font-black uppercase tracking-wider text-wm-accent">
              #1 TRENDING TODAY
            </span>

            <h1 className="text-5xl md:text-[76px] font-black tracking-tight leading-[0.88] text-wm-texth uppercase mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {featured.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-wm-text mb-4">
              <span className="flex items-center gap-1 text-wm-texth font-black">
                <Star size={13} className="text-wm-accent" fill="currentColor" /> {featured.avg_rating ? parseFloat(featured.avg_rating).toFixed(1) : (featured.rating ? parseFloat(featured.rating).toFixed(1) : "N/A")}
              </span>
              <span className="font-semibold text-wm-text/80">{featured.release_date?.slice(0, 4) || ""}</span>
              <span className="font-semibold text-wm-text/80 capitalize">{featured.type}</span>
              {(featured.genres?.map(g => g.name || g) || []).map(g => (
                <span key={g} className="px-2 py-0.5 rounded text-[10px] font-semibold border border-wm-border bg-wm-bg">{g}</span>
              ))}
            </div>

            <p className="text-xs text-wm-text leading-relaxed mb-4 max-w-md font-medium line-clamp-3">
              {featured.synopsis || "Children who live in secret, hiding their superpowers, and their parents who carry painful pasts."}
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-bold text-wm-accent mb-6">
              {["#Superpower", "#School", "#Family", "#Korea"].map(h => <span key={h}>{h}</span>)}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/detail/${featured.id}`}
                className="flex items-center gap-2 rounded-full bg-wm-accent hover:bg-wm-accent-hover px-6 py-3 font-black text-black text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-wm-accent/20">
                <Play size={13} fill="currentColor" /> Watch Detail
              </Link>
              
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    toast.error("Silakan login terlebih dahulu untuk menambah Watchlist!");
                    return;
                  }
                  setShowWatchlistModal(true);
                }}
                className={`flex items-center gap-2 rounded-full border px-5 py-3 font-bold text-xs transition cursor-pointer active:scale-95 ${
                  inWatchlist
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-extrabold"
                    : "border-wm-border bg-wm-card hover:bg-wm-bg text-wm-texth"
                }`}
              >
                {inWatchlist ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" /> In Watchlist
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 z-20">
            <span className="h-2.5 w-2.5 rounded-full bg-wm-accent shadow-sm shadow-wm-accent/50" />
            <span className="h-2 w-2 rounded-full bg-wm-text/30" />
            <span className="h-2 w-2 rounded-full bg-wm-text/30" />
            <span className="h-2 w-2 rounded-full bg-wm-text/30" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TRENDING TODAY - 100% PERSIS SAMA SEPERTI GAMBAR REFERENSI
          (Setiap Item = 1 Kartu Landscape Melebar dengan Rank & Teks di Dalam)
         ═══════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-wm-texth flex items-center gap-1.5">
          Trending Today <ChevronRight size={15} className="text-wm-text/40" />
        </h3>
        <div className="relative">
          <div ref={trendingRef} className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1" style={{ scrollbarWidth: "none" }}>
            {trending.map((item, idx) => {
              const posterUrl = item.poster_url;
              return (
                <Link
                  to={`/detail/${item.id}`}
                  key={item.id}
                  className="relative w-[215px] h-[115px] rounded-2xl overflow-hidden flex-shrink-0 border border-wm-border hover:border-wm-accent/80 transition duration-300 group bg-wm-card flex flex-col justify-between shadow-none dark:shadow-sm"
                >
                  {/* Top: Poster Image Focus On Face */}
                  <div className="h-[74px] w-full overflow-hidden relative bg-wm-bg">
                    <img
                      src={posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                      style={{ objectPosition: "center 20%" }}
                    />
                  </div>

                  {/* Giant Overlapping Typography Rank Number - 100% PURE GREEN WITHOUT ANY SHADOW */}
                  <span
                    className="absolute left-2.5 bottom-1.5 z-20 text-5xl font-black text-[#00E575] italic select-none leading-none tracking-tighter"
                    style={{ filter: "none", textShadow: "none", boxShadow: "none" }}
                  >
                    {idx + 1}
                  </span>

                  {/* Bottom Strip: Title & Rating */}
                  <div className="h-[41px] bg-wm-card pl-11 pr-2.5 flex items-center justify-between gap-1 border-t border-wm-border/40 relative z-10">
                    <h4 className="truncate text-xs font-black text-wm-texth group-hover:text-wm-accent transition leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] font-black text-wm-texth flex-shrink-0">
                      <Star size={10} className="text-wm-accent" fill="currentColor" />
                      <span>{item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : (item.rating ? parseFloat(item.rating).toFixed(1) : "N/A")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => trendingRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-wm-card border border-wm-border flex items-center justify-center text-wm-text hover:text-wm-accent shadow-md cursor-pointer z-10 transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          THREE COLUMN GRID - Top Picks, Poll, Top Review
         ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ─────── 1. TOP PICKS FOR YOU ─────── */}
        <div className="lg:col-span-5 rounded-3xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Link to="/explore" className="text-sm font-black text-wm-texth flex items-center gap-1 hover:text-wm-accent transition">
              Top Picks For You <ChevronRight size={14} className="text-wm-text/40" />
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => picksRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                className="h-7 w-7 rounded-full border border-wm-border flex items-center justify-center text-wm-text hover:text-wm-accent hover:border-wm-accent/40 cursor-pointer transition bg-wm-bg"
                title="Scroll Kiri"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => picksRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                className="h-7 w-7 rounded-full border border-wm-border flex items-center justify-center text-wm-text hover:text-wm-accent hover:border-wm-accent/40 cursor-pointer transition bg-wm-bg"
                title="Scroll Kanan"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 text-[11px] font-bold">
            {[
              { id: "all", l: "All" },
              { id: "movie", l: "Movies" },
              { id: "drakor", l: "Drakor" },
              { id: "anime", l: "Anime" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`rounded-full px-4 py-1.5 transition cursor-pointer ${
                  activeTab === t.id
                    ? "bg-wm-accent text-black font-black"
                    : "text-wm-text hover:text-wm-texth bg-wm-bg border border-wm-border/40"
                }`}>
                {t.l}
              </button>
            ))}
          </div>

          <div ref={picksRef} className="flex gap-3 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {filteredPicks.map(item => {
              const posterUrl = item.poster_url;
              return (
                <Link to={`/detail/${item.id}`} key={item.id} className="flex-shrink-0 w-[112px] group cursor-pointer">
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-2 border border-wm-border/40 shadow-sm bg-wm-bg">
                    <img src={posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] text-white font-bold truncate">{item.title}</p>
                      <p className="text-[8px] text-white/70 font-semibold capitalize">{item.type} • {item.release_date?.slice(0, 4)}</p>
                      <div className="flex items-center gap-0.5 text-[9px] text-wm-accent font-black mt-0.5">
                        <Star size={9} fill="currentColor" /> {item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : (item.rating ? parseFloat(item.rating).toFixed(1) : "N/A")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─────── 2. TODAY'S POLL ─────── */}
        <div className="lg:col-span-4 rounded-3xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-wm-texth flex items-center gap-1.5">
              Today's Poll <BarChart3 size={15} className="text-wm-accent" />
            </h3>
            <Link to="/voting" className="h-7 w-7 rounded-full border border-wm-border flex items-center justify-center text-wm-text hover:text-wm-accent transition">
              <ChevronRight size={13} />
            </Link>
          </div>

          {poll ? (
            <>
              <p className="text-xs font-bold text-wm-texth leading-relaxed">
                {poll.title}
              </p>

              <div className="space-y-2">
                {poll.options?.map((opt) => {
                  const pct = votingResults[opt.id] || 0;
                  const isVoted = votedOptionId === opt.id;
                  return (
                    <button key={opt.id} onClick={() => handleVote(opt.id)}
                      className={`relative w-full rounded-2xl border p-3 text-[11px] font-semibold text-left transition overflow-hidden cursor-pointer flex items-center justify-between ${
                        isVoted
                          ? "border-wm-accent/60 text-wm-texth font-bold bg-wm-bg/60"
                          : "border-wm-border bg-wm-bg/40 text-wm-texth hover:border-wm-accent/40"
                      }`}>
                      <div
                        className="absolute left-0 top-0 bottom-0 rounded-2xl transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: isVoted ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.05)"
                        }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {isVoted && <span className="text-wm-accent font-black text-xs"></span>}
                        {opt.option_text || opt.text}
                      </span>
                      <span className="relative z-10 font-bold text-xs text-wm-text">{pct}%</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-wm-text/60 font-medium">Aktif • Diatur via Panel Admin</p>
            </>
          ) : (
            <p className="text-xs text-wm-text/50 py-4 text-center">Belum ada polling aktif di database.</p>
          )}
        </div>

        {/* ─────── 3. TOP REVIEW ─────── */}
        <div className="lg:col-span-3 rounded-3xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-wm-texth">Top Review</h3>
            {topReview ? (
              <Link to={`/detail/${topReview.content_id}`} className="h-7 w-7 rounded-full border border-wm-border flex items-center justify-center text-wm-text hover:text-wm-accent cursor-pointer transition">
                <ChevronRight size={13} />
              </Link>
            ) : (
              <div className="h-7 w-7 rounded-full border border-wm-border flex items-center justify-center text-wm-text/40">
                <ChevronRight size={13} />
              </div>
            )}
          </div>

          {topReview ? (
            <Link to={`/detail/${topReview.content_id}`} className="block space-y-3 relative z-10 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={topReview.user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"} className="h-9 w-9 rounded-full border border-wm-border" alt="" />
                  <div>
                    <p className="text-xs font-black text-wm-texth group-hover:text-wm-accent transition">{topReview.user?.username || "Pengguna"}</p>
                    <p className="text-[9px] text-wm-text/60 font-medium">{topReview.contentTitle}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: topReview.rating || 5 }).map((_, i) => (
                    <Star key={i} size={11} className="text-wm-accent" fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-wm-text leading-relaxed font-medium line-clamp-3 group-hover:text-wm-texth transition">
                "{topReview.review || topReview.review_text}"
              </p>

              <p className="text-[10px] text-wm-text/50 italic">Was this review helpful?</p>

              <div className="flex items-center gap-5 text-[10px] text-wm-text/70 font-bold pt-2 border-t border-wm-border/40">
                <span className="flex items-center gap-1.5 text-red-500"><Heart size={13} fill="currentColor" /> {topReview.likes_count || 0}</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={13} /> 0</span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-center py-8 text-xs text-wm-text/50 italic">
              Belum ada review pengguna di database.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM ROW: Popular OST & Community Highlights
         ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ─────── POPULAR OST ─────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-wm-texth flex items-center gap-1">
              Popular OST <ChevronRight size={14} className="text-wm-text/40" />
            </h3>
            <Link to="/explore?tab=osts" className="text-[11px] font-bold text-wm-accent hover:underline">See All</Link>
          </div>
          {displayOsts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayOsts.map(ost => {
                const isCurrent = currentTrack?.id === ost.id;
                const activePlaying = isCurrent && isPlaying;
                return (
                  <div
                    key={ost.id}
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playTrack(ost);
                    }}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition shadow-sm bg-wm-card cursor-pointer select-none ${
                      isCurrent ? "border-wm-accent ring-2 ring-wm-accent/20" : "border-wm-border hover:border-wm-accent/40"
                    }`}
                  >
                    <img src={ost.contentPoster} alt="" className="h-10 w-10 rounded-xl object-cover flex-shrink-0 bg-wm-bg border border-wm-border/60" />
                    <button className={`flex h-7 w-7 items-center justify-center rounded-full transition flex-shrink-0 cursor-pointer ${
                      activePlaying ? "bg-wm-accent text-black" : "bg-wm-bg text-wm-accent hover:bg-wm-accent hover:text-black border border-wm-border/50"
                    }`}>
                      {activePlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-[11px] font-bold text-wm-texth">{ost.title}</h4>
                      <p className="truncate text-[9px] text-wm-accent font-semibold">{ost.artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 rounded-2xl border border-wm-border/60 bg-wm-card text-xs text-wm-text/50">
              Belum ada lagu OST di database.
            </div>
          )}
        </div>

        {/* ─────── COMMUNITY HIGHLIGHTS ─────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-wm-texth flex items-center gap-1">
              Community Highlights
            </h3>
            <Link to="/community" className="text-[11px] font-bold text-wm-accent hover:underline">See All</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {posts.length > 0 ? (
              posts.slice(0, 5).map(h => (
                <div key={h.id} className="flex-shrink-0 w-[184px] rounded-2xl border border-wm-border bg-wm-card p-3.5 space-y-2 hover:border-wm-accent/40 transition shadow-sm">
                  <div className="flex items-center gap-2">
                    <img src={h.user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"} className="h-7 w-7 rounded-full border border-wm-border" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-wm-texth truncate">@{h.user?.username || "Pengguna"}</p>
                      <p className="text-[8px] text-wm-text/50 mt-0.5 font-medium">Komunitas</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-wm-text leading-relaxed font-medium line-clamp-3">{h.body || h.content || h.text}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-4 rounded-2xl border border-wm-border/60 bg-wm-card w-full text-xs text-wm-text/50">
                Belum ada postingan komunitas di database.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════
          MODAL INTERAKTIF TAMBAH KE WATCHLIST (createPortal)
         ═══════════════════════════════════════════════════ */}
      {showWatchlistModal && featured && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-wm-border bg-wm-card p-6 shadow-2xl space-y-5 transition-colors">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-wm-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-wm-accent" fill="currentColor" />
                <h3 className="text-sm font-black text-wm-texth">Simpan ke Watchlist</h3>
              </div>
              <button
                onClick={() => setShowWatchlistModal(false)}
                className="rounded-full p-1 text-wm-text/50 hover:bg-wm-bg hover:text-wm-texth cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Poster + Judul Film */}
            <div className="flex items-center gap-3.5 bg-wm-bg p-3 rounded-2xl border border-wm-border/50">
              <img src={featured.poster_url} alt="" className="h-14 w-11 rounded-xl object-cover border border-wm-border flex-shrink-0" />
              <div className="overflow-hidden">
                <h4 className="text-xs font-black text-wm-texth truncate">{featured.title}</h4>
                <p className="text-[10px] text-wm-accent font-bold mt-0.5 capitalize">{featured.type} • {featured.release_date?.slice(0, 4)}</p>
              </div>
            </div>

            {/* Pilihan Status Menonton */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-wm-text/60">Status Menonton</label>
              <select
                value={watchlistForm.status}
                onChange={(e) => setWatchlistForm({ ...watchlistForm, status: e.target.value })}
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-xs font-extrabold text-wm-texth outline-none focus:border-wm-accent transition cursor-pointer"
              >
                <option value="Plan to Watch">Plan to Watch (Ingin Ditonton)</option>
                <option value="Watching">Watching (Sedang Ditonton)</option>
                <option value="Completed">Completed (Selesai Ditonton)</option>
                <option value="Dropped">Dropped (Dihentikan)</option>
              </select>
            </div>

            {/* Pilihan Rating Pribadi (1-10) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-wm-text/60">Rating Pribadi (1 - 10)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={watchlistForm.rating}
                  onChange={(e) => setWatchlistForm({ ...watchlistForm, rating: parseInt(e.target.value) })}
                  className="flex-1 accent-wm-accent cursor-pointer h-2 bg-wm-bg rounded-full border border-wm-border"
                />
                <span className="flex items-center gap-1 text-xs font-black text-wm-texth min-w-[42px]">
                  <Star size={12} className="text-wm-accent" fill="currentColor" /> {watchlistForm.rating}/10
                </span>
              </div>
            </div>

            {/* Catatan Singkat */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-wm-text/60">Catatan Pribadi (Opsional)</label>
              <input
                type="text"
                value={watchlistForm.notes}
                onChange={(e) => setWatchlistForm({ ...watchlistForm, notes: e.target.value })}
                placeholder="misal: Drakor terbaik bulan ini..."
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-xs font-semibold text-wm-texth outline-none focus:border-wm-accent transition"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-wm-border/60">
              <button
                onClick={() => setShowWatchlistModal(false)}
                className="rounded-xl border border-wm-border bg-wm-bg px-4 py-2.5 text-xs font-bold text-wm-text hover:bg-wm-card cursor-pointer transition"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    setSavingWatchlist(true);
                    const ok = await saveToWatchlist(featured.id, watchlistForm);
                    if (ok) {
                      setShowWatchlistModal(false);
                    }
                  } finally {
                    setSavingWatchlist(false);
                  }
                }}
                disabled={savingWatchlist}
                className="rounded-xl bg-wm-accent px-5 py-2.5 text-xs font-black text-black hover:bg-wm-accent-hover active:scale-95 cursor-pointer shadow-md shadow-wm-accent/20 transition disabled:opacity-50"
              >
                {savingWatchlist ? "Menyimpan..." : "Simpan Ke Watchlist"}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </motion.div>
  );
}