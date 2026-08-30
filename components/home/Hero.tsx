import { ArrowRight } from "lucide-react";
import { Action, Container } from "@/components/ui/Kit";
import { Figures, Masthead } from "@/components/layout/PageChrome";
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
    /* A column that is at least one screen tall, so the masthead pins to the top, the figures
       to the bottom and the fold lands on the ledger footing rather than mid-headline. `svh`
       and not `vh`: on mobile `vh` is the *largest* viewport, which hides the last band behind
       the browser's own chrome until you scroll. It is a floor, never a cap -- past the `lg`
       stack the content is taller than a phone screen and simply grows. */
    <section
      id="home"
      className="relative flex min-h-svh flex-col border-b border-line pt-[68px]"
    >
      <div className="grid-lines absolute inset-0" />

      <Masthead section="Decision Intelligence" />

      {/* `flex-1` hands this row whatever the masthead and the footing leave, and `items-center`
          settles the content in the middle of it -- so the hero re-centres as the viewport
          changes instead of being held in place by a fixed block of padding. The padding is
          viewport-relative for the same reason: it is the first thing that should give on a
          short laptop screen. */}
      <Container
        wide
        className="relative z-10 grid flex-1 items-center gap-y-12 py-[clamp(2rem,5.5vh,5rem)] sm:gap-y-14 lg:grid-cols-[1fr_auto] lg:gap-x-16"
      >
        <div>
          {/* The measure belongs on the headline itself: `ch` resolves against the element's own
              font, so on the wrapper it was 19 characters of 16px body text -- a 200px column
              that broke the line after almost every word and stretched the hero to twice the
              height of the screen. */}
          <h1 className="ledger-display rise text-balance text-[clamp(2.6rem,5.6vw,4.75rem)] text-ink lg:max-w-[19ch]">
            The world&apos;s most immersive way to learn{" "}
            <span className="italic text-teal">how to think.</span>
          </h1>

          <div className="rise rise-1 mt-[clamp(1.75rem,4vh,2.25rem)] max-w-[46ch] border-t border-line pt-6">
            <p className="text-pretty text-[16.5px] leading-[1.7] text-dim">
              You are dropped into situations with no right answer and no
              instructions. You decide, the world reacts, and the judgment you
              build is the thing we measure.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action href="/pricing" size="lg">
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

      <Figures items={figures} />
    </section>
  );
}
