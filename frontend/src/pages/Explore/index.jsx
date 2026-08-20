import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Play, Pause, Music, Star, Compass, Film, Tv, Popcorn, Sparkles, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import usePlayerStore from "../../store/ostPlayerStore";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get("type") || "";
  const tabFilter = searchParams.get("tab") || "";
  const initialSearch = searchParams.get("search") || "";

  const [contents, setContents] = useState([]);
  const [osts, setOsts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'newest' | 'title'
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  // Custom Dropdown Open States
  const [yearOpen, setYearOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const yearDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) setYearOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    setSelectedGenre("");
    setSearchInput(searchParams.get("search") || "");
  }, [typeFilter, tabFilter, searchParams.get("search")]);

  // Load Data Katalog atau OSTs
  useEffect(() => {
    async function loadExploreData() {
      setLoading(true);
      try {
        if (tabFilter === "osts") {
          const resContents = await API.get("/contents");
          const allOsts = [];
          const dataList = Array.isArray(resContents.data) ? resContents.data : [];
          dataList.forEach(c => {
            if (c.osts && Array.isArray(c.osts)) {
              c.osts.forEach(o => {
                allOsts.push({
                  ...o,
                  contentId: c.id,
                  contentTitle: c.title,
                  contentPoster: c.poster_url,
                  contentType: c.type
                });
              });
            }
          });
          allOsts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
          setOsts(allOsts);
        } else {
          const [contentsRes, genresRes] = await Promise.all([
            API.get(`/contents?type=${typeFilter}&genre_id=${selectedGenre}&search=${searchInput}`),
            API.get("/genres"),
          ]);
          setContents(Array.isArray(contentsRes.data) ? contentsRes.data : []);
          setGenres(Array.isArray(genresRes.data) ? genresRes.data : []);
        }
      } catch (error) {
        console.error("Failed to load explore data", error);
      } finally {
        setLoading(false);
      }
    }

    loadExploreData();
  }, [typeFilter, tabFilter, selectedGenre, searchInput]);

  const getPageTitle = () => {
    if (tabFilter === "osts") return <span className="flex items-center gap-2 font-black"><Music className="text-wm-accent" size={22} /> Original Soundtrack (OST)</span>;
    if (typeFilter === "film" || typeFilter === "movie" || typeFilter === "series") return <span className="flex items-center gap-2 font-black"><Film className="text-wm-accent" size={22} /> Katalog Film (Movie & Series)</span>;
    if (typeFilter === "drakor" || typeFilter === "drama") return <span className="flex items-center gap-2 font-black"><Tv className="text-wm-accent" size={22} /> Drama Korea (Drakor)</span>;
    if (typeFilter === "anime") return <span className="flex items-center gap-2 font-black"><Popcorn className="text-wm-accent" size={22} /> Anime Terfavorit</span>;
    return <span className="flex items-center gap-2 font-black"><Compass className="text-wm-accent" size={22} /> Explore Seluruh Hiburan</span>;
  };

  // Sort & Filter Contents Logic
  const sortedAndFilteredContents = contents
    .filter((item) => {
      if (!selectedYear) return true;
      const itemYear = parseInt(item.release_date?.slice(0, 4) || "0");
      if (selectedYear === "2020-below") return itemYear <= 2020;
      return item.release_date?.slice(0, 4) === selectedYear;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        const rateA = parseFloat(a.avg_rating || 0);
        const rateB = parseFloat(b.avg_rating || 0);
        return rateB - rateA;
      }
      if (sortBy === "newest") {
        return (b.release_date || "").localeCompare(a.release_date || "");
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-16 text-wm-text">
      {/* Header & Title */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-wm-texth flex items-center gap-2">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-wm-text/60 mt-0.5 font-medium">
            Temukan koleksi konten terbaik sesuai kategori pilihanmu di sidebar kiri.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari judul film, drakor, anime..."
            className="w-full rounded-full border border-wm-border bg-wm-card py-2.5 pl-10 pr-4 text-xs text-wm-texth outline-none focus:border-wm-accent transition placeholder-wm-text/45"
          />
        </div>
      </div>

      {/* Sub-Filter Tab khusus Kategori Film (Semua Film, Movies, Series) */}
      {(typeFilter === "film" || typeFilter === "movie" || typeFilter === "series") && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchParams({ type: "film" })}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              typeFilter === "film"
                ? "bg-wm-accent text-black shadow-sm"
                : "bg-wm-card border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            Semua Film
          </button>
          <button
            onClick={() => setSearchParams({ type: "movie" })}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              typeFilter === "movie"
                ? "bg-wm-accent text-black shadow-sm"
                : "bg-wm-card border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setSearchParams({ type: "series" })}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
              typeFilter === "series"
                ? "bg-wm-accent text-black shadow-sm"
                : "bg-wm-card border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            Series
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB OST (Kumpulan Musik Soundtrack Asli)
         ═══════════════════════════════════════════════════ */}
      {tabFilter === "osts" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-wm-texth flex items-center gap-2">
              <Music size={16} className="text-wm-accent" /> Daftar Lagu Soundtracks
            </h3>
            <span className="text-xs text-wm-text/60 font-semibold">{osts.length} Lagu Ditemukan</span>
          </div>

          {osts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {osts.map((ost) => {
                const isCurrent = currentTrack?.id === ost.id;
                const activePlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={ost.id}
                    onClick={() => {
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        playTrack(ost);
                      }
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition duration-200 bg-wm-card shadow-sm cursor-pointer select-none ${
                      isCurrent ? "border-wm-accent ring-2 ring-wm-accent/20" : "border-wm-border hover:border-wm-accent/40"
                    }`}
                  >
                    {/* Poster Film Terkait */}
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border border-wm-border/60 bg-wm-bg">
                      <img src={ost.contentPoster} alt="" className="h-full w-full object-cover" />
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition ${
                          activePlaying
                            ? "bg-wm-accent/90 text-black opacity-100"
                            : "bg-black/20 text-white opacity-0 hover:opacity-100"
                        }`}
                      >
                        {activePlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                      </div>
                    </div>

                    {/* Informasi Lagu & Artist */}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-xs font-black text-wm-texth">{ost.title}</h4>
                      <p className="truncate text-[10px] text-wm-accent font-bold mt-0.5">{ost.artist}</p>
                      <span className="truncate text-[9px] text-wm-text/60 font-semibold mt-1 block">
                        Film: {ost.contentTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/30 border-dashed text-wm-text/60">
              <p className="text-xs font-semibold">Belum ada lagu OST di database.</p>
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
            KATALOG FILM / DRAKOR / ANIME
           ═══════════════════════════════════════════════════ */
        <div className="space-y-5">
          {/* Controls Bar: Genre, Year Filter & Sorting */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-wm-border bg-wm-card p-4 shadow-sm">
            {/* Genre Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase text-wm-text/50 tracking-wider">Genre:</span>
              <button
                onClick={() => setSelectedGenre("")}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition cursor-pointer ${
                  selectedGenre === ""
                    ? "bg-wm-accent border-wm-accent text-black font-black"
                    : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                }`}
              >
                Semua
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold border transition cursor-pointer ${
                    selectedGenre === g.id
                      ? "bg-wm-accent border-wm-accent text-black font-black"
                      : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Year & Sort Custom Floating Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 border-wm-border/40 pt-3 lg:pt-0">
              
              {/* 1. CUSTOM YEAR DROPDOWN */}
              <div className="relative" ref={yearDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setYearOpen(!yearOpen);
                    setSortOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-sm ${
                    yearOpen || selectedYear !== ""
                      ? "border-wm-accent bg-wm-accent/10 text-wm-accent ring-1 ring-wm-accent/30"
                      : "border-wm-border bg-wm-bg text-wm-texth hover:border-wm-accent/40"
                  }`}
                >
                  <span className="text-wm-text/60 font-medium">Tahun:</span>
                  <span>
                    {selectedYear === "" && "Semua Tahun"}
                    {selectedYear === "2024" && "2024"}
                    {selectedYear === "2023" && "2023"}
                    {selectedYear === "2022" && "2022"}
                    {selectedYear === "2021" && "2021"}
                    {selectedYear === "2020-below" && "2020 & Sebelumnya"}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${yearOpen ? "rotate-180 text-wm-accent" : "text-wm-text/40"}`} />
                </button>

                {/* Dropdown Menu floating popover */}
                <AnimatePresence>
                  {yearOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 sm:right-auto left-0 mt-2 w-48 rounded-2xl border border-wm-border bg-wm-card/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                    >
                      {[
                        { id: "", label: "Semua Tahun" },
                        { id: "2024", label: "2024" },
                        { id: "2023", label: "2023" },
                        { id: "2022", label: "2022" },
                        { id: "2021", label: "2021" },
                        { id: "2020-below", label: "2020 & Sebelumnya" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedYear(item.id);
                            setYearOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                            selectedYear === item.id
                              ? "bg-wm-accent text-black font-black"
                              : "text-wm-texth hover:bg-wm-accent/15 hover:text-wm-accent"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedYear === item.id && <Check size={14} className="text-black stroke-[3]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. CUSTOM SORT DROPDOWN */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSortOpen(!sortOpen);
                    setYearOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-sm ${
                    sortOpen
                      ? "border-wm-accent bg-wm-accent/10 text-wm-accent ring-1 ring-wm-accent/30"
                      : "border-wm-border bg-wm-bg text-wm-texth hover:border-wm-accent/40"
                  }`}
                >
                  <span className="text-wm-text/60 font-medium">Urutkan:</span>
                  <span>
                    {sortBy === "rating" && "Rating Tertinggi ⭐"}
                    {sortBy === "newest" && "Terbaru Rilis 📅"}
                    {sortBy === "title" && "Judul (A-Z) 🔤"}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${sortOpen ? "rotate-180 text-wm-accent" : "text-wm-text/40"}`} />
                </button>

                {/* Dropdown Menu floating popover */}
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-wm-border bg-wm-card/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                    >
                      {[
                        { id: "rating", label: "Rating Tertinggi ⭐" },
                        { id: "newest", label: "Terbaru Rilis 📅" },
                        { id: "title", label: "Judul (A-Z) 🔤" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSortBy(item.id);
                            setSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                            sortBy === item.id
                              ? "bg-wm-accent text-black font-black"
                              : "text-wm-texth hover:bg-wm-accent/15 hover:text-wm-accent"
                          }`}
                        >
                          <span>{item.label}</span>
                          {sortBy === item.id && <Check size={14} className="text-black stroke-[3]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Catalog Grid */}
          {sortedAndFilteredContents.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {sortedAndFilteredContents.map((item) => {
                const posterUrl = item.poster_url;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl border border-wm-border bg-wm-card shadow-sm hover:shadow-md transition duration-200"
                  >
                    <Link to={`/detail/${item.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-wm-bg border-b border-wm-border">
                        <img
                          src={posterUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-wm-accent border border-wm-accent/20 capitalize">
                          {item.type}
                        </div>
                        <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-extrabold text-wm-yellow border border-wm-yellow/20 flex items-center gap-0.5">
                          <Star size={8} fill="currentColor" />
                          <span>{item.avg_rating || "N/A"}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="truncate text-xs font-bold text-wm-texth group-hover:text-wm-accent transition">
                          {item.title}
                        </h4>
                        <p className="mt-0.5 text-[10px] text-wm-text/60 font-semibold">
                          Rilis: {new Date(item.release_date).getFullYear() || "-"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/30 border-dashed text-wm-text/60">
              <p className="text-xs font-semibold">Tidak ada konten ditemukan pada kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}