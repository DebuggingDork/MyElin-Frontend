import { ArrowRight, Play } from "lucide-react";
import { Action, Container, Eyebrow } from "@/components/ui/Kit";
import { DecisionPanel } from "@/components/home/DecisionPanel";

/** Kept honest against the shipped engine: the scenario runs 4 quarters (config/scenarios,
 *  total_quarters: 4) over 22 spend lines per quarter (CLAUDE.md's 22-line model), not the
 *  "120+ decisions / 24 months" this previously claimed. */
const stats = [
  { value: "0", label: "Videos to watch" },
  { value: "22", label: "Spend lines a quarter" },
  { value: "7", label: "Cognitive dimensions" },
  { value: "4Q", label: "Compressed into 30 min" },
];

export function Hero() {
  return (
    <section
      id="home"
      className="noise relative overflow-hidden border-b border-line bg-void pt-[68px]"
    >
      <div className="aurora" />
      <div className="grid-lines absolute inset-0" />

      <Container
        wide
        className="relative z-10 grid items-center gap-14 py-20 sm:py-24 lg:min-h-[76svh] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16"
      >
        <div>
          <div className="rise">
            <Eyebrow accent="teal">
              The Decision Intelligence Platform · S-25 Cohort
            </Eyebrow>
          </div>

          {/* The size lives on the h1, not the spans: `max-w-[…ch]` resolves against *this*
              element's font-size, and with it left at the browser default the headline
              collapsed to one word per line. */}
          <h1 className="display rise rise-1 mt-7 max-w-[16ch] text-balance text-[clamp(2.3rem,4.4vw,3.9rem)] font-medium leading-[1.06] text-ink">
            The world&apos;s most immersive way to learn{" "}
            <span className="text-grad font-bold">how to think.</span>
          </h1>

          <p className="rise rise-2 mt-7 max-w-[52ch] text-pretty text-[16.5px] leading-[1.72] text-dim">
            You are dropped into situations with no right answer and no
            instructions. You decide, the world reacts, and the judgment you
            build is the thing we measure.
          </p>

          <div className="rise rise-3 mt-9 flex flex-wrap items-center gap-3">
            <Action href="/play/startup-survival" size="lg">
              <Play className="h-4 w-4" />
              Run a simulation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Action>
            <Action href="/manifesto" variant="outline" size="lg">
              Read the blueprint
              <ArrowRight className="h-4 w-4" />
            </Action>
          </div>
        </div>

        <div className="rise rise-4 lg:justify-self-end">
          <DecisionPanel />
        </div>
      </Container>

      <Container wide className="relative z-10 pb-10 sm:pb-14">
        <div className="rise rise-4 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <p className="eyebrow max-w-md text-faint">
            No videos. No quizzes. Just judgment.
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-4 sm:justify-end">
            {stats.map((stat) => (
              <div key={stat.label} className="sm:text-right">
                <p className="display text-[19px] leading-none text-ink">
                  {stat.value}
                </p>
                <p className="eyebrow mt-2 text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
