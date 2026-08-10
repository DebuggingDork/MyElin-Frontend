"use client";

import { useRef, useState } from "react";
import { formatLakhs } from "@/lib/api/catalog";
import { SpendNumberInput } from "@/components/run/SpendNumberInput";

export type ColumnLine = { key: string; label: string; hint?: string; value: number };

const TRACK_H = 132;

/**
 * Columns you build up directly, for the departments whose lines each raise a *level* off a
 * baseline rather than buying a quantity: Operations moves Supplier Reliability (baseline 70) and
 * Logistics Efficiency (60), HR moves Employee Satisfaction (65) and Engagement (60)
 * (docs/12-quarter-1-reference.md §5-6). Height reads as "how far up did I push this", and
 * putting the columns side by side in one frame makes the shape of the whole department legible
 * at a glance -- which a grid of separate per-line cards cannot show.
 *
 * Drag or click anywhere on a column to set it; the field underneath still takes an exact figure.
 */
export function SpendColumns({
  lines,
  color,
  disabled,
  referenceMax = 20,
  onChange,
}: {
  lines: ColumnLine[];
  color: string;
  disabled?: boolean;
  /** Scales the column heights only -- typed values are never capped to it. */
  referenceMax?: number;
  onChange: (key: string, value: number) => void;
}) {
  const total = lines.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow text-faint">Build each level</p>
        <p className="num text-[15px] font-semibold text-ink">{formatLakhs(total)}</p>
      </div>

      <div className="mt-4 flex items-end justify-center gap-4 sm:gap-7">
        {lines.map((line) => (
          <Column
            key={line.key}
            line={line}
            color={color}
            disabled={disabled}
            referenceMax={referenceMax}
            onChange={(v) => onChange(line.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  line,
  color,
  disabled,
  referenceMax,
  onChange,
}: {
  line: ColumnLine;
  color: string;
  disabled?: boolean;
  referenceMax: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // State, not a ref: the fill's transition is suppressed mid-drag (a 140ms ease on every
  // pointermove would lag behind the cursor) and restored on release, so this drives rendering.
  const [dragging, setDragging] = useState(false);

  function setFromPointer(clientY: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Measured from the bottom: a column grows upward, so the bottom edge is zero.
    const fromBottom = rect.bottom - clientY;
    const fraction = Math.max(0, Math.min(1, fromBottom / rect.height));
    onChange(Number((fraction * referenceMax).toFixed(2)));
  }

  const fraction = Math.max(0, Math.min(1, line.value / referenceMax));

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${line.label} spend`}
        aria-valuemin={0}
        aria-valuemax={referenceMax}
        aria-valuenow={line.value}
        aria-valuetext={formatLakhs(line.value)}
        onPointerDown={(e) => {
          if (disabled) return;
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromPointer(e.clientY);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setFromPointer(e.clientY);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(Number((line.value + 0.25).toFixed(2)));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(Number(Math.max(0, line.value - 0.25).toFixed(2)));
          }
        }}
        className={`relative w-full max-w-[64px] overflow-hidden rounded-lg ${
          disabled ? "opacity-50" : "cursor-ns-resize touch-none"
        }`}
        style={{ height: TRACK_H, background: "var(--panel-2)" }}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-[4px]"
          style={{
            height: `${fraction * 100}%`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 82%, transparent), color-mix(in srgb, ${color} 42%, transparent))`,
            transition: dragging ? "none" : "height 140ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
        {line.value > 0 && (
          <div
            className="absolute inset-x-0 h-[2px]"
            style={{ bottom: `calc(${fraction * 100}% - 1px)`, background: color }}
            aria-hidden
          />
        )}
      </div>

      <p className="mt-2.5 w-full truncate text-center text-[12px] font-medium text-ink" title={line.label}>
        {line.label}
      </p>
      {line.hint && (
        <p className="w-full truncate text-center text-[10.5px] text-faint" title={line.hint}>
          {line.hint}
        </p>
      )}
      <div className="mt-1.5">
        <SpendNumberInput
          size="sm"
          label={line.label}
          value={line.value}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
