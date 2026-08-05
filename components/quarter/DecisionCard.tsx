"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Lock, Minus, Plus } from "lucide-react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import { accentVar, type Accent } from "@/components/ui/Kit";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import {
  formatLakhs,
  isDecisionSet,
  type DecisionDef,
  type DecisionValue,
  type WorkspaceId,
} from "@/lib/quarter/types";

/* ────────────────────────────────────────────────────────────────
   Generic decision card. Renders any catalog entry: the input
   control, the "affects" chip row, pending-formula badges, and
   dependency locks. No business impact is computed here — the only
   client-side math is budget arithmetic for validation display.
   ──────────────────────────────────────────────────────────────── */

export function DecisionCard({
  ws,
  def,
  accent,
}: {
  ws: WorkspaceId;
  def: DecisionDef;
  accent: Accent;
}) {
  const { draft, setDecision } = useQuarter();
  const values = draft.decisions[ws] ?? {};
  const value = values[def.id];
  const set = (v: DecisionValue) => setDecision(ws, def.id, v);

  const locked =
    def.dependsOn?.some((dep) => !isDecisionSet(values[dep])) ?? false;
  const answered = isDecisionSet(value);
  const color = accentVar[accent];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: easeOut }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-raise/50 transition-colors",
        answered
          ? "border-white/[0.14]"
          : "border-line",
      )}
    >
      <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="num text-[10.5px] text-faint">{def.id}</span>
            {def.optional && (
              <span className="eyebrow text-faint">optional</span>
            )}
            {def.pending && (
              <span
                className="eyebrow rounded-full border border-amber/35 bg-amber/10 px-2 py-1 text-amber"
                title={def.pending}
              >
                formula pending
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium text-ink">
            {def.label}
          </h3>
          {def.brief && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
              {def.brief}
            </p>
          )}
        </div>
        {answered && !def.pending && (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${color} 20%, transparent)` }}
          >
            <Check className="h-3 w-3" style={{ color }} />
          </span>
        )}
      </header>

      <div
        className={cn(
          "px-4 py-4 sm:px-5",
          def.pending && "pointer-events-none opacity-45",
        )}
      >
        <Control def={def} value={value} onChange={set} color={color} />
      </div>

      <footer className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] px-4 py-2.5 sm:px-5">
        <span className="eyebrow mr-1 text-faint">affects</span>
        {def.affects.map((a) => (
          <span
            key={a}
            className="rounded-md border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] text-dim"
          >
            {a}
          </span>
        ))}
      </footer>

      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-void/70 backdrop-blur-[2px]">
          <span className="flex items-center gap-2 rounded-full border border-line bg-raise px-4 py-2 text-[12.5px] text-dim">
            <Lock className="h-3.5 w-3.5" />
            Unlocks after {def.dependsOn?.join(" · ")}
          </span>
        </div>
      )}
    </motion.section>
  );
}

/* ── input controls ─────────────────────────────────────────────── */

function Control({
  def,
  value,
  onChange,
  color,
}: {
  def: DecisionDef;
  value: DecisionValue | undefined;
  onChange: (v: DecisionValue) => void;
  color: string;
}) {
  switch (def.input) {
    case "allocation":
      return <Allocation def={def} value={value} onChange={onChange} />;
    case "spend":
    case "percent":
      return <Spend def={def} value={value} onChange={onChange} color={color} />;
    case "dropdown":
      return <Radios def={def} value={value} onChange={onChange} color={color} />;
    case "multiselect":
      return <Multi def={def} value={value} onChange={onChange} color={color} />;
    case "toggle":
      return <Toggle def={def} value={value} onChange={onChange} color={color} />;
    case "choice-cards":
      return <Cards def={def} value={value} onChange={onChange} color={color} />;
    case "rank":
      return <Rank def={def} value={value} onChange={onChange} color={color} />;
  }
}

type ControlProps = {
  def: DecisionDef;
  value: DecisionValue | undefined;
  onChange: (v: DecisionValue) => void;
  color: string;
};

/** FIN-001 style: distribute a lakh total across buckets. */
function Allocation({
  def,
  value,
  onChange,
}: Omit<ControlProps, "color">) {
  const total = def.allocationTotal ?? 100;
  const step = 2;
  const split: Record<string, number> =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, number>)
      : {};
  const used = Object.values(split).reduce((a, b) => a + b, 0);
  const remaining = total - used;

  const bump = (id: string, dir: 1 | -1) => {
    const current = split[id] ?? 0;
    const next = Math.max(0, current + dir * step);
    if (dir === 1 && remaining < step) return;
    onChange({ ...split, [id]: next });
  };

  return (
    <div>
      <div className="space-y-2.5">
        {def.buckets?.map((bucket) => {
          const amount = split[bucket.id] ?? 0;
          const pct = (amount / total) * 100;
          const bucketColor = accentVar[bucket.accent];
          return (
            <div key={bucket.id} className="flex items-center gap-3">
              <span className="w-[132px] shrink-0 truncate text-[13px] text-dim">
                {bucket.label}
              </span>
              <div className="relative h-[10px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  style={{ background: bucketColor }}
                />
              </div>
              <span className="num w-[52px] shrink-0 text-right text-[12.5px] text-ink">
                {formatLakhs(amount)}
              </span>
              <span className="flex shrink-0 gap-1">
                <Stepper onClick={() => bump(bucket.id, -1)} disabled={amount === 0}>
                  <Minus className="h-3 w-3" />
                </Stepper>
                <Stepper
                  onClick={() => bump(bucket.id, 1)}
                  disabled={remaining < step}
                >
                  <Plus className="h-3 w-3" />
                </Stepper>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-white/[0.03] px-3.5 py-2.5">
        <span className="eyebrow text-faint">
          {remaining === 0 ? "Fully allocated" : "Unallocated budget"}
        </span>
        <span
          className="num text-[13px] font-semibold"
          style={{ color: remaining === 0 ? "var(--emerald)" : "var(--amber)" }}
        >
          {formatLakhs(remaining)} of {formatLakhs(total)}
        </span>
      </div>
    </div>
  );
}

function Stepper({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim transition-colors hover:border-white/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** Segmented spend strip — click a block to set the level. */
function Spend({ def, value, onChange, color }: ControlProps) {
  const max = def.max ?? 100;
  const step = def.step ?? max / 20;
  const amount = typeof value === "number" ? value : 0;
  const blocks = 20;
  const filled = Math.round((amount / max) * blocks);

  const setFromBlock = (i: number) => {
    const raw = ((i + 1) / blocks) * max;
    const snapped = Math.round(raw / step) * step;
    onChange(Number(snapped.toFixed(2)));
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-[3px]">
          {Array.from({ length: blocks }).map((_, i) => {
            const on = i < filled;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Set to ${(((i + 1) / blocks) * max).toFixed(1)}`}
                onClick={() => setFromBlock(i)}
                className="h-[22px] flex-1 rounded-[3px] transition-all duration-150"
                style={{
                  background: on
                    ? `color-mix(in srgb, ${color} ${55 + (i / blocks) * 45}%, transparent)`
                    : "rgba(255,255,255,0.06)",
                }}
              />
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Stepper
            onClick={() => onChange(Math.max(0, Number((amount - step).toFixed(2))))}
            disabled={amount <= 0}
          >
            <Minus className="h-3 w-3" />
          </Stepper>
          <span className="num w-[58px] text-center text-[14px] font-semibold text-ink">
            {def.unit === "%" ? `${amount}%` : formatLakhs(amount)}
          </span>
          <Stepper
            onClick={() => onChange(Math.min(max, Number((amount + step).toFixed(2))))}
            disabled={amount >= max}
          >
            <Plus className="h-3 w-3" />
          </Stepper>
        </div>
      </div>
      <p className="num mt-2 text-[10.5px] text-faint">
        0 — {def.unit === "%" ? `${max}%` : formatLakhs(max)}
      </p>
    </div>
  );
}

