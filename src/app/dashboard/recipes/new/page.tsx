"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecipeForm } from "@/components/recipe-form";
import type { RecipeFormData } from "@/components/recipe-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createRecipe, getCategories } from "@/lib/actions/recipe";

export default function NewRecipePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"url" | "form">("url");
  const [extractedData, setExtractedData] = useState<Partial<RecipeFormData> | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleExtract = async () => {
    if (!url.trim()) return;
    setError("");
    setIsExtracting(true);
    try {
      const res = await fetch("/api/recipes/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "レシピの取得に失敗しました");
        setIsExtracting(false);
        return;
      }
      setExtractedData({
        title: data.title || "",
        sourceUrl: url.trim(),
        imageUrl: data.imageUrl || "",
        cookingTime: data.cookingTime || "",
        servings: data.servings || "",
        calories: data.calories || "",
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        steps: Array.isArray(data.steps) ? data.steps : [],
        nutrition: typeof data.nutrition === "object" && data.nutrition ? data.nutrition : {},
        tags: data.siteName ? [data.siteName] : [],
        categoryId: "",
        rating: 0,
      });
      setStep("form");
    } catch {
      setError("レシピの取得に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManual = () => {
    setExtractedData(undefined);
    setStep("form");
  };

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      await createRecipe({
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
        tagNames: data.tags,
      });
      router.push("/dashboard");
    } catch {
      setError("レシピの保存に失敗しました");
      setIsSubmitting(false);
    }
  };

  if (isExtracting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingSpinner message="AIがレシピを解析中..." />
      </div>
    );
  }

  if (step === "url") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">レシピを追加</h1>
        <div className="space-y-4">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="レシピURLを貼り付け"
            type="url"
            className="text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleExtract();
              }
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleExtract} disabled={!url.trim()} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            AIで取得する
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleManual}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              手動で入力する
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">レシピを追加</h1>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <RecipeForm
        initialData={extractedData}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
