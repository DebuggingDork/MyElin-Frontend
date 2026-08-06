"use client";

import { AnimatePresence, motion } from "framer-motion";
import { easeOut } from "@/lib/media";
import { accentVar } from "@/components/ui/Kit";
import { axisAccent, type Insight, type Tension } from "@/lib/play/insights";
import { SHAPE_LABEL, SHAPE_ORDER, type Shape } from "@/lib/play/types";

/** Four axes as slab columns that refill as decisions land. */
export function AxisColumns({ shape }: { shape: Shape }) {
  const rungs = 12;

  return (
    <div>
      <p className="eyebrow text-faint">Posture — live</p>
      <div className="mt-4 flex max-w-[300px] items-end justify-between gap-3">
        {SHAPE_ORDER.map((key) => {
          const color = accentVar[axisAccent(key)];
          const lit = Math.round((shape[key] / 100) * rungs);
          return (
            <div key={key} className="flex flex-1 flex-col items-center gap-2">
              <span
                className="num text-[13px] font-semibold"
                style={{ color }}
              >
                {shape[key]}
              </span>
              <div className="flex w-full flex-col-reverse gap-[2px]">
                {Array.from({ length: rungs }).map((_, i) => {
                  const on = i < lit;
                  return (
                    <motion.span
                      key={i}
                      className="h-[7px] rounded-[1px]"
                      initial={false}
                      animate={{
                        opacity: on ? 1 : 0.14,
                        scaleX: on ? 1 : 0.55,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: on ? i * 0.012 : 0,
                        ease: easeOut,
                      }}
                      style={{
                        background: on ? color : "rgba(255,255,255,0.2)",
                        boxShadow: on ? `0 0 10px -3px ${color}` : "none",
                      }}
                    />
                  );
                })}
              </div>
              <span className="eyebrow text-center text-[9px] text-faint">
                {SHAPE_LABEL[key].slice(0, 4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Bidirectional read — which side of a trade-off the plan sits on. */
export function TensionBar({ tension }: { tension: Tension }) {
  const left = accentVar[tension.accentLeft];
  const right = accentVar[tension.accentRight];
  const pct = (tension.bias + 100) / 2;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow" style={{ color: left }}>
          {tension.left}
        </span>
        <span className="eyebrow" style={{ color: right }}>
          {tension.right}
        </span>
      </div>
      <div className="relative mt-2.5 h-[10px] overflow-hidden rounded-full bg-white/[0.06]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-full w-px bg-white/20"
        />
        <motion.span
          className="absolute top-0 h-full"
          initial={false}
          animate={
            tension.bias >= 0
              ? { left: "50%", width: `${pct - 50}%` }
              : { left: `${pct}%`, width: `${50 - pct}%` }
          }
          transition={{ duration: 0.45, ease: easeOut }}
          style={{
            background:
              tension.bias >= 0
                ? `linear-gradient(90deg, color-mix(in srgb, ${right} 35%, transparent), ${right})`
                : `linear-gradient(90deg, ${left}, color-mix(in srgb, ${left} 35%, transparent))`,
          }}
        />
      </div>
    </div>
  );
}

/** Insight slabs — swap in and out as the read changes. */
export function InsightSlabs({ insights }: { insights: Insight[] }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald" />
        <p className="eyebrow text-faint">Key read</p>
      </div>

      <div className="mt-4 space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {insights.map((insight) => {
            const color = accentVar[insight.accent];
            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, x: 18, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -14, filter: "blur(4px)" }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="relative flex overflow-hidden rounded-r-lg rounded-l-[3px]"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, ${color} 12%, transparent), rgba(255,255,255,0.02) 70%)`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                <span
                  aria-hidden
                  className="relative w-[3px] shrink-0 overflow-hidden bg-white/10"
                >
                  <motion.span
                    className="absolute bottom-0 left-0 w-full"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max(18, Math.min(100, insight.weight))}%`,
                    }}
                    transition={{ duration: 0.5, ease: easeOut }}
                    style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                  />
                </span>
                <div className="min-w-0 px-4 py-3.5">
                  <p className="eyebrow" style={{ color }}>
                    {insight.tag}
                  </p>
                  <p className="mt-2 text-[13.5px] font-medium leading-snug text-ink">
                    {insight.headline}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
                    {insight.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function LiveRead({
  shape,
  insights,
  tensions,
  committed,
  total,
}: {
  shape: Shape;
  insights: Insight[];
  tensions: Tension[];
  committed: number;
  total: number;
}) {
  return (
    <div className="max-w-[560px] space-y-8 xl:max-w-none">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow text-faint">Workspace commit</p>
          <p className="num text-[13px] text-ink">
            {committed}/{total}
          </p>
        </div>
        <div className="mt-3 flex gap-[3px]">
          {Array.from({ length: total }).map((_, i) => (
            <motion.span
              key={i}
              className="h-[6px] flex-1 rounded-[1px]"
              initial={false}
              animate={{ opacity: i < committed ? 1 : 0.16 }}
              transition={{ duration: 0.3, ease: easeOut }}
              style={{
                background:
                  i < committed ? "var(--grad-primary)" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      <AxisColumns shape={shape} />

      {tensions.length > 0 && (
        <div className="space-y-5">
          <p className="eyebrow text-faint">Trade-offs you are taking</p>
          {tensions.map((tension) => (
            <TensionBar key={tension.id} tension={tension} />
          ))}
        </div>
      )}

      <InsightSlabs insights={insights} />
    </div>
  );
}
