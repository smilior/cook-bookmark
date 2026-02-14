"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/star-rating";
import { TagInput } from "@/components/tag-input";
import type { Ingredient, NutritionInfo, Step } from "@/lib/db/types";

interface RecipeFormData {
  title: string;
  sourceUrl: string;
  imageUrl: string;
  cookingTime: string;
  servings: string;
  calories: string;
  categoryId: string;
  rating: number;
  ingredients: Ingredient[];
  steps: Step[];
  nutrition: NutritionInfo;
  tips: string[];
  tags: string[];
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  categories: { id: string; name: string }[];
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function RecipeForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [cookingTime, setCookingTime] = useState(initialData?.cookingTime ?? "");
  const [servings, setServings] = useState(initialData?.servings ?? "");
  const [calories, setCalories] = useState(initialData?.calories ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [{ name: "", amount: "" }]
  );
  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps?.length ? initialData.steps : [{ text: "", imageUrl: "" }]
  );
  const [nutrition, setNutrition] = useState<{ key: string; value: string }[]>(() => {
    if (initialData?.nutrition && Object.keys(initialData.nutrition).length > 0) {
      return Object.entries(initialData.nutrition).map(([key, value]) => ({
        key,
        value,
      }));
    }
    return [];
  });
  const [tips, setTips] = useState<string[]>(
    initialData?.tips?.length ? initialData.tips : []
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nutritionObj: NutritionInfo = {};
    for (const item of nutrition) {
      if (item.key.trim()) {
        nutritionObj[item.key.trim()] = item.value.trim();
      }
    }
    await onSubmit({
      title,
      sourceUrl,
      imageUrl,
      cookingTime,
      servings,
      calories,
      categoryId,
      rating,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.text.trim()),
      nutrition: nutritionObj,
      tips: tips.filter((t) => t.trim()),
      tags,
    });
  };

  // Tips helpers
  const addTip = () => setTips([...tips, ""]);
  const removeTip = (index: number) => setTips(tips.filter((_, i) => i !== index));
  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };

  // Ingredients helpers
  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "" }]);
  const removeIngredient = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Steps helpers
  const addStep = () => setSteps([...steps, { text: "", imageUrl: "" }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, field: keyof Step, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  // Nutrition helpers
  const addNutrition = () => setNutrition([...nutrition, { key: "", value: "" }]);
  const removeNutrition = (index: number) =>
    setNutrition(nutrition.filter((_, i) => i !== index));
  const updateNutrition = (index: number, field: "key" | "value", value: string) => {
    const updated = [...nutrition];
    updated[index] = { ...updated[index], [field]: value };
    setNutrition(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">料理名 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="料理名を入力"
          required
        />
      </div>

      {/* Source URL */}
      <div className="space-y-2">
        <Label htmlFor="sourceUrl">元URL</Label>
        <Input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com/recipe"
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">画像URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        {imageUrl && (
          <div className="mt-2 overflow-hidden rounded-md border">
            <img
              src={imageUrl}
              alt="プレビュー"
              className="aspect-video w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Cooking Time / Servings / Calories row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cookingTime">調理時間</Label>
          <Input
            id="cookingTime"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            placeholder="30分"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">人数</Label>
          <Input
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="2人前"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="calories">カロリー</Label>
          <Input
            id="calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="350kcal"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>カテゴリ</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label>星評価</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label>材料</Label>
        <div className="space-y-2">
          {ingredients.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item.group ?? ""}
                onChange={(e) => updateIngredient(index, "group", e.target.value)}
                placeholder="グループ"
                className="w-20"
              />
              <Input
                value={item.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                placeholder="材料名"
                className="flex-1"
              />
              <Input
                value={item.amount}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                placeholder="分量"
                className="w-28"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          <Plus className="mr-1 h-4 w-4" />
          材料を追加
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <Label>調理手順</Label>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex h-9 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={step.text}
                    onChange={(e) => updateStep(index, "text", e.target.value)}
                    placeholder={`手順 ${index + 1}`}
                    className="min-h-[60px]"
                  />
                  <Input
                    value={step.imageUrl ?? ""}
                    onChange={(e) => updateStep(index, "imageUrl", e.target.value)}
                    placeholder="手順画像URL（任意）"
                    type="url"
                  />
                  {step.imageUrl && (
                    <div className="overflow-hidden rounded-md border">
                      <img
                        src={step.imageUrl}
                        alt={`手順${index + 1}の画像`}
                        className="aspect-video w-full max-w-xs object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStep(index)}
                  disabled={steps.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="mr-1 h-4 w-4" />
          手順を追加
        </Button>
      </div>

      {/* Nutrition */}
      <div className="space-y-2">
        <Label>栄養情報</Label>
        <div className="space-y-2">
          {nutrition.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item.key}
                onChange={(e) => updateNutrition(index, "key", e.target.value)}
                placeholder="項目名（例: たんぱく質）"
                className="flex-1"
              />
              <Input
                value={item.value}
                onChange={(e) => updateNutrition(index, "value", e.target.value)}
                placeholder="値（例: 20g）"
                className="w-28"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeNutrition(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addNutrition}>
          <Plus className="mr-1 h-4 w-4" />
          栄養情報を追加
        </Button>
      </div>

      {/* Tips */}
      <div className="space-y-2">
        <Label>ポイント・コツ</Label>
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <Textarea
                value={tip}
                onChange={(e) => updateTip(index, e.target.value)}
                placeholder={`ポイント ${index + 1}`}
                className="min-h-[60px] flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTip(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addTip}>
          <Plus className="mr-1 h-4 w-4" />
          ポイントを追加
        </Button>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>タグ</Label>
        <TagInput
          tags={tags}
          onAdd={(tag) => setTags([...tags, tag])}
          onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "保存中..." : "保存する"}
      </Button>
    </form>
  );
}

export type { RecipeFormData };
