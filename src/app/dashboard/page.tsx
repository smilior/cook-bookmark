import { getRecipes, getCategories } from "@/lib/actions/recipe";
import { DashboardContent } from "@/components/dashboard-content";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    favorites?: string;
    sort?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const categoryId = params.categoryId ?? "";
  const favoritesOnly = params.favorites === "1";
  const sortByRating = params.sort === "rating";

  const [recipes, categories] = await Promise.all([
    getRecipes({
      search: search || undefined,
      categoryId: categoryId || undefined,
      favoritesOnly: favoritesOnly || undefined,
      sortByRating: sortByRating || undefined,
    }),
    getCategories(),
  ]);

  return (
    <DashboardContent
      recipes={recipes}
      categories={categories}
      initialSearch={search}
      initialCategoryId={categoryId || null}
      initialFavoritesOnly={favoritesOnly}
      initialSortByRating={sortByRating}
    />
  );
}
