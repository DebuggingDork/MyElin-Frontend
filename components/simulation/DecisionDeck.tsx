"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import { isBlockAnswered } from "@/lib/simulation/engine";
import { formatMoney } from "@/lib/simulation/format";
import type {
  BlockAnswer,
  DecisionBlock,
  Quarter,
  QuarterAnswers,
} from "@/lib/simulation/types";
import { Typewriter } from "@/components/simulation/Typewriter";
import { Ticker } from "@/components/simulation/Ticker";
import {
  ArcGauge,
  SimButton,
  SimChip,
  SimEyebrow,
  SimPanel,
  type Tone,
} from "@/components/simulation/SimChrome";

const SEVERITY: Record<string, { tone: Tone; label: string }> = {
  critical: { tone: "risk", label: "Critical" },
  high: { tone: "caution", label: "High" },
  medium: { tone: "muted", label: "Medium" },
};

const CHANNEL_COLORS = [
  "var(--brand-teal)",
  "var(--brand-teal-bright)",
  "var(--brand-teal-deep)",
  "var(--brand-teal-muted)",
];

export function DecisionDeck({
  quarter,
  answers,
  onAnswer,
  onCommit,
}: {
  quarter: Quarter;
  answers: QuarterAnswers;
  onAnswer: (blockId: string, answer: BlockAnswer) => void;
  onCommit: () => void;
}) {
  const [step, setStep] = useState(0);
  const block = quarter.blocks[step];

  const answeredCount = quarter.blocks.filter((b) =>
    isBlockAnswered(b, answers[b.id]),
  ).length;
  const allAnswered = answeredCount === quarter.blocks.length;
  const currentAnswered = isBlockAnswered(block, answers[block.id]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-28 pt-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SimChip tone="brand">Decision desk</SimChip>
          <SimChip tone="muted">{quarter.label}</SimChip>
        </div>
        <p className="text-[13px] text-muted">
          <span className="sim-num font-semibold text-brand-ink">
            {answeredCount}
          </span>{" "}
          of {quarter.blocks.length} decisions committed
        </p>
      </div>

      <PhaseRail
        quarter={quarter}
        answers={answers}
        step={step}
        onSelect={setStep}
        className="mt-7"
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: easeOut }}
          >
            <BlockPanel
              block={block}
              answer={answers[block.id]}
              onAnswer={(a) => onAnswer(block.id, a)}
            />
          </motion.div>
        </AnimatePresence>

        <Ledger quarter={quarter} answers={answers} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <SimButton
          variant="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </SimButton>

        {step < quarter.blocks.length - 1 ? (
          <SimButton onClick={() => setStep((s) => s + 1)} disabled={!currentAnswered}>
            Next decision
            <ArrowRight className="h-3.5 w-3.5" />
          </SimButton>
        ) : (
          <SimButton onClick={onCommit} disabled={!allAnswered}>
            {allAnswered ? "Run the quarter" : "Complete every decision"}
            <ArrowRight className="h-3.5 w-3.5" />
          </SimButton>
        )}

        <p className="text-[13px] text-muted">
          Consequences resolve the moment you run the quarter.
        </p>
      </div>
    </div>
  );
}

