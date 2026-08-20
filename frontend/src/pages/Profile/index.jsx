import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, BookOpen, MessageSquare, Award, Edit3, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

const allPossibleBadges = [
  { id: 1, name: "Drakor Addict", description: "Sudah review 20 drakor" },
  { id: 2, name: "Movie Master", description: "Sudah nonton 100 film" },
  { id: 3, name: "Tier Legend", description: "Bikin 10 Tier List" },
  { id: 4, name: "Reviewer", description: "50 Review" },
  { id: 5, name: "Meme Lord", description: "Posting 50 meme" },
  { id: 6, name: "Top Voter", description: "Vote 500 kali" },
];

import ImageInputPicker from "../../components/ImageInputPicker";

export default function Profile() {
  const { user, fetchUser, updateProfile } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin");
      setBio(user.bio || "Administrator Resmi GabutHub Indonesia 🚀");
    }
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

  const activeUser = user || {
    username: "admin",
    email: "admin@gabuthub.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
    bio: "Administrator Resmi GabutHub Indonesia 🚀",
    badges: allPossibleBadges
  };

  const hasBadge = (badgeId) => {
    return activeUser.badges && activeUser.badges.some((b) => b.id === badgeId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 text-wm-text">
      
      {/* Profile Card Header */}
      <div className="relative overflow-hidden rounded-3xl border border-wm-border bg-wm-card p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={avatar || activeUser.avatar}
            alt={activeUser.username}
            className="h-28 w-28 rounded-2xl object-cover border border-wm-border bg-wm-bg shadow-sm"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-wm-texth">@{activeUser.username}</h2>
              {activeUser.role === "admin" && (
                <span className="self-center md:self-start rounded bg-wm-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wm-accent border border-wm-accent/20">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-wm-text/50 mt-0.5">Email: {activeUser.email}</p>
          </div>

          <p className="text-sm text-wm-text/80 leading-relaxed max-w-lg">
            {activeUser.bio || "Belum menulis bio."}
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 rounded-xl border border-wm-border bg-wm-bg px-4 py-2 text-xs font-bold text-wm-texth hover:text-wm-accent hover:border-wm-accent/40 transition cursor-pointer"
            >
              <Edit3 size={14} /> Edit Profil
            </button>
            {activeUser.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                Panel Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <AnimatePresence>
        {editMode && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleUpdateProfile}
            className="rounded-3xl border border-wm-border bg-wm-card p-6 shadow-sm space-y-5 overflow-hidden"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-wm-texth">Edit Informasi Profil</h3>

            {/* Custom Dual Mode Image Picker for Avatar */}
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Avatar Profil</label>
              <ImageInputPicker
                value={avatar}
                onChange={setAvatar}
                placeholder="Upload avatar atau tempel URL avatar..."
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Bio Singkat</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan bio atau kata-kata favoritmu..."
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth outline-none focus:border-wm-accent transition"
              />
            </div>

            <div className="flex justify-end gap-3">
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
                className="flex items-center gap-2 rounded-xl bg-wm-accent px-6 py-2.5 text-xs font-bold text-black hover:bg-wm-accent/90 disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                <Check size={14} />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Profile Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-wm-border bg-wm-card p-6 text-center space-y-1 shadow-sm">
          <BookOpen className="mx-auto text-wm-accent mb-2" size={24} />
          <p className="text-2xl font-black text-wm-texth">12</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Watchlist</p>
        </div>
        <div className="rounded-2xl border border-wm-border bg-wm-card p-6 text-center space-y-1 shadow-sm">
          <MessageSquare className="mx-auto text-wm-accent mb-2" size={24} />
          <p className="text-2xl font-black text-wm-texth">5</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Review</p>
        </div>
        <div className="rounded-2xl border border-wm-border bg-wm-card p-6 text-center space-y-1 shadow-sm">
          <Award className="mx-auto text-wm-yellow mb-2" size={24} />
          <p className="text-2xl font-black text-wm-texth">{activeUser.badges?.length || 6}</p>
          <p className="text-3xs font-bold uppercase tracking-widest text-wm-text/50">Lencana</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-wm-texth flex items-center gap-2">
          <Award className="text-wm-yellow" size={20} /> Koleksi Lencana (Badge Collection)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allPossibleBadges.map((badge) => {
            const unlocked = hasBadge(badge.id) || activeUser.role === "admin";
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                  unlocked
                    ? "border-wm-accent/40 bg-wm-card shadow-sm"
                    : "border-wm-border/40 bg-wm-card/40 opacity-40 grayscale"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${
                  unlocked ? "bg-wm-accent/15 text-wm-accent border border-wm-accent/30" : "bg-wm-bg text-wm-text/50"
                }`}>
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-bold text-wm-texth">{badge.name}</h4>
                  <p className="text-3xs text-wm-text/60 mt-0.5">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}