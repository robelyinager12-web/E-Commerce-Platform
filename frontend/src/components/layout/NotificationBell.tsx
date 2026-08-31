import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(id: string, isRead: boolean, type: string) {
    if (!isRead) await markRead(id);
    setIsOpen(false);
    if (type === "order_placed" || type === "order_status") {
      navigate("/orders");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-ink/80 hover:text-teal"
        aria-label="Notifications"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[10px] text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-sm border border-hairline bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="font-display text-sm font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="font-sans text-xs text-teal hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center font-sans text-sm text-muted">
                Nothing here yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n.id, n.is_read, n.type)}
                  className={`block w-full border-b border-hairline px-4 py-3 text-left last:border-0 hover:bg-paper ${
                    n.is_read ? "" : "bg-teal-light/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-sans text-sm font-medium text-ink">{n.title}</p>
                    {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />}
                  </div>
                  <p className="mt-0.5 font-sans text-xs text-ink/70">{n.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}