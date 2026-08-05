"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevel, levels } from "@/lib/simulation/data";
import { resolveQuarter } from "@/lib/simulation/engine";
import type {
  BlockAnswer,
  Level,
  Metrics,
  QuarterAnswers,
  QuarterResult,
} from "@/lib/simulation/types";
import { SimHeader } from "@/components/simulation/SimHeader";
import { LevelSelect } from "@/components/simulation/LevelSelect";
import { BootSequence } from "@/components/simulation/BootSequence";
import { Dossier } from "@/components/simulation/Dossier";
import { QuarterBrief } from "@/components/simulation/QuarterBrief";
import { DecisionDeck } from "@/components/simulation/DecisionDeck";
import { Resolution } from "@/components/simulation/Resolution";
import { QuarterReport } from "@/components/simulation/QuarterReport";
import { LevelDebrief } from "@/components/simulation/LevelDebrief";

type Phase =
  | "select"
  | "boot"
  | "dossier"
  | "brief"
  | "decide"
  | "resolve"
  | "report"
  | "debrief";

const STORAGE_KEY = "myelin.simulation.completed";

const PHASE_LABEL: Record<Phase, string> = {
  select: "Choose a scenario",
  boot: "Preparing the environment",
  dossier: "Company dossier · understand before you act",
  brief: "Planning · incoming brief",
  decide: "Decision desk · commitments open",
  resolve: "Running the quarter",
  report: "Quarter report",
  debrief: "Decision intelligence report",
};

export function SimulationExperience() {
  const [phase, setPhase] = useState<Phase>("select");
  const [levelId, setLevelId] = useState<Level["id"] | null>(null);
  const [quarterIndex, setQuarterIndex] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [previous, setPrevious] = useState<Metrics | undefined>(undefined);
  const [answers, setAnswers] = useState<QuarterAnswers>({});
  const [results, setResults] = useState<QuarterResult[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<string[]>([]);

  const level = useMemo(() => (levelId ? getLevel(levelId) ?? null : null), [levelId]);
  const quarter = level?.quarters[quarterIndex] ?? null;
  const currentResult = results[quarterIndex] ?? null;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw) as string[]);
    } catch {
      /* storage unavailable — levels simply stay locked */
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase, quarterIndex]);

  const markCompleted = useCallback((id: string) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const startLevel = useCallback((id: Level["id"]) => {
    const target = getLevel(id);
    if (!target) return;
    setLevelId(id);
    setQuarterIndex(0);
    setMetrics(target.start);
    setPrevious(undefined);
    setAnswers({});
    setResults([]);
    setPhase("boot");
  }, []);

  const exitToLibrary = useCallback(() => {
    setPhase("select");
    setLevelId(null);
    setMetrics(null);
    setPrevious(undefined);
    setAnswers({});
    setResults([]);
    setQuarterIndex(0);
  }, []);

  const handleAnswer = useCallback((blockId: string, answer: BlockAnswer) => {
    setAnswers((prev) => ({ ...prev, [blockId]: answer }));
  }, []);

  const commitQuarter = useCallback(() => {
    if (!quarter || !metrics) return;
    const result = resolveQuarter(quarter, answers, metrics);
    setResults((prev) => {
      const next = [...prev];
      next[quarterIndex] = result;
      return next;
    });
    setPrevious(metrics);
    setMetrics(result.after);
    setPhase("resolve");
  }, [quarter, metrics, answers, quarterIndex]);

  const advance = useCallback(() => {
    if (!level) return;
    const isLast = quarterIndex >= level.quarters.length - 1;
    if (isLast) {
      markCompleted(level.id);
      setPhase("debrief");
      return;
    }
    setQuarterIndex((i) => i + 1);
    setAnswers({});
    setPrevious(undefined);
    setPhase("brief");
  }, [level, quarterIndex, markCompleted]);

  const nextLevelId = useMemo(() => {
    if (!level) return null;
    const index = levels.findIndex((l) => l.id === level.id);
    return levels[index + 1]?.id ?? null;
  }, [level]);

  const showHud =
    phase === "brief" ||
    phase === "decide" ||
    phase === "resolve" ||
    phase === "report";

  return (
    <div className="sim-surface relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SimHeader
          level={level}
          quarterIndex={quarterIndex}
          phaseLabel={
            quarter && phase !== "select" && phase !== "boot" && phase !== "debrief"
              ? `${quarter.label} · ${PHASE_LABEL[phase]}`
              : PHASE_LABEL[phase]
          }
          metrics={metrics}
          previous={previous}
          showHud={showHud}
          onExit={exitToLibrary}
        />

        <AnimatePresence mode="wait">
          <motion.main
            key={`${phase}-${quarterIndex}-${levelId ?? "none"}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {phase === "select" && (
              <LevelSelect
                completed={[...completed, ...overrides]}
                onStart={startLevel}
                onUnlock={(id) => {
                  const index = levels.findIndex((l) => l.id === id);
                  const prerequisite = levels[index - 1];
                  if (prerequisite) {
                    setOverrides((prev) =>
                      prev.includes(prerequisite.id) ? prev : [...prev, prerequisite.id],
                    );
                  }
                }}
              />
            )}

            {phase === "boot" && level && (
              <BootSequence level={level} onDone={() => setPhase("dossier")} />
            )}

            {phase === "dossier" && level && metrics && (
              <Dossier
                level={level}
                metrics={metrics}
                onDone={() => setPhase("brief")}
              />
            )}

            {phase === "brief" && quarter && (
              <QuarterBrief quarter={quarter} onDone={() => setPhase("decide")} />
            )}

            {phase === "decide" && quarter && (
              <DecisionDeck
                quarter={quarter}
                answers={answers}
                onAnswer={handleAnswer}
                onCommit={commitQuarter}
              />
            )}

            {phase === "resolve" && quarter && currentResult && (
              <Resolution
                quarter={quarter}
                result={currentResult}
                onDone={() => setPhase("report")}
              />
            )}

            {phase === "report" && quarter && currentResult && level && (
              <QuarterReport
                quarter={quarter}
                result={currentResult}
                isLast={quarterIndex >= level.quarters.length - 1}
                onNext={advance}
              />
            )}

            {phase === "debrief" && level && metrics && (
              <LevelDebrief
                level={level}
                results={results}
                metrics={metrics}
                hasNextLevel={!!nextLevelId}
                onRestart={() => startLevel(level.id)}
                onNextLevel={() => nextLevelId && startLevel(nextLevelId)}
                onExit={exitToLibrary}
              />
            )}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