/** Numbered nodes on a connecting line — the quarter's decision path. */
function PhaseRail({
  quarter,
  answers,
  step,
  onSelect,
  className,
}: {
  quarter: Quarter;
  answers: QuarterAnswers;
  step: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start", className)}>
      {quarter.blocks.map((b, i) => {
        const done = isBlockAnswered(b, answers[b.id]);
        const active = i === step;
        return (
          <div key={b.id} className="flex flex-1 items-start gap-3">
            <button
              type="button"
              onClick={() => onSelect(i)}
              className="group flex flex-1 items-start gap-3 text-left"
            >
              <span
                className={cn(
                  "sim-num mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors",
                  active
                    ? "border-transparent bg-brand-ink text-white"
                    : done
                      ? "border-brand/45 bg-brand/10 text-brand-deep"
                      : "border-border bg-white text-muted group-hover:border-brand/40",
                )}
              >
                {done && !active ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-[14px] font-medium transition-colors",
                    active ? "text-brand-ink" : "text-muted group-hover:text-brand-deep",
                  )}
                >
                  {b.title}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-muted/80">
                  {b.owner}
                </span>
              </span>
            </button>
            {i < quarter.blocks.length - 1 && (
              <span
                className={cn(
                  "mt-4 hidden h-px flex-1 sm:block",
                  done ? "bg-brand/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlockPanel({
  block,
  answer,
  onAnswer,
}: {
  block: DecisionBlock;
  answer: BlockAnswer | undefined;
  onAnswer: (answer: BlockAnswer) => void;
}) {
  const severity = SEVERITY[block.severity];

  return (
    <SimPanel className="p-7 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SimEyebrow tone="muted">{block.owner}</SimEyebrow>
          <h2 className="mt-2.5 text-2xl font-semibold tracking-tight text-brand-ink">
            {block.title}
          </h2>
        </div>
        <SimChip tone={severity.tone}>{severity.label}</SimChip>
      </div>

      <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted">
        <Typewriter text={block.prompt} speed={7} />
      </p>

      <div className="mt-7">
        {block.kind === "select" && (
          <SelectBlock block={block} answer={answer} onAnswer={onAnswer} />
        )}
        {block.kind === "allocate" && (
          <AllocateBlock block={block} answer={answer} onAnswer={onAnswer} />
        )}
        {block.kind === "confidence" && (
          <ConfidenceBlock block={block} answer={answer} onAnswer={onAnswer} />
        )}
      </div>
    </SimPanel>
  );
}

function SelectBlock({
  block,
  answer,
  onAnswer,
}: {
  block: Extract<DecisionBlock, { kind: "select" }>;
  answer: BlockAnswer | undefined;
  onAnswer: (answer: BlockAnswer) => void;
}) {
  const selected = answer?.kind === "select" ? answer.optionId : undefined;

  return (
    <>
      <div className="space-y-3">
        {block.options.map((option, i) => {
          const active = selected === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onAnswer({ kind: "select", optionId: option.id })}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.05 }}
              className={cn(
                "group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border py-4 pl-5 pr-4 text-left transition-all duration-200",
                active
                  ? "border-brand bg-brand/[0.06]"
                  : "border-border bg-white hover:border-brand/40 hover:bg-bg-soft",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-[3px] transition-colors",
                  active ? "bg-brand" : "bg-transparent group-hover:bg-brand/30",
                )}
              />
              <span
                className={cn(
                  "sim-num mt-0.5 text-[12px] font-semibold",
                  active ? "text-brand" : "text-muted",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[16px] font-medium",
                    active ? "text-brand-deep" : "text-brand-ink",
                  )}
                >
                  {option.label}
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">
                  {option.hint}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                  active
                    ? "border-transparent bg-brand text-white"
                    : "border-border text-transparent",
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-5 flex items-center gap-2 text-[12.5px] text-muted">
        <Lock className="h-3.5 w-3.5 text-brand/60" />
        The impact stays hidden until the quarter runs. That is the point.
      </p>
    </>
  );
}

/** Ring chart of how the budget has been committed. */
function AllocationRing({
  channels,
  split,
  budget,
}: {
  channels: Extract<DecisionBlock, { kind: "allocate" }>["channels"];
  split: Record<string, number>;
  budget: number;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const spent = Object.values(split).reduce((a, b) => a + b, 0);

  let offset = 0;
  const segments = channels.map((channel, i) => {
    const amount = split[channel.id] ?? 0;
    const fraction = budget > 0 ? amount / budget : 0;
    const length = c * fraction;
    const segment = {
      id: channel.id,
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      length,
      start: offset,
    };
    offset += length;
    return segment;
  });

  return (
    <div className="relative mx-auto h-[150px] w-[150px] shrink-0">
      <svg viewBox="0 0 128 128" className="sim-dial h-full w-full">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--brand-teal-line)"
          strokeWidth={13}
        />
        {segments.map((segment) => (
          <motion.circle
            key={segment.id}
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={segment.color}
            strokeWidth={13}
            strokeLinecap="butt"
            strokeDasharray={`${segment.length} ${c - segment.length}`}
            animate={{ strokeDashoffset: -segment.start }}
            transition={{ duration: 0.4, ease: easeOut }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Ticker
          value={spent}
          format={formatMoney}
          duration={420}
          className="sim-num text-[22px] font-semibold text-brand-ink"
        />
        <span className="sim-eyebrow mt-1 text-muted">
          of {formatMoney(budget)}
        </span>
      </div>
    </div>
  );
}

function AllocateBlock({
  block,
  answer,
  onAnswer,
}: {
  block: Extract<DecisionBlock, { kind: "allocate" }>;
  answer: BlockAnswer | undefined;
  onAnswer: (answer: BlockAnswer) => void;
}) {
  const split = useMemo<Record<string, number>>(() => {
    if (answer?.kind === "allocate") return answer.split;
    return Object.fromEntries(block.channels.map((c) => [c.id, 0]));
  }, [answer, block.channels]);

  const spent = Object.values(split).reduce((a, b) => a + b, 0);
  const remaining = block.budget - spent;

  const setChannel = (id: string, value: number) => {
    const others = spent - (split[id] ?? 0);
    const capped = Math.max(0, Math.min(value, block.budget - others));
    onAnswer({ kind: "allocate", split: { ...split, [id]: capped } });
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-7 rounded-2xl border border-border bg-bg-soft px-6 py-6 sm:flex-row sm:items-center">
        <AllocationRing
          channels={block.channels}
          split={split}
          budget={block.budget}
        />
        <div className="min-w-0 flex-1">
          <SimEyebrow tone="muted">Uncommitted</SimEyebrow>
          <Ticker
            value={remaining}
            format={formatMoney}
            duration={420}
            className={cn(
              "sim-num mt-1.5 block text-[32px] font-semibold",
              remaining === 0 ? "text-brand" : "text-[var(--sim-caution)]",
            )}
          />
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted">
            Anything you leave uncommitted stays as cash. Spreading evenly is also a
            choice — and it is scored as one.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {block.channels.map((channel, i) => {
          const value = split[channel.id] ?? 0;
          const share = block.budget > 0 ? Math.round((value / block.budget) * 100) : 0;
          return (
            <div
              key={channel.id}
              className={cn(
                "rounded-2xl border px-5 py-4 transition-colors",
                value > 0 ? "border-brand/35 bg-brand/[0.04]" : "border-border bg-white",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                    />
                    <p className="text-[15px] font-medium text-brand-ink">
                      {channel.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {channel.hint}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${channel.label}`}
                    onClick={() => setChannel(channel.id, value - block.step)}
                    disabled={value <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-brand-deep transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="sim-num w-[74px] text-center text-[17px] font-semibold text-brand-ink">
                    {formatMoney(value)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${channel.label}`}
                    onClick={() => setChannel(channel.id, value + block.step)}
                    disabled={remaining < block.step}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-brand-deep transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={block.budget}
                step={block.step}
                value={value}
                onChange={(e) => setChannel(channel.id, Number(e.target.value))}
                aria-label={`${channel.label} allocation`}
                className="sim-range mt-4 w-full"
              />
              <div className="mt-2.5 flex items-center justify-between text-[12px] text-muted">
                <span>
                  diminishing returns above {formatMoney(channel.saturates)}
                </span>
                <span className="sim-num">{share}% of budget</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfidenceBlock({
  block,
  answer,
  onAnswer,
}: {
  block: Extract<DecisionBlock, { kind: "confidence" }>;
  answer: BlockAnswer | undefined;
  onAnswer: (answer: BlockAnswer) => void;
}) {
  const value = answer?.kind === "confidence" ? answer.value : 50;
  const touched = answer?.kind === "confidence";

  const band =
    value >= 80
      ? "Near certain — you will be scored against reality."
      : value >= 60
        ? "Confident, with room for error."
        : value >= 40
          ? "Genuinely unsure. Honest beats brave."
          : "Low conviction. Say so now, not later.";

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
      <ArcGauge
        value={value}
        max={100}
        size={190}
        label="Stated confidence"
        readout={`${value}%`}
        tone={value >= 60 ? "brand" : value >= 40 ? "caution" : "risk"}
        className="shrink-0"
      />

      <div className="w-full min-w-0 flex-1">
        <p className="text-[16px] leading-relaxed text-brand-ink">{band}</p>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) =>
            onAnswer({ kind: "confidence", value: Number(e.target.value) })
          }
          aria-label="Confidence"
          className="sim-range mt-7 w-full"
        />
        <div className="mt-2.5 flex justify-between">
          {[0, 25, 50, 75, 100].map((tick) => (
            <span key={tick} className="sim-num text-[12px] text-muted">
              {tick}
            </span>
          ))}
        </div>

        <p
          className={cn(
            "mt-6 text-[13px]",
            touched ? "text-muted" : "text-[var(--sim-caution)]",
          )}
        >
          {touched
            ? "Calibration is scored on distance from reality — not on courage."
            : "Move the dial to log your calibration."}
        </p>
      </div>
    </div>
  );
}

function Ledger({
  quarter,
  answers,
}: {
  quarter: Quarter;
  answers: QuarterAnswers;
}) {
  const committed = quarter.blocks.filter((b) => isBlockAnswered(b, answers[b.id]));

  return (
    <div className="space-y-4 lg:sticky lg:top-[13.5rem] lg:self-start">
      <SimPanel tone="soft" className="p-6" delay={0.08}>
        <SimEyebrow>Commitment ledger</SimEyebrow>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="sim-num text-[34px] font-semibold leading-none text-brand-ink">
            {committed.length}
          </span>
          <span className="text-[14px] text-muted">
            of {quarter.blocks.length} logged
          </span>
        </div>

        <ul className="mt-6 space-y-4">
          {quarter.blocks.map((b, i) => {
            const answer = answers[b.id];
            const done = isBlockAnswered(b, answer);
            return (
              <li key={b.id} className="relative flex gap-3.5">
                <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      done ? "bg-brand" : "border border-border bg-white",
                    )}
                  />
                  {i < quarter.blocks.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-1/2 top-3.5 h-[calc(100%+0.9rem)] w-px -translate-x-1/2",
                        done ? "bg-brand/35" : "bg-border",
                      )}
                    />
                  )}
                </span>
                <div className="min-w-0 pb-1">
                  <p className="sim-eyebrow text-muted">{b.title}</p>
                  <p
                    className={cn(
                      "mt-1 text-[13.5px]",
                      done ? "font-medium text-brand-ink" : "text-muted/70",
                    )}
                  >
                    {summarise(b, answer)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </SimPanel>

      <SimPanel className="p-6" delay={0.16}>
        <SimEyebrow tone="caution">Sealed variables</SimEyebrow>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
          {quarter.hidden.length} variables are active this quarter and withheld from
          you. They open only after you commit — the same way they arrive in a real
          company.
        </p>
        <div className="mt-4 space-y-2">
          {quarter.hidden.map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-dashed border-border px-3.5 py-2.5"
            >
              <Lock className="h-3.5 w-3.5 text-[var(--sim-caution)]" />
              <span className="sim-num text-[12.5px] text-muted">
                variable {String(i + 1).padStart(2, "0")} · sealed
              </span>
            </div>
          ))}
        </div>
      </SimPanel>
    </div>
  );
}

function summarise(block: DecisionBlock, answer: BlockAnswer | undefined): string {
  if (!answer) return "awaiting decision";
  if (block.kind === "select" && answer.kind === "select") {
    return (
      block.options.find((o) => o.id === answer.optionId)?.label ??
      "awaiting decision"
    );
  }
  if (block.kind === "allocate" && answer.kind === "allocate") {
    const spent = Object.values(answer.split).reduce((a, b) => a + b, 0);
    if (spent === 0) return "awaiting decision";
    const top = block.channels
      .map((c) => ({ label: c.label, amount: answer.split[c.id] ?? 0 }))
      .sort((a, b) => b.amount - a.amount)[0];
    return `${formatMoney(spent)} committed · ${top.label} leads`;
  }
  if (block.kind === "confidence" && answer.kind === "confidence") {
    return `${answer.value}% confidence logged`;
  }
  return "awaiting decision";
}
