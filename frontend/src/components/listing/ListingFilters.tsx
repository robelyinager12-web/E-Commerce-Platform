import { Category } from "../../types/category.types";

// Simplified Ethiopian regions list for the location filter.
const REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "SNNPR",
  "Sidama",
  "Somali",
  "Afar",
  "Dire Dawa",
];

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
  return (
    <aside className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Sort by</h3>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="input-field"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Region</h3>
        <select value={region} onChange={(e) => onRegionChange(e.target.value)} className="input-field">
          <option value="">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Condition</h3>
        <select
          value={condition}
          onChange={(e) => onConditionChange(e.target.value)}
          className="input-field"
        >
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="used">Used</option>
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
          Price range (Br)
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