import { Separator } from "@/components/ui/separator";

interface Ingredient {
  name: string;
  amount: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
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
