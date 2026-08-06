"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import { accentVar, type Accent } from "@/components/ui/Kit";
import {
  SHAPE_LABEL,
  SHAPE_ORDER,
  type Channel,
  type ChoiceOption,
  type Decision,
  type PriorityItem,
  type Shape,
} from "@/lib/play/types";
import { axisAccent } from "@/lib/play/insights";

const SEVERITY: Record<Decision["severity"], { label: string; accent: Accent }> =
  {
    critical: { label: "Critical", accent: "rose" },
    high: { label: "High", accent: "amber" },
    medium: { label: "Standard", accent: "cyan" },
  };

/* ────────────────────────── slab primitives ────────────────────────── */

/**
 * Every interactive element in the workspace is a slab: a beveled bar with a
 * colour spine on the left edge that seats forward when it is committed.
 */
function Slab({
  children,
  active = false,
  accent = "violet",
  onClick,
  disabled,
  className,
  index,
}: {
  children: React.ReactNode;
  active?: boolean;
  accent?: Accent;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  index?: string;
}) {
  const color = accentVar[accent];
  const interactive = !!onClick && !disabled;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={{ x: active ? 8 : 0 }}
      whileHover={interactive && !active ? { x: 4 } : undefined}
      transition={{ duration: 0.32, ease: easeOut }}
      className={cn(
        "group relative flex w-full items-stretch overflow-hidden rounded-r-lg rounded-l-[3px] text-left",
        !interactive && "cursor-default",
        disabled && "opacity-35",
        className,
      )}
      style={{
        background: active
          ? `linear-gradient(90deg, color-mix(in srgb, ${color} 22%, transparent), color-mix(in srgb, ${color} 4%, transparent) 55%, rgba(255,255,255,0.02))`
          : "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
        boxShadow: active
          ? `inset 0 1px 0 rgba(255,255,255,0.12), 0 14px 30px -20px ${color}`
          : "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <span
        aria-hidden
        className="w-[3px] shrink-0 transition-all duration-300"
        style={{
          background: active ? color : "rgba(255,255,255,0.14)",
          boxShadow: active ? `0 0 14px ${color}` : "none",
        }}
      />
      {index && (
        <span
          className="num flex w-11 shrink-0 items-center justify-center border-r text-[11px] transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            color: active ? color : "var(--faint)",
          }}
        >
          {index}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </motion.button>
  );
}

/** Tiny four-bar readout of a shape — replaces number tables. */
function ShapeBars({
  shape,
  bright,
  height = 26,
}: {
  shape: Shape;
  bright: boolean;
  height?: number;
}) {
  return (
    <span className="flex items-end gap-[3px]" style={{ height }}>
      {SHAPE_ORDER.map((key) => {
        const accent = accentVar[axisAccent(key)];
        return (
          <motion.span
            key={key}
            title={`${SHAPE_LABEL[key]} ${shape[key]}`}
            className="w-[5px] rounded-[1px]"
            initial={false}
            animate={{ height: `${Math.max(8, shape[key])}%` }}
            transition={{ duration: 0.4, ease: easeOut }}
            style={{
              background: bright ? accent : "rgba(255,255,255,0.16)",
              boxShadow: bright ? `0 0 8px ${accent}` : "none",
            }}
          />
        );
      })}
    </span>
  );
}

/* ───────────────────────── decision container ───────────────────────── */

export function DecisionSlab({
  decision,
  index,
  committed,
  children,
}: {
  decision: Decision;
  index: number;
  committed: boolean;
  children: React.ReactNode;
}) {
  const severity = SEVERITY[decision.severity];
  const color = accentVar[severity.accent];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: easeOut }}
      className="relative overflow-hidden rounded-2xl border border-line bg-raise/70"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[4px]"
        style={{
          background: committed ? "var(--grad-primary)" : color,
          opacity: committed ? 1 : 0.5,
        }}
      />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5 pl-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="num text-[11px] text-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="eyebrow"
              style={{ color: committed ? "var(--emerald)" : color }}
            >
              {committed ? "Committed" : `${severity.label} · open`}
            </span>
          </div>
          <h3 className="display mt-2.5 text-[19px] text-ink">
            {decision.title}
          </h3>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-dim">
            {decision.prompt}
          </p>
        </div>
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            background: committed ? "var(--emerald)" : "rgba(255,255,255,0.16)",
            boxShadow: committed ? "0 0 12px var(--emerald)" : "none",
          }}
        />
      </header>
      <div className="px-6 py-6 pl-8">{children}</div>
    </motion.section>
  );
}

