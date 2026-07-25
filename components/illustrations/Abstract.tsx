"use client";

import { motion } from "framer-motion";

type Props = {
  className?: string;
};

export function NeuralMesh({ className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        {[
          "M80 120 L220 90 L340 160 L480 100 L620 150 L720 80",
          "M120 280 L260 240 L400 300 L540 250 L680 310",
          "M60 400 L200 360 L360 420 L520 370 L700 430",
          "M220 90 L260 240 L360 420",
          "M340 160 L400 300 L520 370",
          "M480 100 L540 250 L680 310",
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="var(--brand-teal)"
            strokeWidth="1"
            strokeOpacity="0.22"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, delay: 0.25 + i * 0.12, ease: "easeInOut" }}
          />
        ))}
        {[
          [80, 120],
          [220, 90],
          [340, 160],
          [480, 100],
          [620, 150],
          [720, 80],
          [120, 280],
          [260, 240],
          [400, 300],
          [540, 250],
          [680, 310],
          [200, 360],
          [360, 420],
          [520, 370],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.5"
            fill="var(--brand-teal)"
            fillOpacity="0.35"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 + i * 0.04 }}
          />
        ))}
      </motion.g>
    </svg>
  );
}

export function DecisionFlow({ className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <motion.path
        d="M40 140 H160"
        stroke="var(--brand-teal)"
        strokeWidth="1.5"
        strokeOpacity="0.45"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M200 140 L300 70 H420"
        stroke="var(--brand-teal)"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M200 140 L300 210 H420"
        stroke="var(--brand-teal)"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.35, ease: "easeInOut" }}
      />
      <motion.path
        d="M460 70 L560 140 H600"
        stroke="var(--brand-teal)"
        strokeWidth="1.5"
        strokeOpacity="0.45"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.55, ease: "easeInOut" }}
      />
      <motion.path
        d="M460 210 L560 140"
        stroke="var(--brand-teal)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.65, ease: "easeInOut" }}
      />

      {[
        { x: 40, y: 140, label: "Situation" },
        { x: 180, y: 140, label: "Decide" },
        { x: 420, y: 70, label: "Path A" },
        { x: 420, y: 210, label: "Path B" },
        { x: 600, y: 140, label: "Judgment" },
      ].map((n, i) => (
        <motion.g
          key={n.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
        >
          <circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill="var(--bg)"
            stroke="var(--brand-teal)"
            strokeWidth="1.5"
          />
          <text
            x={n.x}
            y={n.y + 28}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="var(--font-geist-sans)"
          >
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export function KnowledgeGraph({ className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <path
          d="M200 40 L120 100 L160 180 L240 180 L280 100 Z"
          stroke="var(--brand-teal)"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <path
          d="M200 40 L200 110 M120 100 L200 110 M280 100 L200 110 M160 180 L200 110 M240 180 L200 110"
          stroke="var(--brand-teal)"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        {[
          [200, 40],
          [120, 100],
          [280, 100],
          [160, 180],
          [240, 180],
          [200, 110],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="3.5"
            fill="var(--brand-teal)"
            fillOpacity="0.4"
          />
        ))}
      </motion.g>
    </svg>
  );
}
