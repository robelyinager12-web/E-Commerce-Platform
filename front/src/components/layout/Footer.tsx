import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/translations";
import { getMyAdvertsPath } from "../../utils/profileRoutes";

export function Footer() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const heading = "font-mono text-[11px] uppercase tracking-widest text-white/70";
  const link = "block py-1 text-white/85 transition-colors hover:text-white hover:underline";

  return (
    <footer className="mt-24 border-t border-white/15 bg-teal">
      <div className="mx-auto max-w-6xl px-6 py-12 font-sans text-sm text-white/75">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-semibold text-white">Heroy Market</p>
            <p className="mt-3 max-w-xs">{t("footerBlurb")}</p>
          </div>

          <div>
            <p className={heading}>{t("shop")}</p>
            <div className="mt-3">
              <Link to="/listings" className={link}>
                {t("browseAll")}
              </Link>
              <Link to="/saved" className={link}>
                {t("saved")}
              </Link>
            </div>
          </div>

          <div>
            <p className={heading}>{t("sell")}</p>
            <div className="mt-3">
              <Link to="/listings/new" className={link}>
                {t("postAd")}
              </Link>
              <Link to={getMyAdvertsPath(user?.id)} className={link}>
                {t("myListings")}
              </Link>
            </div>
          </div>

          <div>
            <p className={heading}>{t("account")}</p>
            <div className="mt-3">
              {user ? (
                <Link to="/account" className={link}>
                  {t("account")}
                </Link>
              ) : (
                <>
                  <Link to="/login" className={link}>
                    {t("signIn")}
                  </Link>
                  <Link to="/register" className={link}>
                    {t("register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/20 pt-6 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} Heroy Market. {t("allRightsReserved")}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{t("shippingReturns")}</span>
            <span>{t("contact")}</span>
            <span>{t("privacy")}</span>
            <div className="flex items-center gap-1" role="group" aria-label={t("language")}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={l.code === language}
                  className={`rounded-sm px-2 py-1 text-xs ${
                    l.code === language
                      ? "bg-white font-medium text-teal"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}