/** Dropdown rendered as a radio pill row (options are always few). */
function Radios({ def, value, onChange, color }: ControlProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {def.options?.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="rounded-full border px-3.5 py-2 text-[12.5px] transition-colors"
            style={{
              borderColor: active
                ? `color-mix(in srgb, ${color} 55%, transparent)`
                : "var(--line)",
              background: active
                ? `color-mix(in srgb, ${color} 14%, transparent)`
                : "rgba(255,255,255,0.02)",
              color: active ? "var(--ink)" : "var(--dim)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Multi({ def, value, onChange, color }: ControlProps) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (id: string) => {
    // "none" is exclusive with everything else.
    if (id === "none") {
      onChange(selected.includes("none") ? [] : ["none"]);
      return;
    }
    const without = selected.filter((s) => s !== id && s !== "none");
    onChange(selected.includes(id) ? without : [...without, id]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {def.options?.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors"
            style={{
              borderColor: active
                ? `color-mix(in srgb, ${color} 55%, transparent)`
                : "var(--line)",
              background: active
                ? `color-mix(in srgb, ${color} 14%, transparent)`
                : "rgba(255,255,255,0.02)",
              color: active ? "var(--ink)" : "var(--dim)",
            }}
          >
            {active && <Check className="h-3 w-3" style={{ color }} />}
            {opt.label}
            {opt.hint && (
              <span className="num text-[10.5px] text-faint">{opt.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ value, onChange, color }: ControlProps) {
  const on = value === true;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3"
    >
      <span
        className="relative h-6 w-11 rounded-full border transition-colors"
        style={{
          borderColor: on ? `color-mix(in srgb, ${color} 55%, transparent)` : "var(--line)",
          background: on
            ? `color-mix(in srgb, ${color} 30%, transparent)`
            : "rgba(255,255,255,0.05)",
        }}
      >
        <motion.span
          className="absolute top-[3px] h-[16px] w-[16px] rounded-full"
          initial={false}
          animate={{ left: on ? 24 : 4 }}
          transition={{ duration: 0.2, ease: easeOut }}
          style={{ background: on ? color : "var(--faint)" }}
        />
      </span>
      <span className="text-[13px] text-dim">
        {on ? "Approved" : "Not approved"}
      </span>
    </button>
  );
}

function Cards({ def, value, onChange, color }: ControlProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {def.options?.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="rounded-lg border px-3.5 py-3 text-left transition-colors"
            style={{
              borderColor: active
                ? `color-mix(in srgb, ${color} 55%, transparent)`
                : "var(--line)",
              background: active
                ? `color-mix(in srgb, ${color} 12%, transparent)`
                : "rgba(255,255,255,0.02)",
            }}
          >
            <span
              className="block text-[13px] font-medium"
              style={{ color: active ? "var(--ink)" : "var(--dim)" }}
            >
              {opt.label}
            </span>
            {opt.hint && (
              <span className="mt-1 block text-[11.5px] text-faint">
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Priority board — reorder with arrows; top ships first. */
function Rank({ def, value, onChange, color }: ControlProps) {
  const options = def.options ?? [];
  const order = Array.isArray(value)
    ? (value as string[])
    : options.map((o) => o.id);
  const touched = Array.isArray(value);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="space-y-1.5">
        {order.map((id, i) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5"
            >
              <span
                className="num w-5 text-[12px] font-semibold"
                style={{ color: i === 0 && touched ? color : "var(--faint)" }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-[13px] text-dim">{opt.label}</span>
              {i === 0 && touched && (
                <span className="eyebrow" style={{ color }}>
                  ships first
                </span>
              )}
              <span className="flex gap-1">
                <Stepper onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Stepper>
                <Stepper onClick={() => move(i, 1)} disabled={i === order.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Stepper>
              </span>
            </div>
          );
        })}
      </div>
      {!touched && (
        <button
          type="button"
          onClick={() => onChange(order)}
          className="mt-3 rounded-full border border-line px-3.5 py-1.5 text-[12px] text-dim transition-colors hover:border-white/25 hover:text-ink"
        >
          Accept this order
        </button>
      )}
    </div>
  );
}
