"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  ArrowDownUp,
  UtensilsCrossed,
  Plus,
  Clock,
  ExternalLink,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { StarRating } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import { toggleFavorite } from "@/lib/actions/recipe";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  id: string;
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  rating: number | null;
  isFavorite: boolean;
  cookingTime: string | null;
  servings: string | null;
  categoryId: string | null;
  categoryName: string | null;
  userName: string | null;
  createdAt: Date;
  tags: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface DashboardContentProps {
  recipes: Recipe[];
  categories: Category[];
  initialSearch: string;
  initialCategoryId: string | null;
  initialFavoritesOnly: boolean;
  initialSortByRating: boolean;
}

export function DashboardContent({
  recipes,
  categories,
  initialSearch,
  initialCategoryId,
  initialFavoritesOnly,
  initialSortByRating,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.push(qs ? `/dashboard?${qs}` : "/dashboard");
    },
    [router, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams({ search: value || null });
    },
    [updateParams]
  );

  const handleCategorySelect = useCallback(
    (id: string | null) => {
      updateParams({ categoryId: id });
    },
    [updateParams]
  );

  const handleToggleFavorites = useCallback(() => {
    updateParams({ favorites: initialFavoritesOnly ? null : "1" });
  }, [updateParams, initialFavoritesOnly]);

  const handleToggleSort = useCallback(() => {
    updateParams({ sort: initialSortByRating ? null : "rating" });
  }, [updateParams, initialSortByRating]);

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      await toggleFavorite(id);
      router.refresh();
    },
    [router]
  );

  return (
    <div className="space-y-4">
      <SearchBar
        value={initialSearch}
        onChange={handleSearchChange}
        placeholder="レシピを検索..."
      />

      <div className="space-y-3">
        <CategoryChips
          categories={categories}
          selectedId={initialCategoryId}
          onSelect={handleCategorySelect}
        />

        <div className="flex gap-2">
          <Button
            variant={initialFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFavorites}
            className="gap-1.5"
          >
            <Heart
              className={`h-4 w-4 ${initialFavoritesOnly ? "fill-current" : ""}`}
            />
            お気に入り
          </Button>
          <Button
            variant={initialSortByRating ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSort}
            className="gap-1.5"
          >
            <ArrowDownUp className="h-4 w-4" />
            評価順
          </Button>
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border bg-card">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
            >
              {/* Favorite */}
              <FavoriteButton
                isFavorite={recipe.isFavorite}
                onToggle={() => handleToggleFavorite(recipe.id)}
                size="sm"
              />

              {/* Title + Meta */}
              <Link
                href={`/dashboard/recipes/${recipe.id}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-medium">{recipe.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {recipe.categoryName && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {recipe.categoryName}
                    </Badge>
                  )}
                  {recipe.cookingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.cookingTime}
                    </span>
                  )}
                  {recipe.servings && (
                    <span>{recipe.servings}</span>
                  )}
                  {recipe.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs px-1.5 py-0">
                      {tag.name}
                    </Badge>
                  ))}
                  {recipe.userName && (
                    <span>{recipe.userName}</span>
                  )}
                </div>
              </Link>

              {/* Rating */}
              <div className="hidden sm:block">
                <StarRating value={recipe.rating ?? 0} readonly size="sm" />
              </div>

              {/* Source link */}
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            レシピがありません
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            最初のレシピを追加しましょう
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/dashboard/recipes/new">
              <Plus className="h-4 w-4" />
              レシピを追加
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
