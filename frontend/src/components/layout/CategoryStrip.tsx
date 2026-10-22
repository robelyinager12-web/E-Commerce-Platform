import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchCategories } from "../../services/category.service";
import { Category } from "../../types/category.types";
import { useLanguage } from "../../context/LanguageContext";

/** Desktop category navigation row shown under the main header bar. */
export function CategoryStrip() {
  const { t } = useLanguage();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats.filter((c) => !c.parent_id));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const params = new URLSearchParams(location.search);
  const activeCategory = location.pathname === "/listings" ? params.get("category") : null;
  const allActive = location.pathname === "/listings" && !activeCategory;

  const base = "whitespace-nowrap border-b-2 py-2.5 font-sans text-sm transition-colors";
  const idle = "border-transparent text-ink/70 hover:text-teal";
  const active = "border-teal text-teal";

  return (
    <nav
      aria-label={t("categories")}
      className="hidden border-t border-hairline lg:block"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6">
        <Link to="/listings" className={`${base} font-medium ${allActive ? active : idle}`}>
          {t("allCategories")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/listings?category=${encodeURIComponent(c.slug)}`}
            className={`${base} ${activeCategory === c.slug ? active : idle}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}