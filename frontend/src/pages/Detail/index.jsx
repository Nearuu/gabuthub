import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, Heart, Star, Send, ThumbsUp, Music, Sparkles, Share2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import useAuthStore from "../../store/authStore";
import useOstPlayerStore from "../../store/ostPlayerStore";
import useWatchlistStore from "../../store/watchlistStore";
import toast from "react-hot-toast";

export default function Detail() {
  const { id } = useParams();
  const { token, user } = useAuthStore();
  const { currentTrack, isPlaying, playTrack } = useOstPlayerStore();

  const [content, setContent] = useState(null);
  const [similarContents, setSimilarContents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Watchlist forms
  const [watchlistStatus, setWatchlistStatus] = useState("");
  const [personalRating, setPersonalRating] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  // Review form
  const [newRating, setNewRating] = useState(10);
  const [newReview, setNewReview] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Unblurred reviews tracker
  const [unblurredReviews, setUnblurredReviews] = useState({});

  const loadContentDetail = async () => {
    try {
      const res = await API.get(`/contents/${id}`);
      const data = res.data || {};
      setContent(data);
      if (data.watchlist_status) setWatchlistStatus(data.watchlist_status);
      if (data.personal_rating) setPersonalRating(data.personal_rating);
      if (data.personal_notes) setPersonalNotes(data.personal_notes);

      // Load similar contents by type
      try {
        const resSimilar = await API.get(`/contents?type=${data.type || "movie"}`);
        setSimilarContents((resSimilar.data || []).filter((item) => item.id !== parseInt(id)).slice(0, 6));
      } catch (err) {
        setSimilarContents([]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat detail konten");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (type) => {
    const pageUrl = window.location.href;
    if (type === "copy") {
      navigator.clipboard.writeText(pageUrl);
      toast.success("Tautan berhasil disalin!");
    } else if (type === "wa") {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Cek ${content?.title || "film"} ini di GabutHub! ${pageUrl}`)}`;
      window.open(waUrl, "_blank");
    }
  };

  useEffect(() => {
    loadContentDetail();
  }, [id, token]);

  const handleSaveWatchlist = async () => {
    if (!token || !user) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan ke Watchlist pribadi Anda!");
      return;
    }
    setSavingWatchlist(true);
    try {
      await API.post("/watchlist", {
        content_id: id,
        status: watchlistStatus || "Plan to Watch",
        personal_rating: personalRating || null,
        notes: personalNotes || null,
      });

      // Save to local user-isolated storage
      const key = `watchlist_user_${user.id || user.email}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const newItem = {
        id: Date.now(),
        content_id: parseInt(id),
        title: content?.title || "Judul Konten",
        type: content?.type || "Drakor",
        poster_url: content?.poster_url,
        pivot: { status: watchlistStatus || "Plan to Watch", personal_rating: personalRating || 10 }
      };
      const filtered = existing.filter((item) => item.content_id !== parseInt(id));
      filtered.push(newItem);
      localStorage.setItem(key, JSON.stringify(filtered));

      toast.success("Berhasil tersimpan di Watchlist Anda!");
      loadContentDetail();
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui watchlist");
    } finally {
      setSavingWatchlist(false);
    }
  };

  const handleRemoveWatchlist = async () => {
    try {
      await API.delete(`/watchlist/${id}`);
      setWatchlistStatus("");
      setPersonalRating("");
      setPersonalNotes("");
      toast.success("Dihapus dari watchlist");
      await useWatchlistStore.getState().fetchWatchlist();
      loadContentDetail();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus dari watchlist");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Kamu harus masuk untuk menulis review");
      return;
    }
    if (newReview.trim().length < 5) {
      toast.error("Ulasan minimal 5 karakter");
      return;
    }

    setSubmittingReview(true);
    try {
      await API.post(`/contents/${id}/reviews`, {
        rating: newRating,
        review: newReview,
        spoiler: isSpoiler,
      });
      toast.success("Review berhasil dikirim!");
      setNewReview("");
      setIsSpoiler(false);
      loadContentDetail();
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim ulasan");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!token) {
      toast.error("Masuk untuk menyukai review");
      return;
    }
    try {
      const res = await API.post(`/reviews/${reviewId}/like`);
      toast.success(res.data?.message || "Berhasil disukai");
      loadContentDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeOst = async (ostId) => {
    if (!token) {
      toast.error("Masuk untuk menyukai soundtrack");
      return;
    }
    try {
      const res = await API.post(`/osts/${ostId}/like`);
      toast.success(res.data?.message || "Berhasil disukai");
      loadContentDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoteOst = async (ostId) => {
    if (!token) {
      toast.error("Masuk untuk memilih soundtrack terfavorit");
      return;
    }
    try {
      const res = await API.post(`/osts/${ostId}/vote`);
      toast.success(res.data?.message || "Berhasil divote");
      loadContentDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleShowSpoiler = (reviewId) => {
    setUnblurredReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-wm-text/50">
        <p>Konten tidak ditemukan</p>
        <Link to="/" className="mt-4 text-wm-accent hover:underline font-bold">Kembali ke Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 text-wm-text max-w-6xl mx-auto">
      
      {/* Content Top Detail */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Poster */}
        <div className="w-full md:w-64 flex-shrink-0">
          <img
            src={content.poster_url}
            alt={content.title}
            className="w-full rounded-2xl border border-wm-border object-cover shadow-2xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-wm-accent/10 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-wm-accent border border-wm-accent/20 capitalize">
                {content.type}
              </span>
              <span className="text-wm-text/55 text-xs font-semibold">
                Rilis: {content.release_date ? new Date(content.release_date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "2024"}
              </span>
            </div>
            <h2 className="text-3xl font-black mt-2 tracking-tight text-wm-texth">{content.title}</h2>
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-6 border-y border-wm-border/55 py-3">
            <div className="flex items-center gap-2">
              <Star className="text-wm-yellow" size={24} fill="currentColor" />
              <div>
                <p className="text-lg font-black leading-none text-wm-texth">{content.avg_rating || "N/A"}</p>
                <p className="text-[10px] text-wm-text/55 mt-1 uppercase font-bold tracking-wider">Rating Rata-rata</p>
              </div>
            </div>
            <div className="border-l border-wm-border/55 pl-6">
              <p className="text-lg font-black leading-none text-wm-texth">{content.reviews?.length || 0}</p>
              <p className="text-[10px] text-wm-text/55 mt-1 uppercase font-bold tracking-wider">Total Review</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-wm-text/50">Sinopsis</h4>
            <p className="text-sm text-wm-text/80 leading-relaxed">{content.synopsis}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-wm-text/50">Genre</h4>
            <div className="flex flex-wrap gap-2">
              {content.genres?.map((genre) => (
                <span
                  key={genre.id || genre.name}
                  className="rounded-full border border-wm-border bg-wm-card px-3.5 py-1 text-xs font-bold text-wm-text"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-bold text-wm-text/50 flex items-center gap-1">
              <Share2 size={14} /> Bagikan:
            </span>
            <button
              onClick={() => handleShare("copy")}
              className="flex items-center gap-1.5 rounded-xl border border-wm-border bg-wm-card px-3 py-1.5 text-xs font-bold text-wm-texth hover:text-wm-accent hover:border-wm-accent/40 transition cursor-pointer"
            >
              <Copy size={13} /> Salin Tautan
            </button>
            <button
              onClick={() => handleShare("wa")}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Watchlist Status Panel */}
      <div className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-wm-texth mb-4 flex items-center gap-2">
          <Heart size={16} className="text-wm-accent" fill="currentColor" />
          <span>Saves & Catatan Watchlist</span>
        </h3>

        {!token ? (
          <div className="text-center py-4">
            <p className="text-sm text-wm-text/60">Anda harus masuk untuk menambahkan item ini ke watchlist pribadi Anda.</p>
            <Link to="/login" className="mt-3 inline-block rounded-xl bg-wm-accent px-6 py-2.5 text-xs font-bold text-black hover:bg-wm-accent/90 cursor-pointer shadow-md">
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Status Menonton</label>
              <select
                value={watchlistStatus}
                onChange={(e) => setWatchlistStatus(e.target.value)}
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-accent transition"
              >
                <option value="">-- Pilih Status --</option>
                <option value="Plan to Watch">Plan to Watch</option>
                <option value="Watching">Watching</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Rating Pribadi (1 - 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={personalRating}
                onChange={(e) => setPersonalRating(e.target.value)}
                placeholder="Skor kamu (1-10)..."
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-accent transition"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Catatan / Review Singkat</label>
              <input
                type="text"
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Catatan kecil pribadi..."
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-accent transition"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-4">
              {content.watchlist_status && (
                <button
                  onClick={handleRemoveWatchlist}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                  Hapus Watchlist
                </button>
              )}
              <button
                onClick={handleSaveWatchlist}
                disabled={savingWatchlist || !watchlistStatus}
                className="rounded-xl bg-wm-accent px-6 py-3 text-xs font-bold text-black hover:bg-wm-accent/95 active:scale-95 disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                {savingWatchlist ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Soundtrack OST Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* OST Section */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Music className="text-wm-accent" size={20} />
            <span> Soundtracks (OST)</span>
          </h3>

          {(content.osts?.length || 0) > 0 ? (
            <div className="rounded-2xl border border-wm-border bg-wm-card/40 p-3 divide-y divide-wm-border/40">
              {content.osts?.map((ost) => {
                const isCurrent = currentTrack && currentTrack.id === ost.id;

                return (
                  <div key={ost.id} className="flex items-center justify-between p-3 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => playTrack(ost)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition cursor-pointer ${
                          isCurrent
                            ? "bg-wm-accent text-black font-black shadow-md shadow-wm-accent/20 ring-2 ring-wm-accent/30"
                            : "bg-wm-bg text-wm-text hover:bg-wm-border hover:text-wm-texth border border-wm-border/50"
                        }`}
                      >
                        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                      </button>
                      <div>
                        <p className="text-sm font-bold text-wm-texth leading-snug">{ost.title}</p>
                        <p className="text-2xs text-wm-text/60">{ost.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeOst(ost.id)}
                        className={`flex items-center gap-1 text-2xs border rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                          ost.is_liked
                            ? "border-wm-accent bg-wm-accent/10 text-wm-accent font-bold"
                            : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                        }`}
                      >
                        <Heart size={12} fill={ost.is_liked ? "currentColor" : "none"} />
                        <span>{ost.likes_count || 0}</span>
                      </button>

                      <button
                        onClick={() => handleVoteOst(ost.id)}
                        className={`flex items-center gap-1 text-2xs border rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                          ost.is_voted
                            ? "border-wm-accent bg-wm-accent/10 text-wm-accent font-bold"
                            : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                        }`}
                        title="Pilih OST favorit"
                      >
                        <Sparkles size={12} />
                        <span>Vote ({ost.votes_count || 0})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-wm-text/50 bg-wm-card/10 p-6 rounded-2xl border border-dashed border-wm-border/70 text-center">
              Belum ada OST yang diunggah untuk konten ini.
            </p>
          )}
        </div>

        {/* Stats Summary Widget */}
        <div className="rounded-2xl border border-wm-border bg-wm-card p-6 self-start shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-wm-text/60 mb-3"> Fun Info</h4>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between border-b border-wm-border/50 pb-2">
              <span className="text-wm-text/50">Tipe Konten:</span>
              <span className="font-bold capitalize text-wm-texth">{content.type}</span>
            </div>
            <div className="flex justify-between border-b border-wm-border/50 pb-2">
              <span className="text-wm-text/50">Soundtrack Tracks:</span>
              <span className="font-bold text-wm-texth">{content.osts?.length || 0}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-wm-text/50">Total Ulasan:</span>
              <span className="font-bold text-wm-texth">{content.reviews?.length || 0} ulasan</span>
            </div>
          </div>
        </div>

      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Star className="text-wm-yellow" size={20} />
          <span> Review & Ulasan Komunitas</span>
        </h3>

        {/* Submit Review Form */}
        {token ? (
          <form onSubmit={handleSubmitReview} className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-wm-text/50">Tulis Ulasan Anda</h4>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Rating */}
              <div className="w-full sm:w-1/4">
                <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Rating Pribadi</label>
                <div className="flex items-center gap-2">
                  <Star className="text-wm-yellow" size={18} fill="currentColor" />
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(parseInt(e.target.value))}
                    className="flex-1 rounded-xl border border-wm-border bg-wm-bg p-2.5 text-xs font-bold text-wm-texth outline-none focus:border-wm-accent transition"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Spoiler flag */}
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-wm-text/75 hover:text-wm-texth">
                  <input
                    type="checkbox"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                    className="h-4 w-4 rounded border-wm-border bg-wm-bg text-wm-accent accent-wm-accent"
                  />
                  <span>Mengandung Spoiler? (Ulasan akan diblur)</span>
                </label>
              </div>
            </div>

            {/* Review text */}
            <div className="relative">
              <textarea
                rows="4"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Bagikan pendapatmu tentang konten ini secara detail..."
                className="w-full rounded-xl border border-wm-border bg-wm-bg p-4 text-xs text-wm-texth placeholder-wm-text/40 outline-none focus:border-wm-accent transition"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-wm-accent text-black transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md font-bold"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-wm-border bg-wm-card/10 p-6 text-center">
            <p className="text-xs text-wm-text/50">Anda harus login untuk menulis review komunitas.</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {(content.reviews?.length || 0) > 0 ? (
            content.reviews?.map((rev) => {
              const isUserSpoiler = rev.spoiler && !unblurredReviews[rev.id];

              return (
                <div key={rev.id} className="rounded-2xl border border-wm-border bg-wm-card p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    {/* User profile */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={(user && (rev.user?.id === user.id || rev.user?.email === user.email || rev.user_id === user.id)) ? user.avatar : (rev.user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=User")}
                        alt=""
                        className="h-8 w-8 rounded-lg object-cover bg-wm-bg border border-wm-border"
                      />
                      <div>
                        <p className="text-xs font-bold text-wm-texth">
                          @{(user && (rev.user?.id === user.id || rev.user?.email === user.email || rev.user_id === user.id)) ? user.username : (rev.user?.username || "Pengguna")}
                        </p>
                        <p className="text-[10px] text-wm-text/50">{rev.created_at ? new Date(rev.created_at).toLocaleDateString("id-ID") : "Terbaru"}</p>
                      </div>
                    </div>

                    {/* Review Rating */}
                    <div className="flex items-center gap-1 rounded-lg bg-wm-yellow/15 px-2.5 py-1 text-wm-yellow border border-wm-yellow/30 text-xs font-bold">
                      <Star size={12} fill="currentColor" />
                      <span>{rev.rating} / 10</span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative border-t border-wm-border/50 pt-3">
                    {rev.spoiler && (
                      <span className="mb-2 inline-block rounded bg-red-500/15 border border-red-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
                        Spoiler Alert
                      </span>
                    )}

                    <div className={`text-xs text-wm-text/80 leading-relaxed ${isUserSpoiler ? "blur-md select-none" : ""}`}>
                      {rev.review}
                    </div>

                    {isUserSpoiler && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-md rounded-lg">
                        <button
                          onClick={() => toggleShowSpoiler(rev.id)}
                          className="rounded-xl border border-wm-accent/45 bg-wm-accent/10 px-4 py-2 text-2xs font-bold uppercase tracking-wider text-wm-accent hover:bg-wm-accent hover:text-black transition cursor-pointer shadow-sm"
                        >
                          Tampilkan Spoiler
                        </button>
                      </div>
                    )}

                    {!isUserSpoiler && rev.spoiler && (
                      <button
                        onClick={() => toggleShowSpoiler(rev.id)}
                        className="mt-2 text-3xs font-semibold text-wm-text/50 hover:underline block cursor-pointer"
                      >
                        Sembunyikan Spoiler
                      </button>
                    )}
                  </div>

                  {/* Likes Interactions */}
                  <div className="flex items-center justify-end border-t border-wm-border/40 pt-2">
                    <button
                      onClick={() => handleLikeReview(rev.id)}
                      className={`flex items-center gap-1.5 text-3xs border rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                        rev.is_liked
                          ? "border-wm-accent bg-wm-accent/15 text-wm-accent font-bold"
                          : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                      }`}
                    >
                      <ThumbsUp size={12} />
                      <span>Suka ({rev.likes_count || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-wm-text/50 bg-wm-card/10 p-6 rounded-2xl border border-dashed border-wm-border/70 text-center">
              Belum ada ulasan tertulis. Jadilah yang pertama memberikan review!
            </p>
          )}
        </div>

      </div>

      {/* ─────── REKOMENDASI KONTEN SERUPA ─────── */}
      {(similarContents?.length || 0) > 0 && (
        <div className="space-y-4 pt-6 border-t border-wm-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-wm-texth flex items-center gap-2">
              <Sparkles size={18} className="text-wm-accent" /> Rekomendasi Serupa Untuk Kamu
            </h3>
            <Link to={`/explore?type=${content.type}`} className="text-xs font-bold text-wm-accent hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {similarContents?.map((sim) => (
              <Link to={`/detail/${sim.id}`} key={sim.id} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 border border-wm-border bg-wm-card shadow-sm">
                  <img
                    src={sim.poster_url}
                    alt={sim.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[10px] text-white font-bold truncate">{sim.title}</p>
                    <div className="flex items-center gap-1 text-[9px] text-wm-accent font-black mt-0.5">
                      <Star size={9} fill="currentColor" /> {sim.avg_rating || "N/A"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}