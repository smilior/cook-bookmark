"use server";

import { db } from "@/lib/db";
import { recipe, category, tag, recipeTag, user } from "@/lib/db/schema";
import { getServerSession, isAllowedEmail } from "@/lib/auth-session";
import { revalidatePath } from "next/cache";
import { eq, like, and, or, desc, asc, inArray } from "drizzle-orm";

// ─── Auth Helper ─────────────────────────────────────────────

async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("認証が必要です");
  }
  if (!isAllowedEmail(session.user.email)) {
    throw new Error("このアカウントは許可されていません");
  }
  return session.user;
}

// ─── Create Recipe ───────────────────────────────────────────

export async function createRecipe(data: {
  title: string;
  sourceUrl?: string;
  ingredients?: string;
  steps?: string;
  cookingTime?: string;
  servings?: string;
  calories?: string;
  nutrition?: string;
  tips?: string;
  imageUrl?: string;
  categoryId?: string;
  rating?: number;
  tagNames?: string[];
}) {
  const currentUser = await requireAuth();
  const now = new Date();
  const id = crypto.randomUUID();

  await db.insert(recipe).values({
    id,
    title: data.title,
    sourceUrl: data.sourceUrl ?? null,
    ingredients: data.ingredients ?? null,
    steps: data.steps ?? null,
    cookingTime: data.cookingTime ?? null,
    servings: data.servings ?? null,
    calories: data.calories ?? null,
    nutrition: data.nutrition ?? null,
    tips: data.tips ?? null,
    imageUrl: data.imageUrl ?? null,
    categoryId: data.categoryId ?? null,
    rating: data.rating ?? null,
    isFavorite: false,
    createdBy: currentUser.id,
    createdAt: now,
    updatedAt: now,
  });

  if (data.tagNames && data.tagNames.length > 0) {
    await linkTags(id, data.tagNames);
  }

  revalidatePath("/dashboard");
  return id;
}

// ─── Get Recipes ─────────────────────────────────────────────

