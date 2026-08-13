import { ArrowRight } from "lucide-react";
import { Action, Container } from "@/components/ui/Kit";
import { DecisionPanel } from "@/components/home/DecisionPanel";

/** Kept honest against the shipped engine: the scenario runs 4 quarters (config/scenarios,
 *  total_quarters: 4) over 22 spend lines per quarter (CLAUDE.md's 22-line model). */
const figures = [
  { value: "0", label: "Videos to watch" },
  { value: "22", label: "Spend lines a quarter" },
  { value: "7", label: "Cognitive dimensions" },
  { value: "4Q", label: "Inside 30 minutes" },
];

export function Hero() {
  return (
    <section id="home" className="relative border-b border-line pt-[68px]">
      <div className="grid-lines absolute inset-0" />

      {/* Masthead strip. A newspaper puts its edition line above the fold and so does
          this: what the thing is on the left, what state it is in on the right. */}
      <div className="relative z-10 border-b border-line">
        <Container
          wide
          className="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <p className="tick-label">Myelin · Decision Intelligence</p>
          <p className="tick-label flex items-center gap-2">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />
            S-25 cohort open
          </p>
        </Container>
      </div>

      <Container
        wide
        className="relative z-10 grid items-center gap-y-14 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:gap-x-16 lg:py-24"
      >
        <div className="lg:max-w-[19ch]">
          <h1 className="ledger-display rise text-balance text-[clamp(2.9rem,6.2vw,5.25rem)] text-ink">
            The world&apos;s most immersive way to learn{" "}
            <span className="italic text-teal">how to think.</span>
          </h1>

          <div className="rise rise-1 mt-9 max-w-[46ch] border-t border-line pt-6">
            <p className="text-pretty text-[16.5px] leading-[1.7] text-dim">
              You are dropped into situations with no right answer and no
              instructions. You decide, the world reacts, and the judgment you
              build is the thing we measure.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action href="/play/startup-survival" size="lg">
                Run a simulation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Action>
              <Action href="/manifesto" variant="outline" size="lg">
                Read the blueprint
              </Action>
            </div>
          </div>
        </div>

        <div className="rise rise-2 lg:justify-self-end">
          <DecisionPanel />
        </div>
      </Container>

      {/* The figures, set as a ledger footing: hairline-divided columns, monospace
          numerals, label under value. No cards, no icons, no tinted panels. */}
      <div className="relative z-10 border-t border-line">
        <Container wide className="px-0 sm:px-0">
          <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {figures.map((figure) => (
              <div
                key={figure.label}
                className="rise rise-3 px-5 py-7 first:border-l-0 sm:px-8"
              >
                <dt className="num text-[clamp(1.9rem,3vw,2.6rem)] leading-none text-ink">
                  {figure.value}
                </dt>
                <dd className="tick-label mt-3">{figure.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
