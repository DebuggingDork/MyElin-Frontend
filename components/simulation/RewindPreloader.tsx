"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useRewindSFX } from "@/lib/simulation/use-rewind-sfx";

/**
 * Fullscreen rewind transition overlay — renders for exactly 3 seconds, then calls onComplete.
 *
 * Visual design follows the existing working-overlay (bg-base/90, backdrop-blur-xl, ambient
 * blobs, absolute inset-0 z-[60]) but uses amber instead of teal to make the rewind feel
 * distinct and intentional.
 *
 * Layout:
 *   - Depleting arc ring (SVG, amber stroke, one full rotation per second)
 *   - Large countdown digit  3 → 2 → 1
 *   - Headline: "Rewinding Simulation"
 *   - Sub-line: dynamic "Returning to Quarter N…"
 *   - SFX plays for the full 3 seconds, stops before onComplete fires
 *
 * Guarantees:
 *   - onComplete fires exactly once after 3 seconds
 *   - SFX is stopped before onComplete so the actual rewind API call has
 *     no audio leaking through it
 *   - Cleanup on unmount stops SFX and clears all timers (handles edge-case
 *     where parent unmounts before 3 s are up, e.g. error path)
 */

const TOTAL_MS = 3000;
const TICK_MS = 50; // smooth arc animation

/** SVG arc helpers */
const R = 54; // radius of arc circle (viewBox is 120×120, centre 60,60)
const CIRCUMFERENCE = 2 * Math.PI * R;

function arcDashOffset(elapsed: number): number {
  const progress = Math.min(elapsed / TOTAL_MS, 1);
  // starts full (offset=0), drains to empty (offset=CIRCUMFERENCE) as time passes
  return CIRCUMFERENCE * progress;
}

export function RewindPreloader({
  targetQuarter,
  onComplete,
}: {
  /** The quarter we're rewinding TO — shown in the sub-line. */
  targetQuarter: number;
  /** Called once, after exactly 3 seconds. Trigger the actual API call here. */
  onComplete: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  // countdown digit: 3 when elapsed<1000, 2 when <2000, 1 when <3000
  const countdown = Math.max(1, 3 - Math.floor(elapsed / 1000));
  const dashOffset = arcDashOffset(elapsed);

  const sfx = useRewindSFX();
  const completedRef = useRef(false);
  const startRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  // keep the ref current without re-running effects
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Start audio immediately on mount — we're already inside the user-gesture task
    sfx.start();

    startRef.current = performance.now();

    function tick() {
      const now = performance.now();
      const ms = now - startRef.current;
      setElapsed(ms);

      if (ms >= TOTAL_MS) {
        if (!completedRef.current) {
          completedRef.current = true;
          sfx.stop();
          onCompleteRef.current();
        }
        return; // stop ticking
      }
      tickRef.current = window.setTimeout(tick, TICK_MS);
    }

    tickRef.current = window.setTimeout(tick, TICK_MS);

    return () => {
      window.clearTimeout(tickRef.current);
      sfx.stop();
    };
    // sfx object identity is stable (built from refs) — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-base/90 backdrop-blur-xl overflow-hidden"
      aria-live="assertive"
      aria-label={`Rewinding simulation. Returning to Quarter ${targetQuarter} in ${countdown}…`}
    >
      {/* Ambient blobs — amber palette to distinguish from quarter-close overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-50" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-amber/5 rounded-full blur-[90px] animate-pulse"
          style={{ animationDuration: "2.5s", animationDelay: "0.4s" }}
          aria-hidden
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-sm">

        {/* Arc ring with countdown digit */}
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          {/* Track ring */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="60" cy="60" r={R}
              fill="none"
              strokeWidth="4"
              className="stroke-line"
            />
            {/* Depleting amber arc */}
            <circle
              cx="60" cy="60" r={R}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                stroke: "var(--amber, #f59e0b)",
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: dashOffset,
                transition: "stroke-dashoffset 50ms linear",
              }}
            />
          </svg>

          {/* Countdown digit */}
          <div className="relative flex flex-col items-center justify-center gap-0.5">
            <span
              key={countdown}
              className="font-serif text-5xl font-bold leading-none text-ink tabular-nums"
              style={{
                animation: "rewind-digit-pop 0.25s ease-out both",
              }}
            >
              {countdown}
            </span>
            <RotateCcw
              className="h-3.5 w-3.5 text-amber"
              style={{ animation: "spin 1s linear infinite" }}
              aria-hidden
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber">
            Rewinding Simulation
          </p>
          <h2 className="font-serif text-2xl text-ink leading-tight">
            Returning to Quarter {targetQuarter}
          </h2>
          <p className="text-sm text-dim leading-relaxed">
            Your previous decisions will be restored.
            <br />
            Stand by…
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-line rounded-full overflow-hidden" aria-hidden>
          <div
            className="h-full bg-amber rounded-full"
            style={{
              width: `${Math.min((elapsed / TOTAL_MS) * 100, 100)}%`,
              transition: "width 50ms linear",
            }}
          />
        </div>
      </div>

      {/* Keyframe for digit pop — injected as a global style tag */}
      <style>{`
        @keyframes rewind-digit-pop {
          from { opacity: 0.4; transform: scale(0.75); }
          to   { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
