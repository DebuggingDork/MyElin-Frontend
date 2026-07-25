"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

type DataPanelProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Soft interactive surface — used only when content is interactive */
export function DataPanel({
  children,
  className = "",
  delay = 0,
}: DataPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-white/70 shadow-[0_20px_60px_-40px_rgba(27,61,58,0.35)] backdrop-blur-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
        aria-hidden
      />
      {children}
    </motion.div>
  );
}
