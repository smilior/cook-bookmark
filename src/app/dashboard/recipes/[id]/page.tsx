import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ExternalLink, UtensilsCrossed, Lightbulb } from "lucide-react";
import { getRecipeById } from "@/lib/actions/recipe";
import { StarRating } from "@/components/star-rating";
import { IngredientList } from "@/components/ingredient-list";
import { StepList } from "@/components/step-list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RecipeDetailActions } from "@/components/recipe-detail";
import type { Ingredient, Step, NutritionInfo } from "@/lib/db/types";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const ingredients = parseJson<Ingredient[]>(recipe.ingredients, []);
  const steps = parseJson<(Step | string)[]>(recipe.steps, []);
  const nutrition = parseJson<NutritionInfo>(recipe.nutrition, {});
  const tips = parseJson<string[]>(recipe.tips, []);
  const hasNutrition = Object.keys(nutrition).length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Hero image */}
      {recipe.imageUrl ? (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      ) : (
        <div className="mb-6 flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
          <UtensilsCrossed className="h-16 w-16 text-muted-foreground/40" />
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold">{recipe.title}</h1>

      {/* Meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {recipe.rating && <StarRating value={recipe.rating} readonly size="sm" />}
        {recipe.cookingTime && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookingTime}</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-4">
        <RecipeDetailActions recipeId={recipe.id} isFavorite={recipe.isFavorite} />
      </div>

      {/* User info */}
      {recipe.userName && (
        <div className="mb-4 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={recipe.userImage ?? undefined} />
            <AvatarFallback className="text-xs">
              {recipe.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{recipe.userName}</span>
        </div>
      )}

      {/* Category + Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {recipe.categoryName && <Badge variant="secondary">{recipe.categoryName}</Badge>}
        {recipe.tags.map((t) => (
          <Badge key={t.id} variant="outline">
            {t.name}
          </Badge>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">材料</h2>
          <IngredientList ingredients={ingredients} />
          <Separator className="my-6" />
        </>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">作り方</h2>
          <StepList steps={steps} />
          {(tips.length > 0 || hasNutrition) && <Separator className="my-6" />}
        </>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">ポイント・コツ</h2>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                {tip}
              </li>
            ))}
          </ul>
          {hasNutrition && <Separator className="my-6" />}
        </>
      )}

      {/* Nutrition */}
      {hasNutrition && (
        <>
          <h2 className="mb-3 text-lg font-semibold">栄養情報</h2>
          <dl className="space-y-1">
            {Object.entries(nutrition).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {/* Source link */}
      {recipe.sourceUrl && (
        <div className="mt-6">
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            元のレシピを見る
          </a>
        </div>
      )}
    </div>
  );
}
