import { Link } from "react-router-dom";
import { Category } from "../../types/category.types";
import { useLanguage } from "../../context/LanguageContext";
import { categoryIcon } from "../../constants/categoryIcons";
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
              className="flex items-center justify-between px-4 py-2.5 font-sans text-sm text-ink transition-colors hover:bg-teal-light hover:text-teal-dark"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className="w-6 shrink-0 text-center text-lg leading-none">
                  {categoryIcon(category.slug)}
                </span>
                <span className="truncate">{category.name}</span>
              </span>
              <ChevronDownIcon className="-rotate-90 shrink-0 text-ink/40" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}