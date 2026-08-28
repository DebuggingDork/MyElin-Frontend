"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Fullscreen rewind transition overlay — renders for exactly 3 seconds, then calls onComplete.
 *
 * Audio is NOT managed here. The parent (SimulationApp) starts the SFX synchronously inside
 * the click handler — before React re-renders — so audio is already playing the moment this
 * component mounts. onStop is called here when the countdown ends (or on unmount) to stop it.
 */

const TOTAL_MS = 3000;
const TICK_MS = 50;

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

function arcDashOffset(elapsed: number): number {
  const progress = Math.min(elapsed / TOTAL_MS, 1);
  return CIRCUMFERENCE * progress;
}

export function RewindPreloader({
  targetQuarter,
  onStop,
  onComplete,
}: {
  targetQuarter: number;
  /** Called to stop the rewind SFX — fired when countdown ends or component unmounts. */
  onStop: () => void;
  onComplete: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const countdown = Math.max(1, 3 - Math.floor(elapsed / 1000));
  const dashOffset = arcDashOffset(elapsed);

  const completedRef = useRef(false);
  const startRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  const onStopRef = useRef(onStop);
  onCompleteRef.current = onComplete;
  onStopRef.current = onStop;

  useEffect(() => {
    startRef.current = performance.now();

    function tick() {
      const now = performance.now();
      const ms = now - startRef.current;
      setElapsed(ms);

      if (ms >= TOTAL_MS) {
        if (!completedRef.current) {
          completedRef.current = true;
          onStopRef.current();
          onCompleteRef.current();
        }
        return;
      }
      tickRef.current = window.setTimeout(tick, TICK_MS);
    }

    tickRef.current = window.setTimeout(tick, TICK_MS);

    return () => {
      window.clearTimeout(tickRef.current);
      onStopRef.current();
    };
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
