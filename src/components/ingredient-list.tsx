import { Separator } from "@/components/ui/separator";

interface Ingredient {
  name: string;
  amount: string;
  group?: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const hasGroups = ingredients.some((i) => i.group?.trim());

  if (!hasGroups) {
    return (
      <ul className="space-y-0">
        {ingredients.map((item, i) => (
          <li key={i}>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">{item.name}</span>
              <span className="text-sm text-muted-foreground">{item.amount}</span>
            </div>
            {i < ingredients.length - 1 && <Separator />}
          </li>
        ))}
      </ul>
    );
  }

  // Group ingredients by group name, preserving order
  const groups: { name: string; items: Ingredient[] }[] = [];
  for (const item of ingredients) {
    const groupName = item.group?.trim() || "";
    const last = groups[groups.length - 1];
    if (last && last.name === groupName) {
      last.items.push(item);
    } else {
      groups.push({ name: groupName, items: [item] });
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.name && (
            <h3 className="mb-1 text-sm font-semibold text-primary">
              {group.name}
            </h3>
          )}
          <ul className="space-y-0">
            {group.items.map((item, i) => (
              <li key={i}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.amount}</span>
                </div>
                {i < group.items.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
          {gi < groups.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
