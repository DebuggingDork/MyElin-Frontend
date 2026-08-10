"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/play/use-reduced-motion";

/**
 * Streams text in word-chunks, the way a generated response arrives -- irregular chunk sizes and
 * gaps, not a steady per-character typewriter. Click/tap skips straight to the full paragraph;
 * reduced-motion shows it complete on first paint.
 */
export function ChunkReveal({
  text,
  className,
  onDone,
}: {
  text: string;
  className?: string;
  onDone?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");
  const [shown, setShown] = useState(() => (reduced ? words.length : 0));
  const skippedRef = useRef(false);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    doneFiredRef.current = false;
  }, [text]);

  useEffect(() => {
    if (shown >= words.length && !doneFiredRef.current) {
      doneFiredRef.current = true;
      onDone?.();
    }
  }, [shown, words.length, onDone]);

  useEffect(() => {
    if (reduced) return;
    skippedRef.current = false;
    let i = 0;
    let timeoutId = 0;

    function step() {
      if (skippedRef.current) return;
      const chunk = 1 + Math.floor(Math.random() * 3);
      i = Math.min(words.length, i + chunk);
      setShown(i);
      if (i < words.length) {
        timeoutId = window.setTimeout(step, 60 + Math.random() * 160);
      }
    }
    timeoutId = window.setTimeout(step, 60 + Math.random() * 160);
    return () => window.clearTimeout(timeoutId);
  }, [text, reduced, words.length]);

  return (
    <p
      className={`cursor-pointer ${className ?? ""}`}
      title="Click to skip ahead"
      onClick={() => {
        skippedRef.current = true;
        setShown(words.length);
      }}
    >
      {words.map((word, i) => (
        // The space after each word is a sibling text node, not trailing content inside the
        // inline-block span -- a trailing space *inside* an inline-block gets collapsed away at
        // the box's own edge (the classic word-by-word-span bug), which is why this can't just be
        // `{word} ` inside the span below.
        <span key={i}>
          <span
            className="chunk-word"
            style={{
              opacity: i < shown ? 1 : 0,
              transform: i < shown ? "translateY(0)" : "translateY(4px)",
            }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
      {shown < words.length && <span className="newsprint-caret" aria-hidden />}
    </p>
  );
}
