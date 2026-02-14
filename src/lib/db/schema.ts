import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Better Auth Required Tables ─────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ─── Recipe Domain Tables ────────────────────────────────────

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const tag = sqliteTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const recipe = sqliteTable("recipe", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  ingredients: text("ingredients"), // JSON string
  steps: text("steps"), // JSON string
  cookingTime: text("cooking_time"),
  servings: text("servings"),
  calories: text("calories"),
  nutrition: text("nutrition"), // JSON string
  tips: text("tips"), // JSON string
  imageUrl: text("image_url"),
  rating: integer("rating"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
  categoryId: text("category_id").references(() => category.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const recipeTag = sqliteTable(
  "recipe_tag",
  {
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.tagId] })]
);

// ─── Relations ───────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  recipes: many(recipe),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  recipes: many(recipe),
}));

export const recipeRelations = relations(recipe, ({ one, many }) => ({
  category: one(category, {
    fields: [recipe.categoryId],
    references: [category.id],
  }),
  createdByUser: one(user, {
    fields: [recipe.createdBy],
    references: [user.id],
  }),
  recipeTags: many(recipeTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  recipeTags: many(recipeTag),
}));

export const recipeTagRelations = relations(recipeTag, ({ one }) => ({
  recipe: one(recipe, {
    fields: [recipeTag.recipeId],
    references: [recipe.id],
  }),
  tag: one(tag, {
    fields: [recipeTag.tagId],
    references: [tag.id],
  }),
}));
