import { Category } from "../../types/category.types";
import { SortOption } from "../../types/product.types";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  name_asc: "Name: A to Z",
};

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
}: ProductFiltersProps) {
  return (
    <aside className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Sort by</h3>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="input-field"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Category</h3>
        <ul className="flex flex-col gap-1.5 font-sans text-sm">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange(null)}
              className={`hover:text-teal ${!selectedCategory ? "font-medium text-teal" : "text-ink/80"}`}
            >
              All categories
            </button>
          </li>
          {categories.map((category) => (
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
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
          Price range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="input-field !py-2"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="input-field !py-2"
          />
        </div>
      </div>
    </aside>
  );
}