import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function AdminRoute({ children }) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    toast.error("Silakan login terlebih dahulu untuk mengakses halaman Admin!");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    toast.error("Akses ditolak! Anda bukan admin.");
    return <Navigate to="/" replace />;
  }

  return children;
}
