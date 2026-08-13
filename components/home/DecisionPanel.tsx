"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** The scenario's decision window, in seconds. The depleting rule under the header is a
 *  CSS animation of exactly this length, so the bar and the digits stay aligned without
 *  the two having to talk to each other. */
const WINDOW = 180;
const ROTATE_MS = 3400;

/** Drawn from the shipped Startup Survival brief: three defensible moves, each with a real
 *  price. The trade-off column is the point of the panel, not the options -- "no option is
 *  correct" is the product's entire thesis and this is the shortest way to show it. */
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

  // One tick a second, and only while the tab is in front. A marketing hero has no
  // business burning a timer in a background tab.
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

  return (
    <div className="ticked w-full border border-line bg-base lg:w-[27.5rem]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <p className="tick-label">Startup Survival · Q3</p>
        <p
          className={cn(
            "num text-[13px] tabular-nums transition-colors duration-300",
            urgent ? "text-ember" : "text-teal",
          )}
        >
          {clock(left)}
        </p>
      </div>

      {/* The decision window running out, as one hairline. Constant motion, so: linear,
          and left to CSS -- it never needs to interrupt or retarget, and this keeps it
          off the main thread while the rest of the page is still hydrating. */}
      <div className="relative h-px w-full bg-line">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-full origin-left bg-teal motion-safe:animate-[deplete_180s_linear_infinite]"
          style={{ transform: reduceMotion ? "scaleX(0.62)" : undefined }}
        />
      </div>

      <div className="px-5 py-5">
        <p className="ledger-display text-[19px] leading-[1.3] text-ink">
          Runway is 5.8 months. Your lead engineer resigned on Monday and a
          competitor undercut you by 40% on Tuesday.
        </p>

        <ul className="mt-6 border-t border-line">
          {options.map((option, i) => {
            const on = i === active;
            return (
              <li
                key={option.key}
                className={cn(
                  "flex items-center gap-3 border-b border-line px-1 py-3",
                  "transition-colors duration-300 ease-out",
                  on ? "bg-teal/[0.08]" : "bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "num w-4 shrink-0 text-center text-[11px]",
                    "transition-colors duration-300 ease-out",
                    on ? "text-teal" : "text-faint",
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

        {/* Fixed height so the swap never reflows the panel, and a blur on the outgoing
            text so the crossfade reads as one line changing rather than two lines
            overlapping. */}
        <div className="mt-4 flex h-6 items-center gap-3">
          <span className="tick-label shrink-0 text-ember">Costs you</span>
          <span className="relative min-w-0 flex-1">
            {options.map((option, i) => (
              <span
                key={option.key}
                aria-hidden={i !== active}
                className={cn(
                  "block truncate text-[12.5px] text-ember",
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
    </div>
  );
}
