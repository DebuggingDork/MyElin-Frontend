"use client";

import { useEffect, useRef, useState } from "react";
import { Courier_Prime, Newsreader } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowRight, Check, Newspaper } from "lucide-react";
import { easeOut } from "@/lib/media";
import type { Scenario } from "@/lib/play/types";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
});

const ACCEPTS = [
  {
    id: "time",
    label: "I have 30 uninterrupted minutes.",
    hint: "Pausing mid-quarter resets the run. Treat it like a meeting.",
  },
  {
    id: "consequence",
    label: "I understand decisions have irreversible consequences.",
    hint: "Cash, morale, and stakeholders move the moment you commit.",
  },
  {
    id: "hidden",
    label: "I accept that hidden variables stay sealed until resolution.",
    hint: "You will not see every variable while you decide. That is the point.",
  },
  {
    id: "report",
    label: "I want a Decision Intelligence Report at the end.",
    hint: "Your score is a composite across seven cognitive dimensions.",
  },
];

/** Turns the scenario's own data into front-page copy -- no scenario-specific strings, so a
 *  second scenario reads correctly without touching this file. */
function frontPage(scenario: Scenario) {
  const byKey = Object.fromEntries(scenario.metrics.map((m) => [m.key, m.value]));
  const ledgerBits = [
    byKey.cash && `${byKey.cash} still in the bank`,
    byKey.customers && `${byKey.customers} customers who expect the product to keep working`,
    byKey.burn && `a burn rate of ${byKey.burn} a month`,
  ].filter((x): x is string => Boolean(x));
  const ledger =
    ledgerBits.length > 1
      ? `${ledgerBits.slice(0, -1).join(", ")}, and ${ledgerBits.at(-1)}`
      : (ledgerBits[0] ?? "a ledger the board has already seen");

  return {
    kicker: `${scenario.company.sector} · ${scenario.quarterLabel} dispatch`,
    headline: `${scenario.company.name} opens its books for ${scenario.quarterLabel}`,
    deck: `${scenario.company.name} is a ${scenario.company.stage}-stage ${scenario.company.sector} company, and its ${scenario.quarterLabel.toLowerCase()} ledger just landed on the incoming CEO's desk. The board is already watching.`,
    lead: `${scenario.company.name} built its name on ${scenario.company.sector}. Today the numbers come due: ${ledger}. What happens next is not a drill -- every rupee committed this quarter becomes part of the permanent record, read back at the next board meeting whether it worked or not.`,
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Hand-rolled, interruptible typewriter -- rAF-paced with a little per-character jitter so it
 *  reads like a hand at a keyboard, not a metronome. Click/tap skips straight to the full line,
 *  and reduced-motion users get the finished paragraph on first paint. */
function Typewriter({ text, className }: { text: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(() => (reduced ? text.length : 0));
  const skippedRef = useRef(false);

  useEffect(() => {
    if (reduced) return;
    skippedRef.current = false;
    let raf = 0;
    let i = 0;
    let last = performance.now();
    let acc = 0;
    let stepMs = 14 + Math.random() * 16;

    function tick(now: number) {
      if (skippedRef.current) return;
      acc += now - last;
      last = now;
      let changed = false;
      while (acc >= stepMs && i < text.length) {
        i++;
        acc -= stepMs;
        stepMs = 14 + Math.random() * 16;
        changed = true;
      }
      if (changed) setCount(i);
      if (i < text.length) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced]);

  return (
    <p
      className={`cursor-pointer ${className ?? ""}`}
      title="Click to skip ahead"
      onClick={() => {
        skippedRef.current = true;
        setCount(text.length);
      }}
    >
      {text.slice(0, count)}
      {count < text.length && <span className="newsprint-caret" aria-hidden />}
    </p>
  );
}

export function EntryGate({
  scenario,
  onEnter,
}: {
  scenario: Scenario;
  onEnter: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(0);
  const copy = frontPage(scenario);
  const today = useDateline();

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ready = ACCEPTS.every((item) => checked[item.id]);
  const sweep = (seconds % 60) / 60;
  const circumference = 2 * Math.PI * 54;

  return (
    <div
      className={`newsprint relative min-h-screen ${newsreader.variable} ${typewriter.variable}`}
      style={{ fontFamily: "var(--font-newsreader)" }}
    >
      <div className="newsprint-texture absolute inset-0" aria-hidden />
      <div className="newsprint-fold hidden lg:block" aria-hidden />

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ── masthead ─────────────────────────────────────────── */}
        <div
          className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
        >
          <span>{today}</span>
          <span>{scenario.quarterLabel} edition</span>
          <span>Price: your undivided attention</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6">
          <Newspaper className="h-7 w-7 shrink-0" style={{ color: "var(--press)" }} />
          <h2
            className="text-center text-[clamp(1.9rem,6vw,3.4rem)] font-semibold leading-none"
            style={{ letterSpacing: "-0.01em" }}
          >
            The Boardroom Ledger
          </h2>
        </div>
        <p
          className="mt-2 text-center text-[12.5px] italic"
          style={{ color: "var(--ink-soft)" }}
        >
          Business news for the desk you&apos;re about to take.
        </p>

        <div className="mt-5 space-y-1">
          <div className="border-t-[3px]" style={{ borderColor: "var(--ink)" }} />
          <div className="border-t" style={{ borderColor: "var(--ink)" }} />
        </div>

        {/* ── front page ───────────────────────────────────────── */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.65fr_1fr] lg:gap-12">
          <main>
            <p
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ color: "var(--press)", fontFamily: "var(--font-typewriter)" }}
            >
              {copy.kicker}
            </p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-3 text-[clamp(1.75rem,4.4vw,3rem)] font-semibold capitalize leading-[1.06] [text-wrap:balance]"
            >
              {copy.headline}
            </motion.h1>

            <p
              className="mt-4 text-[16px] italic leading-relaxed [text-wrap:pretty]"
              style={{ color: "var(--ink-soft)" }}
            >
              {copy.deck}
            </p>

            <div
              className="mt-5 flex items-center gap-3 border-y py-2 text-[11px] uppercase tracking-[0.14em]"
              style={{ borderColor: "var(--rule)", color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
            >
              <span>Business desk</span>
              <span aria-hidden>·</span>
              <span>{scenario.minutes}-minute edition</span>
              <span aria-hidden>·</span>
              <span>{scenario.departments.length} workspaces</span>
            </div>

            <Typewriter
              text={copy.lead}
              className="newsprint-lead mt-6 max-w-[62ch] text-[17px] leading-[1.75]"
            />

            <p className="mt-6 text-[11px]" style={{ color: "var(--ink-soft)" }}>
              Tap the paragraph above to skip ahead.
            </p>
          </main>

          <aside className="space-y-6">
            <AtAGlance scenario={scenario} />

            <div
              className="rounded-sm border-[1.5px] p-5"
              style={{ borderColor: "var(--ink)", background: "var(--paper-deep)" }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{ color: "var(--press)", fontFamily: "var(--font-typewriter)" }}
              >
                Notice to the incoming CEO
              </p>
              <div className="mt-4 space-y-3">
                {ACCEPTS.map((item, i) => {
                  const on = !!checked[item.id];
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: easeOut }}
                      onClick={() =>
                        setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="flex w-full items-start gap-3 border-b border-dashed py-2.5 text-left last:border-b-0"
                      style={{ borderColor: "var(--rule)" }}
                    >
                      <span
                        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border-[1.5px]"
                        style={{
                          borderColor: "var(--ink)",
                          background: on ? "var(--ink)" : "transparent",
                        }}
                      >
                        {on && <Check className="h-3 w-3" style={{ color: "var(--paper)" }} />}
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-medium leading-snug">
                          {item.label}
                        </span>
                        <span
                          className="mt-0.5 block text-[11.5px] leading-snug"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {item.hint}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                className="newsprint-stamp relative shrink-0"
                initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                transition={{ duration: 0.55, ease: easeOut }}
              >
                <svg width="84" height="84" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="var(--rule)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="var(--press)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="dial"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - sweep)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[22px] font-semibold leading-none">{scenario.minutes}</p>
                  <p
                    className="mt-0.5 text-[8px] uppercase tracking-[0.12em]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    minutes
                  </p>
                </div>
              </motion.div>
              <p className="text-[12px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                One sitting. No pause. The quarter runs the moment you enter the workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={onEnter}
              disabled={!ready}
              className="group flex w-full items-center justify-center gap-2 border-[2px] px-6 py-4 text-[13.5px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: "var(--ink)",
                background: ready ? "var(--ink)" : "transparent",
                color: ready ? "var(--paper)" : "var(--ink)",
                transitionProperty: "background-color, color, transform",
              }}
            >
              Enter the workspace
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </button>
            <p className="-mt-3 text-center text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
              {ready
                ? "All four notices signed. The presses are ready."
                : "Sign all four notices before the presses can run."}
            </p>
          </aside>
        </div>

        <div className="mt-12 border-t pt-4" style={{ borderColor: "var(--rule)" }}>
          <p
            className="text-center text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-soft)", fontFamily: "var(--font-typewriter)" }}
          >
            No refunds. No do-overs. — The Editors
          </p>
        </div>
      </div>
    </div>
  );
}

function AtAGlance({ scenario }: { scenario: Scenario }) {
  return (
    <div
      className="rounded-sm border-[1.5px] p-5"
      style={{ borderColor: "var(--ink)" }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.16em]"
        style={{ color: "var(--press)", fontFamily: "var(--font-typewriter)" }}
      >
        {scenario.company.name} at a glance
      </p>
      <div className="mt-4 space-y-2.5">
        {scenario.metrics.map((m) => (
          <div key={m.key} className="flex items-baseline gap-2">
            <span
              className="shrink-0 text-[11px] uppercase tracking-[0.06em]"
              style={{ color: "var(--ink-soft)" }}
            >
              {m.label}
            </span>
            <span
              className="mb-[3px] min-w-0 flex-1 border-b border-dotted"
              style={{ borderColor: "var(--rule)" }}
              aria-hidden
            />
            <span className="shrink-0 text-[14.5px] font-semibold">{m.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        {scenario.company.stage} · {scenario.company.sector}
      </p>
    </div>
  );
}

/** Client-only formatted date -- rendered after mount so it can't mismatch server/client output. */
function useDateline(): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    // Deferred a tick (not set synchronously in the effect body) -- `Date` runs fine on the
    // server too, but the server and a visitor's browser can disagree on today's date near
    // midnight, so this is rendered client-only to avoid a hydration mismatch.
    queueMicrotask(() => {
      setLabel(
        new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    });
  }, []);
  return label;
}
