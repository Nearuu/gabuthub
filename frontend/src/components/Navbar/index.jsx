import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Dice5, ChevronDown, User as UserIcon, Heart, LogOut, Sparkles, X, Menu, Sun, Moon, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import API from "../../services/api";

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const { darkMode, toggleTheme, toggleSidebar } = useThemeStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [surpriseResult, setSurpriseResult] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const mockNotifications = [
    { id: 1, text: "Selamat! Kamu mendapatkan lencana Drakor Addict.", time: "1 jam yang lalu" },
    { id: 2, text: "Pengguna lain mengomentari postingan opini kamu.", time: "3 jam yang lalu" },
    { id: 3, text: "Polling 'Best Villain' baru saja berakhir. Cek hasilnya!", time: "1 hari yang lalu" },
  ];

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try { const r = await API.get(`/contents?search=${searchQuery}`); setSearchResults(r.data.slice(0, 5)); }
      catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    function h(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleResultClick = (id) => { setSearchQuery(""); setShowDropdown(false); navigate(`/detail/${id}`); };

  const handleSurpriseMe = async () => {
    setShowSurpriseModal(true); setIsSpinning(true); setSurpriseResult(null);
    try {
      const r = await API.get("/contents/surprise");
      setTimeout(() => { setSurpriseResult(r.data); setIsSpinning(false); }, 2500);
    } catch (e) { console.error(e); setIsSpinning(false); setShowSurpriseModal(false); }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-wm-border bg-wm-card/95 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1700px] items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-wm-bg rounded-xl text-wm-text hover:text-wm-texth transition cursor-pointer"><Menu size={20} /></button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wm-accent text-black shadow-lg shadow-wm-accent/20">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <div className="flex items-center text-lg"><span className="font-black text-wm-texth">Gabut</span><span className="font-black text-wm-accent">Hub</span></div>
          </Link>
        </div>

        <div ref={dropdownRef} className="relative hidden w-[420px] md:block">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/45" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)}
            placeholder="Search movie, anime, drakor, actor..." className="w-full rounded-full border border-wm-border bg-wm-bg py-2.5 pl-11 pr-10 text-xs text-wm-texth placeholder-wm-text/40 outline-none transition focus:border-wm-accent focus:ring-1 focus:ring-wm-accent" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded bg-wm-card text-wm-text/40 border border-wm-border/50">/</div>
          <AnimatePresence>
            {showDropdown && searchQuery.trim().length >= 2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 right-0 mt-2 rounded-xl border border-wm-border bg-wm-card p-2 shadow-2xl z-50">
                {searchResults.length > 0 ? (<div className="flex flex-col gap-1">{searchResults.map((item) => (
                  <button key={item.id} onClick={() => handleResultClick(item.id)} className="flex items-center gap-3 rounded-lg p-2 text-left transition hover:bg-wm-bg cursor-pointer">
                    <img src={item.poster_url} alt="" className="h-10 w-8 rounded object-cover border border-wm-border" />
                    <div className="flex-1 overflow-hidden"><p className="truncate text-sm font-semibold text-wm-texth">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-wm-text/60 capitalize"><span className="rounded bg-wm-bg px-1.5 py-0.5 border border-wm-border">{item.type}</span><span> {item.avg_rating || "N/A"}</span></div>
                    </div></button>))}</div>) : (<p className="p-3 text-center text-xs text-wm-text/50">Tidak ada hasil.</p>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher Button - DIPINDAHKAN KE KANAN ATAS DI SEBELAH NOTIF */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-wm-border bg-wm-bg text-wm-text transition hover:border-wm-accent hover:text-wm-accent cursor-pointer shadow-sm"
            title={darkMode ? "Switch to Light Mode" : "Switch to Night Mode"}
          >
            {darkMode ? (
              <Sun size={17} className="text-yellow-400" />
            ) : (
              <Moon size={17} className="text-slate-600" />
            )}
          </button>

          {token && (
            <div ref={notifRef} className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative flex items-center justify-center h-10 w-10 rounded-full border border-wm-border bg-wm-bg text-wm-text transition hover:text-wm-texth cursor-pointer">
                <Bell size={16} /><span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-wm-accent"></span>
              </button>
              <AnimatePresence>{showNotifications && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 mt-2 w-80 rounded-xl border border-wm-border bg-wm-card p-4 shadow-2xl z-50">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-wm-text/50">Notifikasi</h3>
                  <div className="flex flex-col gap-3">{mockNotifications.map((n) => (<div key={n.id} className="border-b border-wm-border/40 pb-2 last:border-0 last:pb-0"><p className="text-xs text-wm-texth leading-relaxed">{n.text}</p><span className="text-[10px] text-wm-text/50">{n.time}</span></div>))}</div>
                </motion.div>
              )}</AnimatePresence>
            </div>
          )}

          <button onClick={handleSurpriseMe} className="flex items-center gap-2 rounded-full bg-wm-accent hover:bg-wm-accent-hover px-4 py-2.5 text-xs font-black text-black transition hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md shadow-wm-accent/10">
            <Dice5 size={14} /><span>Surprise Me</span>
          </button>

          {token && user ? (
            <div ref={userMenuRef} className="relative">
              <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex cursor-pointer items-center gap-2 rounded-full border border-wm-border bg-wm-bg p-1 pr-3 transition hover:bg-wm-border">
                <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full object-cover border border-wm-border" />
                <ChevronDown size={14} className="text-wm-text/50" />
              </div>
              <AnimatePresence>{showUserMenu && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 mt-2 w-56 rounded-xl border border-wm-border bg-wm-card p-2 shadow-2xl z-50">
                  <div className="border-b border-wm-border/50 p-3">
                    <p className="truncate text-sm font-bold text-wm-texth">@{user.username}</p>
                    <p className="truncate text-xs text-wm-text/60">{user.email}</p>
                    {user.role === "admin" && <span className="mt-1.5 inline-block rounded bg-wm-accent/15 border border-wm-accent/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wm-accent">ADMIN</span>}
                  </div>
                  <div className="flex flex-col gap-1 p-1">
                    {user.role === "admin" && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg p-2.5 text-xs text-black font-black bg-wm-accent hover:bg-wm-accent-hover transition"><ShieldCheck size={14} /><span>Panel Admin</span></Link>}
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg p-2.5 text-xs text-wm-texth transition hover:bg-wm-bg"><UserIcon size={14} /><span>Profil Saya</span></Link>
                    <Link to="/watchlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 rounded-lg p-2.5 text-xs text-wm-texth transition hover:bg-wm-bg"><Heart size={14} /><span>Watchlist</span></Link>
                    <button onClick={() => { logout(); setShowUserMenu(false); }} className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-xs text-red-400 transition hover:bg-red-500/10 cursor-pointer"><LogOut size={14} /><span>Keluar</span></button>
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="rounded-full border border-wm-accent/30 bg-wm-accent/10 px-4 py-2.5 text-xs font-black text-wm-accent transition hover:bg-wm-accent hover:text-black cursor-pointer">Masuk</Link>
          )}
        </div>
      </div>

      {/* SURPRISE ME MODAL PORTAL */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showSurpriseModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-wm-border bg-wm-card p-6 shadow-2xl"
              >
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-wm-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-wm-accent/15 text-wm-accent">
                      <Dice5 size={18} className={isSpinning ? "animate-spin" : ""} />
                    </div>
                    <h3 className="text-sm font-black text-wm-texth">Surprise Recommendation</h3>
                  </div>
                  <button
                    onClick={() => setShowSurpriseModal(false)}
                    className="rounded-full p-1.5 text-wm-text/50 hover:bg-wm-bg hover:text-wm-texth transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content Loading or Result */}
                <div className="py-2 space-y-5 text-center">
                  {isSpinning ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-3 border-wm-accent border-t-transparent shadow-lg shadow-wm-accent/20"
                      />
                      <p className="text-xs font-bold text-wm-accent uppercase tracking-widest animate-pulse">
                        Memutar Dadu Keberuntungan...
                      </p>
                    </div>
                  ) : surpriseResult ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex gap-4 items-center rounded-2xl border border-wm-border/60 bg-wm-bg p-3.5 shadow-inner">
                        <img
                          src={surpriseResult.poster_url}
                          alt=""
                          className="h-28 w-20 rounded-xl object-cover border border-wm-border shadow-md"
                        />
                        <div className="flex-1 overflow-hidden space-y-1">
                          <span className="rounded bg-wm-accent/10 border border-wm-accent/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wm-accent">
                            {surpriseResult.type}
                          </span>
                          <h4 className="truncate text-base font-black text-wm-texth">{surpriseResult.title}</h4>
                          <p className="line-clamp-2 text-2xs text-wm-text/70">{surpriseResult.synopsis}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => {
                            setShowSurpriseModal(false);
                            navigate(`/detail/${surpriseResult.id}`);
                          }}
                          className="w-full rounded-xl bg-wm-accent py-3 text-xs font-black text-black shadow-md shadow-wm-accent/10 transition hover:bg-wm-accent-hover cursor-pointer"
                        >
                          Tonton / Cek Detail
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleSurpriseMe}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-wm-border bg-wm-bg py-2.5 text-xs font-bold text-wm-texth hover:bg-wm-card transition cursor-pointer"
                          >
                            <Dice5 size={14} className="text-wm-accent" />
                            <span>Acak Lagi</span>
                          </button>

                          <button
                            onClick={() => setShowSurpriseModal(false)}
                            className="rounded-xl border border-wm-border bg-wm-bg py-2.5 text-xs font-bold text-wm-text hover:text-wm-texth hover:bg-wm-card transition cursor-pointer"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}