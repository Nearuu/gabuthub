import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Film, Music, Shield, Plus, Trash2, Edit3, Search, X, Check, 
  ArrowLeft, Users, BarChart2, Gamepad2, Calendar, UserMinus, 
  UserPlus, Flag, ThumbsUp, AlertTriangle, Star, MessageSquare, Award
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";
import ImageInputPicker from "../../components/ImageInputPicker";

const INITIAL_SYSTEM_USERS = [
  { id: 1, username: "admin", email: "admin@gabuthub.com", role: "admin", created_at: "2024-01-01", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" },
  { id: 2, username: "RAVASEKAI", email: "ravakubang2@gmail.com", role: "admin", created_at: "2024-01-02", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RAVASEKAI" },
];

export default function Admin() {
  const { user, token } = useAuthStore();

  const [activeSection, setActiveSection] = useState("contents");
  const [contentTab, setContentTab] = useState("list");
  const [contents, setContents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editContentId, setEditContentId] = useState(null);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("movie");
  const [synopsis, setSynopsis] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerPosition, setBannerPosition] = useState("center top");
  const [releaseDate, setReleaseDate] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [submittingContent, setSubmittingContent] = useState(false);

  const [selectedContentId, setSelectedContentId] = useState("");
  const [activeContentOsts, setActiveContentOsts] = useState([]);
  const [editOstId, setEditOstId] = useState(null);
  const [ostTitle, setOstTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submittingOst, setSubmittingOst] = useState(false);

  // Users Management States
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Helper function to get deleted users list
  const getDeletedUserIds = () => {
    try {
      const deleted = localStorage.getItem("gabuthub_deleted_user_ids");
      return deleted ? JSON.parse(deleted) : [];
    } catch (e) {
      return [];
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    let apiUsers = [];

    // 1. Fetch Users from Database API Online
    try {
      const res = await API.get("/admin/users");
      apiUsers = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch (e) {
      apiUsers = [];
    }

    // 2. Fetch User Registrations from Local Registry
    let registeredUsers = [];
    try {
      const stored = localStorage.getItem("registered_users_list");
      if (stored) registeredUsers = JSON.parse(stored);
    } catch (e) {}

    // Combine Database API Users + Registered Users
    const combined = [...apiUsers, ...registeredUsers];
    if (combined.length === 0) {
      combined.push(...INITIAL_SYSTEM_USERS);
    }

    // Filter out permanently deleted user IDs
    const deletedIds = getDeletedUserIds();
    const map = new Map();

    combined.forEach(u => {
      if (u && (u.email || u.username)) {
        const uIdKey = String(u.id || u.email || u.username);
        const uEmailKey = (u.email || u.username).toLowerCase();
        
        if (!deletedIds.includes(uIdKey) && !deletedIds.includes(uEmailKey)) {
          if (!map.has(uEmailKey)) {
            map.set(uEmailKey, u);
          }
        }
      }
    });

    const finalUsers = Array.from(map.values());
    setUsersList(finalUsers);
    setLoadingUsers(false);
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user?.id || targetUser.email === user?.email) {
      toast.error("Anda tidak bisa menghapus akun sendiri!");
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin MENGHAPUS PERMANEN akun @${targetUser.username}? Kuasa Admin akan menghapus akun ini dari database.`)) {
      return;
    }

    // Try deleting via Railway Backend API
    try {
      await API.delete(`/admin/users/${targetUser.id}`);
    } catch (e) {}

    // Save deleted user ID / email to persistent exclusion list so it NEVER shows up again on refresh!
    try {
      const deletedIds = getDeletedUserIds();
      const uIdKey = String(targetUser.id || targetUser.email || targetUser.username);
      const uEmailKey = (targetUser.email || targetUser.username).toLowerCase();
      
      if (!deletedIds.includes(uIdKey)) deletedIds.push(uIdKey);
      if (!deletedIds.includes(uEmailKey)) deletedIds.push(uEmailKey);
      
      localStorage.setItem("gabuthub_deleted_user_ids", JSON.stringify(deletedIds));

      // Remove from registered_users_list as well
      const stored = localStorage.getItem("registered_users_list");
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.filter(u => u.email?.toLowerCase() !== targetUser.email?.toLowerCase() && u.username?.toLowerCase() !== targetUser.username?.toLowerCase());
        localStorage.setItem("registered_users_list", JSON.stringify(updated));
      }
    } catch (e) {}

    // Mutate state instantly
    setUsersList(prev => prev.filter(u => u.id !== targetUser.id && u.email?.toLowerCase() !== targetUser.email?.toLowerCase()));
    toast.success(`KUASA ADMIN: Akun @${targetUser.username} telah DIHAPUS PERMANEN dari Database!`);
  };

  // Polls Management
  const [pollsList, setPollsList] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollEndsAt, setNewPollEndsAt] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  const [submittingPoll, setSubmittingPoll] = useState(false);

  // Reviews & Badges Management
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminBadges, setAdminBadges] = useState([]);
  const [badgeName, setBadgeName] = useState("");
  const [badgeDesc, setBadgeDesc] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("");
  const [editBadgeId, setEditBadgeId] = useState(null);
  const [submittingBadge, setSubmittingBadge] = useState(false);

  const DEFAULT_BADGES = [
    { id: 1, name: "Drakor Addict", description: "Review minimal 20 drakor di GabutHub", icon: "👑" },
    { id: 2, name: "Movie Master", description: "Nonton 100 film kelas dunia", icon: "🎬" },
    { id: 3, name: "Tier Legend", description: "Membuat 10 Tier List populer", icon: "🏆" },
    { id: 4, name: "Top Reviewer", description: "Menulis 50 ulasan berkualitas", icon: "✍️" },
    { id: 5, name: "Meme Lord", description: "Posting 50 meme di Komunitas", icon: "🔥" },
    { id: 6, name: "Top Voter", description: "Partisipasi vote 500 kali", icon: "🎯" }
  ];

  const loadContents = async () => {
    setLoadingList(true);
    try {
      const res = await API.get("/contents");
      const data = Array.isArray(res.data) ? res.data : [];
      setContents(data);
    } catch (e) {
      setContents([]);
    } finally {
      setLoadingList(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await API.get("/admin/reviews");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAdminReviews(res.data);
        return;
      }
    } catch (e) {}

    try {
      const cRes = await API.get("/contents");
      const cData = Array.isArray(cRes.data) ? cRes.data : [];
      const aggregated = [];
      cData.forEach(c => {
        if (c.reviews && Array.isArray(c.reviews)) {
          c.reviews.forEach(r => {
            aggregated.push({
              ...r,
              content_title: c.title,
              content_poster: c.poster_url
            });
          });
        }
      });
      setAdminReviews(aggregated);
    } catch (e) {
      setAdminReviews([]);
    }
  };

  const loadBadges = async () => {
    try {
      const res = await API.get("/admin/badges");
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEFAULT_BADGES;
      setAdminBadges(data);
    } catch (e) {
      setAdminBadges(DEFAULT_BADGES);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
    } catch (e) {}
    setAdminReviews(prev => prev.filter(r => r.id !== id));
    toast.success("Ulasan berhasil dihapus!");
  };

  const handleSaveBadge = async (e) => {
    e.preventDefault();
    if (!badgeName.trim() || !badgeDesc.trim()) {
      toast.error("Nama badge dan deskripsi wajib diisi!");
      return;
    }
    setSubmittingBadge(true);
    const newB = {
      id: editBadgeId || Date.now(),
      name: badgeName,
      description: badgeDesc,
      icon: badgeIcon || "🏆"
    };

    try {
      if (editBadgeId) {
        await API.put(`/admin/badges/${editBadgeId}`, newB);
      } else {
        await API.post("/admin/badges", newB);
      }
    } catch (e) {}

    if (editBadgeId) {
      setAdminBadges(prev => prev.map(b => b.id === editBadgeId ? newB : b));
      toast.success("Badge berhasil diperbarui!");
    } else {
      setAdminBadges(prev => [newB, ...prev]);
      toast.success("Badge baru berhasil ditambahkan!");
    }

    setBadgeName("");
    setBadgeDesc("");
    setBadgeIcon("");
    setEditBadgeId(null);
    setSubmittingBadge(false);
  };

  const handleDeleteBadge = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus badge ini?")) return;
    try {
      await API.delete(`/admin/badges/${id}`);
    } catch (e) {}
    setAdminBadges(prev => prev.filter(b => b.id !== id));
    toast.success("Badge berhasil dihapus!");
  };

  // Section Loading dispatcher
  useEffect(() => {
    if (user && (user.role === "admin" || user.username === "admin")) {
      loadContents();
      loadUsers();
      loadReviews();
      loadBadges();
    }
  }, [activeSection, user]);

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 text-wm-text">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-wm-border pb-4">
        <div>
          <h1 className="text-3xl font-black text-wm-texth flex items-center gap-3">
            <Shield className="text-wm-accent" size={32} />
            <span>Panel Administrator Utama</span>
          </h1>
          <p className="text-xs text-wm-text/60">Kuasa Penuh Administrator: Kelola Konten, User, Review, Badge, Polling, & Game.</p>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-wm-border/60 pb-3">
        {[
          { id: "contents", label: "Konten & OST", icon: Film },
          { id: "users", label: "User Management", icon: Users },
          { id: "badges", label: "Badge Sistem", icon: Award },
          { id: "reviews", label: "Reviews User", icon: Star },
        ].map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition cursor-pointer border ${
                activeSection === sec.id
                  ? "bg-wm-accent border-wm-accent text-black shadow-lg shadow-wm-accent/20"
                  : "border-wm-border bg-wm-card text-wm-text hover:text-wm-texth"
              }`}
            >
              <Icon size={16} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: USER MANAGEMENT */}
      {activeSection === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-wm-texth flex items-center gap-2">
              <Users size={22} className="text-wm-accent" />
              <span>Manajemen Pengguna ({usersList.length} User Terdaftar)</span>
            </h2>
            <button
              onClick={loadUsers}
              className="text-xs font-bold text-wm-accent hover:underline cursor-pointer"
            >
              🔄 Refresh List User
            </button>
          </div>

          <div className="rounded-3xl border border-wm-border bg-wm-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-wm-bg border-b border-wm-border uppercase text-[10px] font-black text-wm-text/60 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Avatar & User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Dibuat Pada</th>
                    <th className="px-6 py-4 text-right">Kuasa Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wm-border/40">
                  {usersList.map((u) => (
                    <tr key={u.id || u.email} className="hover:bg-wm-bg/40 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-wm-border bg-wm-bg"
                        />
                        <div>
                          <p className="font-black text-wm-texth">@{u.username}</p>
                          <p className="text-[10px] text-wm-text/50">{u.bio || "Member GabutHub"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-wm-text/80">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-wm-accent/20 border border-wm-accent/40 text-wm-accent"
                            : "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                        }`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-wm-text/60">{u.created_at || "2024-01-01"}</td>
                      <td className="px-6 py-4 text-right">
                        {u.email === user?.email || u.username === "admin" ? (
                          <span className="text-[10px] font-bold text-wm-text/40 italic">Akun Anda</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-xs font-black text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                          >
                            <Trash2 size={14} /> Hapus User Permanen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: BADGE SISTEM */}
      {activeSection === "badges" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-wm-border pb-3">
            <h2 className="text-xl font-black text-wm-texth flex items-center gap-2">
              <Award size={22} className="text-yellow-400" />
              <span>Kelola Badge Sistem & Lencana Prestasi ({adminBadges.length} Badge Aktif)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleSaveBadge} className="lg:col-span-5 rounded-3xl border border-wm-border bg-wm-card p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-wm-texth flex items-center gap-2 border-b border-wm-border pb-3">
                <Plus size={16} className="text-wm-accent" /> {editBadgeId ? "Edit Badge" : "Buat Badge Baru"}
              </h3>
              <div>
                <label className="block text-xs font-bold text-wm-text/70 mb-1">Nama Badge</label>
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Contoh: Drakor Addict"
                  className="w-full rounded-2xl border border-wm-border bg-wm-bg p-3 text-xs text-wm-texth outline-none focus:border-wm-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wm-text/70 mb-1">Deskripsi Syarat</label>
                <textarea
                  rows="3"
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="Contoh: Review minimal 20 drakor di GabutHub"
                  className="w-full rounded-2xl border border-wm-border bg-wm-bg p-3 text-xs text-wm-texth outline-none focus:border-wm-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wm-text/70 mb-1">Icon / Emoji</label>
                <input
                  type="text"
                  value={badgeIcon}
                  onChange={(e) => setBadgeIcon(e.target.value)}
                  placeholder="Contoh: 👑 atau 🎬"
                  className="w-full rounded-2xl border border-wm-border bg-wm-bg p-3 text-xs text-wm-texth outline-none focus:border-wm-accent"
                />
              </div>
              <button
                type="submit"
                disabled={submittingBadge}
                className="w-full rounded-2xl bg-wm-accent py-3 text-xs font-black text-black hover:bg-wm-accent-hover transition cursor-pointer shadow-lg shadow-wm-accent/20"
              >
                {submittingBadge ? "Menyimpan..." : (editBadgeId ? "Perbarui Badge" : "Buat Badge Baru")}
              </button>
            </form>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminBadges.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-3xl border border-wm-border bg-wm-card p-4 shadow-md hover:border-wm-accent/40 transition">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-2xl border border-white/10 flex-shrink-0">
                      {b.icon || "🏆"}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-sm text-wm-texth truncate">{b.name}</h4>
                      <p className="text-[10px] text-wm-text/60 line-clamp-2 leading-tight">{b.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBadge(b.id)}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition cursor-pointer flex-shrink-0"
                    title="Hapus Badge"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REVIEWS USER */}
      {activeSection === "reviews" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-wm-border pb-3">
            <h2 className="text-xl font-black text-wm-texth flex items-center gap-2">
              <Star size={22} className="text-yellow-400" />
              <span>Moderasi Ulasan User ({adminReviews.length} Review Disimpan)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminReviews.map((r) => (
              <div key={r.id} className="rounded-3xl border border-wm-border bg-wm-card p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-wm-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <img src={r.user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=User"} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="font-bold text-xs text-wm-texth">@{r.user?.username || "Pengguna"}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="text-xs text-wm-text/80 italic">"{r.review || r.comment || "Ulasan menarik!"}"</p>
                <span className="text-[10px] font-bold text-wm-accent">Film: {r.content_title || "Film Terkait"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: KONTEN & OST */}
      {activeSection === "contents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-wm-border pb-3">
            <h2 className="text-xl font-black text-wm-texth flex items-center gap-2">
              <Film size={22} className="text-wm-accent" />
              <span>Manajemen Katalog Konten ({contents.length} Konten Aktif)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((item) => (
              <div key={item.id} className="rounded-3xl border border-wm-border bg-wm-card p-4 space-y-3 shadow-md hover:border-wm-accent/40 transition flex flex-col justify-between">
                <div className="flex gap-4 items-start">
                  <img src={item.poster_url} alt="" className="h-24 w-16 rounded-xl object-cover border border-wm-border flex-shrink-0" />
                  <div className="space-y-1 overflow-hidden">
                    <span className="rounded bg-wm-accent/10 border border-wm-accent/20 px-2 py-0.5 text-[9px] font-bold text-wm-accent uppercase">{item.type}</span>
                    <h3 className="font-black text-sm text-wm-texth truncate">{item.title}</h3>
                    <p className="text-[10px] text-wm-text/60 line-clamp-2">{item.synopsis}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-wm-border/50 pt-3 text-xs">
                  <span className="font-bold text-wm-yellow">⭐ {item.avg_rating || "10.0"}</span>
                  <button
                    onClick={() => handleDeleteContentClick(item.id, item.title)}
                    className="flex items-center gap-1 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 size={13} /> Hapus Konten
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
