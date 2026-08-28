"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { duration, easeOut } from "@/lib/media";
import { api, getToken } from "@/lib/api/client";
import { runHref } from "@/lib/run/ref";
import type { CompanyListItem } from "@/lib/api/types";
import { isTimerExpired } from "@/lib/simulation/timer";
import { cn } from "@/lib/utils";
import { useSimulationHref } from "@/components/play/entry";
import { Figures, Masthead } from "@/components/layout/PageChrome";
import { LedgerHead } from "@/components/home/LedgerHead";
import { Action, Container } from "@/components/ui/Kit";

type Status = "LIVE" | "BETA" | "COMING";

type Scenario = {
  index: string;
  title: string;
  status: Status;
  category: string;
  copy: string;
  duration: string;
  level: string;
  /** 0-100. Rendered as a tick bar, never as a coloured pill — it is a reading, not a badge. */
  intensity: number;
};

const scenarios: Scenario[] = [
  {
    index: "01",
    title: "Startup Survival",
    status: "LIVE",
    category: "Founder",
    copy: "Run a consumer-hardware company for four quarters. Pressure: cash, a market event, the board, a competitor who does not wait.",
    duration: "50 min",
    level: "Beginner → Pro",
    intensity: 62,
  },
  {
    index: "02",
    title: "M&A War Room",
    status: "BETA",
    category: "Strategy",
    copy: "You are the acquirer. Diligence, deal structure, integration — and hidden liabilities that only mature after close.",
    duration: "45 min",
    level: "Pro",
    intensity: 84,
  },
  {
    index: "03",
    title: "Crisis Comms",
    status: "COMING",
    category: "Leadership",
    copy: "A safety incident is trending. Your CEO is on a flight. You have ninety minutes and one statement.",
    duration: "20 min",
    level: "Pro",
    intensity: 78,
  },
  {
    index: "04",
    title: "Turnaround",
    status: "COMING",
    category: "Operator",
    copy: "You inherit a Series C company at ₹4 Cr of burn and five months of runway. Save it or wind it down.",
    duration: "40 min",
    level: "Expert",
    intensity: 96,
  },
  {
    index: "05",
    title: "Fundraise",
    status: "COMING",
    category: "Founder",
    copy: "Pitch twelve funds, negotiate the term sheets, choose your lead. Dilution against control, priced in public.",
    duration: "25 min",
    level: "Beginner",
    intensity: 34,
  },
  {
    index: "06",
    title: "Product Pivot",
    status: "COMING",
    category: "PM",
    copy: "Growth has flatlined for three quarters. Pivot, bridge, or persevere — and defend it to the people who funded the old plan.",
    duration: "30 min",
    level: "Intermediate",
    intensity: 58,
  },
];

const filters = ["All", "Founder", "Strategy", "Leadership", "Operator", "PM"] as const;

const figures = [
  { value: "1", label: "Live now" },
  { value: "1", label: "In beta" },
  { value: "4", label: "Shipping soon" },
  { value: "7", label: "Dimensions scored" },
];

/** Teal is the live system; anything unshipped stays on the quiet rule. */
const statusTone: Record<Status, string> = {
  LIVE: "text-teal",
  BETA: "text-ember",
  COMING: "text-faint",
};

/** Intensity as seven ticks, so six cases can be compared at a glance instead of each
 *  asserting its own number against its own colour. */
function TickBar({ value, lit }: { value: number; lit: boolean }) {
  const on = Math.round((value / 100) * 7);
  return (
    <span aria-hidden className="flex items-end gap-[3px]">
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] transition-colors duration-300",
            i < on ? (lit ? "bg-teal" : "bg-dim") : "bg-line-2",
          )}
          style={{ height: 5 + i * 2.2 }}
        />
      ))}
    </span>
  );
}

