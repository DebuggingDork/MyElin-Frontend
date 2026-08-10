"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatLakhs } from "@/lib/api/catalog";

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
 * A drag-to-set radial dial with a real, always-editable number in the center -- neither a
 * slider (linear drag bar) nor the old fixed-block grid (click-only, 1L granularity). The dial is
 * a fast, tactile way to get roughly where you want; the input is how you land on an exact figure
 * like 1.74 -- backend spend columns are Numeric(10,4), so there's no reason to round to a step.
 */
export function SpendDial({
  label,
  hint,
  value,
  color,
  disabled,
  referenceMax = 20,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  color: string;
  disabled?: boolean;
  /** Visual scale for the ring only -- typed values aren't capped to this. */
  referenceMax?: number;
  onChange: (v: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const [text, setText] = useState(() => trimmed(value));
  const [editing, setEditing] = useState(false);

  function trimmed(v: number) {
    return v === 0 ? "0" : String(Number(v.toFixed(4)));
  }

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
    onChange(Number((fraction * referenceMax).toFixed(2)));
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

  const fraction = Math.max(0, Math.min(1, value / referenceMax));
  const valueAngle = START_ANGLE + fraction * SWEEP;
  const trackPath = describeArc(START_ANGLE, END_ANGLE);
  const valuePath = describeArc(START_ANGLE, Math.max(START_ANGLE, valueAngle));

  function commitText(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const n = Number(cleaned);
    onChange(Number.isFinite(n) && n >= 0 ? n : 0);
  }

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
          className={disabled ? "shrink-0 opacity-50" : "shrink-0 cursor-pointer touch-none"}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
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
          <div className="flex items-baseline gap-1">
            <span className="num text-[13px] text-faint">₹</span>
            <input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={editing ? text : trimmed(value)}
              onFocus={() => {
                setEditing(true);
                setText(trimmed(value));
              }}
              onChange={(e) => {
                setText(e.target.value);
                // Commit as the user types too (not just on blur), so the running totals
                // elsewhere on the page stay live -- but only once it's a real number; "1." or
                // "" mid-keystroke is left alone rather than forced to 1 or 0.
                const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                if (e.target.value !== "" && Number.isFinite(n)) onChange(n);
              }}
              onBlur={() => {
                setEditing(false);
                commitText(text);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="num w-full min-w-0 bg-transparent text-[22px] font-semibold text-ink outline-none disabled:cursor-not-allowed"
              aria-label={`${label} spend in lakhs`}
            />
            <span className="num text-[13px] text-faint">L</span>
          </div>
          <p className="num mt-0.5 text-[11px] text-faint">{formatLakhs(value)} exactly</p>
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              disabled={disabled || value <= 0}
              onClick={() => onChange(Number(Math.max(0, value - 0.25).toFixed(2)))}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(Number((value + 0.25).toFixed(2)))}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
