import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { SignInButton } from "@/components/sign-in-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="font-semibold">Cook Bookmark</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <SignInButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
