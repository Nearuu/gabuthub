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
      setTierLists(tierListRes.data);
      setContents(contentsRes.data);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data tier list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTierLists();
  }, [token]);

  const handleAddItemToRow = (contentId, tier) => {
    // Prevent duplicate items in builder
    const alreadyAdded = Object.values(builderRows).some((row) =>
      row.some((item) => item.id === contentId)
    );

    if (alreadyAdded) {
      toast.error("Konten sudah ditambahkan ke salah satu baris!");
      return;
    }

    const item = contents.find((c) => c.id === contentId);
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
        // Remove from all tiers
        Object.keys(updated).forEach((t) => {
          updated[t] = updated[t].filter((x) => x.id !== item.id);
        });
        // Add to target tier
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
        // Remove from all tiers (returns to pool)
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

    // Ensure at least one item is mapped
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
      toast.success(res.data.message);
      loadTierLists();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter pool items by category, search input, and unused state
  const isItemInAnyRow = (itemId) => {
    return Object.values(builderRows).some((row) =>
      row.some((item) => item.id === itemId)
    );
  };

  const categoryFiltered = contents.filter((item) => {
    const t = (item.type || "").toLowerCase();
    if (category === "Anime") return t === "anime" || t === "donghua";
    if (category === "Movie") return t === "movie" || t === "film" || t === "series" || t === "mcu";
    if (category === "Drakor") return t === "drakor" || t === "drama";
    return true; // General
  });

  const availablePool = categoryFiltered.filter((item) => !isItemInAnyRow(item.id));

  const filteredPool = availablePool.filter((item) =>
    item.title.toLowerCase().includes(poolSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-mint border-t-transparent"></div>
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
            className="flex items-center gap-2 rounded-xl bg-wm-coral px-5 py-3 text-xs font-bold text-white hover:bg-wm-coral/95 cursor-pointer shadow-md shadow-wm-coral/15 transition"
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
              <div className="md:col-span-2">
                <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Judul Tier List</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tier List Anime Tergokil Tahun Ini..."
                  className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-mint transition"
                />
              </div>
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-wm-border bg-wm-bg p-3.5 text-xs text-wm-texth font-bold outline-none focus:border-wm-mint transition"
                >
                  <option value="Anime">Anime</option>
                  <option value="Movie">Movie</option>
                  <option value="Drakor">Drakor</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Builder Grid S-F */}
            <div className="rounded-xl overflow-hidden border border-wm-border divide-y divide-wm-border/50">
              {TIERS.map((tier) => {
                return (
                  <div key={tier} className="flex min-h-20 items-stretch">
                    {/* Row Header Label */}
                    <div className={`w-16 sm:w-20 flex-shrink-0 flex items-center justify-center font-black text-xl select-none text-center ${TIER_COLORS[tier]}`}>
                      {tier}
                    </div>

                    {/* Row Items container */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, tier)}
                      className="flex-1 flex flex-wrap gap-2 px-4 py-3 bg-wm-bg/40 items-center overflow-x-auto min-h-20"
                    >
                      {builderRows[tier].map((item) => (
                        <div
                          key={item.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, item)}
                          onClick={() => handleRemoveItem(item.id, tier)}
                          className="w-14 h-[74px] relative overflow-hidden cursor-grab active:cursor-grabbing group shadow border border-wm-border/50 rounded flex-shrink-0 transition duration-150 hover:scale-103"
                          title={`Seret untuk memindahkan, klik untuk hapus`}
                        >
                          <img src={item.poster_url} className="w-full h-full object-cover transition duration-300 group-hover:scale-105 pointer-events-none" alt="" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-extrabold p-1 text-center leading-tight transition duration-150 pointer-events-none">
                            Hapus
                          </div>
                        </div>
                      ))}
                      {builderRows[tier].length === 0 && (
                        <span className="text-[10px] text-wm-text/30 italic font-semibold self-center ml-2 select-none">Kosong (Seret item kemari)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contents Pool Selector */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-wm-text/60">Pilih Konten dari Pool ({category})</h4>
                  <p className="text-[10px] text-wm-text/50">Seret poster ke atas untuk menilainya. Seret kembali ke pool untuk menghapus.</p>
                </div>
                <input
                  type="text"
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  placeholder="Cari judul konten di pool..."
                  className="rounded-xl border border-wm-border bg-wm-bg px-3.5 py-2 text-xs text-wm-texth placeholder-wm-text/40 outline-none focus:border-wm-mint w-full sm:w-64 transition"
                />
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropToPool(e)}
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-80 overflow-y-auto border border-wm-border bg-wm-bg/30 p-4 rounded-xl"
              >
                {filteredPool.map((item) => (
                  <div
                    key={item.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="group relative rounded-xl border border-wm-border bg-wm-card overflow-hidden flex flex-col shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition duration-150"
                    title="Seret item ini ke baris tier di atas"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-wm-bg pointer-events-none">
                      <img src={item.poster_url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-center">
                        <p className="text-[9px] font-bold text-white truncate">{item.title}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-0.5 p-1 bg-wm-bg border-t border-wm-border">
                      {TIERS.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleAddItemToRow(item.id, tier)}
                          className={`h-5 text-[8px] font-black rounded flex items-center justify-center cursor-pointer transition active:scale-90 ${TIER_COLORS[tier]}`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredPool.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-wm-text/40 italic font-semibold">
                    Tidak ada konten yang tersedia di pool.
                  </div>
                )}
              </div>
            </div>

            {/* Publish buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setBuilderRows({ S: [], A: [], B: [], C: [], D: [], F: [] });
                  toast.success("Board dibersihkan!");
                }}
                className="rounded-xl border border-wm-border bg-wm-bg px-5 py-3 text-xs font-bold text-wm-coral hover:bg-wm-coral/10 cursor-pointer transition"
              >
                Clear Board
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="rounded-xl border border-wm-border bg-wm-bg px-5 py-3 text-xs font-bold text-wm-text hover:bg-wm-card hover:text-wm-texth cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 rounded-xl bg-wm-coral px-6 py-3 text-xs font-bold text-white hover:bg-wm-coral/95 cursor-pointer shadow-md shadow-wm-coral/15 transition"
                >
                  <Send size={14} />
                  <span>Publikasikan ke Publik</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Published Tier Lists Gallery */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-wm-texth"> Perpustakaan Tier List Publik</h3>
        
        {tierLists.length > 0 ? (
          <div className="space-y-8">
            {tierLists.map((list) => (
              <div
                key={list.id}
                className="rounded-2xl border border-wm-border bg-wm-card p-6 space-y-4 shadow-sm"
              >
                {/* Header card info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-wm-texth leading-tight">{list.title}</h4>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <img src={list.user.avatar} className="h-6 w-6 rounded-md bg-wm-bg border border-wm-border" alt="" />
                      <span className="text-2xs text-wm-text/60">
                        Oleh: <strong>@{list.user.username}</strong>
                      </span>
                      <span className="rounded bg-wm-bg px-2 py-0.5 text-3xs font-bold text-wm-text border border-wm-border capitalize">
                        Kategori: {list.category}
                      </span>
                    </div>
                  </div>

                  {/* Likes button */}
                  <button
                    onClick={() => handleLikeTierList(list.id)}
                    className={`flex items-center gap-1.5 text-2xs border rounded-xl px-3 py-2 transition cursor-pointer ${
                      list.is_liked
                        ? "border-wm-coral bg-wm-coral/10 text-wm-coral font-bold"
                        : "border-wm-border bg-wm-bg text-wm-text hover:text-wm-texth"
                    }`}
                  >
                    <Heart size={14} fill={list.is_liked ? "currentColor" : "none"} />
                    <span>Suka ({list.likes_count})</span>
                  </button>
                </div>

                {/* Tier display box */}
                <div className="rounded-xl overflow-hidden border border-wm-border divide-y divide-wm-border/50 shadow-inner">
                  {list.rows.map((row) => {
                    return (
                      <div key={row.id} className="flex min-h-16 items-stretch">
                        <div className={`w-14 sm:w-16 flex-shrink-0 flex items-center justify-center font-black text-sm select-none text-center ${TIER_COLORS[row.label]}`}>
                          {row.label}
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2 px-4 py-2.5 bg-wm-bg/20 items-center overflow-x-auto min-h-16">
                          {row.items.map((item) => (
                            <Link
                              key={item.id}
                              to={`/detail/${item.content.id}`}
                              className="w-11 h-[58px] relative overflow-hidden rounded border border-wm-border/50 shadow-sm flex-shrink-0 group"
                              title={`Klik untuk lihat detail ${item.content.title}`}
                            >
                              <img src={item.content.poster_url} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" alt="" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-extrabold p-0.5 text-center leading-tight transition duration-150">
                                Detail
                              </div>
                            </Link>
                          ))}
                          {row.items.length === 0 && (
                            <span className="text-[10px] text-wm-text/20 select-none italic ml-2">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/10 border-dashed text-wm-text/50">
            <p className="text-sm">Belum ada tier list publik yang dibuat.</p>
          </div>
        )}
      </div>

    </div>
  );
}