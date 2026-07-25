"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

type Tag = "div" | "p" | "h2" | "h3" | "li" | "blockquote";

const motionTags = {
  div: motion.div,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
  li: motion.li,
  blockquote: motion.blockquote,
} as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: Tag;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: RevealProps) {
  const Component = motionTags[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}
