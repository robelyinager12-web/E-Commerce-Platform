import { Link } from "react-router-dom";
import { Category } from "../../types/category.types";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronDownIcon } from "../layout/Icons";

/** Left-hand category list shown on the homepage (desktop). */
export function CategorySidebar({ categories }: { categories: Category[] }) {
  const { t } = useLanguage();

  return (
    <nav aria-label={t("categories")} className="card overflow-hidden">
      <ul>
        {categories.map((category) => (
          <li key={category.id} className="border-b border-hairline last:border-0">
            <Link
              to={`/listings?category=${encodeURIComponent(category.slug)}`}
              className="flex items-center justify-between px-4 py-3 font-sans text-sm text-ink transition-colors hover:bg-teal-light hover:text-teal-dark"
            >
              <span className="truncate">{category.name}</span>
              <ChevronDownIcon className="-rotate-90 shrink-0 text-ink/40" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}