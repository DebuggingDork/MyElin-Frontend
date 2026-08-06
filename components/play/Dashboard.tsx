"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  Factory,
  Heart,
  Lock,
  Megaphone,
  Play,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/media";
import { Logo } from "@/components/brand/Logo";
import { accentVar } from "@/components/ui/Kit";
import {
  ChoiceSlabs,
  DecisionSlab,
  SlabAllocator,
  SlabLadder,
  SlabStackPicker,
} from "@/components/play/Slabs";
import { AxisColumns, LiveRead } from "@/components/play/LiveRead";
import { ReadGrid } from "@/components/play/Readouts";
import { readCompany, readDepartment } from "@/lib/play/insights";
import { resolveRow } from "@/lib/play/readouts";
import {
  allocationProgress,
  departmentProgress,
  isAnswered,
  type Answer,
  type Answers,
  type Decision,
  type Department,
  type Scenario,
  type Shape,
} from "@/lib/play/types";

const ICONS = {
  wallet: Wallet,
  boxes: Boxes,
  megaphone: Megaphone,
  trending: TrendingUp,
  factory: Factory,
  users: Users,
  heart: Heart,
};

export function Dashboard({ scenario }: { scenario: Scenario }) {
  const [departmentId, setDepartmentId] = useState(scenario.departments[0].id);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [view, setView] = useState<"command" | "workspace">("command");
  const [locked, setLocked] = useState(false);

  const department =
    scenario.departments.find((d) => d.id === departmentId) ??
    scenario.departments[0];

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const d of scenario.departments) {
      const p = departmentProgress(d, answers);
      done += p.done;
      total += p.total;
    }
    return { done, total };
  }, [scenario.departments, answers]);

  const companyShape = useMemo(
    () => readCompany(scenario.departments, answers),
    [scenario.departments, answers],
  );

  const read = useMemo(
    () => readDepartment(department, answers),
    [department, answers],
  );

  const sealedCount = scenario.departments.filter(
    (d) => departmentProgress(d, answers).pct === 100,
  ).length;
  const nextUp = scenario.departments.find(
    (d) => departmentProgress(d, answers).pct < 100,
  );
  const ready = sealedCount === scenario.departments.length;

  const setAnswer = (id: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  };

  const openDepartment = (id: string) => {
    setDepartmentId(id);
    setSectionIndex(0);
    setView("workspace");
  };

  const runQuarter = () => {
    if (ready) {
      setLocked(true);
      setView("command");
    } else if (nextUp) {
      openDepartment(nextUp.id);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-void text-ink">
      <aside className="hidden h-full w-[268px] shrink-0 flex-col border-r border-line bg-base lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
          <p className="eyebrow mt-5 text-faint">
            {scenario.quarterLabel} — {scenario.quarterTheme}
          </p>
          <p className="mt-2 text-[13px] text-dim">
            {totals.done} of {totals.total} decisions committed
          </p>
          <div className="mt-3 flex gap-[2px]">
            {Array.from({ length: totals.total }).map((_, i) => (
              <motion.span
                key={i}
                className="h-[5px] flex-1 rounded-[1px]"
                initial={false}
                animate={{ opacity: i < totals.done ? 1 : 0.16 }}
                transition={{ duration: 0.3, ease: easeOut }}
                style={{
                  background:
                    i < totals.done
                      ? "var(--grad-primary)"
                      : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <button
            type="button"
            onClick={() => setView("command")}
            className={cn(
              "mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors",
              view === "command"
                ? "bg-white/[0.06] text-ink"
                : "text-dim hover:bg-white/[0.04] hover:text-ink",
            )}
          >
            Command view
          </button>
          <p className="eyebrow mb-2 mt-4 px-3 text-faint">Workspaces</p>
          {scenario.departments.map((dept) => {
            const progress = departmentProgress(dept, answers);
            const Icon = ICONS[dept.icon];
            const active = view === "workspace" && departmentId === dept.id;
            const complete = progress.pct === 100;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => openDepartment(dept.id)}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-white/[0.06] text-ink"
                    : "text-dim hover:bg-white/[0.04] hover:text-ink",
                )}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `color-mix(in srgb, ${accentVar[dept.accent]} 40%, transparent)`,
                    background: `color-mix(in srgb, ${accentVar[dept.accent]} 12%, transparent)`,
                    color: accentVar[dept.accent],
                  }}
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">
                    {dept.name}
                  </span>
                  <span className="mt-1 flex gap-[2px]">
                    {Array.from({ length: progress.total }).map((_, i) => (
                      <span
                        key={i}
                        className="h-[3px] w-3 rounded-[1px]"
                        style={{
                          background:
                            i < progress.done
                              ? accentVar[dept.accent]
                              : "rgba(255,255,255,0.16)",
                        }}
                      />
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 text-[13px] text-dim transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit simulation
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          scenario={scenario}
          shape={companyShape}
          title={
            view === "command"
              ? `${scenario.company.name} — command view`
              : `${department.name} · ${department.owner}`
          }
          active={totals.done > 0}
          locked={locked}
          ready={ready}
          onRun={runQuarter}
        />

        <div className="flex gap-2 overflow-x-auto border-b border-line bg-base/60 px-5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setView("command")}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] transition-colors",
              view === "command"
                ? "border-transparent bg-white/10 text-ink"
                : "border-line text-dim",
            )}
          >
            Command
          </button>
          {scenario.departments.map((dept, i) => {
            const done = departmentProgress(dept, answers);
            const active = view === "workspace" && dept.id === department.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => openDepartment(dept.id)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] transition-colors",
                  active
                    ? "border-transparent bg-white/10 text-ink"
                    : "border-line text-dim",
                )}
              >
                <span className="num mr-1.5 text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {dept.name}
                <span
                  className="num ml-1.5 text-[11px]"
                  style={{
                    color:
                      done.done === done.total
                        ? accentVar[dept.accent]
                        : "var(--faint)",
                  }}
                >
                  {done.done}/{done.total}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto scroll-pt-8">
          <AnimatePresence mode="wait">
            {view === "command" ? (
              <motion.div
                key="command"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: easeOut }}
              >
                <CommandView
                  scenario={scenario}
                  answers={answers}
                  shape={companyShape}
                  active={totals.done > 0}
                  locked={locked}
                  ready={ready}
                  nextUp={nextUp}
                  sealedCount={sealedCount}
                  onOpen={openDepartment}
                  onRun={runQuarter}
                />
              </motion.div>
            ) : (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: easeOut }}
              >
                <Workspace
                  department={department}
                  answers={answers}
                  shape={read.shape}
                  insights={read.insights}
                  tensions={read.tensions}
                  sectionIndex={sectionIndex}
                  onSection={setSectionIndex}
                  onAnswer={setAnswer}
                  onCommand={() => setView("command")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── top bar ────────────────────────────── */

function TopBar({
  scenario,
  shape,
  title,
  active,
  locked,
  ready,
  onRun,
}: {
  scenario: Scenario;
  shape: Shape;
  title: string;
  active: boolean;
  locked: boolean;
  ready: boolean;
  onRun: () => void;
}) {
  const headline = scenario.panels[0]?.rows.slice(0, 3) ?? [];

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-4 border-b border-line bg-void/85 px-5 backdrop-blur-xl sm:px-8">
      <div className="min-w-0">
        <p className="eyebrow text-faint">{scenario.name}</p>
        <p className="mt-1 truncate text-[15px] font-medium text-ink">{title}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-stretch divide-x divide-line overflow-hidden rounded-xl border border-line lg:flex">
          {headline.map((row) => {
            const r = resolveRow(row, shape, active);
            const moved = r.live && Math.abs(r.drift) > 0.04;
            return (
              <span key={row.label} className="px-4 py-2">
                <span className="eyebrow block text-faint">{r.label}</span>
                <motion.span
                  key={r.value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="num mt-1 block text-[13.5px] font-semibold tabular-nums"
                  style={{
                    color: moved
                      ? r.good
                        ? "var(--emerald)"
                        : "var(--rose)"
                      : "var(--ink)",
                  }}
                >
                  {r.value}
                </motion.span>
              </span>
            );
          })}
        </div>

        <span className="num hidden rounded-lg border border-line px-3 py-2 text-[12px] text-dim sm:block">
          {scenario.quarterLabel.replace("Quarter ", "Q")}
        </span>

        <button
          type="button"
          onClick={onRun}
          disabled={locked}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-all",
            locked && "cursor-default border border-line text-emerald",
            !locked && ready && "text-white",
            !locked && !ready && "border border-line-2 text-dim hover:text-ink",
          )}
          style={
            !locked && ready
              ? {
                  background: "var(--grad-primary)",
                  boxShadow: "0 10px 34px -14px rgba(124,92,255,0.9)",
                }
              : undefined
          }
        >
          {locked ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              Sealed
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Run quarter
            </>
          )}
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────── command view ─────────────────────────── */

function CommandView({
  scenario,
  answers,
  shape,
  active,
  locked,
  ready,
  nextUp,
  sealedCount,
  onOpen,
  onRun,
}: {
  scenario: Scenario;
  answers: Answers;
  shape: Shape;
  active: boolean;
  locked: boolean;
  ready: boolean;
  nextUp?: Department;
  sealedCount: number;
  onOpen: (id: string) => void;
  onRun: () => void;
}) {
  return (
    <div className="px-5 py-6 sm:px-7">
      <Banner
        eyebrow={`${scenario.company.stage} · ${scenario.company.sector}`}
        title={scenario.company.name}
        copy={`${scenario.quarterLabel} opens with these numbers. Every desk you commit moves them before the quarter resolves.`}
        icon="wallet"
        accent="indigo"
        right={
          <div className="flex items-center gap-5">
            <span className="text-right">
              <span className="eyebrow block text-faint">Desks sealed</span>
              <span className="num mt-1 block text-[17px] text-ink">
                {sealedCount}/{scenario.departments.length}
              </span>
            </span>
            <span className="text-right">
              <span className="eyebrow block text-faint">Status</span>
              <span
                className="num mt-1 block text-[13px]"
                style={{
                  color: locked
                    ? "var(--emerald)"
                    : ready
                      ? "var(--amber)"
                      : "var(--dim)",
                }}
              >
                {locked ? "Sealed" : ready ? "Ready to run" : "Planning"}
              </span>
            </span>
          </div>
        }
      />

      <div className="mt-4">
        <ReadGrid
          panels={scenario.panels}
          shape={shape}
          accent="indigo"
          answers={answers}
          active={active}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-xl border border-line bg-raise/45">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="eyebrow text-cyan">Desk register</span>
            <span className="num text-[11px] text-faint">
              owner · budget · commit
            </span>
          </div>

          <div className="divide-y divide-white/[0.045]">
            {scenario.departments.map((dept, i) => {
              const progress = departmentProgress(dept, answers);
              const alloc = allocationProgress(dept, answers);
              const Icon = ICONS[dept.icon];
              const color = accentVar[dept.accent];
              const complete = progress.pct === 100;
              const isNext = nextUp?.id === dept.id;

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => onOpen(dept.id)}
                  className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="num w-6 shrink-0 text-[11px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                      background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      color,
                    }}
                  >
                    {complete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">
                      {dept.name}
                    </span>
                    <span className="eyebrow mt-0.5 block truncate text-faint">
                      {dept.owner} · {dept.role}
                    </span>
                  </span>

                  <span className="hidden w-[92px] shrink-0 text-right sm:block">
                    <span className="num block text-[12.5px]" style={{ color }}>
                      ₹{dept.budget} L
                    </span>
                    <span className="eyebrow mt-0.5 block text-faint">
                      {alloc.total ? `${alloc.pct}% placed` : "no pool"}
                    </span>
                  </span>

                  <span className="flex w-[86px] shrink-0 flex-col items-end gap-1.5">
                    <span className="flex gap-[2px]">
                      {Array.from({ length: progress.total }).map((_, j) => (
                        <span
                          key={j}
                          className="h-[12px] w-[4px] rounded-[1px]"
                          style={{
                            background:
                              j < progress.done
                                ? color
                                : "rgba(255,255,255,0.14)",
                            boxShadow:
                              j < progress.done ? `0 0 8px -2px ${color}` : "none",
                          }}
                        />
                      ))}
                    </span>
                    <span className="eyebrow text-faint">
                      {complete
                        ? "sealed"
                        : isNext
                          ? "next up"
                          : `${progress.done}/${progress.total}`}
                    </span>
                  </span>

                  <ArrowRight className="h-4 w-4 shrink-0 text-faint transition-all group-hover:translate-x-1 group-hover:text-ink" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-line bg-raise/45 p-5">
          <AxisColumns shape={shape} />
          <div>
            <p className="eyebrow text-faint">Quarter status</p>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">
              {locked
                ? "Quarter locked. Delayed consequences mature one to six months out."
                : ready
                  ? "Every desk has committed. Run the quarter when you are ready."
                  : nextUp
                    ? `${nextUp.name} is still open. Company posture stays partly formed until it commits.`
                    : "Open a desk to start shaping the posture."}
            </p>
          </div>
          {locked ? (
            <div
              className="relative overflow-hidden rounded-r-lg rounded-l-[3px] px-4 py-3.5"
              style={{
                background:
                  "linear-gradient(90deg, color-mix(in srgb, var(--emerald) 16%, transparent), rgba(255,255,255,0.02))",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{
                  background: "var(--emerald)",
                  boxShadow: "0 0 14px var(--emerald)",
                }}
              />
              <p className="eyebrow text-emerald">Quarter sealed</p>
              <p className="mt-2 text-[12.5px] text-dim">
                {scenario.departments.reduce(
                  (sum, d) => sum + departmentProgress(d, answers).total,
                  0,
                )}{" "}
                decisions recorded for {scenario.company.name}.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRun}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-white"
              style={{ background: "var(--grad-primary)" }}
            >
              {ready ? "Run the quarter" : `Open ${nextUp?.name ?? "desk"}`}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── workspace ──────────────────────────── */

function Workspace({
  department,
  answers,
  shape,
  insights,
  tensions,
  sectionIndex,
  onSection,
  onAnswer,
  onCommand,
}: {
  department: Department;
  answers: Answers;
  shape: Shape;
  insights: ReturnType<typeof readDepartment>["insights"];
  tensions: ReturnType<typeof readDepartment>["tensions"];
  sectionIndex: number;
  onSection: (i: number) => void;
  onAnswer: (id: string, answer: Answer) => void;
  onCommand: () => void;
}) {
  const [guidance, setGuidance] = useState(false);
  const section = department.sections[sectionIndex];
  const progress = departmentProgress(department, answers);
  const alloc = allocationProgress(department, answers);
  const color = accentVar[department.accent];

  return (
    <div className="grid xl:grid-cols-[1fr_310px]">
      <div className="min-w-0 px-5 py-6 sm:px-7">
        <Banner
          eyebrow={`${department.owner} — ${department.role}`}
          title={department.name}
          copy={department.tagline}
          icon={department.icon}
          accent={department.accent}
          guidance={{
            open: guidance,
            onToggle: () => setGuidance((g) => !g),
            quote: department.quote,
            sections: department.sections.map((s) => ({
              label: s.label,
              blurb: s.blurb,
            })),
          }}
          right={
            <div className="flex items-center gap-5">
              <span className="text-right">
                <span className="eyebrow block text-faint">Discretionary</span>
                <span className="num mt-1 block text-[17px]" style={{ color }}>
                  ₹{department.budget} L
                </span>
              </span>
              <span className="text-right">
                <span className="eyebrow block text-faint">Committed</span>
                <span className="num mt-1 block text-[17px] text-ink">
                  {progress.done}/{progress.total}
                </span>
              </span>
            </div>
          }
        />

        <div className="mt-4">
          <ReadGrid
            panels={department.panels}
            shape={shape}
            accent={department.accent}
            department={department}
            answers={answers}
            active={progress.done > 0}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-line bg-raise/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="eyebrow" style={{ color }}>
              Decision queue
            </span>
            <span className="num text-[11px] text-faint">
              {alloc.total > 0 && `${alloc.used}/${alloc.total} placed · `}
              {progress.done}/{progress.total} committed
            </span>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
            {department.sections.map((s, i) => {
              const done = s.decisions.every((d) =>
                isAnswered(d, answers[d.id]),
              );
              const active = i === sectionIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSection(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] transition-all",
                    active ? "font-medium" : "text-dim hover:text-ink",
                  )}
                  style={
                    active
                      ? { background: color, color: "#05060c" }
                      : { background: "rgba(255,255,255,0.045)" }
                  }
                >
                  <span
                    className="num text-[10.5px]"
                    style={{ opacity: active ? 0.65 : 0.5 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                  {done && (
                    <Check
                      className="h-3 w-3"
                      style={{ color: active ? "#05060c" : "var(--emerald)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 p-4">
            <p className="text-[13px] leading-relaxed text-dim">
              {section.blurb}
            </p>

            {section.decisions.map((decision, i) => (
              <DecisionSlab
                key={decision.id}
                decision={decision}
                index={i}
                committed={isAnswered(decision, answers[decision.id])}
              >
                <DecisionBody
                  decision={decision}
                  answer={answers[decision.id]}
                  onAnswer={(a) => onAnswer(decision.id, a)}
                />
              </DecisionSlab>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (sectionIndex > 0) onSection(sectionIndex - 1);
                  else onCommand();
                }}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[12.5px] text-dim transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {sectionIndex > 0 ? "Previous" : "Command view"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sectionIndex < department.sections.length - 1) {
                    onSection(sectionIndex + 1);
                  } else {
                    onCommand();
                  }
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-medium text-white"
                style={{ background: "var(--grad-primary)" }}
              >
                {sectionIndex < department.sections.length - 1
                  ? "Next section"
                  : "Seal desk"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="border-t border-line bg-base/50 px-5 py-6 xl:border-l xl:border-t-0">
        <div className="xl:sticky xl:top-[92px]">
          <LiveRead
            shape={shape}
            insights={insights}
            tensions={tensions}
            committed={progress.done}
            total={progress.total}
          />
        </div>
      </aside>
    </div>
  );
}

/* ────────────────────────────── banner ───────────────────────────── */

function Banner({
  eyebrow,
  title,
  copy,
  icon,
  accent,
  right,
  guidance,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  icon: Department["icon"];
  accent: Department["accent"];
  right?: React.ReactNode;
  guidance?: {
    open: boolean;
    onToggle: () => void;
    quote: string;
    sections: { label: string; blurb: string }[];
  };
}) {
  const Icon = ICONS[icon];
  const color = accentVar[accent];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-raise/45">
      <div className="flex items-stretch">
        <span
          className="flex w-[68px] shrink-0 items-center justify-center border-r border-line"
          style={{
            background: `linear-gradient(160deg, color-mix(in srgb, ${color} 34%, transparent), transparent)`,
            color,
          }}
        >
          <Icon className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <div
            className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5"
            style={{
              background: `linear-gradient(90deg, color-mix(in srgb, ${color} 26%, transparent), rgba(255,255,255,0.02))`,
            }}
          >
            <div className="flex min-w-0 flex-wrap items-baseline gap-3">
              <span className="display text-[16px] text-ink">{title}</span>
              <span className="eyebrow truncate text-faint">{eyebrow}</span>
            </div>
            {guidance && (
              <button
                type="button"
                onClick={guidance.onToggle}
                aria-expanded={guidance.open}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white/[0.1]"
              >
                Guidance
                <motion.span
                  animate={{ rotate: guidance.open ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="flex"
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5">
            <p className="max-w-2xl text-[13px] leading-relaxed text-dim">
              {copy}
            </p>
            {right}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {guidance?.open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: easeOut }}
            className="overflow-hidden border-t border-line bg-void/40"
          >
            <div className="px-4 py-4 sm:px-6">
              <p className="text-[13px] italic text-dim">
                &ldquo;{guidance.quote}&rdquo;
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {guidance.sections.map((s, i) => (
                  <div
                    key={s.label}
                    className="flex gap-3 rounded-lg bg-white/[0.03] px-3.5 py-3"
                  >
                    <span className="num text-[11px] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium text-ink">
                        {s.label}
                      </span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-dim">
                        {s.blurb}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DecisionBody({
  decision,
  answer,
  onAnswer,
}: {
  decision: Decision;
  answer?: Answer;
  onAnswer: (a: Answer) => void;
}) {
  if (decision.kind === "choice") {
    return (
      <ChoiceSlabs
        options={decision.options}
        selected={answer?.kind === "choice" ? answer.optionId : undefined}
        onSelect={(optionId) => onAnswer({ kind: "choice", optionId })}
      />
    );
  }

  if (decision.kind === "allocate") {
    return (
      <SlabAllocator
        channels={decision.channels}
        budget={decision.budget}
        unit={decision.unit}
        split={
          answer?.kind === "allocate"
            ? answer.split
            : Object.fromEntries(decision.channels.map((c) => [c.id, 0]))
        }
        onChange={(split) => onAnswer({ kind: "allocate", split })}
      />
    );
  }

  if (decision.kind === "priority") {
    return (
      <SlabStackPicker
        items={decision.items}
        pick={decision.pick}
        order={answer?.kind === "priority" ? answer.order : []}
        onChange={(order) => onAnswer({ kind: "priority", order })}
      />
    );
  }

  return (
    <SlabLadder
      value={answer?.kind === "conviction" ? answer.value : 0}
      low={decision.low}
      high={decision.high}
      onChange={(value) => onAnswer({ kind: "conviction", value })}
    />
  );
}
