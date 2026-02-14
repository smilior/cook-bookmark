"use client";

interface Category {
  id: string;
  name: string;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: CategoryChipsProps) {
  const allCategories = [{ id: "__all__", name: "すべて" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const isActive =
          cat.id === "__all__" ? selectedId == null : cat.id === selectedId;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id === "__all__" ? null : cat.id)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
