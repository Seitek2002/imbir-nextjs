import { cn } from "@/shared/lib/utils";

type Props = { current: number; total: number };

export const ProgressBar = ({ current, total }: Props) => (
  <div className="flex gap-1.5 mb-6 md:mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "flex-1 h-1 rounded-full transition-colors",
          i < current ? "bg-primary" : "bg-border-soft",
        )}
      />
    ))}
  </div>
);
