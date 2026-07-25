"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Word-by-word reveal */
export function WordReveal({
  text,
  className,
  delay = 0,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "p" | "h2" | "h3" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <Tag ref={ref as never} className={cn("flex flex-wrap gap-x-[0.3em]", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : undefined}
            transition={{
              duration: 0.65,
              delay: delay + i * 0.035,
              ease: easeOut,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Character shimmer reveal for short headlines */
export function CharReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <span ref={ref} className={cn("inline-block", className)} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : undefined
          }
          transition={{
            duration: 0.45,
            delay: delay + i * 0.018,
            ease: easeOut,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

/** Line mask that slides open */
export function LineReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.75, delay, ease: easeOut }}
      >
        {children}
      </motion.span>
    </span>
  );
}
