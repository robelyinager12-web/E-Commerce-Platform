import { Outlet, Link } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline bg-white px-6 py-3">
        <Link to="/" className="font-display text-lg font-semibold text-ink">
          Aurora Market <span className="font-mono text-xs font-normal text-muted">/ admin</span>
        </Link>
      </header>
      <div className="grid grid-cols-[220px_1fr]">
        <AdminSidebar />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}