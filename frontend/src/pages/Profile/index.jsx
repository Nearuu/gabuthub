import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, BookOpen, MessageSquare, Award, Edit3, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

const allPossibleBadges = [
  { id: 1, name: " Drakor Addict", description: "Sudah review 20 drakor" },
  { id: 2, name: " Movie Master", description: "Sudah nonton 100 film" },
  { id: 3, name: " Tier Legend", description: "Bikin 10 Tier List" },
  { id: 4, name: " Reviewer", description: "50 Review" },
  { id: 5, name: " Meme Lord", description: "Posting 50 meme" },
  { id: 6, name: " Top Voter", description: "Vote 500 kali" },
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
      setAvatar(user.avatar || "");
      setBio(user.bio || "");
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
      toast.error(res.message);
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-wm-text/60">
        <p className="mb-4">Silakan login terlebih dahulu untuk melihat profil Anda.</p>
        <Link to="/login" className="rounded-xl bg-wm-coral px-6 py-2.5 text-xs font-bold text-white hover:bg-wm-coral/95 cursor-pointer shadow-md shadow-wm-coral/15 transition">Masuk</Link>
      </div>
    );
  }

  // Helper to check if user earned a badge
  const hasBadge = (badgeId) => {
    return user.badges && user.badges.some((b) => b.id === badgeId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 text-wm-text">
      
      {/* Profile Card Header */}
      <div className="relative overflow-hidden rounded-3xl border border-wm-border bg-wm-card p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={avatar}
            alt=""
            className="h-28 w-28 rounded-2xl object-cover border border-wm-border bg-wm-bg shadow-sm"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-wm-texth">@{user.username}</h2>
              {user.role === "admin" && (
                <span className="self-center md:self-start rounded bg-wm-coral/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wm-coral border border-wm-coral/20">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-wm-text/50 mt-0.5">Email: {user.email}</p>
          </div>

          <p className="text-sm text-wm-text/80 leading-relaxed max-w-lg">
            {user.bio || "Belum menulis bio."}
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 rounded-xl border border-wm-border bg-wm-bg px-4 py-2 text-xs font-bold text-wm-text hover:text-wm-texth transition hover:bg-wm-card cursor-pointer shadow-sm"
            >
              <Edit3 size={14} />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleUpdateProfile} className="rounded-2xl border border-wm-border bg-wm-card p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-wm-texth">Edit Data Diri</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ImageInputPicker
                    value={avatar}
                    onChange={(val) => setAvatar(val)}
                    placeholder="Masukkan URL avatar atau upload..."
                    label="Foto Avatar Pengguna"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`)}
                      className="text-[10px] font-bold text-wm-accent hover:underline cursor-pointer"
                    >
                      Gunakan Random Avatar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Bio Singkat</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tulis bio tentang dirimu..."
                    className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-mint transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-xl border border-wm-border bg-wm-bg px-4 py-2.5 text-xs font-bold text-wm-text hover:bg-wm-card hover:text-wm-texth cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-wm-coral px-5 py-2.5 text-xs font-bold text-white hover:bg-wm-coral/90 cursor-pointer shadow shadow-wm-coral/10 disabled:opacity-50 transition"
                >
                  {saving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-wm-border bg-wm-card p-5 text-center shadow-sm">
          <BookOpen className="text-wm-coral mx-auto mb-2" size={20} />
          <h4 className="text-lg font-black text-wm-texth">{user.watchlist_count || 0}</h4>
          <p className="text-[10px] text-wm-text/50 uppercase font-bold tracking-wider mt-1">Watchlist</p>
        </div>
        <div className="rounded-2xl border border-wm-border bg-wm-card p-5 text-center shadow-sm">
          <MessageSquare className="text-wm-mint mx-auto mb-2" size={20} />
          <h4 className="text-lg font-black text-wm-texth">{user.reviews_count || 0}</h4>
          <p className="text-[10px] text-wm-text/50 uppercase font-bold tracking-wider mt-1">Review</p>
        </div>
        <div className="rounded-2xl border border-wm-border bg-wm-card p-5 text-center shadow-sm">
          <Award className="text-wm-yellow mx-auto mb-2" size={20} />
          <h4 className="text-lg font-black text-wm-texth">{user.badges ? user.badges.length : 0}</h4>
          <p className="text-[10px] text-wm-text/50 uppercase font-bold tracking-wider mt-1">Lencana</p>
        </div>
      </div>

      {/* Badge Showcase Collection */}
      <div className="space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2 border-b border-wm-border/50 pb-3 text-wm-texth">
          <Award className="text-wm-mint" size={20} />
          <span> Koleksi Lencana (Badge Collection)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPossibleBadges.map((badge) => {
            const earned = hasBadge(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative overflow-hidden rounded-2xl border p-5 flex items-center gap-4 transition-all duration-300 ${
                  earned
                    ? "border-wm-mint/20 bg-wm-mint/5 text-wm-texth shadow-sm"
                    : "border-wm-border bg-wm-card/10 text-wm-text/40 opacity-60"
                }`}
              >
                {/* Badge Status Icon */}
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl transition ${
                  earned ? "bg-wm-mint/15" : "bg-wm-bg border border-wm-border/50 filter grayscale"
                }`}>
                  {badge.name.split(" ")[0]} {/* Gets emoji */}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-wm-texth leading-none">
                      {badge.name.split(" ").slice(1).join(" ")} {/* Gets badge title */}
                    </h4>
                    {earned && (
                      <span className="rounded bg-wm-mint/10 border border-wm-mint/20 px-1.5 py-0.5 text-[8px] font-bold text-wm-mint uppercase tracking-widest flex items-center gap-0.5">
                        <Check size={8} /> Earned
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-wm-text/65 mt-2 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}