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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {allCategories.map((cat) => {
        const isActive =
          cat.id === "__all__" ? selectedId == null : cat.id === selectedId;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id === "__all__" ? null : cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
