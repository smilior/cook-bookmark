import { getRecipes, getCategories } from "@/lib/actions/recipe";
import { DashboardContent } from "@/components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    createdBy?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const categoryId = params.categoryId ?? "";
  const createdBy = params.createdBy ?? "";

  const [recipes, categories] = await Promise.all([
    getRecipes({
      search: search || undefined,
      categoryId: categoryId || undefined,
      createdBy: createdBy || undefined,
    }),
    getCategories(),
  ]);

  // When filtering by user, find the user name for display
  const createdByName = createdBy
    ? recipes.find((r) => r.createdBy === createdBy)?.userName ?? null
    : null;

  const mapped = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    sourceUrl: r.sourceUrl,
    imageUrl: r.imageUrl,
    cookingTime: r.cookingTime,
    servings: r.servings,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    createdBy: r.createdBy,
    userName: r.userName,
    createdAt: r.createdAt,
    tags: r.tags,
  }));

  return (
    <DashboardContent
      recipes={mapped}
      categories={categories}
      initialSearch={search}
      initialCategoryId={categoryId || null}
      initialCreatedBy={createdBy || null}
      initialCreatedByName={createdByName}
    />
  );
}
