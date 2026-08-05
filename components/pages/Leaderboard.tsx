"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Medal,
  Play,
  Trophy,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import {
  Action,
  Container,
  Eyebrow,
  Panel,
  Pill,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

const columns = ["Rank", "Operator", "Company", "DI Score", "Months", "Result"] as const;

type Entry = {
  rank: string;
  operator: string;
  company: string;
  score: string;
  months: string;
  result: string;
  accent: Accent;
  medallion: "trophy" | "medal" | "crown" | "open";
  filled: boolean;
};

const rows: Entry[] = [
  {
    rank: "01",
    operator: "Vikas",
    company: "myelinlabs",
    score: "89.1",
    months: "24",
    result: "Completed 24 months",
    accent: "amber",
    medallion: "trophy",
    filled: true,
  },
  {
    rank: "02",
    operator: "—",
    company: "slot open",
    score: "—",
    months: "—",
    result: "Awaiting entrant",
    accent: "violet",
    medallion: "open",
    filled: false,
  },
  {
    rank: "03",
    operator: "—",
    company: "slot open",
    score: "—",
    months: "—",
    result: "Awaiting entrant",
    accent: "indigo",
    medallion: "open",
    filled: false,
  },
  {
    rank: "04",
    operator: "—",
    company: "slot open",
    score: "—",
    months: "—",
    result: "Awaiting entrant",
    accent: "cyan",
    medallion: "open",
    filled: false,
  },
  {
    rank: "05",
    operator: "—",
    company: "slot open",
    score: "—",
    months: "—",
    result: "Awaiting entrant",
    accent: "emerald",
    medallion: "open",
    filled: false,
  },
  {
    rank: "06",
    operator: "—",
    company: "slot open",
    score: "—",
    months: "—",
    result: "Awaiting entrant",
    accent: "rose",
    medallion: "open",
    filled: false,
  },
];

const boardStats = [
  { value: "1", label: "operators ranked", accent: "amber" as Accent },
  { value: "89.1", label: "top DI score", accent: "violet" as Accent },
  { value: "24", label: "months simulated", accent: "cyan" as Accent },
  { value: "S-25", label: "active cohort", accent: "emerald" as Accent },
];

export function Leaderboard() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />

        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <Eyebrow accent="amber">MYELIN — LEADERBOARD</Eyebrow>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: easeOut }}
                className="display mt-7 text-[clamp(2.5rem,6.4vw,4.6rem)] leading-[0.98] text-ink"
              >
                Global <span className="text-grad-warm">Leaderboard</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease: easeOut }}
                className="mt-5 text-[18px] text-dim"
              >
                Top operators.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: easeOut }}
              className="flex items-center gap-3"
            >
              <Pill accent="amber" solid>
                <Trophy className="h-3 w-3" />
                Season S-25
              </Pill>
              <Pill accent="cyan">Public · global</Pill>
            </motion.div>
          </div>
        </Container>

        <Container wide className="relative z-10 mt-14">
          <div className="grid divide-line overflow-hidden rounded-2xl border border-line bg-white/[0.02] sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {boardStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 + i * 0.07, ease: easeOut }}
                className={`relative px-6 py-7 ${i < 2 ? "border-b border-line lg:border-b-0" : ""}`}
              >
                <p
                  className="display text-[34px] leading-none"
                  style={{ color: accentVar[stat.accent] }}
                >
                  {stat.value}
                </p>
                <p className="eyebrow mt-3 text-faint">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-base">
        <div className="dot-grid absolute inset-0" />
        <Container wide className="relative z-10 section-pad">
          <Panel gradientRing className="overflow-hidden p-0">
            {/* Column headers */}
            <div className="hidden border-b border-line bg-white/[0.03] px-6 py-4 md:grid md:grid-cols-[72px_1.2fr_1fr_0.9fr_0.7fr_1.3fr] md:gap-4">
              {columns.map((col) => (
                <span key={col} className="eyebrow text-faint">
                  {col}
                </span>
              ))}
            </div>

            <div className="divide-y divide-line">
              {rows.map((row, i) => (
                <LeaderRow key={row.rank} row={row} delay={i * 0.05} />
              ))}
            </div>
          </Panel>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Panel
              accent="violet"
              glow
              gradientRing
              className="overflow-hidden p-0"
            >
              <div
                className="p-7 sm:p-9"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(124,92,255,0.2), rgba(34,211,238,0.08))",
                }}
              >
                <Eyebrow accent="cyan">Claim a slot</Eyebrow>
                <p className="display mt-5 text-[clamp(1.5rem,2.8vw,2.1rem)] leading-[1.1] text-ink">
                  Run a simulation.{" "}
                  <span className="text-grad">Earn the board.</span>
                </p>
                <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-dim">
                  DI Score is a composite percentile across seven cognitive
                  dimensions. Your best-of-three is what ranks.
                </p>
                <div className="mt-7">
                  <Action href="/play/startup-survival" size="lg">
                    <Play className="h-4 w-4" />
                    Run Startup Survival
                    <ArrowRight className="h-4 w-4" />
                  </Action>
                </div>
              </div>
            </Panel>

            <Panel className="p-7 sm:p-8">
              <p className="eyebrow text-faint">How ranking works</p>
              <ul className="mt-5 space-y-4">
                {[
                  { n: "01", t: "Complete 24 months", a: "violet" as Accent },
                  { n: "02", t: "Submit best-of-three", a: "indigo" as Accent },
                  { n: "03", t: "DI Score ranks you", a: "cyan" as Accent },
                  { n: "04", t: "Cohort resets each season", a: "emerald" as Accent },
                ].map((item) => (
                  <li key={item.n} className="flex items-center gap-3">
                    <span
                      className="num flex h-8 w-8 items-center justify-center rounded-lg border text-[11px]"
                      style={{
                        borderColor: `color-mix(in srgb, ${accentVar[item.a]} 40%, transparent)`,
                        color: accentVar[item.a],
                        background: `color-mix(in srgb, ${accentVar[item.a]} 10%, transparent)`,
                      }}
                    >
                      {item.n}
                    </span>
                    <span className="text-[14.5px] text-dim">{item.t}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </Container>
      </section>
    </>
  );
}

function LeaderRow({ row, delay }: { row: Entry; delay: number }) {
  const color = accentVar[row.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: easeOut }}
      className="group relative px-5 py-5 transition-colors hover:bg-white/[0.03] sm:px-6 md:grid md:grid-cols-[72px_1.2fr_1fr_0.9fr_0.7fr_1.3fr] md:items-center md:gap-4"
      style={
        row.filled
          ? undefined
          : {
              borderStyle: "dashed",
            }
      }
    >
      {row.filled && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] opacity-80"
          style={{ background: color }}
        />
      )}

      {/* Rank medallion */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full border"
          style={{
            borderColor: row.filled
              ? `color-mix(in srgb, ${color} 55%, transparent)`
              : "var(--line)",
            borderStyle: row.filled ? "solid" : "dashed",
            background: row.filled
              ? `color-mix(in srgb, ${color} 18%, transparent)`
              : "transparent",
            color: row.filled ? color : "var(--faint)",
          }}
        >
          {row.filled ? (
            <span className="text-[18px]" aria-hidden>
              🏆
            </span>
          ) : row.medallion === "crown" ? (
            <Crown className="h-4 w-4" />
          ) : (
            <Medal className="h-4 w-4 opacity-40" />
          )}
        </span>
        <span className="num text-[13px] text-faint md:hidden">{row.rank}</span>
        <span className="num hidden text-[13px] text-faint md:inline">{row.rank}</span>
      </div>

      <div className="mt-4 md:mt-0">
        <p
          className={`text-[15px] font-medium ${row.filled ? "text-ink" : "text-faint"}`}
        >
          {row.operator}
        </p>
        <p className="mt-0.5 text-[12px] text-faint md:hidden">Operator</p>
      </div>

      <div className="mt-2 md:mt-0">
        <p
          className={`num text-[13.5px] ${row.filled ? "text-dim" : "text-faint italic"}`}
        >
          {row.company}
        </p>
      </div>

      <div className="mt-3 md:mt-0">
        {row.filled ? (
          <span className="display text-grad text-[22px] leading-none">
            {row.score}
          </span>
        ) : (
          <span className="num text-[15px] text-faint">—</span>
        )}
      </div>

      <div className="mt-2 md:mt-0">
        <span className={`num text-[14px] ${row.filled ? "text-ink" : "text-faint"}`}>
          {row.months}
        </span>
      </div>

      <div className="mt-2 md:mt-0">
        {row.filled ? (
          <Pill accent="emerald">{row.result}</Pill>
        ) : (
          <span className="eyebrow text-faint">{row.result}</span>
        )}
      </div>
    </motion.div>
  );
}