/* ──────────────────────────── choice slabs ──────────────────────────── */

export function ChoiceSlabs({
  options,
  selected,
  onSelect,
}: {
  options: ChoiceOption[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option, i) => {
        const active = selected === option.id;
        const dimmed = !!selected && !active;
        const lead = SHAPE_ORDER.reduce((best, key) =>
          option.shape[key] > option.shape[best] ? key : best,
        );
        return (
          <Slab
            key={option.id}
            index={String(i + 1).padStart(2, "0")}
            active={active}
            accent={axisAccent(lead)}
            onClick={() => onSelect(option.id)}
            className={cn(
              "transition-opacity duration-300",
              dimmed && "opacity-55 hover:opacity-90",
            )}
          >
            <span className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <span className="min-w-0">
                <span className="block text-[15.5px] font-medium text-ink">
                  {option.label}
                </span>
                <span className="mt-1 block text-[13px] text-dim">
                  {option.hint}
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span
                  className="eyebrow hidden sm:block"
                  style={{
                    color: active
                      ? accentVar[axisAccent(lead)]
                      : "var(--faint)",
                  }}
                >
                  {SHAPE_LABEL[lead]}
                </span>
                <ShapeBars shape={option.shape} bright={active} />
              </span>
            </span>
          </Slab>
        );
      })}
    </div>
  );
}

/* ────────────────────── allocation: paintable slabs ────────────────── */

