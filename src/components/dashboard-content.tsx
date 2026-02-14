"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { Heart, ArrowDownUp, UtensilsCrossed, Plus } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { RecipeCard } from "@/components/recipe-card";
import { toggleFavorite } from "@/lib/actions/recipe";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: string;
  title: string;
  imageUrl: string | null;
  rating: number | null;
  isFavorite: boolean;
  cookingTime: string | null;
  categoryId: string | null;
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                title: recipe.title,
                imageUrl: recipe.imageUrl,
                rating: recipe.rating ?? undefined,
                isFavorite: recipe.isFavorite,
                cookingTime: recipe.cookingTime
                  ? parseInt(recipe.cookingTime, 10) || null
                  : null,
              }}
              onToggleFavorite={(id) => handleToggleFavorite(id)}
            />
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
