import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function AdminRoute({ children }) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    toast.error("Silakan login sebagai Admin terlebih dahulu!");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    toast.error("Akses ditolak! Halaman ini khusus untuk Administrator.");
    return <Navigate to="/" replace />;
  }

  return children;
}
