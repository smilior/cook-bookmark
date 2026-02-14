"use client";

import { useTransition, useOptimistic } from "react";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle?: (next: boolean) => void;
  size?: "sm" | "md";
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = "md",
}: FavoriteButtonProps) {
  const [, startTransition] = useTransition();
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorite);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const handleClick = () => {
    const next = !optimisticFav;
    startTransition(() => {
      setOptimisticFav(next);
      onToggle?.(next);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer transition-colors"
      aria-label={optimisticFav ? "お気に入りを解除" : "お気に入りに追加"}
    >
      <Heart
        className={`${iconSize} ${
          optimisticFav
            ? "fill-red-500 text-red-500"
            : "fill-none text-muted-foreground"
        }`}
      />
    </button>
  );
}
