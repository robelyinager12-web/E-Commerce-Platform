import { useMemo, useState } from "react";
import { Category } from "../../types/category.types";
import { useLanguage } from "../../context/LanguageContext";
import { PickerSheet } from "../common/PickerSheet";
import { ChevronDownIcon } from "../layout/Icons";

interface CategoryPickerProps {
  categories: Category[];
  onSelect: (categoryId: string, label: string) => void;
  onClose: () => void;
}

/** Two-level category picker: tap a group to drill in, tap a leaf to choose it. */
export function CategoryPicker({ categories, onSelect, onClose }: CategoryPickerProps) {
  const { t } = useLanguage();
  const [parent, setParent] = useState<Category | null>(null);

  const { topLevel, childrenOf } = useMemo(() => {
    const map = new Map<string, Category[]>();
    const tops: Category[] = [];
    for (const c of categories) {
      if (c.parent_id) map.set(c.parent_id, [...(map.get(c.parent_id) ?? []), c]);
      else tops.push(c);
    }
    return { topLevel: tops, childrenOf: map };
  }, [categories]);

  const items = parent ? childrenOf.get(parent.id) ?? [] : topLevel;
  const row =
    "flex w-full items-center justify-between border-b border-hairline px-5 py-4 text-left font-sans text-base text-ink last:border-0 hover:bg-paper";

  function choose(category: Category) {
    const hasChildren = (childrenOf.get(category.id) ?? []).length > 0;
    if (hasChildren && !parent) {
      setParent(category);
      return;
    }
    onSelect(category.id, parent ? `${parent.name} › ${category.name}` : category.name);
  }

  return (
    <PickerSheet
      title={parent ? parent.name : t("postSelectCategory")}
      onClose={onClose}
      onBack={parent ? () => setParent(null) : undefined}
    >
      {items.map((category) => {
        const hasChildren = !parent && (childrenOf.get(category.id) ?? []).length > 0;
        return (
          <button key={category.id} type="button" onClick={() => choose(category)} className={row}>
            <span>{category.name}</span>
            {hasChildren && <ChevronDownIcon className="-rotate-90 text-ink/40" />}
          </button>
        );
      })}
    </PickerSheet>
  );
}