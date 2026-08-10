"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/media";

/**
 * A physical kitchen-timer dial, not an abstract progress ring -- the needle sits fixed at the
 * scenario's minute count so the "how long this takes" framing reads at a glance, the way an
 * actual twist-timer would if you set it before starting.
 */
export function TimerDial({ minutes, size = 168 }: { minutes: number; size?: number }) {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  const majorEvery = 5;
  const angleFor = (mark: number) => (mark / 60) * 360;
  const needleAngle = angleFor(minutes % 60);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="relative shrink-0"
    >
      <svg width={size} height={size} viewBox="0 0 168 168" className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <defs>
          <radialGradient id="timer-bezel" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e6e9ec" />
            <stop offset="55%" stopColor="#9aa2ab" />
            <stop offset="100%" stopColor="#5b6169" />
          </radialGradient>
          <radialGradient id="timer-face" cx="42%" cy="36%" r="70%">
            <stop offset="0%" stopColor="#fbf9f2" />
            <stop offset="100%" stopColor="#eee8da" />
          </radialGradient>
        </defs>

        <circle cx="84" cy="84" r="82" fill="url(#timer-bezel)" />
        <circle cx="84" cy="84" r="70" fill="url(#timer-face)" stroke="#c8bfa8" strokeWidth="1" />

        {ticks.map((t) => {
          const major = t % majorEvery === 0;
          const angle = angleFor(t) - 90;
          const r1 = major ? 56 : 61;
          const r2 = 66;
          const x1 = 84 + r1 * Math.cos((angle * Math.PI) / 180);
          const y1 = 84 + r1 * Math.sin((angle * Math.PI) / 180);
          const x2 = 84 + r2 * Math.cos((angle * Math.PI) / 180);
          const y2 = 84 + r2 * Math.sin((angle * Math.PI) / 180);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3a3530"
              strokeWidth={major ? 1.6 : 0.75}
              strokeLinecap="round"
              opacity={major ? 0.75 : 0.4}
            />
          );
        })}

        {ticks
          .filter((t) => t % (majorEvery * 2) === 0)
          .map((t) => {
            const angle = angleFor(t) - 90;
            const r = 46;
            const x = 84 + r * Math.cos((angle * Math.PI) / 180);
            const y = 84 + r * Math.sin((angle * Math.PI) / 180);
            return (
              <text
                key={t}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight={600}
                fill="#3a3530"
              >
                {t}
              </text>
            );
          })}

        <line
          x1="84"
          y1="84"
          x2={84 + 50 * Math.cos(((needleAngle - 90) * Math.PI) / 180)}
          y2={84 + 50 * Math.sin(((needleAngle - 90) * Math.PI) / 180)}
          stroke="#9c2b2b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="84" cy="84" r="5.5" fill="#2a2622" />
        <circle cx="84" cy="84" r="2" fill="#c8bfa8" />
      </svg>

      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-faint">
        {minutes} minutes, set
      </p>
    </motion.div>
  );
}
