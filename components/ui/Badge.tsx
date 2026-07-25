import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: "teal" | "muted" | "dark" | "outline";
};

export function Badge({
  children,
  className,
  variant = "teal",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]",
        variant === "teal" && "bg-brand/10 text-brand",
        variant === "muted" && "bg-bg-soft text-muted",
        variant === "dark" && "bg-white/10 text-white/80",
        variant === "outline" && "border border-border text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
