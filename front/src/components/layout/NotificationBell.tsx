import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { BellIcon } from "./Icons";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => navigate("/profile/notifications")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal shadow-sm ring-1 ring-white/70 transition-colors hover:bg-teal-light hover:text-teal-dark focus:outline-none focus:ring-2 focus:ring-white/80"
      aria-label={t("notifications")}
      title={t("notifications")}
    >
      <BellIcon width={19} height={19} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-teal bg-gold px-1 font-mono text-[9px] font-semibold text-paper">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}