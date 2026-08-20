import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function Register() {
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    if (username.trim().length < 3) {
      toast.error("Username minimal 3 karakter!");
      return;
    }

    if (password.trim().length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    const res = await register(username, email, password);
    if (res.success) {
      toast.success("Akun berhasil dibuat! Selamat datang di GabutHub.");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-wm-texth">Daftar Akun Baru</h3>
        <p className="text-xs text-wm-text/75 mt-1">Gabung sekarang dan bagikan seleramu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/45" size={16} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pilih nama unik..."
              className="w-full rounded-xl border border-wm-border bg-wm-bg py-3.5 pl-11 pr-4 text-xs text-wm-texth outline-none focus:border-wm-mint transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/45" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ketik alamat email aktif..."
              className="w-full rounded-xl border border-wm-border bg-wm-bg py-3.5 pl-11 pr-4 text-xs text-wm-texth outline-none focus:border-wm-mint transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/45" size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Buat password aman..."
              className="w-full rounded-xl border border-wm-border bg-wm-bg py-3.5 pl-11 pr-4 text-xs text-wm-texth outline-none focus:border-wm-mint transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-wm-coral py-3.5 text-xs font-bold text-white hover:bg-wm-coral/95 active:scale-95 disabled:opacity-50 transition duration-300 shadow-md shadow-wm-coral/15 cursor-pointer"
        >
          {loading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
        </button>
      </form>

      <div className="flex justify-between items-center text-xs border-t border-wm-border/50 pt-4">
        <span className="text-wm-text/60">Sudah punya akun?</span>
        <Link to="/login" className="flex items-center gap-1 font-bold text-wm-mint hover:text-wm-mint/90">
          <span>Masuk</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}