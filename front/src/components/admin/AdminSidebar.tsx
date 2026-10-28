import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/listings", label: "Listings" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/users", label: "Users" },
];

export function AdminSidebar() {
  return (
    <nav className="flex flex-col gap-1 border-r border-hairline bg-white p-5">
      <p className="mb-3 px-2 font-mono text-xs uppercase tracking-widest text-muted">Admin</p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-sm px-3 py-2 font-sans text-sm ${
              isActive ? "bg-teal-light font-medium text-teal-dark" : "text-ink/80 hover:bg-paper"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}