"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/play/use-reduced-motion";

/**
 * Streams text in word-chunks, the way a generated response arrives -- irregular chunk sizes and
 * gaps, not a steady per-character typewriter. Click/tap skips straight to the full paragraph;
 * reduced-motion shows it complete on first paint.
 */
export function ChunkReveal({ text, className }: { text: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");
  const [shown, setShown] = useState(() => (reduced ? words.length : 0));
  const skippedRef = useRef(false);

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
        <span
          key={i}
          className="chunk-word"
          style={{
            opacity: i < shown ? 1 : 0,
            transform: i < shown ? "translateY(0)" : "translateY(4px)",
            transitionDelay: i < shown ? "0ms" : "0ms",
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
      {shown < words.length && <span className="newsprint-caret" aria-hidden />}
    </p>
  );
}
