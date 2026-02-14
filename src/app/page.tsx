import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { getServerSession } from "@/lib/auth-session";

export default async function Home() {
  const session = await getServerSession();
  const isLoggedIn = !!session?.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-secondary/30 to-accent/20">
      <div className="text-center space-y-6 max-w-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <UtensilsCrossed className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Cook Bookmark</h1>
          <p className="text-lg text-muted-foreground">
            家族のレシピを、ひとつの場所に。
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          お気に入りのレシピURLを保存して、AIが自動で材料や手順を整理。家族みんなで使えるレシピコレクション。
        </p>

        <div className="pt-2">
          {isLoggedIn ? (
            <Button asChild size="lg" className="w-full text-base">
              <Link href="/dashboard">ダッシュボードへ</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="w-full text-base">
              <Link href="/login">Googleでログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
