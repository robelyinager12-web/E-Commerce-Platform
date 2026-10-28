import { useEffect, useState, useCallback } from "react";
import { fetchUsersAdmin, updateUserAdmin } from "../../services/adminUser.service";
import { AdminUser } from "../../types/adminUser.types";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchUsersAdmin({ search: search || undefined })
      .then(({ items }) => setUsers(items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(load, [load]);

  async function handleToggleActive(user: AdminUser) {
    setPendingId(user.id);
    try {
      await updateUserAdmin(user.id, { isActive: !user.is_active });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-64 !py-2 text-sm"
        />
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead className="bg-white text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Listings</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-ink">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{u.role}</td>
                  <td className="px-4 py-3">{u.listing_count}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                        u.is_active ? "bg-teal-light text-teal-dark" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {u.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      disabled={pendingId === u.id}
                      className="text-teal hover:underline disabled:opacity-50"
                    >
                      {u.is_active ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}