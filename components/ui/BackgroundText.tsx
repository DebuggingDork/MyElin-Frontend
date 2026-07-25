"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Monumental ghost word — drifts gently with scroll (Hero only) */
export function BackgroundText({
  text,
  className,
  speed = 80,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.035, 0.07, 0.07, 0.025],
  );

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className,
      )}
      aria-hidden
    >
      <motion.p
        style={{ y, opacity }}
        className="absolute left-1/2 top-[42%] w-[140%] -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(4rem,16vw,12rem)] font-semibold leading-none tracking-tight text-brand-deep"
      >
        {text}
      </motion.p>
    </div>
  );
}

type MarqueeProps = {
  items: string[];
  className?: string;
  direction?: "left" | "right";
  duration?: number;
  tone?: "ink" | "teal" | "soft";
  size?: "sm" | "md" | "lg";
  /** When false, sits in normal flow (for DualMarquee rows) */
  absolute?: boolean;
};

const toneClass = {
  ink: "text-brand-deep/[0.07]",
  teal: "text-brand/[0.09]",
  soft: "text-brand-deep/[0.06]",
} as const;

const sizeClass = {
  sm: "text-[clamp(1.25rem,3vw,2rem)] tracking-[0.08em]",
  md: "text-[clamp(1.75rem,4.5vw,3.25rem)] tracking-[0.04em]",
  lg: "text-[clamp(2.25rem,6vw,4.5rem)] tracking-tight",
} as const;

function MarqueeTrack({
  items,
  direction,
  duration,
  tone,
  size,
}: Omit<MarqueeProps, "className" | "absolute">) {
  const seq = items.join("   ·   ");
  const track = `${seq}   ·   ${seq}   ·   `;

  return (
    <div
      className={cn(
        "flex w-max whitespace-nowrap font-semibold uppercase",
        toneClass[tone ?? "ink"],
        sizeClass[size ?? "md"],
        direction === "right" ? "animate-marquee-right" : "animate-marquee-left",
      )}
      style={{ animationDuration: `${duration ?? 48}s` }}
    >
      <span className="pr-12">{track}</span>
      <span className="pr-12">{track}</span>
    </div>
  );
}

/** Continuous cycling band — left or right */
export function TextMarquee({
  items,
  className,
  direction = "left",
  duration = 48,
  tone = "ink",
  size = "md",
  absolute = true,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden select-none",
        absolute && "absolute inset-x-0",
        className,
      )}
      aria-hidden
    >
      <MarqueeTrack
        items={items}
        direction={direction}
        duration={duration}
        tone={tone}
        size={size}
      />
    </div>
  );
}

/** Two opposing crawl rows — editorial ribbon */
export function DualMarquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 overflow-hidden select-none",
        className,
      )}
      aria-hidden
    >
      <MarqueeTrack
        items={items}
        direction="left"
        duration={56}
        tone="ink"
        size="md"
      />
      <div className="mt-3">
        <MarqueeTrack
          items={[...items].reverse()}
          direction="right"
          duration={64}
          tone="teal"
          size="sm"
        />
      </div>
    </div>
  );
}
