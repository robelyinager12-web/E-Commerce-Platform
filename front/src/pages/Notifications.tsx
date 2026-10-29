import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNotifications } from "../context/NotificationContext";
import { Notification } from "../types/notification.types";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationColors(type: string): string {
  if (type.startsWith("order")) return "bg-blue-100 text-blue-700";
  if (type.startsWith("listing")) return "bg-emerald-100 text-emerald-700";
  if (type.startsWith("review")) return "bg-amber-100 text-amber-700";
  return "bg-violet-100 text-violet-700";
}

function NotificationIcon({ type }: { type: string }) {
  if (type.startsWith("order")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18l-1.5 13h-15L3 7Z" />
        <path d="M8 9V6a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (type.startsWith("listing")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 8-8h8l2 2v8l-8 8-10-10Z" />
        <circle cx="16" cy="8" r="1" />
      </svg>
    );
  }
  if (type.startsWith("review")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.43 1.08 6.25L12 17.13l-5.63 2.95 1.08-6.25L2.9 9.4l6.3-.9L12 2.8Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-15S6 15 6 9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (notification: Notification) => void;
}) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification)}
      className={`flex w-full items-start gap-4 border-b border-hairline px-4 py-5 text-left transition-colors last:border-b-0 hover:bg-paper sm:px-6 ${
        notification.is_read ? "bg-white" : "bg-teal-light/25"
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getNotificationColors(notification.type)}`}>
        <NotificationIcon type={notification.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="font-sans text-sm font-semibold text-ink">{notification.title}</span>
          {!notification.is_read && (
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal" aria-label={t("unread")} />
          )}
        </span>
        <span className="mt-1 block font-sans text-sm leading-relaxed text-ink/75">{notification.message}</span>
        <time dateTime={notification.created_at} className="mt-2 block font-sans text-xs text-muted">
          {formatNotificationDate(notification.created_at)}
        </time>
      </span>
    </button>
  );
}

export function Notifications() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  async function handleMarkRead(notification: Notification) {
    if (notification.is_read) return;
    setError(null);
    try {
      await markRead(notification.id);
    } catch (markError) {
      setError(getErrorMessage(markError));
    }
  }

  async function handleMarkAllRead() {
    setError(null);
    setIsMarkingAllRead(true);
    try {
      await markAllRead();
    } catch (markError) {
      setError(getErrorMessage(markError));
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-sans text-sm text-muted">{t("account")}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {t("notifications")}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={isMarkingAllRead}
              className="rounded-md px-3 py-2 font-sans text-sm font-medium text-teal hover:bg-white disabled:cursor-wait disabled:opacity-60"
            >
              {isMarkingAllRead ? t("saving") : t("markAllRead")}
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-sm">
          {isLoading ? (
            <p className="px-6 py-12 text-center font-sans text-sm text-muted">{t("loadingNotifications")}</p>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-light text-teal">
                <NotificationIcon type="notification" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink">{t("nothingYet")}</h2>
              <p className="mt-2 font-sans text-sm text-muted">{t("noNotificationsMessage")}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={(item) => void handleMarkRead(item)}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
