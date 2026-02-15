"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RecipeForm } from "@/components/recipe-form";
import type { RecipeFormData } from "@/components/recipe-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { createRecipe, getCategories, getOrCreateCategoryByName } from "@/lib/actions/recipe";

type InputMode = "url" | "text";

export default function NewRecipePage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [freeText, setFreeText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [step, setStep] = useState<"input" | "form">("input");
  const [extractedData, setExtractedData] = useState<Partial<RecipeFormData> | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleExtractFromUrl = async () => {
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
      await applyExtractedData(data, url.trim(), data.siteName ? [data.siteName] : []);
    } catch {
      setError("レシピの取得に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractFromText = async () => {
    if (!freeText.trim()) return;
    setError("");
    setIsExtracting(true);
    try {
      const res = await fetch("/api/recipes/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: freeText.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "レシピの解析に失敗しました");
        setIsExtracting(false);
        return;
      }
      await applyExtractedData(data, sourceUrl.trim(), []);
    } catch {
      setError("レシピの解析に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const applyExtractedData = async (
    data: Record<string, unknown>,
    recipeSourceUrl: string,
    defaultTags: string[]
  ) => {
    // Resolve category name to ID (get or create)
    let resolvedCategoryId = "";
    if (data.category) {
      const catId = await getOrCreateCategoryByName(data.category as string);
      if (catId) {
        resolvedCategoryId = catId;
        const updatedCategories = await getCategories();
        setCategories(updatedCategories);
      }
    }

    setExtractedData({
      title: (data.title as string) || "",
      sourceUrl: recipeSourceUrl,
      imageUrl: (data.imageUrl as string) || "",
      cookingTime: (data.cookingTime as string) || "",
      servings: (data.servings as string) || "",
      calories: (data.calories as string) || "",
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      steps: Array.isArray(data.steps)
        ? data.steps.map((s: unknown) => {
            if (typeof s === "string") return { text: s, imageUrl: "" };
            const step = s as Record<string, unknown>;
            return { text: (step.text as string) || "", imageUrl: (step.imageUrl as string) || "", tip: (step.tip as string) || "" };
          })
        : [],
      nutrition: typeof data.nutrition === "object" && data.nutrition ? (data.nutrition as Record<string, string>) : {},
      tips: Array.isArray(data.tips) ? data.tips : [],
      tags: defaultTags,
      categoryId: resolvedCategoryId,
    });
    setStep("form");
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
        ingredients: JSON.stringify(data.ingredients),
        steps: JSON.stringify(data.steps),
        nutrition: Object.keys(data.nutrition).length > 0 ? JSON.stringify(data.nutrition) : undefined,
        tips: data.tips.length > 0 ? JSON.stringify(data.tips) : undefined,
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

  if (step === "input") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">レシピを追加</h1>

        {/* Mode toggle tabs */}
        <div className="mb-6 flex rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => { setInputMode("url"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              inputMode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="h-4 w-4" />
            URLから取得
          </button>
          <button
            type="button"
            onClick={() => { setInputMode("text"); setError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              inputMode === "text"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            テキストから解析
          </button>
        </div>

        <div className="space-y-4">
          {inputMode === "url" ? (
            <>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="レシピURLを貼り付け"
                type="url"
                className="text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleExtractFromUrl();
                  }
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleExtractFromUrl} disabled={!url.trim()} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                AIで取得する
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="freeText">レシピテキスト</Label>
                <Textarea
                  id="freeText"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="ウェブページからコピーしたレシピのテキストを貼り付けてください..."
                  className="min-h-[200px] text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">元サイトのURL（任意）</Label>
                <Input
                  id="sourceUrl"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/recipe"
                  type="url"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleExtractFromText} disabled={!freeText.trim()} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                AIで解析する
              </Button>
            </>
          )}
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
