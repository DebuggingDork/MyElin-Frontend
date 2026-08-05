"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toneText, type Tone } from "@/components/simulation/SimChrome";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Types a single string out character by character. */
export function Typewriter({
  text,
  speed = 16,
  delay = 0,
  className,
  caret = false,
  onDone,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  caret?: boolean;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState(0);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setShown(0);
    done.current = false;

    if (prefersReducedMotion()) {
      setShown(text.length);
      onDoneRef.current?.();
      return;
    }

    let raf = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - delay;
      if (elapsed <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const chars = Math.min(text.length, Math.floor(elapsed / speed));
      setShown(chars);
      if (chars >= text.length) {
        if (!done.current) {
          done.current = true;
          onDoneRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {text.slice(0, shown)}
      {caret && shown < text.length ? <span className="sim-caret" /> : null}
    </span>
  );
}

export type FeedLine = {
  text: string;
  tone?: Tone;
};

/**
 * Types a queue of lines out in sequence, each anchored to a marker on a
 * vertical rail so the feed reads as a record rather than a terminal log.
 */
export function TypedFeed({
  lines,
  speed = 13,
  gap = 200,
  className,
  lineClassName,
  onDone,
  rail = true,
}: {
  lines: FeedLine[];
  speed?: number;
  gap?: number;
  className?: string;
  lineClassName?: string;
  onDone?: () => void;
  rail?: boolean;
}) {
  const [visible, setVisible] = useState(1);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Callers build `lines` inline, so compare content rather than identity —
  // otherwise every parent render would restart the queue.
  const signature = lines.map((l) => l.text).join("\u0000");

  useEffect(() => {
    setVisible(1);
  }, [signature]);

  const handleLineDone = (index: number) => {
    if (index >= lines.length - 1) {
      window.setTimeout(() => onDoneRef.current?.(), gap);
      return;
    }
    window.setTimeout(() => {
      setVisible((v) => Math.min(lines.length, Math.max(v, index + 2)));
    }, gap);
  };

  return (
    <ul className={cn("space-y-3.5", className)}>
      {lines.slice(0, visible).map((line, i) => {
        const tone = line.tone ?? "muted";
        return (
          <motion.li
            key={`${line.text}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("relative flex gap-3.5", rail && "pl-0")}
          >
            {rail && (
              <span className="relative mt-[9px] flex h-2 w-2 shrink-0">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    tone === "muted" ? "bg-brand/45" : "bg-current",
                    tone !== "muted" && toneText[tone],
                  )}
                />
                {i < lines.length - 1 && (
                  <span className="absolute left-1/2 top-3 h-[calc(100%+0.6rem)] w-px -translate-x-1/2 bg-border" />
                )}
              </span>
            )}
            <span
              className={cn(
                "min-w-0 flex-1 text-[14.5px] leading-relaxed",
                tone === "muted" ? "text-brand-deep/80" : toneText[tone],
                lineClassName,
              )}
            >
              <Typewriter
                text={line.text}
                speed={speed}
                caret={i === visible - 1}
                onDone={i === visible - 1 ? () => handleLineDone(i) : undefined}
              />
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}
