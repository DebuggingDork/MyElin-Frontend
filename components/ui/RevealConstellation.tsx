"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NodeItem = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
};

/** Interactive constellation — click nodes to reveal */
export function RevealConstellation({
  nodes,
  className,
}: {
  nodes: NodeItem[];
  className?: string;
}) {
  const [active, setActive] = useState(nodes[0]?.id ?? "");

  const activeNode = nodes.find((n) => n.id === active) ?? nodes[0];

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 70"
        className="h-auto w-full"
        role="img"
        aria-label="Interactive competency map"
      >
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => (
            <motion.line
              key={`${a.id}-${b.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#2aa99c"
              strokeOpacity={
                a.id === active || b.id === active ? 0.45 : 0.12
              }
              strokeWidth={0.25}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.05 }}
            />
          )),
        )}
        {nodes.map((n) => {
          const on = n.id === active;
          return (
            <g key={n.id} className="cursor-pointer" onClick={() => setActive(n.id)}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={on ? 2.8 : 1.8}
                fill={on ? "#2aa99c" : "#1b3d3a"}
                fillOpacity={on ? 1 : 0.55}
                whileHover={{ scale: 1.25 }}
              />
              <text
                x={n.x}
                y={n.y + 5.5}
                textAnchor="middle"
                className="fill-[var(--text-muted)]"
                style={{ fontSize: 2.4 }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <motion.div
        key={activeNode?.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3"
      >
        <p className="text-[11px] uppercase tracking-[0.14em] text-brand">
          Node unlocked
        </p>
        <p className="mt-1 font-medium text-charcoal">{activeNode?.label}</p>
        <p className="mt-1 text-sm text-muted">{activeNode?.detail}</p>
      </motion.div>
    </div>
  );
}
