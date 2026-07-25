"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";

export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.88, 1],
    [0, 1, 1, 0.55],
  );
  const y = useTransform(scrollYProgress, [0, 0.18], [36, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      transition={{ ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StickyScrub({
  children,
  className,
  height = "220vh",
}: {
  children: (progress: MotionValue<number>) => ReactNode;
  className?: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className={cn("relative", className)} style={{ height }}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

export function MaskReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"],
  });
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
  );
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.4, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ clipPath: clip, opacity }}>{children}</motion.div>
    </div>
  );
}

export function ParallaxX({
  children,
  className,
  from = 80,
  to = -80,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <motion.div ref={ref} style={{ x }} className={className}>
      {children}
    </motion.div>
  );
}

/** Image that gently zooms while section is in view */
export function KenBurns({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ scale }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
