"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Animates from the previous value to the next one, rendering via `format`. */
export function Ticker({
  value,
  format,
  duration = 900,
  className,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    const target = value;
    if (start === target) {
      setDisplay(target);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      from.current = target;
      setDisplay(target);
      return;
    }

    let raf = 0;
    let t0 = 0;

    const step = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (target - start) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        from.current = target;
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{format(display)}</span>;
}
