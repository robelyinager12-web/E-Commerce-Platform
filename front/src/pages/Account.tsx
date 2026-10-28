import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Account() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Your account</h1>

      <section className="card mb-10 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Profile</h2>
        <div className="grid grid-cols-1 gap-3 font-sans text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted">Name</p>
            <p className="text-ink">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <p className="text-muted">Email</p>
            <p className="text-ink">{user.email}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          <Link to="/listings/mine" className="btn-secondary !py-2 !text-sm">
            My listings
          </Link>
          <Link to="/saved" className="btn-secondary !py-2 !text-sm">
            Saved listings
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="font-sans text-sm text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}