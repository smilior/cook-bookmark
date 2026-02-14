import { notFound } from "next/navigation";
import { getRecipeById, getCategories } from "@/lib/actions/recipe";
import { EditRecipeForm } from "./edit-form";
import type { Ingredient, NutritionInfo } from "@/lib/db/types";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, categories] = await Promise.all([
    getRecipeById(id),
    getCategories(),
  ]);

  if (!recipe) {
    notFound();
  }

  const ingredients = parseJson<Ingredient[]>(recipe.ingredients, []);
  const steps = parseJson<string[]>(recipe.steps, []);
  const nutrition = parseJson<NutritionInfo>(recipe.nutrition, {});

  const initialData = {
    title: recipe.title,
    sourceUrl: recipe.sourceUrl ?? "",
    imageUrl: recipe.imageUrl ?? "",
    cookingTime: recipe.cookingTime ?? "",
    servings: recipe.servings ?? "",
    calories: recipe.calories ?? "",
    categoryId: recipe.categoryId ?? "",
    rating: recipe.rating ?? 0,
    ingredients,
    steps,
    nutrition,
    tags: recipe.tags.map((t) => t.name),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">レシピを編集</h1>
      <EditRecipeForm
        recipeId={recipe.id}
        initialData={initialData}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
