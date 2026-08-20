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

const STANDARD_GENRES = [
  { id: 1, name: "Action" },
  { id: 2, name: "Romance" },
  { id: 3, name: "Comedy" },
  { id: 4, name: "Fantasy" },
  { id: 5, name: "Thriller" },
  { id: 6, name: "Slice of Life" },
  { id: 7, name: "Drama" },
  { id: 8, name: "Sci-Fi" },
  { id: 9, name: "Mystery" }
];

export default function Admin() {
  const { user, token } = useAuthStore();

  // Navigation Panel sections: 'contents' | 'users' | 'polls' | 'games'
  const [activeSection, setActiveSection] = useState("contents");

  // Tab inner states for Contents
  const [contentTab, setContentTab] = useState("list"); // 'list' | 'form' | 'osts'
  const [contents, setContents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form Content (Create / Edit)
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

  // OST Management States
  const [selectedContentId, setSelectedContentId] = useState("");
  const [activeContentOsts, setActiveContentOsts] = useState([]);
  const [editOstId, setEditOstId] = useState(null);
  const [ostTitle, setOstTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submittingOst, setSubmittingOst] = useState(false);

  //  Users Management States
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  //  Polls/Voting Management States
  const [pollsList, setPollsList] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollEndsAt, setNewPollEndsAt] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]); // Default 2 options
  const [submittingPoll, setSubmittingPoll] = useState(false);

  //  Game Prompts & Settings States
  const [gameTab, setGameTab] = useState("hottakes"); // 'hottakes' | 'characters' | 'settings'
  const [gameSeconds, setGameSeconds] = useState(15);
  const [gameCount, setGameCount] = useState(10);
  const [loadingGameSettings, setLoadingGameSettings] = useState(false);
  const [savingGameSettings, setSavingGameSettings] = useState(false);

  const loadGameSettings = async () => {
    setLoadingGameSettings(true);
    try {
      const res = await API.get("/admin/games/settings");
      setGameSeconds(res.data.guess_ost_seconds || 15);
      setGameCount(res.data.guess_ost_count || 10);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGameSettings(false);
    }
  };

  const handleSaveGameSettings = async (e) => {
    e.preventDefault();
    setSavingGameSettings(true);
    try {
      await API.post("/admin/games/settings", {
        guess_ost_seconds: gameSeconds,
        guess_ost_count: gameCount
      });
      toast.success("Pengaturan Game Tebak Lagu berhasil disimpan!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan pengaturan game!");
    } finally {
      setSavingGameSettings(false);
    }
  };
  const [hotTakes, setHotTakes] = useState([]);
  const [loadingTakes, setLoadingTakes] = useState(false);
  const [editTakeId, setEditTakeId] = useState(null);
  const [takeText, setTakeText] = useState("");
  const [takeCategory, setTakeCategory] = useState("Drakor");
  const [submittingTake, setSubmittingTake] = useState(false);

  const [flagChars, setFlagChars] = useState([]);
  const [loadingChars, setLoadingChars] = useState(false);
  const [editCharId, setEditCharId] = useState(null);
  const [charName, setCharName] = useState("");
  const [charSeries, setCharSeries] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [charAvatar, setCharAvatar] = useState("");
  const [submittingChar, setSubmittingChar] = useState(false);

  // GLOBAL FETCHERS
  const loadContents = async () => {
    setLoadingList(true);
    try {
      const res = await API.get("/contents");
      const data = Array.isArray(res.data) ? res.data : [];
      setContents(data);
      if (data.length > 0 && !selectedContentId) {
        const firstId = data[0].id.toString();
        setSelectedContentId(firstId);
        loadOstsForSelectedContent(firstId);
      } else if (selectedContentId) {
        loadOstsForSelectedContent(selectedContentId);
      }
    } catch (e) {
      console.error(e);
      setContents([]);
    } finally {
      setLoadingList(false);
    }
  };

  const loadOstsForSelectedContent = async (contentId) => {
    if (!contentId) return;
    try {
      const res = await API.get(`/contents/${contentId}`);
      setActiveContentOsts(Array.isArray(res.data?.osts) ? res.data.osts : []);
    } catch (e) {
      console.error(e);
      setActiveContentOsts([]);
    }
  };

  useEffect(() => {
    if (selectedContentId) {
      loadOstsForSelectedContent(selectedContentId);
    }
  }, [selectedContentId]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await API.get("/admin/users");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setUsersList(data);
    } catch (e) {
      console.error("Failed to load admin users from database:", e);
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPolls = async () => {
    setLoadingPolls(true);
    try {
      const res = await API.get("/polls");
      setPollsList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setPollsList([]);
    } finally {
      setLoadingPolls(false);
    }
  };

  const loadHotTakes = async () => {
    setLoadingTakes(true);
    try {
      const res = await API.get("/hot-takes");
      setHotTakes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setHotTakes([]);
    } finally {
      setLoadingTakes(false);
    }
  };

  const loadFlagChars = async () => {
    setLoadingChars(true);
    try {
      const res = await API.get("/flag-characters");
      setFlagChars(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setFlagChars([]);
    } finally {
      setLoadingChars(false);
    }
  };

  // Community & Tier List Management States
  const [adminPosts, setAdminPosts] = useState([]);
  const [adminTierLists, setAdminTierLists] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const loadCommunityData = async () => {
    setLoadingCommunity(true);
    try {
      const [postsRes, tiersRes] = await Promise.all([
        API.get("/posts"),
        API.get("/tier-lists"),
      ]);
      setAdminPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setAdminTierLists(Array.isArray(tiersRes.data) ? tiersRes.data : []);
    } catch (e) {
      console.error(e);
      setAdminPosts([]);
      setAdminTierLists([]);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan komunitas ini?")) return;
    try {
      const res = await API.delete(`/admin/posts/${id}`);
      toast.success(res.data.message);
      loadCommunityData();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus postingan");
    }
  };

  const handleDeleteTierList = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Tier List ini?")) return;
    try {
      const res = await API.delete(`/admin/tier-lists/${id}`);
      toast.success(res.data.message);
      loadCommunityData();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus Tier List");
    }
  };

  const DEFAULT_BADGES = [
    { id: 1, name: "Drakor Addict", description: "Review minimal 20 drakor di GabutHub", icon: "👑" },
    { id: 2, name: "Movie Master", description: "Nonton 100 film kelas dunia", icon: "🎬" },
    { id: 3, name: "Tier Legend", description: "Membuat 10 Tier List populer", icon: "🏆" },
    { id: 4, name: "Top Reviewer", description: "Menulis 50 ulasan berkualitas", icon: "✍️" },
    { id: 5, name: "Meme Lord", description: "Posting 50 meme di Komunitas", icon: "🔥" },
    { id: 6, name: "Top Voter", description: "Partisipasi vote 500 kali", icon: "🎯" }
  ];

  const loadReviews = async () => {
    try {
      const res = await API.get("/admin/reviews");
      setAdminReviews(Array.isArray(res.data) && res.data.length > 0 ? res.data : []);
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

  // Super Admin Stats & Genre States
  const [adminStats, setAdminStats] = useState(null);
  const [newGenreName, setNewGenreName] = useState("");

  const loadAdminStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      if (res.data) {
        setAdminStats(res.data);
        return;
      }
    } catch (e) {}

    try {
      const [contentsRes, usersRes, postsRes] = await Promise.all([
        API.get("/contents"),
        API.get("/admin/users").catch(() => ({ data: [] })),
        API.get("/posts").catch(() => ({ data: [] }))
      ]);

      const contentsData = Array.isArray(contentsRes.data) ? contentsRes.data : [];
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const postsData = Array.isArray(postsRes.data) ? postsRes.data : [];

      let reviewCount = 0;
      contentsData.forEach(c => {
        if (c.reviews && Array.isArray(c.reviews)) {
          reviewCount += c.reviews.length;
        }
      });

      setAdminStats({
        total_contents: contentsData.length,
        total_users: usersData.length,
        total_reviews: reviewCount,
        total_posts: postsData.length
      });
    } catch (err) {
      setAdminStats({
        total_contents: 0,
        total_users: 0,
        total_reviews: 0,
        total_posts: 0
      });
    }
  };

  const handleToggleBanUser = async (userId) => {
    try {
      const res = await API.post(`/admin/users/${userId}/ban`);
      toast.success(res.data.message);
      loadUsers();
    } catch (e) {
      console.error(e);
      toast.error("Gagal mengubah status pembekuan akun");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;
    try {
      const res = await API.delete(`/admin/comments/${commentId}`);
      toast.success(res.data.message);
      loadCommunityData();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus komentar");
    }
  };

  // Section Loading dispatcher
  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminStats();
      if (activeSection === "contents") {
        loadContents();
      } else if (activeSection === "community") {
        loadCommunityData();
      } else if (activeSection === "reviews") {
        loadReviews();
      } else if (activeSection === "badges") {
        loadBadges();
      } else if (activeSection === "users") {
        loadUsers();
      } else if (activeSection === "polls") {
        loadPolls();
      } else if (activeSection === "games") {
        loadHotTakes();
        loadFlagChars();
        loadGameSettings();
      }
    }
  }, [activeSection, user]);

  useEffect(() => {
    if (selectedContentId) {
      loadOstsForSelectedContent(selectedContentId);
    }
  }, [selectedContentId]);

  // 1.  CONTENT CRUD HANDLERS
  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim() || !posterUrl.trim() || !releaseDate) {
      toast.error("Semua field wajib diisi!");
      return;
    }
    if (selectedGenres.length === 0) {
      toast.error("Pilih minimal satu genre!");
      return;
    }

    setSubmittingContent(true);
    try {
      if (editContentId) {
        await API.put(`/contents/${editContentId}`, {
          title,
          type: contentType,
          synopsis,
          poster_url: posterUrl,
          banner_url: bannerUrl || null,
          banner_position: bannerPosition || "center top",
          release_date: releaseDate,
          genre_ids: selectedGenres
        });
        toast.success("Konten berhasil diperbarui!");
      } else {
        await API.post("/contents", {
          title,
          type: contentType,
          synopsis,
          poster_url: posterUrl,
          banner_url: bannerUrl || null,
          banner_position: bannerPosition || "center top",
          release_date: releaseDate,
          genre_ids: selectedGenres
        });
        toast.success("Konten berhasil ditambahkan!");
      }
      resetContentForm();
      loadContents();
      setContentTab("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan konten");
    } finally {
      setSubmittingContent(false);
    }
  };

  const handleEditContentClick = (item) => {
    setEditContentId(item.id);
    setTitle(item.title);
    setContentType(item.type);
    setSynopsis(item.synopsis);
    setPosterUrl(item.poster_url);
    setBannerUrl(item.banner_url || "");
    setBannerPosition(item.banner_position || "center top");
    setReleaseDate(item.release_date || "");
    setSelectedGenres(item.genres ? item.genres.map(g => g.id) : []);
    setContentTab("form");
  };

  const handleSetFeaturedClick = async (contentId, contentTitle) => {
    try {
      await API.post(`/contents/${contentId}/featured`);
      toast.success(`"${contentTitle}" berhasil dijadikan Banner Utama Home! `);
      loadContents();
    } catch (err) {
      toast.error("Gagal menjadikan Banner Utama");
    }
  };

  const handleDeleteContentClick = async (contentId, contentTitle) => {
    if (!window.confirm(`Hapus konten "${contentTitle}"? Seluruh review & OST terkait akan ikut terhapus.`)) return;
    try {
      await API.delete(`/contents/${contentId}`);
      toast.success("Konten berhasil dihapus!");
      loadContents();
    } catch (err) {
      toast.error("Gagal menghapus konten");
    }
  };

  const resetContentForm = () => {
    setEditContentId(null);
    setTitle("");
    setContentType("movie");
    setSynopsis("");
    setPosterUrl("");
    setBannerUrl("");
    setBannerPosition("center top");
    setReleaseDate("");
    setSelectedGenres([]);
  };

  // OST CRUD HANDLERS
  const handleSaveOst = async (e) => {
    e.preventDefault();
    if (!selectedContentId || !ostTitle.trim() || !artist.trim()) {
      toast.error("Lengkapi judul dan penyanyi!");
      return;
    }
    setSubmittingOst(true);
    try {
      if (editOstId) {
        await API.put(`/osts/${editOstId}`, { title: ostTitle, artist, preview_url: previewUrl || null });
        toast.success("OST diperbarui!");
      } else {
        await API.post(`/contents/${selectedContentId}/osts`, { title: ostTitle, artist, preview_url: previewUrl || null });
        toast.success("OST ditambahkan!");
      }
      resetOstForm();
      loadOstsForSelectedContent(selectedContentId);
    } catch (err) {
      toast.error("Gagal menyimpan OST");
    } finally {
      setSubmittingOst(false);
    }
  };

  const handleEditOstClick = (ost) => {
    setEditOstId(ost.id);
    setOstTitle(ost.title);
    setArtist(ost.artist);
    setPreviewUrl(ost.preview_url || "");
  };

  const handleDeleteOstClick = async (ostId) => {
    if (!window.confirm("Hapus OST ini?")) return;
    try {
      await API.delete(`/osts/${ostId}`);
      toast.success("OST dihapus!");
      loadOstsForSelectedContent(selectedContentId);
    } catch (e) {
      toast.error("Gagal menghapus OST");
    }
  };

  const resetOstForm = () => {
    setEditOstId(null);
    setOstTitle("");
    setArtist("");
    setPreviewUrl("");
  };

  // 2.  USER CRUD HANDLERS
  const handleToggleUserRole = async (targetUser) => {
    if (targetUser.id === user.id) {
      toast.error("Anda tidak bisa mengubah role akun sendiri!");
      return;
    }
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    try {
      await API.put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      toast.success(`Role @${targetUser.username} berhasil diubah ke ${newRole.toUpperCase()}!`);
      loadUsers();
    } catch (e) {
      toast.error("Gagal memperbarui role");
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user.id) {
      toast.error("Anda tidak bisa menghapus akun sendiri!");
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus/banned akun @${targetUser.username}? Semua interaksi pengguna akan dihapus permanen.`)) {
      return;
    }
    try {
      await API.delete(`/admin/users/${targetUser.id}`);
    } catch (e) {}

    setUsersList(prev => prev.filter(u => u.id !== targetUser.id && u.username !== targetUser.username));
    toast.success(`Akun @${targetUser.username} berhasil dihapus.`);
  };

  // 3.  POLLS CRUD HANDLERS
  const handleAddPollOptionField = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const handleRemovePollOptionField = (index) => {
    if (newPollOptions.length <= 2) {
      toast.error("Voting wajib memiliki minimal 2 pilihan!");
      return;
    }
    setNewPollOptions(newPollOptions.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (value, index) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPollTitle.trim() || !newPollEndsAt) {
      toast.error("Judul dan Tanggal Berakhir wajib diisi!");
      return;
    }
    const validOptions = newPollOptions.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Tulis minimal 2 pilihan jawaban!");
      return;
    }

    setSubmittingPoll(true);
    try {
      await API.post("/polls", {
        title: newPollTitle,
        description: newPollDesc,
        ends_at: newPollEndsAt,
        options: validOptions
      });
      toast.success("Voting baru berhasil dipublikasi!");
      setNewPollTitle("");
      setNewPollDesc("");
      setNewPollEndsAt("");
      setNewPollOptions(["", ""]);
      loadPolls();
    } catch (e) {
      toast.error("Gagal membuat voting baru");
    } finally {
      setSubmittingPoll(false);
    }
  };

  const handleDeletePoll = async (pollId, pollTitle) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus voting "${pollTitle}"?`)) return;
    try {
      await API.delete(`/polls/${pollId}`);
      toast.success("Voting dihapus!");
      loadPolls();
    } catch (e) {
      toast.error("Gagal menghapus voting");
    }
  };

  // 4.  GAME PROMPTS CRUD HANDLERS (Hot Takes & Flags)
  const handleSaveHotTake = async (e) => {
    e.preventDefault();
    if (!takeText.trim()) return;
    setSubmittingTake(true);
    try {
      if (editTakeId) {
        await API.put(`/hot-takes/${editTakeId}`, { text: takeText, category: takeCategory });
        toast.success("Hot Take diperbarui!");
      } else {
        await API.post("/hot-takes", { text: takeText, category: takeCategory });
        toast.success("Hot Take baru ditambahkan!");
      }
      setTakeText("");
      setEditTakeId(null);
      loadHotTakes();
    } catch (e) {
      toast.error("Gagal menyimpan Hot Take");
    } finally {
      setSubmittingTake(false);
    }
  };

  const handleDeleteHotTake = async (id) => {
    if (!window.confirm("Hapus prompt Hot Take ini?")) return;
    try {
      await API.delete(`/hot-takes/${id}`);
      toast.success("Hot Take dihapus!");
      loadHotTakes();
    } catch (e) {
      toast.error("Gagal menghapus Hot Take");
    }
  };

  const handleSaveFlagChar = async (e) => {
    e.preventDefault();
    if (!charName.trim() || !charSeries.trim() || !charDesc.trim() || !charAvatar.trim()) {
      toast.error("Lengkapi semua field!");
      return;
    }
    setSubmittingChar(true);
    try {
      const payload = { name: charName, series: charSeries, description: charDesc, avatar: charAvatar };
      if (editCharId) {
        await API.put(`/flag-characters/${editCharId}`, payload);
        toast.success("Karakter diperbarui!");
      } else {
        await API.post("/flag-characters", payload);
        toast.success("Karakter baru ditambahkan!");
      }
      setCharName("");
      setCharSeries("");
      setCharDesc("");
      setCharAvatar("");
      setEditCharId(null);
      loadFlagChars();
    } catch (e) {
      toast.error("Gagal menyimpan karakter");
    } finally {
      setSubmittingChar(false);
    }
  };

  const handleDeleteFlagChar = async (id) => {
    if (!window.confirm("Hapus karakter ini dari permainan?")) return;
    try {
      await API.delete(`/flag-characters/${id}`);
      toast.success("Karakter dihapus!");
      loadFlagChars();
    } catch (e) {
      toast.error("Gagal menghapus karakter");
    }
  };

  // Helper filters
  const filteredContents = contents.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Tab triggers
  const toggleGenre = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  // Shield Protection Guard
  if (!token || !user || user.role !== "admin") {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center px-6">
        <Shield size={64} className="text-wm-coral mb-4 animate-bounce" />
        <h2 className="text-xl font-black text-wm-texth">Akses Ditolak</h2>
        <p className="text-sm text-wm-text/60 mt-2 max-w-md">
          Halaman ini khusus untuk Administrator GabutHub.
        </p>
        <Link to="/" className="mt-6 rounded-xl bg-wm-coral px-6 py-2.5 text-xs font-bold text-white hover:bg-wm-coral/95 transition">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-wm-text">
      
      {/* 1. STATISTIK OVERVIEW CARDS (PALING ATAS) */}
      {adminStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-2xl border border-wm-border bg-wm-card p-4 space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-wm-text/50 uppercase tracking-wider">Total Konten</p>
            <p className="text-xl font-black text-wm-accent">{adminStats.total_contents || adminStats.total_drakors || 0}</p>
          </div>
          <div className="rounded-2xl border border-wm-border bg-wm-card p-4 space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-wm-text/50 uppercase tracking-wider">Total User</p>
            <p className="text-xl font-black text-wm-texth">{adminStats.total_users || 0}</p>
          </div>
          <div className="rounded-2xl border border-wm-border bg-wm-card p-4 space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-wm-text/50 uppercase tracking-wider">Total Review</p>
            <p className="text-xl font-black text-wm-yellow">{adminStats.total_reviews || 0}</p>
          </div>
          <div className="rounded-2xl border border-wm-border bg-wm-card p-4 space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-wm-text/50 uppercase tracking-wider">Post Komunitas</p>
            <p className="text-xl font-black text-wm-coral">{adminStats.total_posts || 0}</p>
          </div>
        </div>
      )}

      {/* 2. STICKY FLOATING ADMIN NAVIGATION BAR (TERBUNGKUS RAPI HANYA DI WORKSPACE, TIDAK MENUTUPI SIDEBAR KIRI) */}
      <div className="sticky top-16 z-30 bg-wm-card/95 backdrop-blur-xl border border-wm-border rounded-2xl p-2 shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-wm-border/60 flex-shrink-0">
            <Shield className="text-wm-coral animate-pulse" size={16} />
            <span className="text-xs font-black text-wm-texth uppercase tracking-wider hidden sm:inline">Admin</span>
          </div>

          <button
            onClick={() => setActiveSection("contents")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "contents"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <Film size={14} />
            <span>Konten & OST</span>
          </button>

          <button
            onClick={() => setActiveSection("community")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "community"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <MessageSquare size={14} />
            <span>Komunitas & Tier</span>
          </button>

          <button
            onClick={() => setActiveSection("reviews")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "reviews"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <Star size={14} />
            <span>Reviews User</span>
          </button>

          <button
            onClick={() => setActiveSection("badges")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "badges"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <Award size={14} />
            <span>Badge Sistem</span>
          </button>

          <button
            onClick={() => setActiveSection("users")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "users"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <Users size={14} />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveSection("polls")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "polls"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <BarChart2 size={14} />
            <span>Polling & Voting</span>
          </button>

          <button
            onClick={() => setActiveSection("games")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              activeSection === "games"
                ? "bg-wm-coral text-white shadow-sm shadow-wm-coral/30"
                : "bg-wm-bg border border-wm-border text-wm-text hover:text-wm-texth"
            }`}
          >
            <Gamepad2 size={14} />
            <span>Prompts Game</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE AREA */}
      <main className="space-y-6">
        {/* ======================= SECTION 1: CONTENTS & OSTS ======================= */}
        {activeSection === "contents" && (
          <div className="space-y-6">
            
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth flex items-center gap-2"><Film className="text-wm-coral" size={20} /> Kelola Konten & OST</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Publikasi, sunting, atau hapus film, anime, variety show, dan data musik.</p>
            </div>

            {/* Inner tab switcher */}
            <div className="flex border-b border-wm-border/40 gap-2 text-2xs font-bold">
              <button
                onClick={() => { setContentTab("list"); resetContentForm(); }}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  contentTab === "list" ? "border-wm-coral text-wm-coral" : "border-transparent text-wm-text/60"
                }`}
              >
                 Daftar Konten ({contents.length})
              </button>
              <button
                onClick={() => setContentTab("form")}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  contentTab === "form" ? "border-wm-coral text-wm-coral" : "border-transparent text-wm-text/60"
                }`}
              >
                {editContentId ? `️ Edit: ${title}` : " Tambah Konten Baru"}
              </button>
              <button
                onClick={() => setContentTab("osts")}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  contentTab === "osts" ? "border-wm-coral text-wm-coral" : "border-transparent text-wm-text/60"
                }`}
              >
                 Kelola OST ({activeContentOsts.length} OST)
              </button>
            </div>

            {/* TAB CONTENT: Contents List */}
            {contentTab === "list" && (
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wm-text/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan judul atau tipe..."
                    className="w-full rounded-xl border border-wm-border bg-wm-card py-2 pl-9 pr-4 text-2xs text-wm-texth outline-none focus:border-wm-mint transition"
                  />
                </div>

                <div className="rounded-2xl border border-wm-border bg-wm-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-2xs">
                      <thead>
                        <tr className="bg-wm-bg border-b border-wm-border/50 uppercase font-bold text-wm-text/60 tracking-wider">
                          <th className="px-5 py-3.5">Poster & Judul</th>
                          <th className="px-5 py-3.5">Tipe</th>
                          <th className="px-5 py-3.5">Rilis</th>
                          <th className="px-5 py-3.5">Genre</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wm-border/40">
                        {loadingList ? (
                          <tr>
                            <td colSpan="5" className="px-5 py-10 text-center text-wm-text/50">Memuat data...</td>
                          </tr>
                        ) : filteredContents.length > 0 ? (
                          filteredContents.map((item) => (
                            <tr key={item.id} className="hover:bg-wm-bg/15">
                              <td className="px-5 py-3 flex items-center gap-3">
                                <img src={item.poster_url} className="h-10 w-7 rounded object-cover border border-wm-border bg-wm-bg" />
                                <div>
                                  <p className="font-extrabold text-wm-texth text-xs">{item.title}</p>
                                  <p className="text-[10px] text-wm-text/50 line-clamp-1 max-w-xs">{item.synopsis}</p>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="rounded bg-wm-mint/10 border border-wm-mint/20 px-1.5 py-0.5 text-[8px] font-bold text-wm-mint capitalize">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-semibold text-wm-text/80">{item.release_date}</td>
                              <td className="px-5 py-3">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {item.genres?.map(g => (
                                    <span key={g.id} className="rounded bg-wm-bg border border-wm-border px-1 py-0.5 text-[9px] font-semibold">
                                      {g.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => handleSetFeaturedClick(item.id, item.title)}
                                  className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-bold cursor-pointer transition ${
                                    item.is_featured || item.is_featured === 1
                                      ? "bg-wm-accent text-black border-wm-accent shadow-sm"
                                      : "bg-wm-bg border-wm-border text-wm-text hover:text-wm-accent hover:border-wm-accent/40"
                                  }`}
                                  title="Tampilkan film ini sebagai Banner Utama di Home"
                                >
                                  <Star size={10} fill={item.is_featured || item.is_featured === 1 ? "currentColor" : "none"} />
                                  <span>{item.is_featured || item.is_featured === 1 ? "Banner Utama" : "Set Banner"}</span>
                                </button>
                                <button
                                  onClick={() => handleEditContentClick(item)}
                                  className="inline-flex items-center gap-1 rounded bg-wm-bg border border-wm-border px-2 py-1 font-bold text-wm-text hover:text-wm-texth cursor-pointer"
                                >
                                  <Edit3 size={10} />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteContentClick(item.id, item.title)}
                                  className="inline-flex items-center gap-1 rounded bg-wm-coral/10 border border-wm-coral/25 px-2 py-1 font-bold text-wm-coral hover:bg-wm-coral hover:text-white cursor-pointer"
                                >
                                  <Trash2 size={10} />
                                  <span>Hapus</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-5 py-8 text-center text-wm-text/40 italic">Tidak ada data.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Content Add/Edit Form */}
            {contentTab === "form" && (
              <div className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-wm-border/40 pb-2">
                  <h4 className="text-sm font-black text-wm-texth">{editContentId ? "Edit Konten" : "Tambah Konten Baru"}</h4>
                  {editContentId && (
                    <button onClick={resetContentForm} className="text-2xs font-bold text-wm-coral hover:underline">Batalkan Edit</button>
                  )}
                </div>

                <form onSubmit={handleSaveContent} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Judul Konten</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Twinkling Watermelon"
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-mint"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">URL Poster (3:4 Ratio)</label>
                    <input
                      type="text"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-mint"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">URL Hero Banner Khusus (Widescreen Landscape - Opsional)</label>
                      <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="Kosongkan jika ingin menggunakan poster utama"
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-mint"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Posisi Fokus Gambar Banner (Object Position)</label>
                      <select
                        value={bannerPosition}
                        onChange={(e) => setBannerPosition(e.target.value)}
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-mint font-semibold"
                      >
                        <option value="center top">Atas / Muka (Center Top)</option>
                        <option value="center center">Tengah (Center Center)</option>
                        <option value="center bottom">Bawah (Center Bottom)</option>
                        <option value="right top">Kanan Atas (Right Top)</option>
                        <option value="left top">Kiri Atas (Left Top)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Tipe</label>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-mint font-semibold"
                      >
                        <option value="movie">Movie / Film</option>
                        <option value="series">Series</option>
                        <option value="drakor">Drakor</option>
                        <option value="anime">Anime</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Tanggal Rilis</label>
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Sinopsis</label>
                    <textarea
                      rows="3"
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Tulis synopsis..."
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                      required
                    />
                  </div>

                  <div>
                    <ImageInputPicker
                      value={posterUrl}
                      onChange={(val) => setPosterUrl(val)}
                      placeholder="Masukkan URL poster atau upload..."
                      label="Poster Gambar Konten"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Pilih Genre</label>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_GENRES.map((g) => {
                        const selected = selectedGenres.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleGenre(g.id)}
                            className={`rounded-full px-3 py-1 text-2xs font-bold border transition ${
                              selected
                                ? "bg-wm-mint border-wm-mint text-white"
                                : "border-wm-border bg-wm-bg text-wm-text hover:bg-wm-card"
                            }`}
                          >
                            {g.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingContent}
                    className="w-full rounded-xl bg-wm-coral py-3 font-bold text-white shadow shadow-wm-coral/10 hover:bg-wm-coral/95 transition disabled:opacity-50"
                  >
                    {submittingContent ? "Menyimpan..." : editContentId ? "Perbarui Konten" : "Tambahkan Konten"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: OST Manager */}
            {contentTab === "osts" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1.5">Pilih Konten Target</label>
                    <select
                      value={selectedContentId}
                      onChange={(e) => setSelectedContentId(e.target.value)}
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-xs text-wm-texth outline-none"
                    >
                      {contents.map((item) => (
                        <option key={item.id} value={item.id}>
                          [{item.type.toUpperCase()}] {item.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-wm-border overflow-hidden bg-wm-bg/10 text-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-wm-bg border-b border-wm-border/40 font-bold text-wm-text/60">
                          <th className="px-4 py-2">Lagu OST</th>
                          <th className="px-4 py-2">Penyanyi</th>
                          <th className="px-4 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wm-border/30">
                        {activeContentOsts.length > 0 ? (
                          activeContentOsts.map((ost) => (
                            <tr key={ost.id} className="hover:bg-wm-bg/20">
                              <td className="px-4 py-2 font-bold text-wm-texth">{ost.title}</td>
                              <td className="px-4 py-2 text-wm-text/80">{ost.artist}</td>
                              <td className="px-4 py-2 text-right space-x-1">
                                <button onClick={() => handleEditOstClick(ost)} className="inline-flex rounded border border-wm-border bg-wm-bg p-1 text-wm-text hover:text-wm-texth">
                                  <Edit3 size={10} />
                                </button>
                                <button onClick={() => handleDeleteOstClick(ost.id)} className="inline-flex rounded bg-wm-coral/10 border border-wm-coral/20 p-1 text-wm-coral hover:bg-wm-coral hover:text-white">
                                  <Trash2 size={10} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-6 text-center italic text-wm-text/40">Belum ada OST.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                  <h4 className="text-xs font-black text-wm-texth flex items-center gap-1.5 pb-2 border-b border-wm-border/40">
                    <Music className="text-wm-yellow" size={14} fill="currentColor" />
                    <span>{editOstId ? "Edit OST" : "Tambah OST Baru"}</span>
                  </h4>

                  <form onSubmit={handleSaveOst} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Judul Lagu</label>
                      <input
                        type="text"
                        value={ostTitle}
                        onChange={(e) => setOstTitle(e.target.value)}
                        placeholder="Contoh: Sudden Shower"
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Artis / Penyanyi</label>
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Contoh: ECLIPSE"
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">URL Audio MP3 Preview</label>
                      <input
                        type="url"
                        value={previewUrl}
                        onChange={(e) => setPreviewUrl(e.target.value)}
                        placeholder="Contoh: https://..."
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      {editOstId && (
                        <button type="button" onClick={resetOstForm} className="rounded-xl border border-wm-border bg-wm-bg px-3.5 py-2 font-bold text-wm-text">
                          Batal
                        </button>
                      )}
                      <button type="submit" disabled={submittingOst} className="flex-1 rounded-xl bg-wm-mint py-2.5 font-bold text-white shadow shadow-wm-mint/10">
                        {editOstId ? "Simpan Perubahan" : "Tambahkan OST"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================= SECTION 2: COMMUNITY & TIER LISTS ======================= */}
        {activeSection === "community" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth flex items-center gap-2"><MessageSquare className="text-wm-coral" size={20} /> Kelola Komunitas & Tier List</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Pantau postingan forum komunitas dan Tier List buatan pengguna. Hapus konten yang melanggar aturan.</p>
            </div>

            {/* Grid 2 Kolom: Posts & Tier Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Kolom 1: Forum Posts */}
              <div className="rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-wm-texth flex items-center gap-2">
                  <MessageSquare size={16} className="text-wm-accent" /> Postingan Komunitas ({adminPosts.length})
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {adminPosts.length > 0 ? (
                    adminPosts.map((post) => (
                      <div key={post.id} className="rounded-xl border border-wm-border bg-wm-bg p-3.5 space-y-2 text-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={post.user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=user"} alt="" className="h-6 w-6 rounded-full border border-wm-border object-cover" />
                            <span className="font-bold text-wm-texth">@{post.user?.username}</span>
                            <span className="rounded bg-wm-card px-2 py-0.5 text-[9px] font-bold text-wm-accent uppercase">{post.type}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded bg-wm-coral/10 border border-wm-coral/20 px-2 py-1 text-wm-coral font-bold hover:bg-wm-coral hover:text-white transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} /> Hapus
                          </button>
                        </div>
                        <p className="text-wm-text/80 line-clamp-2">{post.content}</p>
                        {post.image_url && (
                          <img src={post.image_url} alt="" className="h-16 rounded object-cover border border-wm-border" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-wm-text/50 italic py-6 text-center">Belum ada postingan komunitas.</p>
                  )}
                </div>
              </div>

              {/* Kolom 2: Tier Lists */}
              <div className="rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-wm-texth flex items-center gap-2">
                  <Award size={16} className="text-wm-accent" /> Tier List Pengguna ({adminTierLists.length})
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {adminTierLists.length > 0 ? (
                    adminTierLists.map((tl) => (
                      <div key={tl.id} className="rounded-xl border border-wm-border bg-wm-bg p-3.5 space-y-2 text-2xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-black text-wm-texth text-xs">{tl.title}</p>
                            <p className="text-[10px] text-wm-text/60">Oleh @{tl.user?.username} • Kategori: <span className="font-bold text-wm-accent">{tl.category}</span></p>
                          </div>
                          <button
                            onClick={() => handleDeleteTierList(tl.id)}
                            className="rounded bg-wm-coral/10 border border-wm-coral/20 px-2 py-1 text-wm-coral font-bold hover:bg-wm-coral hover:text-white transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} /> Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-wm-text/50 italic py-6 text-center">Belum ada Tier List yang dibuat.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================= SECTION 3: USER REVIEWS MANAGEMENT ======================= */}
        {activeSection === "reviews" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth flex items-center gap-2"><Star className="text-wm-yellow" size={20} fill="currentColor" /> Kelola Ulasan & Rating Pengguna</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Pantau seluruh review yang diberikan pengguna pada konten film/drakor/anime. Hapus ulasan bermasalah.</p>
            </div>

            <div className="rounded-2xl border border-wm-border bg-wm-card overflow-hidden shadow-sm text-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-wm-bg border-b border-wm-border/50 uppercase font-bold text-wm-text/60 tracking-wider">
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Judul Konten</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Isi Ulasan</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wm-border/40">
                  {adminReviews.length > 0 ? (
                    adminReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-wm-bg/30 transition">
                        <td className="px-5 py-4 font-bold text-wm-texth">@{rev.user?.username || "Pengguna"}</td>
                        <td className="px-5 py-4 font-semibold text-wm-accent">{rev.content?.title || "N/A"}</td>
                        <td className="px-5 py-4 font-bold text-wm-yellow flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {rev.rating} / 10
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate text-wm-text/80">{rev.review}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="rounded bg-wm-coral/10 border border-wm-coral/20 px-2.5 py-1 text-wm-coral font-bold hover:bg-wm-coral hover:text-white transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Trash2 size={11} /> Hapus Ulasan
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-wm-text/50 italic">Belum ada ulasan pengguna di database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= SECTION 4: BADGES MANAGEMENT ======================= */}
        {activeSection === "badges" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth flex items-center gap-2"><Award className="text-wm-accent" size={20} /> Kelola Badge Sistem & Hadiah</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Buat badge baru atau edit deskripsi syarat badge pencapaian pengguna.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Tambah/Edit Badge */}
              <div className="rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm self-start">
                <h3 className="text-sm font-black text-wm-texth">
                  {editBadgeId ? "Edit Badge" : "Buat Badge Baru"}
                </h3>

                <form onSubmit={handleSaveBadge} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Nama Badge</label>
                    <input
                      type="text"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="Contoh: Drakor Addict"
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Deskripsi Syarat</label>
                    <textarea
                      rows="3"
                      value={badgeDesc}
                      onChange={(e) => setBadgeDesc(e.target.value)}
                      placeholder="Contoh: Review minimal 20 drakor di GabutHub"
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Icon / Emoji (Opsional)</label>
                    <input
                      type="text"
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      placeholder="Contoh: 👑 atau Award"
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-accent"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editBadgeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditBadgeId(null);
                          setBadgeName("");
                          setBadgeDesc("");
                          setBadgeIcon("");
                        }}
                        className="rounded-xl border border-wm-border bg-wm-bg px-4 py-2.5 font-bold text-wm-text hover:text-wm-texth"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submittingBadge}
                      className="flex-1 rounded-xl bg-wm-accent py-2.5 font-black text-black shadow hover:opacity-95 transition disabled:opacity-50"
                    >
                      {submittingBadge ? "Memproses..." : editBadgeId ? "Perbarui Badge" : "Buat Badge"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Badges */}
              <div className="lg:col-span-2 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-wm-texth">Daftar Badge Aktif ({adminBadges.length})</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {adminBadges.length > 0 ? (
                    adminBadges.map((bg) => (
                      <div key={bg.id} className="rounded-xl border border-wm-border bg-wm-bg p-3.5 space-y-2 text-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{bg.icon || "🏆"}</span>
                            <h4 className="font-black text-wm-texth text-xs">{bg.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditBadgeId(bg.id);
                                setBadgeName(bg.name);
                                setBadgeDesc(bg.description);
                                setBadgeIcon(bg.icon || "");
                              }}
                              className="rounded border border-wm-border bg-wm-card p-1 text-wm-text hover:text-wm-texth"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteBadge(bg.id)}
                              className="rounded bg-wm-coral/10 border border-wm-coral/20 p-1 text-wm-coral hover:bg-wm-coral hover:text-white transition"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        <p className="text-wm-text/70">{bg.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-xs text-wm-text/50 italic py-6 text-center">Belum ada badge tersimpan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= SECTION 3: USERS MANAGEMENT ======================= */}
        {activeSection === "users" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth"> Manajemen Pengguna</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Lihat profil seluruh user, atur hak akses admin, atau banned/hapus akun pengguna.</p>
            </div>

            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wm-text/40" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan username atau email..."
                className="w-full rounded-xl border border-wm-border bg-wm-card py-2 pl-9 pr-4 text-2xs text-wm-texth outline-none focus:border-wm-mint transition"
              />
            </div>

            <div className="rounded-2xl border border-wm-border bg-wm-card overflow-hidden shadow-sm text-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-wm-bg border-b border-wm-border/50 uppercase font-bold text-wm-text/60 tracking-wider">
                    <th className="px-5 py-3.5">Avatar & User</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Dibuat Pada</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wm-border/40">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-wm-text/50">Memuat data user...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-wm-bg/15">
                        <td className="px-5 py-3 flex items-center gap-3">
                          <img
                            src={item.avatar || "https://api.dicebear.com/7.x/adventurer/svg"}
                            className="h-8 w-8 rounded-full border border-wm-border bg-wm-bg"
                            alt=""
                          />
                          <div>
                            <p className="font-extrabold text-wm-texth text-xs">@{item.username}</p>
                            <p className="text-[10px] text-wm-text/50 line-clamp-1 max-w-[150px]">{item.bio || "Tidak ada bio."}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-wm-text/80">{item.email}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                            item.role === "admin"
                              ? "bg-wm-coral/10 border-wm-coral/20 text-wm-coral"
                              : "bg-wm-text/10 border-wm-border text-wm-text/80"
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-wm-text/60">{item.created_at || "Bawaan"}</td>
                        <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                          {item.id !== user.id ? (
                            <>
                              <button
                                onClick={() => handleToggleUserRole(item)}
                                className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-bold text-3xs transition cursor-pointer ${
                                  item.role === "admin"
                                    ? "bg-wm-bg border-wm-border text-wm-text hover:text-wm-texth"
                                    : "bg-wm-mint/10 border-wm-mint/20 text-wm-mint hover:bg-wm-mint hover:text-white"
                                }`}
                              >
                                {item.role === "admin" ? <UserMinus size={10} /> : <UserPlus size={10} />}
                                <span>{item.role === "admin" ? "Demote" : "Promote"}</span>
                              </button>
                              <button
                                onClick={() => handleToggleBanUser(item.id)}
                                className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-bold text-3xs transition cursor-pointer ${
                                  item.is_banned
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white"
                                }`}
                              >
                                <span>{item.is_banned ? "Unban" : "Ban User"}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(item)}
                                className="inline-flex items-center gap-1 rounded bg-wm-coral/10 border border-wm-coral/20 px-2 py-1 font-bold text-3xs text-wm-coral hover:bg-wm-coral hover:text-white transition cursor-pointer"
                              >
                                <Trash2 size={10} />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-wm-text/40 font-bold italic mr-4">Akun Anda</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-wm-text/40 italic">Tidak ada data pengguna.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= SECTION 3: POLLS / VOTING ======================= */}
        {activeSection === "polls" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth"> Manajemen Polling & Voting</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Publikasikan tema polling baru atau hapus voting yang sudah berjalan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Polls List table */}
              <div className="md:col-span-3 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                <h4 className="text-xs font-black text-wm-texth uppercase tracking-wide border-b border-wm-border/40 pb-2">Daftar Polling Aktif</h4>
                
                <div className="rounded-xl border border-wm-border overflow-hidden bg-wm-bg/10 text-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-wm-bg border-b border-wm-border/40 font-bold text-wm-text/60">
                        <th className="px-4 py-2">Judul Polling</th>
                        <th className="px-4 py-2">Berakhir Pada</th>
                        <th className="px-4 py-2">Pilihan</th>
                        <th className="px-4 py-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wm-border/30">
                      {pollsList.length > 0 ? (
                        pollsList.map((poll) => (
                          <tr key={poll.id} className="hover:bg-wm-bg/25">
                            <td className="px-4 py-2.5">
                              <p className="font-extrabold text-wm-texth">{poll.title}</p>
                              <p className="text-[10px] text-wm-text/50 line-clamp-1">{poll.description}</p>
                            </td>
                            <td className="px-4 py-2.5 text-wm-text/70">{poll.ends_at?.split("T")[0] || poll.ends_at}</td>
                            <td className="px-4 py-2.5 font-bold text-wm-mint">{poll.options?.length || 0} Opsi</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => handleDeletePoll(poll.id, poll.title)}
                                className="inline-flex rounded bg-wm-coral/10 border border-wm-coral/25 px-2.5 py-1 text-wm-coral hover:bg-wm-coral hover:text-white cursor-pointer"
                              >
                                <Trash2 size={10} />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center italic text-wm-text/40">Belum ada voting terdaftar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form Create Poll */}
              <div className="md:col-span-2 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                <h4 className="text-xs font-black text-wm-texth border-b border-wm-border/40 pb-2 flex items-center gap-1">
                  <BarChart2 className="text-wm-coral" size={14} />
                  <span>Buat Polling Baru</span>
                </h4>

                <form onSubmit={handleCreatePoll} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Judul Polling</label>
                    <input
                      type="text"
                      value={newPollTitle}
                      onChange={(e) => setNewPollTitle(e.target.value)}
                      placeholder="Contoh: Best Villain of All Time"
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Deskripsi Polling</label>
                    <textarea
                      rows="2"
                      value={newPollDesc}
                      onChange={(e) => setNewPollDesc(e.target.value)}
                      placeholder="Tulis keterangan/pertanyaan tambahan..."
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Tanggal Berakhir</label>
                    <input
                      type="datetime-local"
                      value={newPollEndsAt}
                      onChange={(e) => setNewPollEndsAt(e.target.value)}
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 flex items-center justify-between">
                      <span>Pilihan Jawaban (Min. 2)</span>
                      <button
                        type="button"
                        onClick={handleAddPollOptionField}
                        className="text-[10px] text-wm-mint font-extrabold hover:underline"
                      >
                        + Tambah Opsi
                      </button>
                    </label>
                    {newPollOptions.map((option, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(e.target.value, idx)}
                          placeholder={`Pilihan #${idx + 1}`}
                          className="flex-1 rounded-xl border border-wm-border bg-wm-bg p-2 text-xs text-wm-texth outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePollOptionField(idx)}
                          className="p-2 text-wm-coral hover:bg-wm-bg rounded-lg border border-transparent hover:border-wm-border transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPoll}
                    className="w-full rounded-xl bg-wm-coral py-3 font-bold text-white hover:bg-wm-coral/95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>{submittingPoll ? "Membuat..." : "Publikasikan Polling"}</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ======================= SECTION 4: GAME PROMPTS (HOT TAKES & CHARACTERS) ======================= */}
        {activeSection === "games" && (
          <div className="space-y-6">
            <div className="border-b border-wm-border/50 pb-4">
              <h2 className="text-xl font-black text-wm-texth"> Kelola Prompts Game (Gabut Mode)</h2>
              <p className="text-2xs text-wm-text/60 mt-1">Sunting atau tambahkan text Hot Takes dan kartu karakter Green / Red Flag.</p>
            </div>

            {/* Inner tab switcher */}
            <div className="flex border-b border-wm-border/40 gap-2 text-2xs font-bold">
              <button
                onClick={() => setGameTab("guess_ost")}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  gameTab === "guess_ost" ? "border-wm-accent text-wm-accent font-black" : "border-transparent text-wm-text/60"
                }`}
              >
                Setelan Tebak Lagu OST
              </button>
              <button
                onClick={() => setGameTab("hottakes")}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  gameTab === "hottakes" ? "border-wm-accent text-wm-accent font-black" : "border-transparent text-wm-text/60"
                }`}
              >
                Hot Takes ({hotTakes.length})
              </button>
              <button
                onClick={() => setGameTab("characters")}
                className={`px-4 py-2 border-b-2 transition cursor-pointer ${
                  gameTab === "characters" ? "border-wm-accent text-wm-accent font-black" : "border-transparent text-wm-text/60"
                }`}
              >
                Karakter Green/Red Flag ({flagChars.length})
              </button>
            </div>

            {/* SUB-SECTION 0: SETELAN GAME TEBAK LAGU OST */}
            {gameTab === "guess_ost" && (
              <div className="max-w-xl rounded-2xl border border-wm-border bg-wm-card p-6 space-y-5 shadow-sm">
                <div className="border-b border-wm-border/40 pb-3">
                  <h3 className="text-sm font-black text-wm-texth flex items-center gap-2">
                    <Music size={16} className="text-wm-accent" />
                    <span>Konfigurasi Permainan Tebak Lagu OST</span>
                  </h3>
                  <p className="text-2xs text-wm-text/60 mt-0.5">
                    Permainan tebak lagu mengambil lagu secara otomatis dari database OST. Di sini Anda dapat membatasi durasi dan jumlah pertanyaan.
                  </p>
                </div>

                <form onSubmit={handleSaveGameSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/70 mb-1">
                      Durasi Waktu Per Soal (Detik)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={gameSeconds}
                      onChange={(e) => setGameSeconds(parseInt(e.target.value) || 15)}
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-accent font-bold"
                      required
                    />
                    <p className="text-[10px] text-wm-text/50 mt-1">Batas waktu mundur untuk menebak satu judul lagu.</p>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/70 mb-1">
                      Jumlah Pertanyaan Per Sesi Permainan
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={gameCount}
                      onChange={(e) => setGameCount(parseInt(e.target.value) || 10)}
                      className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none focus:border-wm-accent font-bold"
                      required
                    />
                    <p className="text-[10px] text-wm-text/50 mt-1">Banyaknya lagu acak yang dijadikan soal dalam 1 ronde.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingGameSettings}
                      className="w-full rounded-xl bg-wm-accent py-3 font-black text-black hover:bg-wm-accent-hover transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-wm-accent/10 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{savingGameSettings ? "Menyimpan..." : "Simpan Pengaturan Game"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-SECTION A: HOT TAKES MANAGER */}
            {gameTab === "hottakes" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Hot Takes List */}
                <div className="md:col-span-3 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                  <h4 className="text-xs font-black text-wm-texth uppercase tracking-wide border-b border-wm-border/40 pb-2">Daftar Prompt Hot Takes</h4>
                  
                  <div className="rounded-xl border border-wm-border overflow-hidden bg-wm-bg/10 text-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-wm-bg border-b border-wm-border/40 font-bold text-wm-text/60">
                          <th className="px-4 py-2">Prompt Hot Take</th>
                          <th className="px-4 py-2">Kategori</th>
                          <th className="px-4 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wm-border/30">
                        {loadingTakes ? (
                          <tr>
                            <td colSpan="3" className="px-4 py-6 text-center text-wm-text/50">Memuat...</td>
                          </tr>
                        ) : hotTakes.length > 0 ? (
                          hotTakes.map((ht) => (
                            <tr key={ht.id} className="hover:bg-wm-bg/25">
                              <td className="px-4 py-2.5 font-semibold text-wm-texth">"{ht.text}"</td>
                              <td className="px-4 py-2.5">
                                <span className="rounded bg-wm-coral/10 border border-wm-coral/25 px-1.5 py-0.5 text-[8px] font-bold text-wm-coral">
                                  {ht.category}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => { setEditTakeId(ht.id); setTakeText(ht.text); setTakeCategory(ht.category); }}
                                  className="inline-flex rounded border border-wm-border bg-wm-bg p-1 text-wm-text hover:text-wm-texth"
                                >
                                  <Edit3 size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHotTake(ht.id)}
                                  className="inline-flex rounded bg-wm-coral/10 border border-wm-coral/20 p-1 text-wm-coral hover:bg-wm-coral hover:text-white"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-6 text-center italic text-wm-text/40">Belum ada prompt.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Add/Edit Hot Take */}
                <div className="md:col-span-2 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 self-start">
                  <h4 className="text-xs font-black text-wm-texth border-b border-wm-border/40 pb-2">
                    {editTakeId ? "️ Edit Hot Take" : " Tambah Hot Take"}
                  </h4>

                  <form onSubmit={handleSaveHotTake} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Pernyataan Hot Take</label>
                      <textarea
                        rows="3"
                        value={takeText}
                        onChange={(e) => setTakeText(e.target.value)}
                        placeholder="Contoh: Nonton bioskop itu overrated..."
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Kategori</label>
                      <select
                        value={takeCategory}
                        onChange={(e) => setTakeCategory(e.target.value)}
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                      >
                        <option value="Drakor">Drakor </option>
                        <option value="Anime">Anime </option>
                        <option value="MCU">MCU </option>
                        <option value="Variety">Variety Show </option>
                        <option value="Umum">Umum </option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      {editTakeId && (
                        <button
                          type="button"
                          onClick={() => { setEditTakeId(null); setTakeText(""); }}
                          className="rounded-xl border border-wm-border bg-wm-bg px-3.5 py-2 font-bold text-wm-text"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingTake}
                        className="flex-1 rounded-xl bg-wm-coral py-2.5 font-bold text-white shadow shadow-wm-coral/10"
                      >
                        {editTakeId ? "Simpan Perubahan" : "Tambahkan Prompt"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SUB-SECTION B: FLAG CHARACTERS MANAGER */}
            {gameTab === "characters" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Flag Characters List */}
                <div className="md:col-span-3 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4">
                  <h4 className="text-xs font-black text-wm-texth uppercase tracking-wide border-b border-wm-border/40 pb-2">Daftar Karakter Green/Red Flag</h4>
                  
                  <div className="rounded-xl border border-wm-border overflow-hidden bg-wm-bg/10 text-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-wm-bg border-b border-wm-border/40 font-bold text-wm-text/60">
                          <th className="px-4 py-2">Karakter</th>
                          <th className="px-4 py-2">Seri / Asal</th>
                          <th className="px-4 py-2">Keterangan</th>
                          <th className="px-4 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wm-border/30">
                        {loadingChars ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-wm-text/50">Memuat data...</td>
                          </tr>
                        ) : flagChars.length > 0 ? (
                          flagChars.map((char) => (
                            <tr key={char.id} className="hover:bg-wm-bg/25">
                              <td className="px-4 py-2 flex items-center gap-2">
                                <img src={char.avatar} className="h-8 w-8 rounded-full border border-wm-border bg-wm-bg" />
                                <span className="font-extrabold text-wm-texth">{char.name}</span>
                              </td>
                              <td className="px-4 py-2 font-bold text-wm-text/80">{char.series}</td>
                              <td className="px-4 py-2 text-wm-text/60 line-clamp-1 max-w-[150px] mt-2">"{char.description}"</td>
                              <td className="px-4 py-2 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEditCharId(char.id);
                                    setCharName(char.name);
                                    setCharSeries(char.series);
                                    setCharDesc(char.description);
                                    setCharAvatar(char.avatar);
                                  }}
                                  className="inline-flex rounded border border-wm-border bg-wm-bg p-1 text-wm-text hover:text-wm-texth"
                                >
                                  <Edit3 size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFlagChar(char.id)}
                                  className="inline-flex rounded bg-wm-coral/10 border border-wm-coral/20 p-1 text-wm-coral hover:bg-wm-coral hover:text-white"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-6 text-center italic text-wm-text/40">Belum ada karakter terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Add/Edit Flag Character */}
                <div className="md:col-span-2 rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 self-start">
                  <h4 className="text-xs font-black text-wm-texth border-b border-wm-border/40 pb-2">
                    {editCharId ? "️ Edit Karakter" : " Tambah Karakter"}
                  </h4>

                  <form onSubmit={handleSaveFlagChar} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Nama Karakter</label>
                      <input
                        type="text"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        placeholder="Contoh: Baek Hyun-woo"
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Seri / Asal Konten</label>
                      <input
                        type="text"
                        value={charSeries}
                        onChange={(e) => setCharSeries(e.target.value)}
                        placeholder="Contoh: Queen of Tears"
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-1">Deskripsi Sifat</label>
                      <textarea
                        rows="2"
                        value={charDesc}
                        onChange={(e) => setCharDesc(e.target.value)}
                        placeholder="Contoh: Suami penyayang, rela bertaruh nyawa..."
                        className="w-full rounded-xl border border-wm-border bg-wm-bg p-3 text-wm-texth outline-none"
                        required
                      />
                    </div>

                    <div>
                      <ImageInputPicker
                        value={charAvatar}
                        onChange={(val) => setCharAvatar(val)}
                        placeholder="Masukkan URL avatar atau upload..."
                        label="Foto Avatar Karakter"
                      />
                    </div>

                    <div className="flex gap-2">
                      {editCharId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditCharId(null);
                            setCharName("");
                            setCharSeries("");
                            setCharDesc("");
                            setCharAvatar("");
                          }}
                          className="rounded-xl border border-wm-border bg-wm-bg px-3.5 py-2 font-bold text-wm-text"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingChar}
                        className="flex-1 rounded-xl bg-wm-coral py-2.5 font-bold text-white shadow shadow-wm-coral/10"
                      >
                        {editCharId ? "Simpan Perubahan" : "Tambahkan Karakter"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
