import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export function NotFound() {
  const { localize } = useLanguage();
  return (
    <div className="mx-auto flex max-w-md flex-col items-start px-6 py-24">
      <p className="price-tag text-sm text-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        {localize("Page not found")}
      </h1>
      <p className="mt-3 font-sans text-sm text-muted">
        {localize("The page you're looking for doesn't exist or may have moved.")}
      </p>
      <Link to="/" className="btn-primary mt-6">
        {localize("Back to shop")}
      </Link>
    </div>
  );
}