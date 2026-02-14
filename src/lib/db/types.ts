import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { user, session, recipe, category, tag, recipeTag } from "./schema";

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;

export type Recipe = InferSelectModel<typeof recipe>;
export type NewRecipe = InferInsertModel<typeof recipe>;
export type Category = InferSelectModel<typeof category>;
export type NewCategory = InferInsertModel<typeof category>;
export type Tag = InferSelectModel<typeof tag>;
export type NewTag = InferInsertModel<typeof tag>;
export type RecipeTag = InferSelectModel<typeof recipeTag>;

// Parsed recipe with JSON fields deserialized
export type RecipeWithDetails = Recipe & {
  category: Category | null;
  createdByUser: User;
  tags: Tag[];
  parsedIngredients: Ingredient[];
  parsedSteps: Step[];
  parsedNutrition: NutritionInfo | null;
};

export type Ingredient = {
  name: string;
  amount: string;
};

export type Step = {
  text: string;
  imageUrl?: string;
};

export type NutritionInfo = {
  [key: string]: string;
};
