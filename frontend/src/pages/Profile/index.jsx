import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, BookOpen, MessageSquare, Award, Edit3, Check, ShieldCheck, Heart, Sparkles, Star, Flame, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import ImageInputPicker from "../../components/ImageInputPicker";

const allPossibleBadges = [
  { id: 1, icon: "👑", name: "Drakor Addict", description: "Sudah review 20 drakor favorit", color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400" },
  { id: 2, icon: "🎬", name: "Movie Master", description: "Sudah nonton 100 film kelas dunia", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 3, icon: "🏆", name: "Tier Legend", description: "Membuat 10 Tier List populer", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400" },
  { id: 4, icon: "✍️", name: "Top Reviewer", description: "Menulis 50 ulasan berkualitas", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-cyan-400" },
  { id: 5, icon: "🔥", name: "Meme Lord", description: "Posting 50 meme di Komunitas", color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400" },
  { id: 6, name: "🎯", name: "Top Voter", description: "Partisipasi vote 500 kali", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400" },
];

export default function Profile() {
  const { user, fetchUser, updateProfile, logout } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const activeUser = user || {
    username: "admin",
    email: "admin@gabuthub.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
    bio: "Administrator Resmi GabutHub Indonesia 🚀 - Pecinta Drakor & Sci-Fi",
    badges: allPossibleBadges
  };

  useEffect(() => {
    setAvatar(activeUser.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin");
    setBio(activeUser.bio || "Administrator Resmi GabutHub Indonesia 🚀");
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile(bio, avatar);
    if (res.success) {
      toast.success("Profil berhasil diperbarui!");
      setEditMode(false);
      fetchUser();
    } else {
      toast.error(res.message || "Gagal memperbarui profil");
    }
    setSaving(false);
  };

  const hasBadge = (badgeId) => {
    return activeUser.badges && activeUser.badges.some((b) => b.id === badgeId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 text-wm-text">
      
      {/* ────── PREMIUM BANNER & USER PROFILE HEADER ────── */}
      <div className="relative overflow-hidden rounded-3xl border border-wm-border bg-wm-card shadow-2xl">
        {/* Decorative Ambient Cover Gradient */}
        <div className="h-40 w-full bg-gradient-to-r from-emerald-600/30 via-teal-600/20 to-purple-600/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-wm-accent/20 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 text-2xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-wm-accent" /> GabutHub VIP
            </span>
          </div>
        </div>

        {/* Header Main Info */}
        <div className="relative px-8 pb-8 pt-0 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left -mt-16">
          {/* Avatar Container with glowing border */}
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-wm-accent via-emerald-400 to-teal-300 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
            <img
              src={avatar || activeUser.avatar}
              alt={activeUser.username}
              className="relative h-32 w-32 rounded-2xl object-cover border-4 border-wm-card bg-wm-bg shadow-2xl"
            />
          </div>

          {/* User Info & Bio */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-black tracking-tight text-wm-texth">@{activeUser.username}</h1>
              {activeUser.role === "admin" && (
                <span className="inline-flex items-center gap-1 self-center md:self-auto rounded-full bg-wm-accent/20 border border-wm-accent/40 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-wm-accent shadow-sm">
                  <ShieldCheck size={13} /> ADMIN RESMI
                </span>
              )}
            </div>

            <p className="text-xs text-wm-text/60 font-medium">✉️ {activeUser.email}</p>

            <p className="text-sm text-wm-text/80 leading-relaxed max-w-xl font-medium pt-1">
              "{activeUser.bio || "Belum menulis bio."}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end pb-1">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 rounded-2xl border border-wm-border bg-wm-bg px-5 py-3 text-xs font-bold text-wm-texth hover:text-wm-accent hover:border-wm-accent/40 transition cursor-pointer shadow-md"
            >
              <Edit3 size={15} /> {editMode ? "Tutup Editor" : "Edit Profil"}
            </button>
            
            {activeUser.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-2xl bg-wm-accent hover:bg-wm-accent-hover px-5 py-3 text-xs font-black text-black transition cursor-pointer shadow-lg shadow-wm-accent/20"
              >
                <ShieldCheck size={15} /> Panel Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ────── EDIT PROFILE FORM MODAL SECTION ────── */}
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
                <Edit3 size={16} className="text-wm-accent" /> Perbarui Profil Pribadi
              </h3>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="text-xs text-wm-text/50 hover:text-wm-texth"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Custom Dual Mode Image Picker for Avatar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-wm-text/70 mb-2">Avatar Profil</label>
              <ImageInputPicker
                value={avatar}
                onChange={setAvatar}
                placeholder="Upload avatar biasa atau tempel URL gambar avatar..."
              />
            </div>

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
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ────── STATISTIK DASHBOARD CARDS ────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <BookOpen className="mx-auto text-wm-accent mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">12</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Watchlist Tersimpan</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <MessageSquare className="mx-auto text-wm-accent mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">5</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Ulasan Komunitas</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <Award className="mx-auto text-yellow-400 mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">{activeUser.badges?.length || 6}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Koleksi Lencana</p>
        </div>

        <div className="rounded-3xl border border-wm-border bg-wm-card p-5 text-center space-y-1 shadow-sm hover:border-wm-accent/40 transition">
          <Flame className="mx-auto text-orange-400 mb-1" size={26} />
          <p className="text-3xl font-black text-wm-texth">24</p>
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
            {activeUser.badges?.length || 6} / 6 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {allPossibleBadges.map((badge) => {
            const unlocked = hasBadge(badge.id) || activeUser.role === "admin";
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