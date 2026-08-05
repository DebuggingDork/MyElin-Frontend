"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Flame, Info } from "lucide-react";
import { easeOut } from "@/lib/media";
import type { MarketEvent } from "@/lib/quarter/types";

/* Narrative event card — used for CEO-briefing market events and CX
   dynamic customer stories (same structural pattern, per spec §4). */

const SEVERITY = {
  critical: { icon: Flame, color: "var(--rose)", label: "Critical" },
  warning: { icon: AlertTriangle, color: "var(--amber)", label: "Watch" },
  info: { icon: Info, color: "var(--cyan)", label: "Signal" },
} as const;

export function EventCard({
  event,
  delay = 0,
}: {
  event: MarketEvent;
  delay?: number;
}) {
  const sev = SEVERITY[event.severity];
  const Icon = sev.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: easeOut }}
      className="relative overflow-hidden rounded-xl border border-line bg-raise/60 p-4"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: sev.color }}
      />
      <div className="flex items-start gap-3 pl-1">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: sev.color }} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-medium text-ink">{event.title}</h3>
            <span className="eyebrow" style={{ color: sev.color }}>
              {sev.label}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-dim">
            {event.body}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] text-faint"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