export function Simulations() {
  const simulationHref = useSimulationHref();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  /**
   * The run already in progress, if there is one.
   *
   * Without this the page always offered "Run the live case", which sends a returning CEO back
   * through the entry gate and its "30 uninterrupted minutes" prompt -- asking them to commit
   * the whole session again when they only have one quarter left to play. The API already
   * reports progress per owned run, so the button can say what it actually does.
   *
   * A run whose shared 50-minute timer has already reached 00:00 is no longer resumable: it is
   * read-only, and a returning CEO should start a fresh run instead of getting a "Resume" that
   * cannot give them back their time. Expiry is read from the persisted timer state, not from
   * transient component state, so a refresh agrees with the live simulation.
   */
  const [resumable, setResumable] = useState<CompanyListItem | null>(null);

  useEffect(() => {
    // Signed-out visitors see the marketing path; there is nothing of theirs to resume.
    if (!getToken()) return;
    let cancelled = false;
    api
      .listCompanies({ limit: 1 })
      .then(({ entries }) => {
        if (cancelled) return;
        // Newest first from the API; the first still-running one that hasn't hit its timer
        // ceiling is the one to offer.
        setResumable(
          entries.find(
            (e) =>
              (e.run_status === "active" || e.run_status === "distressed") &&
              !isTimerExpired(e.id),
          ) ?? null,
        );
      })
      .catch(() => {
        /* Offer the fresh-start path rather than an error on a marketing page. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resumeQuarter = resumable
    ? (resumable.current_quarter_number ?? resumable.quarters_locked + 1)
    : null;

  const visible =
    filter === "All" ? scenarios : scenarios.filter((s) => s.category === filter);

  return (
    <>
      {/* ── the opening band ──────────────────────────────────────── */}
      <section className="relative border-b border-line pt-[68px]">
        <div className="grid-lines absolute inset-0" />
        <Masthead section="Simulations" />

        <Container
          wide
          className="relative z-10 grid gap-x-16 gap-y-12 py-[clamp(3rem,7vh,5.5rem)] lg:grid-cols-[1.15fr_1fr] lg:items-end"
        >
          <div>
            <h1 className="ledger-display rise text-balance text-[clamp(2.5rem,5.4vw,4.5rem)] text-ink">
              Pick your <span className="italic text-teal">weight class.</span>
            </h1>

            <div className="rise rise-1 mt-[clamp(1.75rem,4vh,2.25rem)] max-w-[46ch] border-t border-line pt-6">
              <p className="text-pretty text-[16.5px] leading-[1.7] text-dim">
                Cases published by Myelin Labs and partner institutions. One
                engine, one scorecard — so a Turnaround run is comparable to a
                Fundraise run.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                {resumable ? (
                  <Action href={runHref(resumable.seq, "/simulation")} size="lg">
                    <Play className="h-4 w-4" />
                    Resume quarter {resumeQuarter} of 4
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Action>
                ) : (
                  <Action href={simulationHref} size="lg">
                    <Play className="h-4 w-4" />
                    Run the live case
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Action>
                )}
                <span className="tick-label">
                  {resumable
                    ? `${resumable.quarters_locked} of 4 quarters closed`
                    : "6 cases in the catalogue"}
                </span>
              </div>
            </div>
          </div>

          {/* Catalogue status: the shelf read as an instrument, hairline rows and a
              monospace column, rather than a rounded glass card floating over a glow. */}
          <div className="ticked rise rise-2 border border-line bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="tick-label flex items-center gap-2">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />
                Catalogue status
              </p>
              <p className="num text-[11px] text-teal">S-25</p>
            </div>

            <ul>
              {scenarios.map((s) => (
                <li
                  key={s.index}
                  className="flex items-center gap-4 border-b border-line px-5 py-3"
                >
                  <span className="num w-6 shrink-0 text-[11px] text-faint">
                    {s.index}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13.5px]",
                      s.status === "LIVE" ? "text-ink" : "text-dim",
                    )}
                  >
                    {s.title}
                  </span>
                  <TickBar value={s.intensity} lit={s.status === "LIVE"} />
                  <span className="num w-7 shrink-0 text-right text-[11px] text-dim">
                    {s.intensity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between px-5 py-3">
              <p className="tick-label">Difficulty index</p>
              <p className="num text-[12px] text-ink">avg 68</p>
            </div>
          </div>
        </Container>

        <Figures items={figures} stagger />
      </section>

      {/* ── the catalogue ─────────────────────────────────────────── */}
      <section className="relative border-b border-line">
        <Container wide className="ledger-section relative z-10">
          <LedgerHead
            title={
              <>
                Six cases. <span className="text-teal">One scorecard.</span>
              </>
            }
            deck={
              <p>
                Every scenario runs on the same deterministic engine and grades
                the same seven dimensions. What changes is the pressure, the
                counterparty, and how little time you get to read them.
              </p>
            }
          />

          {/* Squared segmented control. The active tab is a filled block on the rule, not a
              floating pill: the same geometry as every other control on the site. */}
          <div className="mt-12 flex flex-wrap border border-line">
            {filters.map((option) => {
              const active = option === filter;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={active}
                  className={cn(
                    "border-r border-line px-4 py-2.5 text-[13px] transition-colors duration-200 last:border-r-0",
                    active
                      ? "bg-teal/[0.12] text-teal"
                      : "text-dim hover:bg-[var(--panel)] hover:text-ink",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* The rules are the cards' own borders, not a `gap-px` grid showing its background
              through: the cards fade in on scroll, and a grid that paints the rule colour
              behind them flashed a solid block wherever a card had not arrived yet. */}
          <div className="mt-8 grid border-l border-t border-line md:grid-cols-2 xl:grid-cols-3">
            {visible.map((s, i) => (
              <ScenarioCard key={s.index} scenario={s} delay={i * 0.05} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-8 border border-line px-6 py-10 text-center text-[15px] text-dim">
              No cases in this track yet — new scenarios ship monthly.
            </p>
          )}
        </Container>
      </section>

      {/* ── publish with us ───────────────────────────────────────── */}
      <section className="relative">
        <Container wide className="ledger-section relative z-10">
          <div className="grid border border-line lg:grid-cols-[1.4fr_1fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-11">
              <p className="tick-label">Publish with us</p>
              <p className="ledger-display mt-5 max-w-[20ch] text-[clamp(1.5rem,3vw,2.4rem)] text-ink">
                Bring your own case.{" "}
                <span className="italic text-teal">We run the consequences.</span>
              </p>
              <p className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.7] text-dim">
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

            <dl className="border-t border-line lg:border-l lg:border-t-0">
              {[
                { label: "Authoring time", value: "~2 weeks" },
                { label: "Engine", value: "deterministic" },
                { label: "Narrative layer", value: "AI voiced" },
                { label: "Cohort analytics", value: "included" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b border-line px-6 py-5 last:border-b-0 sm:px-9"
                >
                  <dt className="tick-label">{row.label}</dt>
                  <dd className="num text-[13.5px] text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * One case, set as a ruled block.
 *
 * The grid that holds these is `gap-px` on a `bg-line` surface, so the gutters between cards
 * *are* the rules -- the catalogue reads as one divided sheet rather than six floating cards,
 * and no card needs a border of its own to be separated from its neighbour.
 */
function ScenarioCard({ scenario, delay }: { scenario: Scenario; delay: number }) {
  const simulationHref = useSimulationHref();
  const isLive = scenario.status === "LIVE";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: duration.reveal, delay, ease: easeOut }}
      className={cn(
        "flex flex-col border-b border-r border-line transition-colors duration-300",
        isLive ? "bg-teal/[0.06]" : "hover:bg-[var(--panel)]",
      )}
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3">
        <span className="num text-[11px] text-faint">{scenario.index}</span>
        <span className={cn("tick-label flex items-center gap-2", statusTone[scenario.status])}>
          {isLive && <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />}
          {scenario.status}
        </span>
      </div>

      {/* `flex-1` on the copy block, not on the footer: the cards stretch to the tallest in
          their row, so absorbing the slack here is what lines the intensity reading, the
          duration/level pair and the action up across all six. */}
      <div className="flex-1 px-5 pt-6">
        <p className="tick-label">{scenario.category}</p>
        <h3 className="ledger-display mt-3 text-[clamp(1.25rem,2vw,1.6rem)] text-ink">
          {scenario.title}
        </h3>
        <p className="mt-3 text-[14.5px] leading-[1.65] text-dim">{scenario.copy}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 px-5">
        <span className="tick-label">Intensity</span>
        <span className="flex items-center gap-3">
          <TickBar value={scenario.intensity} lit={isLive} />
          <span className="num text-[11.5px] text-dim">{scenario.intensity}/100</span>
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 border-y border-line">
        <div className="border-r border-line px-5 py-4">
          <dt className="tick-label">Duration</dt>
          <dd className="num mt-2 text-[13.5px] text-ink">{scenario.duration}</dd>
        </div>
        <div className="px-5 py-4">
          <dt className="tick-label">Level</dt>
          <dd className="mt-2 text-[13.5px] text-ink">{scenario.level}</dd>
        </div>
      </dl>

      <div className="mt-auto px-5 py-5">
        {isLive ? (
          <Action href={simulationHref} className="w-full">
            Play
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Action>
        ) : (
          <p className="tick-label py-3 text-center">In the build queue</p>
        )}
      </div>
    </motion.article>
  );
}
