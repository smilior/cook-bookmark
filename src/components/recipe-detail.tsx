"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/favorite-button";
import { toggleFavorite, deleteRecipe } from "@/lib/actions/recipe";
import Link from "next/link";

interface RecipeDetailActionsProps {
  recipeId: string;
  isFavorite: boolean;
}

export function RecipeDetailActions({ recipeId, isFavorite }: RecipeDetailActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleFavorite = () => {
    toggleFavorite(recipeId);
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteRecipe(recipeId);
      router.push("/dashboard");
    });
  };

  return (
    <div className="flex items-center gap-3">
      <FavoriteButton isFavorite={isFavorite} onToggle={handleToggleFavorite} />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/recipes/${recipeId}/edit`}>
          <Pencil className="mr-1 h-4 w-4" />
          編集
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-1 h-4 w-4" />
            削除
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>レシピを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。レシピが完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
