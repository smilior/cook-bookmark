"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/dashboard/recipes/new", label: "追加", icon: Plus },
  { href: "/dashboard/profile", label: "マイページ", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background">
      <div className="mx-auto flex h-full max-w-md items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
