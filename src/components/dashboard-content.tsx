"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { CategoryChips } from "@/components/category-chips";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteRecipe, deleteRecipes } from "@/lib/actions/recipe";

interface Recipe {
  id: string;
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
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
}

export function DashboardContent({
  recipes,
  categories,
  initialSearch,
  initialCategoryId,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Selection mode ──
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Swipe state ──
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [showSwipeDeleteDialog, setShowSwipeDeleteDialog] = useState(false);
  const [swipeDeleteTargetId, setSwipeDeleteTargetId] = useState<string | null>(null);
  const [swipeDeleting, setSwipeDeleting] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const swipeRowRef = useRef<HTMLDivElement | null>(null);

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

  // ── Selection handlers ──
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await deleteRecipes(Array.from(selectedIds));
      setShowBulkDeleteDialog(false);
      exitSelectionMode();
      router.refresh();
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Swipe handlers ──
  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    if (selectionMode) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    // Close other swiped row
    if (swipedId && swipedId !== id) {
      setSwipedId(null);
    }
  };

  const handleTouchMove = (id: string, e: React.TouchEvent) => {
    if (selectionMode) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchCurrentX.current;
    const el = e.currentTarget.querySelector("[data-swipe-inner]") as HTMLElement | null;
    if (el && diff > 0) {
      el.style.transform = `translateX(-${Math.min(diff, 80)}px)`;
      el.style.transition = "none";
    }
  };

  const handleTouchEnd = (id: string, e: React.TouchEvent) => {
    if (selectionMode) return;
    const diff = touchStartX.current - touchCurrentX.current;
    const el = e.currentTarget.querySelector("[data-swipe-inner]") as HTMLElement | null;
    if (el) {
      el.style.transition = "transform 0.2s ease";
      if (diff >= 80) {
        el.style.transform = "translateX(-80px)";
        setSwipedId(id);
      } else {
        el.style.transform = "translateX(0)";
        setSwipedId(null);
      }
    }
  };

  const handleSwipeDeleteClick = (id: string) => {
    setSwipeDeleteTargetId(id);
    setShowSwipeDeleteDialog(true);
  };

  const handleSwipeDelete = async () => {
    if (!swipeDeleteTargetId) return;
    setSwipeDeleting(true);
    try {
      await deleteRecipe(swipeDeleteTargetId);
      setShowSwipeDeleteDialog(false);
      setSwipeDeleteTargetId(null);
      setSwipedId(null);
      router.refresh();
    } finally {
      setSwipeDeleting(false);
    }
  };

  // Reset swipe when clicking elsewhere
  const resetSwipe = () => {
    if (swipedId) {
      const el = document.querySelector(`[data-swipe-id="${swipedId}"] [data-swipe-inner]`) as HTMLElement | null;
      if (el) {
        el.style.transition = "transform 0.2s ease";
        el.style.transform = "translateX(0)";
      }
      setSwipedId(null);
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        value={initialSearch}
        onChange={handleSearchChange}
        placeholder="レシピを検索..."
      />

      <CategoryChips
        categories={categories}
        selectedId={initialCategoryId}
        onSelect={handleCategorySelect}
      />

      {recipes.length > 0 ? (
        <>
          {/* Selection mode header */}
          <div className="flex items-center justify-end gap-2">
            {selectionMode ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size}件選択中
                </span>
                {selectedIds.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    削除
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitSelectionMode}
                >
                  <X className="mr-1 h-4 w-4" />
                  キャンセル
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectionMode(true)}
              >
                選択
              </Button>
            )}
          </div>

          <div
            className="divide-y divide-border rounded-lg border bg-card"
            onClick={resetSwipe}
          >
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                data-swipe-id={recipe.id}
                className="relative overflow-hidden"
                onTouchStart={(e) => handleTouchStart(recipe.id, e)}
                onTouchMove={(e) => handleTouchMove(recipe.id, e)}
                onTouchEnd={(e) => handleTouchEnd(recipe.id, e)}
              >
                {/* Delete button revealed by swipe */}
                <button
                  className="absolute right-0 top-0 bottom-0 flex w-20 items-center justify-center bg-destructive text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipeDeleteClick(recipe.id);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                {/* Main row content */}
                <div
                  data-swipe-inner
                  className="relative flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent/50"
                  style={{ transform: "translateX(0)" }}
                >
                  {/* Checkbox in selection mode */}
                  {selectionMode && (
                    <Checkbox
                      checked={selectedIds.has(recipe.id)}
                      onCheckedChange={() => toggleSelection(recipe.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    />
                  )}

                  {/* Title + Meta */}
                  <Link
                    href={selectionMode ? "#" : `/dashboard/recipes/${recipe.id}`}
                    className="min-w-0 flex-1"
                    onClick={(e) => {
                      if (selectionMode) {
                        e.preventDefault();
                        toggleSelection(recipe.id);
                      }
                    }}
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

                  {/* Source link */}
                  {!selectionMode && recipe.sourceUrl && (
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
              </div>
            ))}
          </div>
        </>
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

      {/* Swipe delete confirmation dialog */}
      <Dialog open={showSwipeDeleteDialog} onOpenChange={setShowSwipeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>レシピを削除</DialogTitle>
            <DialogDescription>
              このレシピを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={swipeDeleting}>
                キャンセル
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleSwipeDelete}
              disabled={swipeDeleting}
            >
              {swipeDeleting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>レシピを一括削除</DialogTitle>
            <DialogDescription>
              {selectedIds.size}件のレシピを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={bulkDeleting}>
                キャンセル
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "削除中..." : `${selectedIds.size}件を削除`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
