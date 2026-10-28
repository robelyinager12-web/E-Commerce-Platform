import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ADMIN_ROLES = ["super_admin", "admin", "staff"];

export function AdminRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}