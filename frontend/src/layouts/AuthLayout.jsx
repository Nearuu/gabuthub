import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AuthLayout() {
  const { token } = useAuthStore();

  // If already logged in, redirect to home
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wm-bg px-4 py-12 text-wm-text relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-wm-coral/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-wm-mint/10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wm-coral text-2xl font-black text-white shadow-lg shadow-wm-coral/20 mb-3">
            G
          </div>
          <h2 className="text-2xl font-black text-wm-texth">GabutHub</h2>
          <p className="mt-1 text-xs text-wm-text/60 font-black tracking-widest uppercase">Entertainment Hub</p>
        </div>

        <div className="rounded-2xl border border-wm-border bg-wm-card p-8 shadow-2xl transition-colors duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
