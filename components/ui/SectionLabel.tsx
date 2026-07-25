"use client";

import { cn } from "@/lib/utils";

/** Compact eyebrow in deep teal ink */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Dark teal statement block for emphasis without WebGL */
export function DarkStatement({
  eyebrow,
  children,
  className,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] bg-brand-ink px-7 py-8 text-white sm:px-9 sm:py-10",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-bright/80">
          {eyebrow}
        </p>
      ) : null}
      <div
        className={cn(
          "text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl",
          eyebrow && "mt-4",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Soft ink wash behind content — CSS only, no canvas */
export function InkWash({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-deep/[0.04] blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand/[0.06] blur-3xl" />
    </div>
  );
}
