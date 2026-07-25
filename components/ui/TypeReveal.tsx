"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Typewriter that only runs when in view */
export function TypeReveal({
  text,
  className,
  speed = 22,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, text, speed]);

  return (
    <span ref={ref} className={cn("whitespace-pre-wrap", className)}>
      {out}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-brand align-baseline"
      />
    </span>
  );
}
