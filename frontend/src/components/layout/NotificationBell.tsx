import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { BellIcon } from "./Icons";

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
  const { t } = useLanguage();

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
        className="relative flex h-9 w-9 items-center justify-center rounded-sm text-ink/80 hover:bg-teal-light hover:text-teal"
        aria-label={t("notifications")}
        title={t("notifications")}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-mono text-[10px] text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-28 z-40 rounded-sm sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 border border-hairline bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="font-display text-sm font-semibold text-ink">{t("notifications")}</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="font-sans text-xs text-teal hover:underline"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center font-sans text-sm text-muted">
                {t("nothingYet")}
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