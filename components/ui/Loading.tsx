"use client";

/**
 * The one loading vocabulary for the whole app.
 *
 * Every asynchronous wait -- signing in, resolving a run, closing a quarter -- draws from
 * these four primitives so a wait never looks like it belongs to a different product.
 *
 * `LogoGlow` is the full-page and overlay spinner: the Myelin glyph with a teal pulse glow.
 * `Spinner` is a quiet hairline arc used inline and on buttons.
 * The keyframes live in `globals.css` next to the rest of the motion.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

const RING_SIZE = { sm: 14, md: 18, lg: 26 } as const;

/**
 * A hairline arc ring — used inline and inside buttons where the glyph would be too heavy.
 */
export function Spinner({
  size = "md",
  className,
  label,
}: {
  size?: keyof typeof RING_SIZE;
  className?: string;
  label?: string;
}) {
  const px = RING_SIZE[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("myelin-spin shrink-0", className)}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" opacity="0.18" />
      <path
        d="M21.5 12A9.5 9.5 0 0 0 12 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The Myelin glyph with a pulsing teal glow — used wherever a wait owns its own space
 * (page loads, overlays, processing panels). More on-brand than a spinning ring.
 */
export function LogoGlow({
  size = "md",
  className,
  label,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const px = size === "sm" ? 28 : size === "md" ? 40 : 56;
  return (
    <span
      role={label ? "status" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("myelin-logo-glow inline-flex items-center justify-center shrink-0", className)}
    >
      <Image
        src="/brand/myelin-glyph.png"
        alt=""
        width={685}
        height={340}
        aria-hidden
        className="h-auto w-auto object-contain"
        style={{ width: px, height: "auto" }}
      />
    </span>
  );
}

/** Three dots, staggered. The quietest indicator here -- use it beside text. */
export function Dots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-hidden>
      <span className="myelin-dot h-1 w-1 rounded-full bg-current" />
      <span className="myelin-dot h-1 w-1 rounded-full bg-current" />
      <span className="myelin-dot h-1 w-1 rounded-full bg-current" />
    </span>
  );
}

/**
 * A 2px indeterminate rail. The one indicator that reads as "a process is running" rather than
 * "a request is open", so it is reserved for the multi-step waits: closing a quarter, opening
 * the next one.
 */
export function ProgressRail({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative h-[2px] w-full overflow-hidden rounded-full bg-current/10", className)}
      role="presentation"
      aria-hidden
    >
      <span className="myelin-rail absolute inset-y-0 left-0 w-1/3 rounded-full bg-current" />
    </div>
  );
}

/**
 * A wait that happens inside a section: a list still loading, a panel still computing. Sits on
 * whatever surface it is dropped onto and takes its ink from the parent.
 */
export function InlineLoading({
  label,
  sub,
  className,
}: {
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-dim", className)} role="status" aria-live="polite">
      <Spinner size="sm" />
      <span className="min-w-0 text-[13px]">
        <span className="text-ink">{label}</span>
        {sub && <span className="ml-2 text-faint">{sub}</span>}
      </span>
    </div>
  );
}

/**
 * A wait that owns the viewport: a route that cannot render anything useful yet. Deliberately
 * the same shape everywhere, so moving between a run, the catalogue and the auth screens never
 * flashes three different loading treatments.
 */
export function PageLoading({
  label,
  sub,
  className,
}: {
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LogoGlow size="lg" label={label} />
      <div className="space-y-1.5">
        <p className="text-[14.5px] text-ink">{label}</p>
        {sub && <p className="text-[12.5px] text-faint">{sub}</p>}
      </div>
      <ProgressRail className="max-w-[13rem] text-teal" />
    </div>
  );
}

/**
 * The named, multi-step wait -- "Processing quarter 2" -- with an error state that keeps the
 * same frame rather than swapping in a different component. Keeping one frame matters: the
 * reader is watching this box, and a failure should change what it says, not where it is.
 */
export function ProcessingPanel({
  title,
  message,
  error,
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title: string;
  message: string;
  error?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-md border border-line bg-raise px-6 py-7 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {error ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-tone-bad">
            Processing failed
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink">{title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-dim">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 border border-line-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:border-teal hover:text-tone-good"
            >
              {retryLabel}
            </button>
          )}
        </>
      ) : (
        <>
          <LogoGlow size="lg" className="mx-auto" />
          <h2 className="mt-4 font-serif text-2xl text-ink">{title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-dim">{message}</p>
          <ProgressRail className="mx-auto mt-5 max-w-[12rem] text-teal" />
        </>
      )}
    </div>
  );
}

/**
 * `ProcessingPanel` over the surface it belongs to, blocking what is underneath.
 *
 * Absolute rather than fixed: the quarter closes inside the simulation's own scroll frame, and
 * a fixed overlay would sit over the app chrome too -- which reads as "the app is stuck"
 * rather than "this quarter is being scored".
 */
export function ProcessingOverlay(props: React.ComponentProps<typeof ProcessingPanel>) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-base/85 px-5 backdrop-blur-sm">
      <ProcessingPanel {...props} />
    </div>
  );
}

/**
 * The spinner a button shows while its own request is open. Sized to the label rather than to
 * the button, so a submit control never changes height when it starts working.
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={cn("opacity-80", className)} />;
}
