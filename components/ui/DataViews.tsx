"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";

export type TimelineItem = {
  label: string;
  title: string;
  body: string;
};

/** Vertical line + points — click a node to focus */
export function DataTimeline({
  items,
  active,
  onSelect,
  className,
}: {
  items: TimelineItem[];
  active: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute bottom-3 left-[11px] top-3 w-px bg-border"
        aria-hidden
      />
      <ul className="space-y-1">
        {items.map((item, i) => {
          const on = i === active;
          return (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  "group relative flex w-full gap-4 rounded-2xl py-3 pl-1 pr-3 text-left transition-colors",
                  on ? "bg-brand-ink text-white" : "hover:bg-bg-soft",
                )}
              >
                <span
                  className={cn(
                    "relative z-[1] mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors",
                    on
                      ? "border-brand-bright bg-brand"
                      : "border-brand-deep/40 bg-bg group-hover:border-brand",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[10px] font-semibold uppercase tracking-[0.16em]",
                      on ? "text-brand-bright/90" : "text-brand-muted",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-sm font-semibold tracking-tight sm:text-base",
                      on ? "text-white" : "text-brand-ink",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Horizontal progress line with clickable points */
export function PointLine({
  items,
  active,
  onSelect,
  className,
  showLabels = true,
}: {
  items: { title: string }[];
  active: number;
  onSelect: (i: number) => void;
  className?: string;
  showLabels?: boolean;
}) {
  const pct = items.length <= 1 ? 0 : (active / (items.length - 1)) * 100;

  return (
    <div className={cn("relative pt-2", className)}>
      <div className="relative mx-3 h-px bg-border">
        <motion.div
          className="absolute inset-y-0 left-0 bg-brand"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: easeOut }}
        />
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {items.map((item, i) => {
            const on = i === active;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={item.title}
                className={cn(
                  "h-3.5 w-3.5 rounded-full border-2 transition-transform",
                  on
                    ? "scale-125 border-brand bg-brand-ink"
                    : "border-brand/40 bg-bg hover:border-brand",
                )}
              />
            );
          })}
        </div>
      </div>
      {showLabels ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
                i === active
                  ? "bg-brand-ink text-white"
                  : "text-muted hover:bg-bg-soft hover:text-brand-deep",
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Card that expands body on click — fills a grid without empty panels */
export function RevealCard({
  eyebrow,
  title,
  body,
  open,
  onToggle,
  icon,
  className,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  open: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex h-full min-h-[11rem] flex-col rounded-[1.5rem] border p-6 text-left transition-colors sm:p-7",
        open
          ? "border-brand-ink bg-brand-ink text-white"
          : "border-border bg-white text-brand-ink hover:border-brand/35",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              open ? "bg-white/10 text-brand-bright" : "bg-bg-soft text-brand",
            )}
          >
            {icon}
          </span>
        ) : null}
        {eyebrow ? (
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.16em]",
              open ? "text-brand-bright/90" : "text-brand-muted",
            )}
          >
            {eyebrow}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0.85 }}
        className="overflow-hidden"
      >
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed",
            open ? "text-white/75" : "text-muted",
          )}
        >
          {body}
        </p>
      </motion.div>
      {!open ? (
        <span className="mt-auto pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
          Reveal
        </span>
      ) : null}
    </button>
  );
}
