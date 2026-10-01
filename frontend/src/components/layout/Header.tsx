import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSavedListings } from "../../context/SavedListingsContext";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { user, logout } = useAuth();
  const { saved } = useSavedListings();

  return (
    <header className="border-b border-hairline bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="group">
          <div className="font-display text-2xl font-semibold tracking-tight text-ink">
            Aurora Market
          </div>
          <div className="mt-1 flex flex-col gap-[3px]">
            <span className="block h-px w-full bg-ink/70" />
            <span className="block h-px w-2/3 bg-ink/30" />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 font-sans text-sm text-ink/80 md:flex">
          <Link to="/listings" className="hover:text-teal">
            Browse all
          </Link>
        </nav>

        <div className="flex items-center gap-5 font-sans text-sm">
          {user && (
            <Link to="/saved" className="relative text-ink/80 hover:text-teal">
              Saved
              {saved.length > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[10px] text-paper">
                  {saved.length}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/listings/new" className="btn-primary !py-2">
                + Post ad
              </Link>
              <NotificationBell />
              {["super_admin", "admin", "staff"].includes(user.role) && (
                <Link to="/admin" className="text-ink/80 hover:text-teal">
                  Admin
                </Link>
              )}
              <Link to="/account" className="text-ink/80 hover:text-teal">
                {user.firstName}
              </Link>
              <button
                onClick={() => void logout()}
                className="text-ink/50 hover:text-ink"
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !py-2">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}