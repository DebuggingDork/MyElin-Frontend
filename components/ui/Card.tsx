import { cn } from "@/lib/utils";
import { type HTMLAttributes, type ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: "light" | "dark" | "soft";
};

export function Card({
  children,
  className,
  tone = "light",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-colors",
        tone === "light" && "border-border bg-white",
        tone === "soft" && "border-border/70 bg-bg-soft",
        tone === "dark" && "border-white/10 bg-charcoal text-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5 pb-0 sm:p-6 sm:pb-0", className)}>{children}</div>;
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}
