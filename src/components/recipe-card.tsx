"use client";

import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    imageUrl?: string | null;
    rating?: number;
    isFavorite?: boolean;
    cookingTime?: number | null;
    createdByUser?: boolean;
  };
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

export function RecipeCard({ recipe, onToggleFavorite }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/dashboard/recipes/${recipe.id}`}>
        <div className="relative aspect-video bg-muted">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/dashboard/recipes/${recipe.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium">{recipe.title}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <StarRating value={recipe.rating ?? 0} readonly size="sm" />
          <div className="flex items-center gap-2">
            {recipe.cookingTime != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {recipe.cookingTime}分
              </span>
            )}
            <FavoriteButton
              isFavorite={recipe.isFavorite ?? false}
              onToggle={(next) => onToggleFavorite?.(recipe.id, next)}
              size="sm"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
