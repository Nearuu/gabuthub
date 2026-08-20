import { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, Image, Send, Heart, Eye, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

const POST_TYPES = [
  { id: "all", label: "Semua" },
  { id: "meme", label: "Meme" },
  { id: "opinion", label: "Opini" },
  { id: "recommendation", label: "Rekomendasi" },
  { id: "question", label: "Pertanyaan" },
];

import ImageInputPicker from "../../components/ImageInputPicker";

export default function Community() {
  const { token, user } = useAuthStore();

  const [posts, setPosts] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Post Creator form
  const [newPostType, setNewPostType] = useState("meme");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active post comments modal
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPosts = async () => {
    try {
      const typeParam = selectedType === "all" ? "" : `?type=${selectedType}`;
      const res = await API.get(`/posts${typeParam}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat postingan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedType, token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Kamu harus masuk untuk memposting!");
      return;
    }
    if (newPostContent.trim().length < 3) {
      toast.error("Konten minimal 3 karakter!");
      return;
    }

    setSubmittingPost(true);
    try {
      await API.post("/posts", {
        type: newPostType,
        content: newPostContent,
        image_url: newPostImage || null,
      });

      toast.success("Postingan berhasil dibagikan!");
      setNewPostContent("");
      setNewPostImage("");
      loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Gagal membagikan postingan");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!token) {
      toast.error("Masuk untuk menyukai postingan");
      return;
    }
    try {
      const res = await API.post(`/posts/${postId}/like`);
      toast.success(res.data.message);
      loadPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Masuk untuk berkomentar");
      return;
    }
    if (newCommentText.trim().length < 1) {
      toast.error("Tulis komentar terlebih dahulu!");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await API.post(`/posts/${activeCommentsPost.id}/comments`, {
        comment: newCommentText,
      });

      toast.success("Komentar ditambahkan!");
      setNewCommentText("");
      
      // Update local comments in activeCommentsPost
      setActiveCommentsPost((prev) => ({
        ...prev,
        comments: [res.data.comment, ...(prev.comments || [])],
        comments_count: (prev.comments_count || 0) + 1,
      }));

      loadPosts();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menambahkan komentar");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-mint border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 text-wm-text max-w-3xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="border-b border-wm-border/50 pb-4">
        <h2 className="text-2xl font-black tracking-wide text-wm-texth flex items-center gap-2">
          <Users className="text-wm-accent" size={24} /> Forum Komunitas
        </h2>
        <p className="text-xs text-wm-text/60">Kumpul, bagikan meme, diskusikan anime, film, tanya info terbaru.</p>
      </div>

      {/* Post Creator Panel */}
      {token && (
        <form onSubmit={handleCreatePost} className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-wm-texth">Bagikan Sesuatu</h3>
            
            <select
              value={newPostType}
              onChange={(e) => setNewPostType(e.target.value)}
              className="rounded-xl border border-wm-border bg-wm-bg p-2.5 text-xs font-bold text-wm-texth outline-none focus:border-wm-mint transition font-semibold"
            >
              <option value="meme">Meme</option>
              <option value="opinion">Opini</option>
              <option value="recommendation">Rekomendasi</option>
              <option value="question">Pertanyaan</option>
            </select>
          </div>

          <textarea
            rows="3"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Ada meme lucu baru? Mau ngobrolin film favorit? Tulis disini..."
            className="w-full rounded-xl border border-wm-border bg-wm-bg p-4 text-xs text-wm-texth outline-none focus:border-wm-mint transition placeholder-wm-text/45"
          />

          <ImageInputPicker
            value={newPostImage}
            onChange={(val) => setNewPostImage(val)}
            placeholder="Paste Link URL Gambar/Meme atau upload..."
            label="Lampiran Gambar (Opsional)"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submittingPost}
              className="flex items-center gap-1.5 rounded-xl bg-wm-accent px-6 py-2.5 text-xs font-black text-black hover:bg-wm-accent-hover transition cursor-pointer active:scale-95 shadow-md shadow-wm-accent/10"
            >
              <Send size={14} />
              <span>{submittingPost ? "Mengirim..." : "Kirim Postingan"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Post Type Filters */}
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition cursor-pointer ${
              selectedType === type.id
                ? "bg-wm-coral border-wm-coral text-white font-bold shadow shadow-wm-coral/10"
                : "border-wm-border bg-wm-card text-wm-text hover:text-wm-texth"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => {
            const badgeLabel = {
              meme: " Meme",
              opinion: " Opini",
              recommendation: " Rekomendasi",
              question: " Pertanyaan",
            }[post.type];

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-wm-border bg-wm-card p-5 space-y-4 shadow-sm"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={post.user.avatar} className="h-8 w-8 rounded-lg bg-wm-bg border border-wm-border object-cover" alt="" />
                    <div>
                      <p className="text-xs font-bold text-wm-texth">@{post.user.username}</p>
                      <p className="text-[10px] text-wm-text/50">{new Date(post.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>

                  <span className="rounded bg-wm-bg border border-wm-border px-2 py-0.5 text-3xs font-bold text-wm-text capitalize">
                    {badgeLabel}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-xs text-wm-text/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.image_url && (
                    <div className="relative overflow-hidden rounded-xl border border-wm-border bg-wm-bg/40">
                      <img src={post.image_url} alt="" className="max-h-96 w-full object-contain mx-auto" />
                    </div>
                  )}
                </div>

                {/* Interactions Row */}
                <div className="flex items-center gap-4 border-t border-wm-border/40 pt-3 text-wm-text/50">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-2xs transition cursor-pointer ${
                      post.is_liked ? "text-wm-coral font-bold" : "hover:text-wm-texth"
                    }`}
                  >
                    <ThumbsUp size={14} fill={post.is_liked ? "currentColor" : "none"} />
                    <span>Suka ({post.likes_count})</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPost(post)}
                    className="flex items-center gap-1.5 text-2xs hover:text-wm-texth transition cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Komentar ({post.comments_count})</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/10 border-dashed text-wm-text/50">
            <p className="text-sm">Belum ada postingan dalam kategori ini.</p>
          </div>
        )}
      </div>

      {/* Comments Drawer / Modal */}
      <AnimatePresence>
        {activeCommentsPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl rounded-2xl border border-wm-border bg-wm-card p-6 flex flex-col max-h-[85vh] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-wm-border/50 pb-3 flex-shrink-0">
                <h3 className="text-sm font-bold text-wm-texth">Komentar</h3>
                <button
                  onClick={() => {
                    setActiveCommentsPost(null);
                    setNewCommentText("");
                  }}
                  className="text-wm-text/50 hover:text-wm-texth text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Comments List (Scrollable) */}
              <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 divide-y divide-wm-border/40">
                {activeCommentsPost.comments && activeCommentsPost.comments.length > 0 ? (
                  activeCommentsPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 pt-3 first:pt-0">
                      <img
                        src={comment.user.avatar}
                        alt=""
                        className="h-7 w-7 rounded-md object-cover bg-wm-bg border border-wm-border flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-wm-texth">@{comment.user.username}</p>
                        <p className="text-2xs text-wm-text mt-1">{comment.comment}</p>
                        <span className="text-[10px] text-wm-text/50 mt-1 block">
                          {new Date(comment.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-wm-text/50 text-center py-6">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                )}
              </div>

              {/* Comment Input form (Sticky bottom) */}
              {token ? (
                <form onSubmit={handleAddComment} className="flex gap-2 border-t border-wm-border/50 pt-3 flex-shrink-0">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Tulis balasan/komentar kamu..."
                    className="flex-1 rounded-xl border border-wm-border bg-wm-bg px-4 py-2.5 text-xs text-wm-texth outline-none focus:border-wm-mint transition placeholder-wm-text/45"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || newCommentText.trim().length === 0}
                    className="flex items-center justify-center rounded-xl bg-wm-coral px-4 py-2.5 text-white hover:bg-wm-coral/95 active:scale-95 cursor-pointer shadow shadow-wm-coral/10 disabled:opacity-50 transition"
                  >
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <div className="text-center text-2xs text-wm-text/50 border-t border-wm-border/50 pt-3">
                  Harus login untuk berkomentar.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}