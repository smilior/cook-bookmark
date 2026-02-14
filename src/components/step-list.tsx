interface StepListProps {
  steps: string[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {i + 1}
          </span>
          <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}
