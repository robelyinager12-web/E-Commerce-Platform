import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export function Messages() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="font-sans text-sm text-muted">{t("account")}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t("messages")}
          </h1>
        </div>

        <section
          aria-label={t("messages")}
          className="grid min-h-[480px] overflow-hidden rounded-xl border border-hairline bg-white shadow-sm md:grid-cols-[320px_minmax(0,1fr)]"
        >
          <div className="border-b border-hairline md:border-b-0 md:border-r">
            <div className="border-b border-hairline px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">{t("messages")}</h2>
            </div>
            <div className="border-b border-hairline p-4">
              <label htmlFor="message-search" className="sr-only">
                {t("searchMessages")}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-hairline bg-paper px-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="message-search"
                  type="search"
                  placeholder={t("searchMessages")}
                  disabled
                  className="min-w-0 flex-1 border-0 bg-transparent py-2.5 font-sans text-sm text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center md:min-h-[340px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-1 2v-5.5a7.5 7.5 0 1 1 16-4Z" />
                  <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
                </svg>
              </div>
              <p className="mt-3 font-sans text-sm font-medium text-ink">{t("noMessagesYet")}</p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-muted">
                {t("messagesUnavailable")}
              </p>
            </div>
          </div>

          <div className="hidden items-center justify-center bg-white px-8 py-12 text-center md:flex">
            <div className="max-w-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper text-teal">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5h16v12H9l-5 3v-15Z" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold text-ink">{t("selectConversation")}</h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted">{t("messagesUnavailable")}</p>
              <Link to="/listings" className="btn-primary mt-6 inline-flex">
                {t("browseAll")}
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-8 text-center md:hidden">
            <Link to="/listings" className="font-sans text-sm font-medium text-teal hover:underline">
              {t("browseAll")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
