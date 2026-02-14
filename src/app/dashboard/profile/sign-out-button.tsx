"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        })
      }
    >
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  );
}
