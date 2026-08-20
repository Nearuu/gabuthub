import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginVal || !password) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    const res = await login(loginVal, password);
    if (res.success) {
      toast.success("Berhasil masuk! Selamat bersenang-senang.");
      navigate("/");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-wm-texth">Selamat Datang Kembali</h3>
        <p className="text-xs text-wm-text/75 mt-1">Masuk menggunakan email atau username kamu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-wm-text/60 mb-2">Username / Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-wm-text/45" size={16} />
            <input
              type="text"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              placeholder="Ketik email atau username..."
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
              placeholder="Ketik password rahasia..."
              className="w-full rounded-xl border border-wm-border bg-wm-bg py-3.5 pl-11 pr-4 text-xs text-wm-texth outline-none focus:border-wm-mint transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-wm-coral py-3.5 text-xs font-bold text-white hover:bg-wm-coral/95 active:scale-95 disabled:opacity-50 transition duration-300 shadow-md shadow-wm-coral/15 cursor-pointer"
        >
          {loading ? "MEMPROSES..." : "MASUK KE GABUTHUB"}
        </button>
      </form>

      <div className="flex justify-between items-center text-xs border-t border-wm-border/50 pt-4">
        <span className="text-wm-text/60">Belum punya akun?</span>
        <Link to="/register" className="flex items-center gap-1 font-bold text-wm-mint hover:text-wm-mint/90">
          <span>Daftar</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}