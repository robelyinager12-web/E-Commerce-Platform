import { Category } from "../../types/category.types";
import { REGIONS } from "../../constants/regions";
import { useLanguage } from "../../context/LanguageContext";

interface ListingFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  region: string;
  onRegionChange: (region: string) => void;
  condition: string;
  onConditionChange: (condition: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
}

export function ListingFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  region,
  onRegionChange,
  condition,
  onConditionChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
}: ListingFiltersProps) {
  const { localize } = useLanguage();
  // Show top-level categories; expand the subcategories of the one that is currently selected.
  const topLevel = categories.filter((c) => !c.parent_id);
  const selected = categories.find((c) => c.slug === selectedCategory);
  const activeTopId = selected ? selected.parent_id ?? selected.id : null;
  const subCategories = activeTopId ? categories.filter((c) => c.parent_id === activeTopId) : [];

  return (
    <aside className="flex flex-col gap-8 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:self-start md:overflow-y-auto md:pr-1">
      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{localize("Sort by")}</h3>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="input-field"
        >
          <option value="newest">{localize("Newest")}</option>
          <option value="price_asc">{localize("Price: low to high")}</option>
          <option value="price_desc">{localize("Price: high to low")}</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{localize("Region")}</h3>
        <select value={region} onChange={(e) => onRegionChange(e.target.value)} className="input-field">
          <option value="">{localize("All regions")}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{localize("Condition")}</h3>
        <select
          value={condition}
          onChange={(e) => onConditionChange(e.target.value)}
          className="input-field"
        >
          <option value="">{localize("Any condition")}</option>
          <option value="new">{localize("New")}</option>
          <option value="used">{localize("Used")}</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{localize("Category")}</h3>
        <ul className="flex flex-col gap-1.5 font-sans text-sm">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={`hover:text-teal ${!selectedCategory ? "font-medium text-teal" : "text-ink/80"}`}
            >
              {localize("All categories")}
            </button>
          </li>
          {topLevel.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(category.slug)}
                className={`hover:text-teal ${
                  selectedCategory === category.slug ? "font-medium text-teal" : "text-ink/80"
                }`}
              >
                {category.name}
              </button>

              {category.id === activeTopId && subCategories.length > 0 && (
                <ul className="mb-1 ml-3 mt-1.5 flex flex-col gap-1.5 border-l border-hairline pl-3">
                  {subCategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => onCategoryChange(sub.slug)}
                        className={`text-left hover:text-teal ${
                          selectedCategory === sub.slug ? "font-medium text-teal" : "text-ink/70"
                        }`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
          {localize("Price range (Br)")}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={localize("Min")}
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="input-field !py-2"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder={localize("Max")}
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="input-field !py-2"
          />
        </div>
      </div>
    </aside>
  );
}