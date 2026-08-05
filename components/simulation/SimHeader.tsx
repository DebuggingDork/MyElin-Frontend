"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import { Logo } from "@/components/brand/Logo";
import type { Level, Metrics } from "@/lib/simulation/types";
import { MetricHud } from "@/components/simulation/MetricHud";
import { SimEyebrow } from "@/components/simulation/SimChrome";

export function SimHeader({
  level,
  quarterIndex,
  phaseLabel,
  metrics,
  previous,
  showHud,
  onExit,
}: {
  level: Level | null;
  quarterIndex: number;
  phaseLabel: string;
  metrics: Metrics | null;
  previous?: Metrics;
  showHud: boolean;
  onExit: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" aria-label="Myelin home" className="shrink-0">
            <Logo
              priority
              className="h-9 w-auto max-w-[7rem] object-contain object-left"
            />
          </Link>
          <div className="hidden h-7 w-px bg-border sm:block" />
          <div className="min-w-0">
            <SimEyebrow className="truncate">
              {level ? level.name : "Simulation library"}
            </SimEyebrow>
            <p className="mt-1 truncate text-[13px] text-muted">{phaseLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {level && (
            <div className="hidden items-center gap-1 sm:flex">
              {level.quarters.map((q, i) => {
                const done = i < quarterIndex;
                const active = i === quarterIndex;
                return (
                  <span key={q.id} className="flex items-center gap-1">
                    <span
                      title={q.label}
                      className={cn(
                        "sim-eyebrow flex h-7 items-center justify-center rounded-full border px-2.5 transition-colors",
                        done
                          ? "border-brand/40 bg-brand/10 text-brand-deep"
                          : active
                            ? "border-transparent bg-brand-ink text-white"
                            : "border-border text-muted/70",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : `Q${i + 1}`}
                    </span>
                    {i < level.quarters.length - 1 && (
                      <span
                        className={cn(
                          "h-px w-3",
                          done ? "bg-brand/50" : "bg-border",
                        )}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={onExit}
            className="sim-eyebrow flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-muted transition-colors hover:border-brand/45 hover:text-brand-deep"
          >
            <ChevronLeft className="h-3 w-3" />
            Exit
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showHud && metrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="mx-auto w-full max-w-6xl px-5 pb-3 sm:px-8">
              <MetricHud metrics={metrics} previous={previous} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
