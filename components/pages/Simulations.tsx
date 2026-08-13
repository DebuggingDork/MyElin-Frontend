"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Clock,
  Gauge,
  Layers,
  Play,
  Signal,
  Sparkles,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  Action,
  Container,
  Eyebrow,
  Meter,
  Panel,
  Pill,
  SectionHead,
  accentVar,
  type Accent,
} from "@/components/ui/Kit";

type Status = "LIVE" | "BETA" | "COMING";

type Scenario = {
  index: string;
  title: string;
  status: Status;
  category: string;
  copy: string;
  duration: string;
  level: string;
  intensity: number;
  accent: Accent;
};

const scenarios: Scenario[] = [
  {
    index: "01",
    title: "Startup Survival",
    status: "LIVE",
    category: "Founder",
    copy: "Run a seed-stage SaaS for 24 simulated months. Pressure: cash, crisis, co-founder, competitor.",
    duration: "30 min",
    level: "Beginner → Pro",
    intensity: 62,
    accent: "violet",
  },
  {
    index: "02",
    title: "M&A War Room",
    status: "BETA",
    category: "Strategy",
    copy: "You're the acquirer. Diligence, deal structure, integration. Hidden liabilities mature post-close.",
    duration: "45 min",
    level: "Pro",
    intensity: 84,
    accent: "indigo",
  },
  {
    index: "03",
    title: "Crisis Comms",
    status: "COMING",
    category: "Leadership",
    copy: "A safety incident just hit Twitter. Your CEO is offline. You have 90 minutes.",
    duration: "20 min",
    level: "Pro",
    intensity: 78,
    accent: "rose",
  },
  {
    index: "04",
    title: "Turnaround",
    status: "COMING",
    category: "Operator",
    copy: "You inherited a Series C company at ₹4M burn and 5 months runway. Save it or wind it down.",
    duration: "40 min",
    level: "Expert",
    intensity: 96,
    accent: "amber",
  },
  {
    index: "05",
    title: "Fundraise",
    status: "COMING",
    category: "Founder",
    copy: "Pitch 12 VCs, negotiate term sheets, choose your lead. Dilution vs. control.",
    duration: "25 min",
    level: "Beginner",
    intensity: 34,
    accent: "emerald",
  },
  {
    index: "06",
    title: "Product Pivot",
    status: "COMING",
    category: "PM",
    copy: "Growth has flatlined. Pivot, pivot-and-bridge, or persevere?",
    duration: "30 min",
    level: "Intermediate",
    intensity: 58,
    accent: "cyan",
  },
];

const statusAccent: Record<Status, Accent> = {
  LIVE: "emerald",
  BETA: "amber",
  COMING: "indigo",
};

const filters = ["All", "Founder", "Strategy", "Leadership", "Operator", "PM"] as const;

const shelfStats = [
  { value: "1", label: "live now", accent: "emerald" as Accent },
  { value: "1", label: "in beta", accent: "amber" as Accent },
  { value: "4", label: "shipping soon", accent: "indigo" as Accent },
  { value: "7", label: "dimensions scored", accent: "cyan" as Accent },
];

