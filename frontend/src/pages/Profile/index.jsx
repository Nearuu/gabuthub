import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, BookOpen, MessageSquare, Award, Edit3, Check, ShieldCheck, Heart, Sparkles, Star, Flame, LogOut, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";
import ImageInputPicker from "../../components/ImageInputPicker";

const allPossibleBadges = [
  { id: 1, icon: "👑", name: "Drakor Addict", description: "Sudah review 20 drakor favorit", color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" },
  { id: 2, icon: "🎬", name: "Movie Master", description: "Sudah nonton 100 film kelas dunia", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 3, icon: "🏆", name: "Tier Legend", description: "Membuat 10 Tier List populer", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400" },
  { id: 4, icon: "✍️", name: "Top Reviewer", description: "Menulis 50 ulasan berkualitas", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-cyan-400" },
  { id: 5, icon: "🔥", name: "Meme Lord", description: "Posting 50 meme di Komunitas", color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400" },
  { id: 6, icon: "🎯", name: "Top Voter", description: "Partisipasi vote 500 kali", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400" },
];

export default function Profile() {
  const { user, token, updateProfile, logout } = useAuthStore();

  const [watchlistCount, setWatchlistCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [userBadgesCount, setUserBadgesCount] = useState(0);
  const [votesCount, setVotesCount] = useState(0);

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatar(user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=User");
      setCoverUrl(user.coverUrl || "");
      setBio(user.bio || "Member baru GabutHub! 👋");
    }
  }, [user]);

  // Compute Per-User Real Activity Stats
  useEffect(() => {
    if (token && user) {
      const key = `watchlist_user_${user.id || user.username || user.email}`;
      const storedWatchlist = localStorage.getItem(key);
      if (storedWatchlist) {
        try {
          const parsed = JSON.parse(storedWatchlist);
          setWatchlistCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch (e) {
          setWatchlistCount(0);
        }
      } else {
        setWatchlistCount(0);
      }

      // Compute Community Posts by this exact username
      API.get("/posts").then((r) => {
        if (Array.isArray(r.data)) {
          const myPosts = r.data.filter((p) => p.user?.username?.toLowerCase() === user.username?.toLowerCase() || p.user_id === user.id);
          setPostsCount(myPosts.length);
        } else {
          setPostsCount(0);
        }
      }).catch(() => {
        setPostsCount(0);
      });

      // Compute Badges & Votes
      const badges = user.badges ? user.badges.length : 0;
      setUserBadgesCount(badges);
      setVotesCount(user.votesCount || 0);
    }
  }, [token, user?.username]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const res = await updateProfile(bio, avatar, username, coverUrl);
    if (res.success) {
      toast.success("Profil & Username berhasil diperbarui!");
      setEditMode(false);
    } else {
      toast.error(res.message || "Gagal memperbarui profil");
    }
    setSaving(false);
  };

  // ────── ALGORITMA STATE 1: UNAUTHENTICATED (BELUM LOGIN) ──────
  if (!token || !user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="relative mx-auto h-24 w-24 rounded-3xl bg-wm-accent/15 border border-wm-accent/30 flex items-center justify-center text-wm-accent shadow-xl">
          <Lock size={40} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-wm-texth">Sesi Anda Belum Aktif</h2>
          <p className="text-xs text-wm-text/60 max-w-md mx-auto leading-relaxed">
            Anda belum masuk ke akun Anda. Silakan login untuk melihat profil pribadi, mengelola watchlist, dan mengakses lencana Anda.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-wm-accent hover:bg-wm-accent-hover px-8 py-3.5 text-xs font-black text-black transition shadow-lg shadow-wm-accent/20 cursor-pointer"
          >
            <KeyRound size={16} /> Masuk ke Akun Anda
          </Link>
        </div>
      </div>
    );
  }

  // ────── ALGORITMA STATE 2: AUTHENTICATED ──────
  const hasBadge = (badgeId) => {
    return user.badges && user.badges.some((b) => b.id === badgeId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 text-wm-text">
      
      {/* ────── PREMIUM BANNER & USER PROFILE HEADER ────── */}
      <div className="relative overflow-hidden rounded-3xl border border-wm-border bg-wm-card shadow-2xl">
        
        {/* 1. COVER BANNER SAMPUL ATAS */}
        <div 
          className="h-44 w-full bg-cover bg-center relative transition-all duration-300"
          style={{
            backgroundImage: coverUrl 
              ? `url(${coverUrl})`
              : "linear-gradient(to right, rgba(0, 229, 117, 0.35), rgba(20, 184, 166, 0.25), rgba(168, 85, 247, 0.35))"
          }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1 text-2xs font-bold text-white flex items-center gap-1.5 shadow-lg">
              <Sparkles size={13} className="text-wm-accent" /> {user.role === "admin" ? "Administrator Resmi" : "Member Resmi"}
            </span>
          </div>
        </div>

        {/* 2. AREA KARTU UTAMA DENGAN PADDING LEGA (TEKS NAMA DITURUNKAN KE BAWAH AREA BERSIH) */}
        <div className="px-8 pb-8 pt-8 bg-wm-card border-t border-wm-border/40">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
            
            {/* Avatar & Detail User */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Box */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-wm-accent via-emerald-400 to-teal-300 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
                <img
                  src={avatar || user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=User"}
                  alt={user.username}
                  className="relative h-28 w-28 rounded-2xl object-cover border-2 border-wm-border bg-wm-bg shadow-xl"
                />
              </div>

              {/* Teks Username Diturunkan Ke Bawah Di Area Kartu Bersih */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-3xl font-black tracking-tight text-wm-texth">@{user.username}</h1>
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 self-center md:self-auto rounded-full bg-wm-accent/20 border border-wm-accent/40 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-wm-accent shadow-sm">
                      <ShieldCheck size={13} /> ADMIN RESMI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 self-center md:self-auto rounded-full bg-blue-500/20 border border-blue-500/40 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-400 shadow-sm">
                      USER MEMBER
                    </span>
                  )}
                </div>

                <p className="text-xs text-wm-text/60 font-medium">✉️ {user.email}</p>

                <p className="text-sm text-wm-text/80 leading-relaxed max-w-xl font-medium pt-1">
                  "{user.bio || bio || "Member baru GabutHub! 👋"}"
                </p>
              </div>
            </div>

            {/* Action Buttons Diturunkan Ke Bawah Di Area Kartu Bersih */}
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end pt-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2 rounded-2xl border border-wm-border bg-wm-bg px-5 py-3 text-xs font-bold text-wm-texth hover:text-wm-accent hover:border-wm-accent/40 transition cursor-pointer shadow-md"
              >
                <Edit3 size={15} /> {editMode ? "Tutup Editor" : "Edit Profil & Sampul"}
              </button>
              
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-2xl bg-wm-accent hover:bg-wm-accent-hover px-5 py-3 text-xs font-black text-black transition cursor-pointer shadow-lg shadow-wm-accent/20"
                >
                  <ShieldCheck size={15} /> Panel Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                <LogOut size={15} /> Keluar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ────── EDIT PROFILE & SAMPUL BANNER FORM MODAL ────── */}
      <AnimatePresence>
        {editMode && (
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onSubmit={handleUpdateProfile}
            className="rounded-3xl border border-wm-accent/30 bg-wm-card p-6 shadow-2xl space-y-6 overflow-hidden relative"
          >
            <div className="flex items-center justify-between border-b border-wm-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-wm-texth flex items-center gap-2">
                <Edit3 size={16} className="text-wm-accent" /> Edit Informasi Profil & Gambar Sampul
              </h3>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="text-xs text-wm-text/50 hover:text-wm-texth"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wm-text/70 mb-2">Username Baru</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ketik username baru..."
                className="w-full rounded-2xl border border-wm-border bg-wm-bg p-3.5 text-xs font-bold text-wm-texth outline-none focus:border-wm-accent transition"
              />
            </div>

            {/* Custom Dual Mode Image Picker for Avatar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wm-text/70 mb-2">Foto Avatar Profil</label>
              <ImageInputPicker
                value={avatar}
                onChange={setAvatar}
                placeholder="Upload avatar atau tempel URL avatar..."
              />
            </div>

            {/* Custom Cover / Banner Background Image Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wm-text/70 mb-2">Gambar Sampul / Cover Background</label>
              <ImageInputPicker
                value={coverUrl}
                onChange={setCoverUrl}
                placeholder="Upload foto sampul atau tempel URL gambar banner..."
              />
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wm-text/70 mb-2">Bio Singkat</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan bio singkat favoritmu..."
                className="w-full rounded-2xl border border-wm-border bg-wm-bg p-4 text-xs font-medium text-wm-texth outline-none focus:border-wm-accent transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-xl border border-wm-border bg-wm-bg px-5 py-2.5 text-xs font-bold text-wm-text hover:text-wm-texth transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-wm-accent px-6 py-2.5 text-xs font-black text-black hover:bg-wm-accent-hover disabled:opacity-50 transition cursor-pointer shadow-lg shadow-wm-accent/20"
              >
                <Check size={15} />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ────── REAL PER-USER STATISTIK DASHBOARD CARDS ────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <BookOpen className="mx-auto text-wm-accent mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">{watchlistCount}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Watchlist Tersimpan</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <MessageSquare className="mx-auto text-wm-accent mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">{postsCount}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Postingan Komunitas</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <Award className="mx-auto text-yellow-400 mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">{userBadgesCount}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Koleksi Lencana</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <Flame className="mx-auto text-orange-400 mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">{votesCount}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Total Partisipasi Vote</p>
        </div>
      </div>

      {/* ────── BADGES / LENCANA PRESTASI SECTION ────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-wm-border/50 pb-3">
          <h2 className="text-xl font-black text-wm-texth flex items-center gap-2">
            <Award className="text-yellow-400" size={22} /> Koleksi Lencana & Prestasi (Badges)
          </h2>
          <span className="text-2xs font-bold text-wm-accent bg-wm-accent/10 px-3 py-1 rounded-full border border-wm-accent/20">
            {userBadgesCount} / 6 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {allPossibleBadges.map((badge) => {
            const unlocked = hasBadge(badge.id) || user.role === "admin" || user.username === "admin";
            return (
              <div
                key={badge.id}
                className={`relative flex items-center gap-4 rounded-3xl border p-5 transition duration-300 bg-gradient-to-br ${badge.color} ${
                  unlocked ? "shadow-md hover:scale-[1.02]" : "opacity-40 grayscale"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/30 backdrop-blur-md text-2xl shadow-inner border border-white/10 flex-shrink-0">
                  {badge.icon || "🏆"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-black text-wm-texth truncate">{badge.name}</h3>
                  <p className="text-3xs font-medium text-wm-text/70 mt-1 leading-snug">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}