export async function getRecipes(options?: {
  search?: string;
  categoryId?: string;
  tagId?: string;
  favoritesOnly?: boolean;
  sortByRating?: boolean;
}) {
  const conditions = [];

  if (options?.search) {
    const pattern = `%${options.search}%`;
    conditions.push(
      or(like(recipe.title, pattern), like(recipe.ingredients, pattern))
    );
  }

  if (options?.categoryId) {
    conditions.push(eq(recipe.categoryId, options.categoryId));
  }

  if (options?.favoritesOnly) {
    conditions.push(eq(recipe.isFavorite, true));
  }

  if (options?.tagId) {
    const recipeIdsWithTag = db
      .select({ recipeId: recipeTag.recipeId })
      .from(recipeTag)
      .where(eq(recipeTag.tagId, options.tagId));

    const taggedRecipeIds = await recipeIdsWithTag;
    if (taggedRecipeIds.length === 0) {
      return [];
    }
    conditions.push(
      or(...taggedRecipeIds.map((r) => eq(recipe.id, r.recipeId)))
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const recipes = await db
    .select({
      id: recipe.id,
      title: recipe.title,
      sourceUrl: recipe.sourceUrl,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      calories: recipe.calories,
      nutrition: recipe.nutrition,
      tips: recipe.tips,
      imageUrl: recipe.imageUrl,
      rating: recipe.rating,
      isFavorite: recipe.isFavorite,
      categoryId: recipe.categoryId,
      createdBy: recipe.createdBy,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      categoryName: category.name,
      userName: user.name,
      userImage: user.image,
    })
    .from(recipe)
    .leftJoin(category, eq(recipe.categoryId, category.id))
    .leftJoin(user, eq(recipe.createdBy, user.id))
    .where(where)
    .orderBy(
      options?.sortByRating ? desc(recipe.rating) : desc(recipe.createdAt)
    );

  const recipeIds = recipes.map((r) => r.id);
  if (recipeIds.length === 0) return [];

  const allRecipeTags = await db
    .select({
      recipeId: recipeTag.recipeId,
      tagId: tag.id,
      tagName: tag.name,
    })
    .from(recipeTag)
    .innerJoin(tag, eq(recipeTag.tagId, tag.id))
    .where(or(...recipeIds.map((id) => eq(recipeTag.recipeId, id))));

  const tagsByRecipeId = new Map<
    string,
    { id: string; name: string }[]
  >();
  for (const rt of allRecipeTags) {
    const existing = tagsByRecipeId.get(rt.recipeId) ?? [];
    existing.push({ id: rt.tagId, name: rt.tagName });
    tagsByRecipeId.set(rt.recipeId, existing);
  }

  return recipes.map((r) => ({
    ...r,
    tags: tagsByRecipeId.get(r.id) ?? [],
  }));
}

// ─── Get Recipe By ID ────────────────────────────────────────

export async function getRecipeById(id: string) {
  const rows = await db
    .select({
      id: recipe.id,
      title: recipe.title,
      sourceUrl: recipe.sourceUrl,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      calories: recipe.calories,
      nutrition: recipe.nutrition,
      tips: recipe.tips,
      imageUrl: recipe.imageUrl,
      rating: recipe.rating,
      isFavorite: recipe.isFavorite,
      categoryId: recipe.categoryId,
      createdBy: recipe.createdBy,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      categoryName: category.name,
      userName: user.name,
      userImage: user.image,
    })
    .from(recipe)
    .leftJoin(category, eq(recipe.categoryId, category.id))
    .leftJoin(user, eq(recipe.createdBy, user.id))
    .where(eq(recipe.id, id))
    .limit(1);

  if (rows.length === 0) return null;

  const recipeTags = await db
    .select({
      tagId: tag.id,
      tagName: tag.name,
    })
    .from(recipeTag)
    .innerJoin(tag, eq(recipeTag.tagId, tag.id))
    .where(eq(recipeTag.recipeId, id));

  return {
    ...rows[0],
    tags: recipeTags.map((t) => ({ id: t.tagId, name: t.tagName })),
  };
}

// ─── Update Recipe ───────────────────────────────────────────

export async function updateRecipe(
  id: string,
  data: {
    title?: string;
    sourceUrl?: string;
    ingredients?: string;
    steps?: string;
    cookingTime?: string;
    servings?: string;
    calories?: string;
    nutrition?: string;
    tips?: string;
    imageUrl?: string;
    categoryId?: string;
    rating?: number;
    tagNames?: string[];
  }
) {
  await requireAuth();

  const { tagNames, ...fields } = data;

  await db
    .update(recipe)
    .set({
      ...fields,
      updatedAt: new Date(),
    })
    .where(eq(recipe.id, id));

  if (tagNames !== undefined) {
    await db.delete(recipeTag).where(eq(recipeTag.recipeId, id));
    if (tagNames.length > 0) {
      await linkTags(id, tagNames);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/recipe/${id}`);
}

// ─── Delete Recipe ───────────────────────────────────────────

export async function deleteRecipe(id: string) {
  await requireAuth();

  await db.delete(recipe).where(eq(recipe.id, id));

  revalidatePath("/dashboard");
}

// ─── Delete Recipes (Bulk) ───────────────────────────────────

export async function deleteRecipes(ids: string[]) {
  await requireAuth();

  if (ids.length === 0) return;

  await db.delete(recipe).where(inArray(recipe.id, ids));

  revalidatePath("/dashboard");
}

// ─── Toggle Favorite ─────────────────────────────────────────

export async function toggleFavorite(id: string) {
  await requireAuth();

  const rows = await db
    .select({ isFavorite: recipe.isFavorite })
    .from(recipe)
    .where(eq(recipe.id, id))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("レシピが見つかりません");
  }

  await db
    .update(recipe)
    .set({
      isFavorite: !rows[0].isFavorite,
      updatedAt: new Date(),
    })
    .where(eq(recipe.id, id));

  revalidatePath("/dashboard");
  revalidatePath(`/recipe/${id}`);
}

// ─── Update Rating ───────────────────────────────────────────

export async function updateRating(id: string, rating: number) {
  await requireAuth();

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error("評価は1〜5の整数で指定してください");
  }

  await db
    .update(recipe)
    .set({
      rating,
      updatedAt: new Date(),
    })
    .where(eq(recipe.id, id));

  revalidatePath("/dashboard");
  revalidatePath(`/recipe/${id}`);
}

// ─── Get Categories ──────────────────────────────────────────

export async function getCategories() {
  return db.select().from(category).orderBy(asc(category.name));
}

// ─── Get Tags ────────────────────────────────────────────────

export async function getTags() {
  return db.select().from(tag).orderBy(asc(tag.name));
}

// ─── Get or Create Category by Name ─────────────────────────

export async function getOrCreateCategoryByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await db
    .select()
    .from(category)
    .where(eq(category.name, trimmed))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const id = crypto.randomUUID();
  await db.insert(category).values({
    id,
    name: trimmed,
    createdAt: new Date(),
  });

  return id;
}

// ─── Internal Helpers ────────────────────────────────────────

async function linkTags(recipeId: string, tagNames: string[]) {
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    let existing = await db
      .select()
      .from(tag)
      .where(eq(tag.name, trimmed))
      .limit(1);

    let tagId: string;
    if (existing.length > 0) {
      tagId = existing[0].id;
    } else {
      tagId = crypto.randomUUID();
      await db.insert(tag).values({
        id: tagId,
        name: trimmed,
        createdAt: new Date(),
      });
    }

    await db.insert(recipeTag).values({
      recipeId,
      tagId,
    });
  }
}
