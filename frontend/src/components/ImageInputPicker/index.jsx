import { useState, useRef } from "react";
import { Link, Upload, Image, X, Loader2 } from "lucide-react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function ImageInputPicker({
  value,
  onChange,
  placeholder = "Masukkan URL Gambar atau upload...",
  label = "Gambar",
}) {
  const [mode, setMode] = useState("url"); // 'url' | 'file'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File yang dipilih harus berupa gambar!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.url);
      toast.success("Gambar berhasil di-upload!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal meng-upload gambar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="block text-2xs font-extrabold uppercase tracking-wider text-wm-text/70">{label}</label>}
        
        {/* Toggle Mode URL vs File */}
        <div className="flex items-center rounded-lg border border-wm-border bg-wm-bg p-0.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition cursor-pointer ${
              mode === "url" ? "bg-wm-card text-wm-accent font-black shadow-xs" : "text-wm-text/50 hover:text-wm-texth"
            }`}
          >
            <Link size={11} />
            <span>URL Link</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition cursor-pointer ${
              mode === "file" ? "bg-wm-card text-wm-accent font-black shadow-xs" : "text-wm-text/50 hover:text-wm-texth"
            }`}
          >
            <Upload size={11} />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Input Mode Switcher */}
      {mode === "url" ? (
        <div className="relative">
          <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wm-text/40" />
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-wm-border bg-wm-bg py-2.5 pl-9 pr-8 text-xs text-wm-texth outline-none focus:border-wm-accent transition"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wm-text/40 hover:text-rose-400 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-wm-accent/40 bg-wm-accent/5 p-3 text-xs font-bold text-wm-accent hover:bg-wm-accent/15 transition cursor-pointer active:scale-98"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Meng-upload Gambar...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Pilih File Dari Komputer / HP</span>
              </>
            )}
          </button>

          {value && (
            <div className="relative h-10 w-10 rounded-xl border border-wm-border overflow-hidden bg-wm-card flex-shrink-0">
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl hover:bg-rose-600"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
