"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export function TiltReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(42,169,156,0.2), transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      className={cn("relative [perspective:1000px]", className)}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        rotateX.set((py - 0.5) * -18);
        rotateY.set((px - 0.5) * 22);
        glareX.set(px * 100);
        glareY.set(py * 100);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        glareX.set(50);
        glareY.set(50);
      }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_30px_80px_-50px_rgba(27,61,58,0.45)]">
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: glare }}
        />
      </div>
    </motion.div>
  );
}
