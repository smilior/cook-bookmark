import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const initials = (user.name ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <span className="text-lg font-semibold text-primary">
            Cook Bookmark
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
