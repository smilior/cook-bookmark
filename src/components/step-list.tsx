import Image from "next/image";
import { Lightbulb } from "lucide-react";
import type { Step } from "@/lib/db/types";

interface StepListProps {
  steps: (Step | string)[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-6">
      {steps.map((step, i) => {
        const text = typeof step === "string" ? step : step.text;
        const imageUrl = typeof step === "string" ? undefined : step.imageUrl;
        const tip = typeof step === "string" ? undefined : step.tip;

        return (
          <li key={i} className="space-y-2">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-relaxed">{text}</p>
            </div>
            {imageUrl && (
              <div className="relative ml-10 aspect-video max-w-sm overflow-hidden rounded-md border">
                <Image
                  src={imageUrl}
                  alt={`手順${i + 1}の画像`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 384px) 100vw, 384px"
                />
              </div>
            )}
            {tip && (
              <div className="ml-10 flex items-start gap-1.5 rounded-md bg-yellow-50 px-3 py-2 dark:bg-yellow-950/30">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                <p className="text-xs leading-relaxed text-yellow-800 dark:text-yellow-200">
                  {tip}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
