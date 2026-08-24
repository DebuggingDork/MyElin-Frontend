"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const WINDOW = 180;
const ROTATE_MS = 3400;

const options = [
  {
    key: "1",
    label: "Cut burn to nine months of runway",
    cost: "The roadmap slips a full quarter",
  },
  {
    key: "2",
    label: "Match their price on the top ten accounts",
    cost: "Gross margin drops eleven points",
  },
  {
    key: "3",
    label: "Hold price and spend into the roadmap",
    cost: "Runway ends a month before the raise",
  },
];

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DecisionPanel() {
  const reduceMotion = useReducedMotion();
  const [left, setLeft] = useState(WINDOW);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let id: number | undefined;

    const start = () => {
      if (id !== undefined) return;
      id = window.setInterval(() => {
        setLeft((v) => (v <= 1 ? WINDOW : v - 1));
      }, 1000);
    };
    const stop = () => {
      if (id === undefined) return;
      window.clearInterval(id);
      id = undefined;
    };
    const sync = () => (document.hidden ? stop() : start());

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % options.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const urgent = left <= 45;
  const pct = (left / WINDOW) * 100;

  return (
    <div className="w-full lg:w-[28rem] border border-line overflow-hidden shadow-[0_0_40px_-12px_rgba(36,177,177,0.25)]">
      {/* ── Scenario context header ─────────────────────────────── */}
      <div className="border-b border-line px-5 py-3 bg-gradient-to-r from-panel to-transparent flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {/* Live indicator dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
          </span>
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-dim font-semibold">
              Startup Survival
            </p>
            <p className="text-[10px] text-faint font-mono">Q3 of 4 · Seed stage</p>
          </div>
        </div>
        {/* Urgency badge */}
        <p
          className={cn(
            "text-xs font-mono font-semibold px-2.5 py-1 rounded-sm transition-colors duration-300",
            urgent
              ? "bg-danger/15 text-tone-bad border border-danger/30"
              : "bg-teal/10 text-teal-bright border border-teal/20",
          )}
        >
          {clock(left)}
        </p>
      </div>

      {/* ── Progress bar ────────────────────────────────────────── */}
      <div className="relative h-0.5 w-full bg-raise-2">
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 origin-left transition-colors duration-300",
            urgent ? "bg-danger" : "bg-teal",
            "motion-safe:animate-[deplete_180s_linear_infinite]",
          )}
          style={{
            width: "100%",
            transform: reduceMotion ? `scaleX(${pct / 100})` : undefined,
            boxShadow: urgent
              ? "2px 0 8px 0 var(--danger)"
              : "2px 0 8px 0 var(--teal)",
          }}
        />
      </div>

      {/* ── Scenario body ───────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-2 bg-raise">
        {/* Cash urgency chip */}
        {urgent && (
          <div className="mb-3 inline-flex items-center gap-1.5 bg-danger/10 border border-danger/25 px-2.5 py-1 rounded-sm">
            <span className="text-tone-bad text-[10px]">▲</span>
            <span className="text-tone-bad text-xs font-mono font-semibold">5.8 months runway</span>
          </div>
        )}

        <p className="text-[15px] leading-[1.65] text-ink">
          Runway is 5.8 months. Your lead engineer resigned on Monday and a
          competitor undercut you by 40% on Tuesday.
        </p>

        <ul className="mt-5 border-t border-line divide-y divide-line">
          {options.map((option, i) => {
            const on = i === active;
            return (
              <li
                key={option.key}
                className={cn(
                  "flex items-start gap-3 px-1 py-3 transition-all duration-300 ease-out cursor-pointer",
                  on ? "bg-teal/[0.07] border-l-2 border-teal pl-2" : "border-l-2 border-transparent pl-2 hover:bg-panel",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono mt-0.5 transition-all duration-300",
                    on
                      ? "border-teal bg-teal text-chrome font-bold"
                      : "border-line-2 text-faint",
                  )}
                >
                  {option.key}
                </span>
                <span
                  className={cn(
                    "text-[13.5px] leading-snug transition-colors duration-300 ease-out",
                    on ? "text-ink" : "text-dim",
                  )}
                >
                  {option.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Crossfading cost line ────────────────────────────────── */}
      <div className="px-5 py-3 bg-raise border-t border-line flex items-center gap-3 h-10">
        <span className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-ember shrink-0">
          Costs you
        </span>
        <span className="relative min-w-0 flex-1">
          {options.map((option, i) => (
            <span
              key={option.key}
              aria-hidden={i !== active}
              className={cn(
                "block truncate text-[12.5px] text-ember font-mono",
                "transition-[opacity,filter] duration-300 ease-out",
                i === active
                  ? "opacity-100 blur-0"
                  : "absolute inset-0 opacity-0 blur-[3px]",
              )}
            >
              {option.cost}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
