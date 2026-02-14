import { getRecipes, getCategories } from "@/lib/actions/recipe";
import { DashboardContent } from "@/components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const categoryId = params.categoryId ?? "";

  const [recipes, categories] = await Promise.all([
    getRecipes({
      search: search || undefined,
      categoryId: categoryId || undefined,
    }),
    getCategories(),
  ]);

  const mapped = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    sourceUrl: r.sourceUrl,
    imageUrl: r.imageUrl,
    cookingTime: r.cookingTime,
    servings: r.servings,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
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
    />
  );
}