export function Simulations() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible =
    filter === "All"
      ? scenarios
      : scenarios.filter((s) => s.category === filter);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />

        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <Eyebrow accent="teal">MYELIN — SIMULATIONS / MARKETPLACE</Eyebrow>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: easeOut }}
                className="display mt-7 text-[clamp(2.5rem,6.4vw,4.6rem)] leading-[0.98] text-ink"
              >
                Pick your <span className="text-grad">weight class.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
                className="mt-7 max-w-xl text-[17px] leading-[1.7] text-dim"
              >
                Scenarios published by Myelin Labs and partner institutions. New
                cases every month.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Action href="/play/startup-survival" size="lg">
                  <Play className="h-4 w-4" />
                  Run the live case
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Action>
                <span className="flex items-center gap-2 text-[13px] text-faint">
                  <Sparkles className="h-3.5 w-3.5 text-pink" />
                  6 scenarios in the catalogue
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.16, ease: easeOut }}
              className="ring-grad panel relative overflow-hidden rounded-[1.6rem] p-1.5"
            >
              <div className="rounded-[1.25rem] bg-void/70 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow flex items-center gap-2 text-dim">
                    <Signal className="h-3.5 w-3.5 text-emerald" />
                    Catalogue status
                  </span>
                  <Pill accent="teal">S-25</Pill>
                </div>
                <div className="mt-5 space-y-3.5">
                  {scenarios.map((s) => (
                    <div key={s.index} className="flex items-center gap-3">
                      <span className="num w-6 shrink-0 text-[11px] text-faint">
                        {s.index}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-dim">
                        {s.title}
                      </span>
                      <div className="w-20 shrink-0">
                        <Meter value={s.intensity} accent={s.accent} height={3} />
                      </div>
                      <span
                        className="num w-7 shrink-0 text-right text-[11px]"
                        style={{ color: accentVar[s.accent] }}
                      >
                        {s.intensity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="eyebrow text-faint">Difficulty index</span>
                  <span className="num text-[12px] text-ink">avg 68</span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        <Container wide className="relative z-10 mt-16">
          <div className="grid divide-line overflow-hidden rounded-2xl border border-line bg-[var(--panel)] sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {shelfStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: easeOut }}
                className={cn(
                  "relative px-6 py-7",
                  i < 2 && "border-b border-line lg:border-b-0",
                )}
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
          <SectionHead
            index="001"
            kicker="The catalogue"
            accent="teal"
            title={
              <>
                Six cases. <span className="text-grad-iris">One scorecard.</span>
              </>
            }
            copy={
              <p>
                Every scenario runs on the same deterministic engine and grades the
                same seven dimensions — so a Turnaround run is comparable to a
                Fundraise run.
              </p>
            }
          />

          <div className="mt-10 flex flex-wrap items-center gap-2 rounded-full border border-line bg-[var(--panel-2)] p-1.5">
            {filters.map((option) => {
              const active = option === filter;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[13px] transition-colors",
                    active ? "text-white" : "text-dim hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sim-filter-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "var(--grad-primary)" }}
                      transition={{ duration: 0.32, ease: easeOut }}
                    />
                  )}
                  <span className="relative">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((s, i) => (
              <ScenarioCard key={s.index} scenario={s} delay={i * 0.06} />
            ))}
          </div>

          {visible.length === 0 && (
            <Panel className="mt-8 p-8 text-center">
              <p className="text-[15px] text-dim">
                No cases in this track yet — new scenarios ship monthly.
              </p>
            </Panel>
          )}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-void">
        <div className="aurora opacity-70" />
        <Container wide className="relative z-10 section-pad">
          <Panel gradientRing glow accent="teal" className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              <div className="p-8 sm:p-11">
                <Eyebrow accent="teal">Publish with us</Eyebrow>
                <p className="display mt-6 max-w-lg text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] text-ink">
                  Bring your own case.{" "}
                  <span className="text-grad-warm">We run the consequences.</span>
                </p>
                <p className="mt-5 max-w-lg text-[15.5px] leading-[1.7] text-dim">
                  Faculty and accelerator partners author scenarios on the Myelin
                  engine — same telemetry, same DI Report, your curriculum.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Action href="/#institutions">
                    Talk to us about institution plans
                    <ArrowRight className="h-4 w-4" />
                  </Action>
                  <Action href="/manifesto" variant="outline">
                    Read the blueprint
                  </Action>
                </div>
              </div>
              <div
                className="grid divide-y divide-line border-line lg:border-l"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(20,184,166,0.14), transparent 72%)",
                }}
              >
                {[
                  { label: "Authoring time", value: "~2 weeks", accent: "violet" as Accent },
                  { label: "Engine", value: "deterministic", accent: "cyan" as Accent },
                  { label: "Narrative layer", value: "AI voiced", accent: "pink" as Accent },
                  { label: "Cohort analytics", value: "included", accent: "emerald" as Accent },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 px-7 py-5 sm:px-9"
                  >
                    <span className="eyebrow text-faint">{row.label}</span>
                    <span
                      className="num text-[14px]"
                      style={{ color: accentVar[row.accent] }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}

function ScenarioCard({
  scenario,
  delay,
}: {
  scenario: Scenario;
  delay: number;
}) {
  const color = accentVar[scenario.accent];
  const isLive = scenario.status === "LIVE";
  const badge = statusAccent[scenario.status];

  return (
    <Panel
      accent={scenario.accent}
      glow
      gradientRing={isLive}
      delay={delay}
      className="hover-lift flex flex-col p-0"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{
            borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
          }}
        >
          <span className="num text-[13px] font-semibold">{scenario.index}</span>
        </span>

        <Pill accent={badge}>
          {isLive && (
            <span
              className="live-dot h-1.5 w-1.5 rounded-full"
              style={{ background: accentVar[badge] }}
            />
          )}
          {scenario.status}
        </Pill>
      </div>

      <div className="px-6 pt-5">
        <div className="flex items-center gap-2.5">
          <Layers className="h-3.5 w-3.5" style={{ color }} />
          <span className="eyebrow" style={{ color }}>
            {scenario.category}
          </span>
        </div>
        <p className="display mt-3 text-[21px] leading-tight text-ink">
          {scenario.title}
        </p>
        <p className="mt-3 text-[14px] leading-[1.65] text-dim">{scenario.copy}</p>
      </div>

      <div className="mt-6 px-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-faint">Intensity</span>
          <span className="num text-[11.5px]" style={{ color }}>
            {scenario.intensity}/100
          </span>
        </div>
        <Meter value={scenario.intensity} accent={scenario.accent} className="mt-2.5" />
      </div>

      <div className="mt-6 grid grid-cols-2 divide-x divide-line border-y border-line">
        <div className="px-6 py-4">
          <span className="eyebrow flex items-center gap-1.5 text-faint">
            <Clock className="h-3 w-3" />
            Duration
          </span>
          <p className="num mt-2 text-[13.5px] text-ink">{scenario.duration}</p>
        </div>
        <div className="px-6 py-4">
          <span className="eyebrow flex items-center gap-1.5 text-faint">
            <Gauge className="h-3 w-3" />
            Level
          </span>
          <p className="mt-2 text-[13.5px] text-ink">{scenario.level}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 px-6 py-5">
        {isLive ? (
          <Action href="/play/startup-survival" className="w-full">
            Play →
          </Action>
        ) : (
          <Action variant="outline" disabled className="w-full opacity-45">
            <Bell className="h-3.5 w-3.5" />
            Notify me
          </Action>
        )}
      </div>
    </Panel>
  );
}
