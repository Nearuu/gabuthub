import { useState, useEffect } from "react";
import { Plus, Trash2, Heart, ExternalLink, Award, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

const TIERS = ["S", "A", "B", "C", "D", "F"];

const TIER_COLORS = {
  S: "bg-[#ff7f7f] text-black font-extrabold",
  A: "bg-[#ffbf7f] text-black font-extrabold",
  B: "bg-[#ffdf7f] text-black font-extrabold",
  C: "bg-[#ffff7f] text-black font-extrabold",
  D: "bg-[#bfff7f] text-black font-extrabold",
  F: "bg-[#7f7fff] text-white font-extrabold",
};

export default function TierList() {
  const { token, user } = useAuthStore();

  const [tierLists, setTierLists] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Anime");
  const [poolSearch, setPoolSearch] = useState("");
  const [builderRows, setBuilderRows] = useState({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  });

  const loadTierLists = async () => {
    try {
      const [tierListRes, contentsRes] = await Promise.all([
        API.get("/tier-lists"),
        API.get("/contents"),
      ]);
      setTierLists(Array.isArray(tierListRes.data) ? tierListRes.data : []);
      setContents(Array.isArray(contentsRes.data) ? contentsRes.data : []);
    } catch (e) {
      console.error(e);
      setTierLists([]);
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTierLists();
  }, [token]);

  const handleAddItemToRow = (contentId, tier) => {
    const alreadyAdded = Object.values(builderRows).some((row) =>
      row.some((item) => item.id === contentId)
    );

    if (alreadyAdded) {
      toast.error("Konten sudah ditambahkan ke salah satu baris!");
      return;
    }

    const item = (contents || []).find((c) => c.id === contentId);
    if (!item) return;

    setBuilderRows((prev) => ({
      ...prev,
      [tier]: [...prev[tier], item],
    }));
  };

  const handleRemoveItem = (contentId, tier) => {
    setBuilderRows((prev) => ({
      ...prev,
      [tier]: prev[tier].filter((item) => item.id !== contentId),
    }));
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDrop = (e, targetTier) => {
    e.preventDefault();
    try {
      const itemStr = e.dataTransfer.getData("text/plain");
      if (!itemStr) return;
      const item = JSON.parse(itemStr);

      setBuilderRows((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((t) => {
          updated[t] = updated[t].filter((x) => x.id !== item.id);
        });
        updated[targetTier] = [...updated[targetTier], item];
        return updated;
      });
    } catch (error) {
      console.error("Drop error", error);
    }
  };

  const handleDropToPool = (e) => {
    e.preventDefault();
    try {
      const itemStr = e.dataTransfer.getData("text/plain");
      if (!itemStr) return;
      const item = JSON.parse(itemStr);

      setBuilderRows((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((t) => {
          updated[t] = updated[t].filter((x) => x.id !== item.id);
        });
        return updated;
      });
    } catch (error) {
      console.error("Drop to pool error", error);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Judul minimal 3 karakter");
      return;
    }

    const rowsPayload = TIERS.map((tier) => ({
      label: tier,
      items: builderRows[tier].map((item) => item.id),
    }));

    const totalItems = rowsPayload.reduce((sum, row) => sum + row.items.length, 0);
    if (totalItems === 0) {
      toast.error("Tambahkan minimal 1 konten ke dalam baris tier!");
      return;
    }

    try {
      await API.post("/tier-lists", {
        title,
        category,
        rows: rowsPayload,
      });

      toast.success("Tier list berhasil dipublikasikan!");
      setTitle("");
      setBuilderRows({ S: [], A: [], B: [], C: [], D: [], F: [] });
      setShowBuilder(false);
      loadTierLists();
    } catch (error) {
      console.error(error);
      toast.error("Gagal mempublikasikan tier list");
    }
  };

  const handleLikeTierList = async (id) => {
    if (!token) {
      toast.error("Masuk untuk menyukai tier list");
      return;
    }
    try {
      const res = await API.post(`/tier-lists/${id}/like`);
      toast.success(res.data?.message || "Berhasil disukai");
      loadTierLists();
    } catch (e) {
      console.error(e);
    }
  };

  const isItemInAnyRow = (itemId) => {
    return Object.values(builderRows).some((row) =>
      row.some((item) => item.id === itemId)
    );
  };

  const safeContents = Array.isArray(contents) ? contents : [];
  const safeTierLists = Array.isArray(tierLists) ? tierLists : [];

  const categoryFiltered = safeContents.filter((item) => {
    const t = (item.type || "").toLowerCase();
    if (category === "Anime") return t === "anime" || t === "donghua";
    if (category === "Movie") return t === "movie" || t === "film" || t === "series" || t === "mcu";
    if (category === "Drakor") return t === "drakor" || t === "drama";
    return true;
  });

  const availablePool = categoryFiltered.filter((item) => !isItemInAnyRow(item.id));

  const filteredPool = availablePool.filter((item) =>
    (item.title || "").toLowerCase().includes(poolSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 text-wm-text max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-wm-border/50 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-wm-texth flex items-center gap-2">
            <Award className="text-wm-accent" size={24} /> Tier List Hub
          </h2>
          <p className="text-xs text-wm-text/60">Buat, bagikan, dan diskusikan peringkat konten terpopuler.</p>
        </div>

        {token && (
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2 rounded-xl bg-wm-accent px-5 py-3 text-xs font-bold text-black hover:bg-wm-accent/90 cursor-pointer shadow-md transition"
          >
            <Plus size={16} />
            <span>{showBuilder ? "Tutup Builder" : "Buat Tier List"}</span>
          </button>
        )}
      </div>

      {/* Builder Modal / Section */}
      <AnimatePresence>
        {showBuilder && token && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-xl space-y-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-wm-texth flex items-center gap-2">
              <Sparkles size={16} className="text-wm-yellow" fill="currentColor" />
              <span>Interactive Tier List Maker</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Judul Tier List</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Top Drakor Romance 2024..."
                  className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-accent transition"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Kategori Konten</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-accent transition"
                >
                  <option value="Anime">Anime</option>
                  <option value="Drakor">Drakor</option>
                  <option value="Movie">Movie / Film</option>
                  <option value="General">Semua Kategori</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePublish}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-wm-accent py-3 text-xs font-bold text-black hover:bg-wm-accent/90 transition cursor-pointer shadow-md"
                >
                  <Send size={14} /> Publiskan Tier List
                </button>
              </div>
            </div>

            {/* Visual Builder Canvas */}
            <div className="space-y-2 border border-wm-border rounded-xl p-3 bg-wm-bg">
              {TIERS.map((tier) => (
                <div
                  key={tier}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, tier)}
                  className="flex items-center gap-3 min-h-[64px] rounded-xl border border-wm-border/60 bg-wm-card/50 p-2"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg ${TIER_COLORS[tier]}`}>
                    {tier}
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {builderRows[tier].map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="group relative flex items-center gap-1.5 rounded-lg border border-wm-border bg-wm-bg p-1.5 pr-2 text-2xs font-bold text-wm-texth cursor-grab active:cursor-grabbing"
                      >
                        <img src={item.poster_url} alt="" className="h-7 w-5 rounded object-cover" />
                        <span className="max-w-[100px] truncate">{item.title}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id, tier)}
                          className="ml-1 text-red-400 hover:text-red-300 font-black text-sm cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {builderRows[tier].length === 0 && (
                      <span className="text-3xs text-wm-text/40 italic ml-2">Drag konten atau klik tombol tier di bawah</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pool of Available Contents to Add / Drag */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-wm-border/50 pt-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-wm-texth">
                    Pilihan Film & Konten ({filteredPool.length})
                  </h4>
                  <p className="text-3xs text-wm-text/60">
                    Klik tombol tier (S, A, B, C, D, F) atau drag gambar konten ke baris tier di atas:
                  </p>
                </div>
                <input
                  type="text"
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  placeholder="Cari judul konten..."
                  className="rounded-xl border border-wm-border bg-wm-bg px-3 py-1.5 text-xs text-wm-texth outline-none focus:border-wm-accent transition w-full sm:w-48"
                />
              </div>

              <div className="flex flex-wrap gap-3 max-h-72 overflow-y-auto p-3 rounded-xl border border-wm-border bg-wm-bg/40">
                {filteredPool.length > 0 ? (
                  filteredPool.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="group relative flex flex-col items-center w-24 p-2 rounded-xl border border-wm-border bg-wm-card hover:border-wm-accent transition shadow-sm cursor-grab active:cursor-grabbing"
                    >
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="h-24 w-18 rounded-lg object-cover mb-1.5 shadow"
                      />
                      <span className="text-3xs font-bold text-wm-texth text-center line-clamp-1 w-full">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-wm-text/50 capitalize mb-1">
                        {item.type}
                      </span>

                      {/* Quick Add Tier Buttons */}
                      <div className="flex flex-wrap justify-center gap-1 w-full pt-1 border-t border-wm-border/40">
                        {TIERS.map((t) => (
                          <button
                            key={t}
                            onClick={() => handleAddItemToRow(item.id, t)}
                            title={`Tambah ke Tier ${t}`}
                            className={`h-4 w-4 rounded text-[9px] font-black flex items-center justify-center cursor-pointer transition active:scale-90 ${TIER_COLORS[t]}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center text-xs text-wm-text/50">
                    Tidak ada konten yang tersedia dalam kategori {category}.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Lists Items Grid */}
      <div className="space-y-6">
        {safeTierLists.length > 0 ? (
          safeTierLists.map((tl) => (
            <div key={tl.id} className="rounded-2xl border border-wm-border bg-wm-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-wm-border/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-wm-texth">{tl.title}</h3>
                  <p className="text-xs text-wm-text/50">Dibuat oleh @{tl.user?.username || "admin"}</p>
                </div>
                <button
                  onClick={() => handleLikeTierList(tl.id)}
                  className="flex items-center gap-1.5 text-xs font-bold border border-wm-border bg-wm-bg px-3 py-1.5 rounded-xl hover:border-wm-accent transition cursor-pointer"
                >
                  <Heart size={14} className="text-wm-accent" />
                  <span>Suka</span>
                </button>
              </div>

              <div className="space-y-2">
                {Object.entries(tl.tiers || {}).map(([tier, items]) => (
                  <div key={tier} className="flex items-center gap-3 rounded-xl border border-wm-border/40 bg-wm-bg/50 p-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${TIER_COLORS[tier] || "bg-wm-accent text-black"}`}>
                      {tier}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.isArray(items) && items.map((itemName, idx) => (
                        <span key={idx} className="rounded-lg border border-wm-border bg-wm-card px-2.5 py-1 text-xs font-bold text-wm-texth">
                          {itemName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-wm-border p-12 text-center text-wm-text/50">
            <Award size={36} className="mx-auto mb-2 opacity-30 text-wm-accent" />
            <p className="text-sm font-semibold">Belum ada Tier List yang dibuat.</p>
          </div>
        )}
      </div>

    </div>
  );
}