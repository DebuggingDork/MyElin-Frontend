"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";

/** Accent families used across the product. Keyed so data can name a colour. */
export type Accent =
  | "violet"
  | "indigo"
  | "cyan"
  | "teal"
  | "ember"
  | "ember-soft"
  | "emerald"
  | "amber"
  | "orange"
  | "rose"
  | "pink"
  | "danger"
  | "danger-soft"
  | "danger-deep";

export const accentVar: Record<Accent, string> = {
  violet: "var(--violet)",
  indigo: "var(--indigo)",
  cyan: "var(--cyan)",
  teal: "var(--teal)",
  ember: "var(--ember)",
  "ember-soft": "var(--ember-soft)",
  emerald: "var(--emerald)",
  amber: "var(--amber)",
  orange: "var(--orange)",
  rose: "var(--rose)",
  pink: "var(--pink)",
  // Real red, not remapped like --rose was -- see the token's own comment in globals.css.
  danger: "var(--danger)",
  "danger-soft": "var(--danger-soft)",
  "danger-deep": "var(--danger-deep)",
};

export function Container({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        wide ? "max-w-[88rem]" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
  accent = "teal",
}: {
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
}) {
  return (
    <p
      className={cn("eyebrow flex items-center gap-2.5", className)}
      style={{ color: accentVar[accent] }}
    >
      <span
        className="h-px w-6"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentVar[accent]})`,
        }}
      />
      {children}
    </p>
  );
}

export function Panel({
  children,
  className,
  accent,
  glow = false,
  gradientRing = false,
  delay = 0,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
  glow?: boolean;
  gradientRing?: boolean;
  delay?: number;
  animate?: boolean;
}) {
  const inner = (
    <>
      {glow && accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-40 blur-xl"
          style={{
            background: `radial-gradient(60% 60% at 50% 0%, ${accentVar[accent]}, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </>
  );

  const classes = cn(
    "panel relative overflow-hidden rounded-2xl",
    gradientRing && "ring-grad",
    className,
  );

  if (!animate) {
    return <div className={classes}>{inner}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: easeOut }}
      className={classes}
    >
      {inner}
    </motion.div>
  );
}

export function Pill({
  children,
  accent = "teal",
  solid = false,
  className,
}: {
  children: React.ReactNode;
  accent?: Accent;
  solid?: boolean;
  className?: string;
}) {
  const color = accentVar[accent];
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[6px]",
        className,
      )}
      style={
        solid
          ? { background: color, borderColor: "transparent", color: "#071a16" }
          : {
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
              color,
            }
      }
    >
      {children}
    </span>
  );
}

type ActionProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline";
  size?: "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export function Action({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
}: ActionProps) {
  const base = cn(
    // Named properties, not `all`: `transition-all` here also animated colour and border on
    // every state change, and fought the press feedback below. 160ms is the button-press band.
    // `shrink-0` and `whitespace-nowrap`: as a flex child (the report and complete footers put
    // five of these in one wrapping row) the default `flex-shrink: 1` squeezed the pill narrower
    // than its own label, so the text wrapped inside the rounded shape or spilled past it. A
    // button should wrap to the next line, never compress.
    "sweep group relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
    size === "lg" ? "px-7 py-4 text-[15px]" : "px-5 py-3 text-[13.5px]",
    variant === "primary" &&
      "text-white shadow-[0_10px_40px_-12px_color-mix(in_srgb,var(--teal)_55%,transparent)] hover:shadow-[0_14px_50px_-10px_color-mix(in_srgb,var(--teal)_70%,transparent)]",
    // Base sits on the quieter rule and brightens on hover -- both were line-2 after the token
    // sweep, which left the outline variant with no visible hover change at all.
    variant === "outline" &&
      "border border-line text-ink hover:border-line-2 hover:bg-[var(--panel-2)]",
    variant === "ghost" && "text-dim hover:text-ink",
    className,
  );

  const style =
    variant === "primary" ? { background: "var(--grad-primary)" } : undefined;

  if (href && !disabled) {
    return (
      <Link href={href} className={base} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base}
      style={style}
    >
      {children}
    </button>
  );
}

export function SectionHead({
  kicker,
  title,
  copy,
  action,
  className,
  accent = "teal",
}: {
  /** Optional on purpose. An uppercase tracked label above *every* section is scaffolding,
   *  not hierarchy — the headline already says what the section is. */
  kicker?: string;
  title: React.ReactNode;
  copy?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  accent?: Accent;
}) {
  return (
    <div className={cn("relative z-10", className)}>
      {kicker && <Eyebrow accent={accent}>{kicker}</Eyebrow>}
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-6",
          kicker && "mt-5",
        )}
      >
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="display max-w-3xl text-balance text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.06] text-ink"
        >
          {title}
        </motion.h2>
        {action}
      </div>
      {copy && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.08, ease: easeOut }}
          className="mt-6 max-w-2xl space-y-4 text-[16.5px] leading-[1.72] text-dim"
        >
          {copy}
        </motion.div>
      )}
    </div>
  );
}

/** Thin progress meter used inside panels. */
export function Meter({
  value,
  accent = "teal",
  className,
  height = 4,
}: {
  value: number;
  accent?: Accent;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-[var(--panel-2)]", className)}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${accentVar[accent]}, color-mix(in srgb, ${accentVar[accent]} 40%, var(--teal-bright)))`,
        }}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: easeOut }}
      />
    </div>
  );
}
