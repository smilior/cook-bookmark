import { getServerSession } from "@/lib/auth-session";
import { getRecipes } from "@/lib/actions/recipe";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "./sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const initials = (user.name ?? "U").slice(0, 2).toUpperCase();

  const recipes = await getRecipes();
  const recipeCount = recipes.length;

  return (
    <div className="space-y-6 py-2">
      <h1 className="text-2xl font-bold">プロフィール</h1>

      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl pt-2">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">登録レシピ数</span>
            <span className="text-2xl font-bold text-primary">
              {recipeCount}
            </span>
          </div>

          <Separator />

          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
