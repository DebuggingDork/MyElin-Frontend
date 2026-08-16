"use client";

import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { formatLakhs } from "@/lib/api/catalog";
import { SpendNumberInput } from "@/components/run/SpendNumberInput";
import { clampSpend } from "@/components/run/spendValue";

const CX = 60;
const CY = 60;
const R = 46;
const START_ANGLE = -135;
const END_ANGLE = 135;
const SWEEP = END_ANGLE - START_ANGLE;

/** 0deg = 12 o'clock, clockwise positive -- matches TimerDial's convention. */
function polarToCartesian(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * Math.sin(rad), y: CY - R * Math.cos(rad) };
}

function describeArc(startAngle: number, endAngle: number) {
  if (endAngle <= startAngle) return "";
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * A drag-to-set radial dial with a real, editable number beside it -- neither a slider (linear
 * drag bar) nor the old fixed-block grid (click-only, 1L granularity). The dial is a fast,
 * tactile way to get roughly where you want; the field is how you land on an exact figure like
 * 1.74 -- backend spend columns are Numeric(10,4), so there's no reason to round to a step.
 *
 * The two halves drive one number and stay in step in both directions: dragging the arc rewrites
 * the field on the same frame, typing in the field moves the arc on the same keystroke. That is
 * the whole reason the field is `SpendNumberInput` rather than a local copy of one -- it is the
 * same control the split rows and the columns use, so all three agree on what a typed figure
 * means and all three look equally editable.
 *
 * `step` governs the arc's keyboard, the arrow keys and the +/- buttons; typed entry stays free
 * to any 4dp figure. `min`/`max` are hard on every route in.
 */
export function SpendDial({
  label,
  hint,
  value,
  color,
  disabled,
  referenceMax = 20,
  min = 0,
  max,
  step = 0.25,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  color: string;
  disabled?: boolean;
  /** Visual scale for the ring only -- typed values aren't capped to this. */
  referenceMax?: number;
  /** Floor for every route in (drag, type, arrows, buttons). */
  min?: number;
  /** Ceiling for every route in. Omitted means uncapped -- the ring's scale is not a cap. */
  max?: number;
  /** Granularity of the arc's keyboard and the +/- buttons. Not of typed entry. */
  step?: number;
  onChange: (v: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  const ceiling = max ?? Number.POSITIVE_INFINITY;
  const commit = (v: number) => onChange(clampSpend(v, min, ceiling));
  /** Where the arc's End key lands: the smaller of the ring's scale and a real ceiling. */
  const arcMax = Math.min(ceiling, referenceMax);

  function angleFromPointer(clientX: number, clientY: number): number {
    const svg = svgRef.current;
    if (!svg) return START_ANGLE;
    const rect = svg.getBoundingClientRect();
    const scale = 120 / rect.width;
    const dx = (clientX - rect.left) * scale - CX;
    const dy = (clientY - rect.top) * scale - CY;
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
  }

  function setFromAngle(angle: number) {
    const fraction = (angle - START_ANGLE) / SWEEP;
    commit(fraction * referenceMax);
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (disabled) return;
    draggingRef.current = true;
    svgRef.current?.setPointerCapture(e.pointerId);
    setFromAngle(angleFromPointer(e.clientX, e.clientY));
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggingRef.current) return;
    setFromAngle(angleFromPointer(e.clientX, e.clientY));
  }
  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    draggingRef.current = false;
    svgRef.current?.releasePointerCapture(e.pointerId);
  }

  /** The arc answers the keys a slider is expected to answer, so the pointer is not the only
   *  way to reach it -- and so a screen reader announcing `role="slider"` is telling the truth. */
  function onArcKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (disabled) return;
    let next: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = value + step;
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = value - step;
    else if (e.key === "PageUp") next = value + step * 4;
    else if (e.key === "PageDown") next = value - step * 4;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = arcMax;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  }

  const fraction = Math.max(0, Math.min(1, value / referenceMax));
  const valueAngle = START_ANGLE + fraction * SWEEP;
  const trackPath = describeArc(START_ANGLE, END_ANGLE);
  const valuePath = describeArc(START_ANGLE, Math.max(START_ANGLE, valueAngle));

  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <p className="text-[13.5px] font-medium text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-[11.5px] text-faint">{hint}</p>}

      <div className="mt-3 flex items-center gap-4">
        <svg
          ref={svgRef}
          viewBox="0 0 120 120"
          width={92}
          height={92}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label} spend dial`}
          aria-valuemin={min}
          aria-valuemax={arcMax}
          aria-valuenow={value}
          aria-valuetext={formatLakhs(value)}
          aria-disabled={disabled || undefined}
          className={
            disabled
              ? "shrink-0 opacity-50"
              : "shrink-0 cursor-pointer touch-none rounded-full"
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onArcKeyDown}
        >
          <path d={trackPath} fill="none" stroke="var(--line-2)" strokeWidth={9} strokeLinecap="round" />
          {value > 0 && (
            <path
              d={valuePath}
              fill="none"
              stroke={color}
              strokeWidth={9}
              strokeLinecap="round"
            />
          )}
          <circle
            cx={polarToCartesian(valueAngle).x}
            cy={polarToCartesian(valueAngle).y}
            r={6}
            fill={color}
            stroke="var(--raise)"
            strokeWidth={2}
          />
        </svg>

        <div className="min-w-0 flex-1">
          <SpendNumberInput
            label={label}
            value={value}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={commit}
          />
          <p className="num mt-1 px-3 text-[11px] text-faint">{formatLakhs(value)} exactly</p>
          <div className="mt-2 flex items-center gap-1.5 px-3">
            <button
              type="button"
              disabled={disabled || value <= min}
              aria-label={`Decrease ${label}`}
              onClick={() => commit(value - step)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-line-2 hover:text-ink disabled:opacity-30 sm:h-6 sm:w-6"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={disabled || value >= ceiling}
              aria-label={`Increase ${label}`}
              onClick={() => commit(value + step)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-line-2 hover:text-ink disabled:opacity-30 sm:h-6 sm:w-6"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
