"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";

export type Tone = "brand" | "caution" | "risk" | "muted";

export const toneText: Record<Tone, string> = {
  brand: "text-brand",
  caution: "text-[var(--sim-caution)]",
  risk: "text-[var(--sim-risk)]",
  muted: "text-muted",
};

export const toneStroke: Record<Tone, string> = {
  brand: "var(--brand-teal)",
  caution: "var(--sim-caution)",
  risk: "var(--sim-risk)",
  muted: "var(--brand-teal-muted)",
};

export function SimPanel({
  children,
  className,
  delay = 0,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  tone?: "light" | "soft" | "ink";
}) {
  const tones = {
    light: "border-border bg-white",
    soft: "border-border bg-bg-soft",
    ink: "border-transparent bg-brand-ink text-white",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className={cn(
        "relative rounded-[1.5rem] border shadow-[0_1px_2px_rgba(7,96,94,0.04),0_18px_40px_-32px_rgba(7,96,94,0.25)]",
        tones[tone],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function SimEyebrow({
  children,
  className,
  tone = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
}) {
  return (
    <p className={cn("sim-eyebrow", toneText[tone], className)}>{children}</p>
  );
}

export function SimChip({
  children,
  tone = "brand",
  solid = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  solid?: boolean;
  className?: string;
}) {
  const outline: Record<Tone, string> = {
    brand: "border-brand/30 bg-brand/8 text-brand-deep",
    caution: "border-[var(--sim-caution)]/30 bg-[var(--sim-caution)]/8 text-[var(--sim-caution)]",
    risk: "border-[var(--sim-risk)]/30 bg-[var(--sim-risk)]/8 text-[var(--sim-risk)]",
    muted: "border-border bg-bg-soft text-muted",
  };
  const filled: Record<Tone, string> = {
    brand: "border-transparent bg-brand-ink text-white",
    caution: "border-transparent bg-[var(--sim-caution)] text-white",
    risk: "border-transparent bg-[var(--sim-risk)] text-white",
    muted: "border-transparent bg-brand-ink/8 text-brand-deep",
  };
  return (
    <span
      className={cn(
        "sim-eyebrow inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px]",
        solid ? filled[tone] : outline[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SimButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-brand-ink text-white hover:bg-brand-deep disabled:bg-brand-ink/25",
    secondary:
      "border border-border bg-white text-brand-deep hover:border-brand/45 hover:text-brand disabled:opacity-45",
    ghost:
      "text-brand-deep hover:bg-bg-soft disabled:opacity-45",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "sim-eyebrow inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 transition-all duration-200 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Slim progress track used under readings. */
export function SimBar({
  value,
  max = 100,
  tone = "brand",
  className,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    brand: "bg-brand",
    caution: "bg-[var(--sim-caution)]",
    risk: "bg-[var(--sim-risk)]",
    muted: "bg-brand-muted",
  }[tone];
  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-brand-ink/8", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.85, ease: easeOut }}
      />
    </div>
  );
}

/** Half-circle dial — the primary way runway and pressure are shown. */
export function ArcGauge({
  value,
  max,
  label,
  readout,
  tone = "brand",
  size = 168,
  className,
}: {
  value: number;
  max: number;
  label: string;
  readout: string;
  tone?: Tone;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 54;
  const circumference = Math.PI * r;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size * 0.62} viewBox="0 0 140 84" role="img" aria-label={`${label}: ${readout}`}>
        <path
          d={`M 16 70 A ${r} ${r} 0 0 1 124 70`}
          fill="none"
          stroke="var(--brand-teal-line)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <motion.path
          d={`M 16 70 A ${r} ${r} 0 0 1 124 70`}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: easeOut }}
        />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const angle = Math.PI * (1 - t);
          const x = 70 + Math.cos(angle) * (r + 12);
          const y = 70 - Math.sin(angle) * (r + 12);
          return <circle key={t} cx={x} cy={y} r={1.4} fill="var(--brand-teal-line)" />;
        })}
      </svg>
      <p className={cn("sim-num -mt-4 text-[28px] font-semibold", toneText[tone])}>
        {readout}
      </p>
      <p className="sim-eyebrow mt-2 text-muted">{label}</p>
    </div>
  );
}

/** Compact ring used for percentage readings like morale and trust. */
export function RingGauge({
  value,
  label,
  tone = "brand",
  size = 62,
  className,
}: {
  value: number;
  label?: string;
  tone?: Tone;
  size?: number;
  className?: string;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 64 64" width={size} height={size} className="sim-dial">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--brand-teal-line)"
            strokeWidth={5}
          />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={toneStroke[tone]}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1, ease: easeOut }}
          />
        </svg>
        <span
          className={cn(
            "sim-num absolute inset-0 flex items-center justify-center text-[13px] font-semibold",
            toneText[tone],
          )}
        >
          {Math.round(value)}
        </span>
      </div>
      {label && <span className="sim-eyebrow text-muted">{label}</span>}
    </div>
  );
}

/** Bidirectional bar showing movement away from a centre axis. */
export function ShiftBar({
  magnitude,
  positive,
  className,
}: {
  /** 0–1 share of the widest movement in the set. */
  magnitude: number;
  positive: boolean;
  className?: string;
}) {
  const width = `${Math.max(4, Math.min(100, magnitude * 100)) / 2}%`;
  return (
    <div className={cn("relative h-1.5 w-full rounded-full bg-brand-ink/6", className)}>
      <span className="absolute left-1/2 top-[-3px] h-[12px] w-px -translate-x-1/2 bg-border" />
      <motion.div
        className={cn(
          "absolute top-0 h-full rounded-full",
          positive ? "left-1/2 bg-brand" : "right-1/2 bg-[var(--sim-risk)]",
        )}
        initial={{ width: 0 }}
        animate={{ width }}
        transition={{ duration: 0.75, ease: easeOut }}
      />
    </div>
  );
}
