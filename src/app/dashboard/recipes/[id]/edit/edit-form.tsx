"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { RecipeForm } from "@/components/recipe-form";
import type { RecipeFormData } from "@/components/recipe-form";
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
import { updateRecipe, deleteRecipe } from "@/lib/actions/recipe";

interface EditRecipeFormProps {
  recipeId: string;
  initialData: Partial<RecipeFormData>;
  categories: { id: string; name: string }[];
}

export function EditRecipeForm({
  recipeId,
  initialData,
  categories,
}: EditRecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await updateRecipe(recipeId, {
        title: data.title,
        sourceUrl: data.sourceUrl || undefined,
        imageUrl: data.imageUrl || undefined,
        cookingTime: data.cookingTime || undefined,
        servings: data.servings || undefined,
        calories: data.calories || undefined,
        categoryId: data.categoryId || undefined,
        rating: data.rating || undefined,
        ingredients: JSON.stringify(data.ingredients),
        steps: JSON.stringify(data.steps),
        nutrition: Object.keys(data.nutrition).length > 0 ? JSON.stringify(data.nutrition) : undefined,
        tips: data.tips.length > 0 ? JSON.stringify(data.tips) : undefined,
        tagNames: data.tags,
      });
      router.push(`/dashboard/recipes/${recipeId}`);
    } catch {
      setError("レシピの更新に失敗しました");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteRecipe(recipeId);
      router.push("/dashboard");
    });
  };

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <RecipeForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="border-t pt-6">
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              このレシピを削除
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
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "削除中..." : "削除する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
