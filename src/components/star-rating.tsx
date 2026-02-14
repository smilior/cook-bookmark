"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="評価">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          aria-label={`${star}つ星`}
        >
          <Star
            className={`${iconSize} ${
              star <= value
                ? "fill-amber-500 text-amber-500"
                : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
