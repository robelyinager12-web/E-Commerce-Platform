import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormField } from "../components/common/FormField";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useLanguage } from "../context/LanguageContext";

export function Account() {
  const { localize } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  if (!user) return null;

  const hasChanges =
    firstName !== user.firstName || lastName !== user.lastName || phone !== (user.phone ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasChanges || isSaving) return;

    setError(null);
    setSaved(false);
    setIsSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      });
      setSaved(true);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  const sideLink = "block rounded-md px-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-sans text-sm text-muted">
          <Link to="/account" className="hover:text-teal">
            {localize("My account")}
          </Link>
          <span className="mx-2">/</span>
          {localize("Settings")}
        </p>
        <h1 className="mb-7 font-display text-2xl font-semibold text-ink">{localize("Account settings")}</h1>

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label={localize("Account settings")} className="h-fit rounded-lg bg-white p-2 shadow-sm">
            <p className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              My account
            </p>
            <Link
              to="/profile/settings/contact-details"
              aria-current="page"
              className={`${sideLink} bg-teal-light font-medium text-teal-dark`}
            >
              {localize("Contact details")}
            </Link>
            <Link to="/profile/shop" className={`${sideLink} text-ink hover:bg-paper`}>
              {localize("My shop")}
            </Link>
            <Link to="/profile/feedback" className={`${sideLink} text-ink hover:bg-paper`}>
              {localize("Feedback")}
            </Link>
            <Link to="/profile/statistics" className={`${sideLink} text-ink hover:bg-paper`}>
              {localize("Performance")}
            </Link>
          </nav>

          <section className="rounded-lg bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7 border-b border-hairline pb-5">
              <h2 className="font-display text-xl font-semibold text-ink">{localize("Contact details")}</h2>
              <p className="mt-2 font-sans text-sm text-muted">
                {localize("Keep your contact information up to date so buyers can recognize your account.")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="contact-first-name"
                  label={localize("First name")}
                  required
                  autoComplete="given-name"
                  maxLength={100}
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setSaved(false);
                  }}
                />
                <FormField
                  id="contact-last-name"
                  label={localize("Last name")}
                  required
                  autoComplete="family-name"
                  maxLength={100}
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    setSaved(false);
                  }}
                />
              </div>

              <FormField
                id="contact-email"
                label={localize("Email address")}
                type="email"
                autoComplete="email"
                value={user.email}
                readOnly
                aria-describedby="email-note"
              />
              <p id="email-note" className="-mt-4 font-sans text-xs text-muted">
                {localize("Email address changes are not available here.")}
              </p>
              <FormField
                id="contact-phone"
                label={localize("Phone number")}
                type="tel"
                autoComplete="tel"
                maxLength={20}
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setSaved(false);
                }}
              />

              {error && <p role="alert" className="font-sans text-sm text-red-700">{error}</p>}
              {saved && <p role="status" className="font-sans text-sm text-teal-dark">{localize("Contact details saved.")}</p>}

              <button
                type="submit"
                disabled={!hasChanges || isSaving || !firstName.trim() || !lastName.trim()}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {localize(isSaving ? "Saving…" : "Save changes")}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