export function SlabAllocator({
  channels,
  budget,
  unit,
  split,
  onChange,
}: {
  channels: Channel[];
  budget: number;
  unit: number;
  split: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [hover, setHover] = useState<{ id: string; cells: number } | null>(null);
  const cells = Math.round(budget / unit);
  const committed = Object.values(split).reduce((a, b) => a + b, 0);
  const remaining = budget - committed;

  useEffect(() => {
    const stop = () => setDragging(null);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const paint = useCallback(
    (channelId: string, cellIndex: number, allowRelease: boolean) => {
      const own = split[channelId] ?? 0;
      const others = committed - own;
      const wanted = (cellIndex + 1) * unit;
      // Tapping the last filled block releases that lane back to the vault.
      if (allowRelease && wanted === own) {
        onChange({ ...split, [channelId]: 0 });
        return;
      }
      const next = Math.min(wanted, budget - others);
      if (next === own) return;
      onChange({ ...split, [channelId]: next });
    },
    [budget, committed, onChange, split, unit],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-faint">Vault — unassigned</p>
          <div className="mt-2.5 flex flex-wrap gap-[3px]">
            {Array.from({ length: cells }).map((_, i) => {
              const held = i < remaining / unit;
              return (
                <motion.span
                  key={i}
                  className="h-6 w-2.5 rounded-[2px]"
                  initial={false}
                  animate={{
                    opacity: held ? 1 : 0.16,
                    scaleY: held ? 1 : 0.42,
                  }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  style={{
                    background: held
                      ? "linear-gradient(180deg, #eaeefb, #99a2bb)"
                      : "rgba(255,255,255,0.14)",
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="text-right">
          <p className="eyebrow text-faint">Committed</p>
          <p className="num mt-1.5 text-[26px] font-semibold text-ink">
            ₹{committed}
            <span className="text-[13px] font-normal text-faint">
              {" "}
              / {budget} L
            </span>
          </p>
        </div>
      </div>

      <p className="mt-5 text-[12.5px] text-faint">
        Drag across a lane to pour capital into it. Tap the last block to pull it
        back.
      </p>

      <div className="mt-3 space-y-2">
        {channels.map((channel) => {
          const value = split[channel.id] ?? 0;
          const filled = Math.round(value / unit);
          const color = accentVar[channel.accent];
          const preview =
            hover?.id === channel.id ? hover.cells : null;
          const share = budget > 0 ? Math.round((value / budget) * 100) : 0;

          return (
            <div
              key={channel.id}
              className="relative overflow-hidden rounded-r-lg rounded-l-[3px] border border-line/60"
              style={{
                background:
                  value > 0
                    ? `linear-gradient(90deg, color-mix(in srgb, ${color} 14%, transparent), rgba(255,255,255,0.015))`
                    : "rgba(255,255,255,0.02)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] transition-all"
                style={{
                  background: value > 0 ? color : "rgba(255,255,255,0.12)",
                  boxShadow: value > 0 ? `0 0 12px ${color}` : "none",
                }}
              />
              <div className="flex flex-wrap items-center gap-4 px-5 py-4 pl-6">
                <div className="min-w-[9rem] flex-1">
                  <p className="text-[14.5px] font-medium text-ink">
                    {channel.label}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-dim">{channel.hint}</p>
                </div>

                <div
                  className="flex touch-none gap-[3px]"
                  onPointerLeave={() => setHover(null)}
                >
                  {Array.from({ length: cells }).map((_, i) => {
                    const on = i < filled;
                    const ghost =
                      preview !== null && !on && i <= preview;
                    return (
                      <span
                        key={i}
                        role="button"
                        tabIndex={-1}
                        aria-label={`Set ${channel.label} to ₹${(i + 1) * unit} L`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setDragging(channel.id);
                          paint(channel.id, i, true);
                        }}
                        onPointerEnter={() => {
                          setHover({ id: channel.id, cells: i });
                          if (dragging === channel.id) paint(channel.id, i, false);
                        }}
                        className="h-8 w-[13px] cursor-pointer rounded-[2px] transition-all duration-200"
                        style={{
                          background: on
                            ? color
                            : ghost
                              ? `color-mix(in srgb, ${color} 32%, transparent)`
                              : "rgba(255,255,255,0.08)",
                          boxShadow: on ? `0 0 10px -1px ${color}` : "none",
                          transform: on ? "scaleY(1)" : "scaleY(0.7)",
                        }}
                      />
                    );
                  })}
                </div>

                <div className="w-[5.5rem] text-right">
                  <p
                    className="num text-[15px] font-semibold"
                    style={{ color: value > 0 ? color : "var(--faint)" }}
                  >
                    ₹{value} L
                  </p>
                  <p className="eyebrow mt-1 text-faint">{share}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────── priority: stack the slabs ──────────────────── */

export function SlabStackPicker({
  items,
  pick,
  order,
  onChange,
}: {
  items: PriorityItem[];
  pick: number;
  order: string[];
  onChange: (next: string[]) => void;
}) {
  const stacked = order
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is PriorityItem => !!i);
  const pool = items.filter((i) => !order.includes(i.id));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="eyebrow text-faint">
          The stack — {order.length}/{pick} seated
        </p>
        <div
          className="mt-3 space-y-1.5 rounded-xl border border-dashed p-3"
          style={{
            borderColor:
              order.length === pick
                ? "color-mix(in srgb, var(--emerald) 40%, transparent)"
                : "rgba(255,255,255,0.12)",
            background:
              order.length === pick
                ? "color-mix(in srgb, var(--emerald) 6%, transparent)"
                : "rgba(255,255,255,0.015)",
          }}
        >
          <AnimatePresence initial={false}>
            {stacked.map((item, rank) => (
              <motion.button
                key={item.id}
                type="button"
                layout
                onClick={() => onChange(order.filter((x) => x !== item.id))}
                initial={{ opacity: 0, y: 14, scaleX: 0.9 }}
                animate={{ opacity: 1, y: 0, scaleX: 1 }}
                exit={{ opacity: 0, y: -10, scaleX: 0.92 }}
                transition={{ duration: 0.28, ease: easeOut }}
                className="relative flex w-full origin-left items-center gap-3 overflow-hidden rounded-r-md rounded-l-[3px] px-4 py-3 text-left"
                style={{
                  width: `${100 - rank * 7}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--rose) ${28 - rank * 7}%, transparent), rgba(255,255,255,0.02))`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ background: "var(--grad-warm)" }}
                />
                <span className="num text-[15px] font-semibold text-ink">
                  {rank + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink">
                    {item.label}
                  </span>
                </span>
                <span className="eyebrow text-faint">release</span>
              </motion.button>
            ))}
          </AnimatePresence>
          {stacked.length === 0 && (
            <p className="px-2 py-5 text-center text-[12.5px] text-faint">
              Seat {pick} slabs. Top of the stack defines the quarter.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="eyebrow text-faint">Unranked</p>
        <div className="mt-3 space-y-1.5">
          <AnimatePresence initial={false}>
            {pool.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25, ease: easeOut }}
              >
                <Slab
                  accent="amber"
                  disabled={order.length >= pick}
                  onClick={() => {
                    if (order.length >= pick) return;
                    onChange([...order, item.id]);
                  }}
                >
                  <span className="block px-4 py-3">
                    <span className="block text-[14px] font-medium text-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-dim">
                      {item.hint}
                    </span>
                  </span>
                </Slab>
              </motion.div>
            ))}
          </AnimatePresence>
          {pool.length === 0 && (
            <p className="px-2 py-5 text-center text-[12.5px] text-faint">
              Everything is ranked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── conviction: a slab ladder ───────────────────── */

export function SlabLadder({
  value,
  low,
  high,
  onChange,
}: {
  value: number;
  low: string;
  high: string;
  onChange: (v: number) => void;
}) {
  const rungs = 10;
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? Math.round(value / 10);

  const phrase =
    shown === 0
      ? "Not stated"
      : shown <= 3
        ? low
        : shown >= 8
          ? high
          : "Somewhere in between";

  return (
    <div className="flex flex-wrap items-end gap-8">
      <div
        className="flex flex-col-reverse gap-[3px]"
        onPointerLeave={() => setHover(null)}
      >
        {Array.from({ length: rungs }).map((_, i) => {
          const on = i < shown;
          const committed = i < Math.round(value / 10);
          return (
            <button
              key={i}
              type="button"
              aria-label={`Set conviction to ${(i + 1) * 10}%`}
              onPointerEnter={() => setHover(i + 1)}
              onClick={() => onChange((i + 1) * 10)}
              className="h-[13px] rounded-[2px] transition-all duration-200"
              style={{
                width: `${88 + i * 7}px`,
                background: on
                  ? `linear-gradient(90deg, var(--amber), var(--violet) ${100 - i * 6}%)`
                  : "rgba(255,255,255,0.08)",
                opacity: on ? (committed ? 1 : 0.55) : 1,
                boxShadow: committed
                  ? "0 0 14px -4px rgba(124,92,255,0.9)"
                  : "none",
              }}
            />
          );
        })}
      </div>

      <div className="min-w-[12rem] flex-1">
        <p className="display text-grad text-[44px] leading-none">
          {shown * 10}
          <span className="text-[18px]">%</span>
        </p>
        <p className="mt-3 text-[14px] text-ink">{phrase}</p>
        <div className="mt-4 flex items-center justify-between text-[12px] text-faint">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      </div>
    </div>
  );
}
