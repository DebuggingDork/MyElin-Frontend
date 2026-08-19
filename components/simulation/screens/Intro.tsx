"use client";

/** The opening screen. Ported from the shipped `NadiWear.html` bundle. */

import { OPENING_CASH, marketDemand } from "@/lib/simulation/constants";
import { inr, n0 } from "@/lib/simulation/format";
import { Eyebrow, Panel } from "@/components/simulation/Kit";

export function IntroScreen({ onStart, busy }: { onStart: () => void; busy?: boolean }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Eyebrow tone="text-danger-deep">Four quarters. One company. You.</Eyebrow>
        <h1 className="font-serif text-5xl text-ink leading-none mt-2">Nadi Wear</h1>
        <p className="font-mono text-sm text-dim mt-2">Pvt. Ltd. · Bengaluru, Karnataka</p>
      </div>

      <p className="text-lg text-ink leading-relaxed">
        You are the chief executive. The company sells a smartwatch called the Nadi Pulse at {inr(9999)}, has four
        thousand customers, fourteen people and {inr(OPENING_CASH)} in the bank. The category buys about{" "}
        {n0(marketDemand(1))} units a quarter and you are a small part of that. Three funded competitors would like you
        to stay small.
      </p>

      <Panel eyebrow="How this works" title="Four decisions a quarter, and one you cannot take back">
        <p className="text-sm text-dim">
          Each quarter opens with a briefing: what changed, what is holding the company back, and what everyone around
          you wants. You declare a priority, make your decisions, and close the quarter. Then you find out what actually
          happened.
        </p>
        <p className="text-sm text-dim mt-3">
          You will not be shown your revenue before you commit. You will be shown pressure — where the company is tight,
          where it has room — and you will have to decide with that. That is the situation the job is actually conducted
          in.
        </p>
      </Panel>

      <Panel eyebrow="What is being assessed" title="Judgment, not arithmetic">
        <p className="text-sm text-dim">
          Every quarter you say what you are prioritising and what you are giving up. At the close, those are compared
          with what your money actually did and what the company turned out to need. Consequences arrive late and out of
          order, which is the point.
        </p>
      </Panel>

      <button
        onClick={onStart}
        disabled={busy}
        className={
          "w-full py-4 font-serif text-xl " +
          (busy ? "bg-raise-2 text-faint" : "bg-danger-deep text-white hover:bg-danger-deep")
        }
      >
        {busy ? "Opening the quarter…" : "Take the job"}
      </button>
    </div>
  );
}
