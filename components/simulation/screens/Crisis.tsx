"use client";

/**
 * The market event: five steps from "something is happening" to a signed commitment.
 *
 * Which event fires is the engine's decision, not a local coin flip -- the archetype is assigned
 * from the company id and returned by the API, and the commitment is sent as a single figure
 * against the chosen posture. Nothing here computes damage; it only reports what was decided.
 */

import { useState } from "react";
import { ARCHETYPES, CRISIS_STEPS, DIAGNOSIS_LABELS, STRATEGY_BY_ID } from "@/lib/simulation/constants";
import { inr, lakh, num } from "@/lib/simulation/format";
import { Eyebrow, LedgerRow, Panel, TeachingNote } from "@/components/simulation/Kit";
import type { CrisisBriefing } from "@/lib/simulation/remote";
import type {
  ArchetypeId,
  Budget,
  CompanyState,
  CrisisInput,
  DiagnosisId,
  StrategyId,
} from "@/lib/simulation/types";

const EVIDENCE_BORDER: Record<string, string> = {
  bad: "border-rose-700",
  watch: "border-amber-600",
  flat: "border-stone-400",
};

export function CrisisScreen({
  s,
  archId,
  crisis,
  setCrisis,
  locked,
  budget,
  briefing,
  commitReading,
}: {
  s: CompanyState;
  archId: ArchetypeId;
  crisis: CrisisInput;
  setCrisis: (c: CrisisInput) => void;
  locked: boolean;
  budget: Budget;
  briefing: CrisisBriefing | null;
  /** The server's read on the amount committed. Absent until a preview has run. */
  commitReading: { band: string; strain: string; line: string; trade: string } | null;
}) {
  const [step, setStep] = useState(crisis.strategy ? 4 : 0);
  const arch = ARCHETYPES[archId];

  // All three come from the server. Exposure is deliberately NOT among them: the engine
  // returns symptoms and a severity band, never the underlying number, because working out
  // how badly this lands is the exercise.
  const evidence = briefing?.evidence ?? [];
  const choices = briefing?.strategies ?? [];

  const set = (key: keyof CrisisInput, value: unknown) => setCrisis({ ...crisis, [key]: value });

  const choiceClass = (on: boolean) =>
    "text-left border px-3 py-2 text-sm " +
    (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800");

  const canAdvance = [true, true, locked || Boolean(crisis.diagnosis), locked || Boolean(crisis.strategy), true][step];

  return (
    <div className="space-y-5">
      <div className="bg-stone-900 text-white p-5">
        <Eyebrow tone="text-rose-400">
          Quarter {s.quarter} · {locked ? "The situation is a quarter old" : "Something is happening"}
        </Eyebrow>
        <h2 className="font-serif text-3xl mt-1">{briefing?.signal ?? arch.signal}</h2>
        <p className="text-sm text-stone-300 mt-3 max-w-3xl leading-relaxed">{briefing?.body ?? arch.body}</p>
        {locked && (
          <p className="text-sm text-amber-300 mt-3 max-w-3xl">
            You committed to{" "}
            {crisis.strategy && STRATEGY_BY_ID[crisis.strategy]
              ? STRATEGY_BY_ID[crisis.strategy].name.toLowerCase()
              : "a direction"}{" "}
            last quarter and that is not reversible. What you put behind it this quarter still is.
          </p>
        )}
        <div className="flex flex-wrap gap-x-1 gap-y-2 mt-4">
          {CRISIS_STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={
                "px-3 py-1 text-xs uppercase tracking-widest border " +
                (i === step
                  ? "border-rose-500 text-white"
                  : i < step
                    ? "border-stone-600 text-stone-300 hover:text-white"
                    : "border-stone-800 text-stone-600")
              }
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      {step === 0 && (
        <Panel eyebrow="Step one" title="You do not yet know what this is">
          <p className="text-sm text-stone-700">
            Something has changed outside the company. What it costs you depends on the company you have spent two
            quarters building, and you will not be told the number in advance. Start by looking at what each part of the
            business is actually seeing.
          </p>
          <TeachingNote id="crisis" />
        </Panel>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <Eyebrow tone="text-rose-800">Step two</Eyebrow>
            <h3 className="font-serif text-xl">What each function is seeing</h3>
            <p className="text-sm text-stone-600 mt-1">Some of this is relevant. Some of it is not.</p>
          </div>
          {evidence.map((line, i) => (
            <div key={i} className={"bg-white border border-stone-300 border-l-4 px-4 py-3 " + EVIDENCE_BORDER[line.tone]}>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-xs uppercase tracking-widest text-stone-500 w-32">{line.fn}</span>
                <span className="font-mono text-base text-stone-900">{line.line}</span>
              </div>
              <p className="text-sm text-stone-700 mt-1">{line.detail}</p>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <Panel eyebrow="Step three" title="What do you believe is happening?">
          <p className="text-sm text-stone-600 mb-3">
            Nobody will confirm this for you. Your reading is recorded either way, and how the quarter turns out will
            show whether you read it correctly.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(briefing?.diagnoses ?? arch.diagnoses.map((id: DiagnosisId) => ({ id, label: DIAGNOSIS_LABELS[id] }))).map((d) => (
              <button
                key={d.id}
                disabled={locked}
                onClick={() => set("diagnosis", d.id)}
                className={choiceClass(crisis.diagnosis === d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <div className="font-serif text-base">Why do you think so?</div>
            <textarea
              value={crisis.reasoning || ""}
              onChange={(e) => set("reasoning", e.target.value)}
              rows={2}
              disabled={locked}
              placeholder="A sentence on what in the evidence points you there."
              className="w-full border border-stone-400 p-3 text-sm bg-white mt-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
          </div>
        </Panel>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div>
            <Eyebrow tone="text-rose-800">Step four</Eyebrow>
            <h3 className="font-serif text-xl">How will you respond?</h3>
            <p className="text-sm text-stone-600 mt-1">
              These are directions, not budgets. You decide how much to put behind it next.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {choices.map((c) => {
              const on = crisis.strategy === c.id;
              return (
                <button
                  key={c.id}
                  disabled={locked}
                  onClick={() => set("strategy", c.id as StrategyId)}
                  className={
                    "text-left border p-4 " +
                    (on ? "border-stone-900 border-2 bg-white" : "border-stone-300 bg-white hover:border-stone-800") +
                    (locked && !on ? " opacity-40" : "")
                  }
                >
                  <div className="font-serif text-xl">{c.name}</div>
                  <p className="text-sm text-stone-700 mt-1">{c.thesis}</p>
                  <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 mt-3">
                    <div className="text-xs text-teal-800">
                      <span className="uppercase tracking-widest font-semibold">Upside</span>
                      <br />
                      {c.gain}
                    </div>
                    <div className="text-xs text-rose-800">
                      <span className="uppercase tracking-widest font-semibold">Exposure</span>
                      <br />
                      {c.risk}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Panel
            eyebrow="Step five"
            title={
              crisis.strategy
                ? "What will you risk on " + STRATEGY_BY_ID[crisis.strategy].name.toLowerCase() + "?"
                : "Choose a direction first"
            }
          >
            {crisis.strategy && (
              <>
                <p className="text-sm text-stone-600 mb-3">
                  This comes out of the same cash as everything else this quarter. Nobody can tell you in advance how far
                  it will go.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={crisis.commit}
                    placeholder="0"
                    onChange={(e) => set("commit", e.target.value.replace(/^-/, ""))}
                    className="w-32 border border-stone-400 px-2 py-1 text-right font-mono text-lg focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                  <span className="text-xs uppercase tracking-widest text-stone-500">lakh</span>
                </div>
                <div className="mt-3 border-l-4 border-stone-800 bg-stone-50 px-3 py-2">
                  <div className="text-sm text-stone-900">{commitReading?.line ?? "Nothing committed yet."}</div>
                  <div className="text-xs text-stone-600 mt-1">
                    What you are accepting: {commitReading?.trade ?? STRATEGY_BY_ID[crisis.strategy].risk}
                  </div>
                </div>
                <div className="mt-3 text-xs text-stone-500 font-mono">
                  {inr(num(crisis.commit) * 1e5)} of a remaining {inr(budget.ceiling - budget.committed)}.
                </div>
              </>
            )}
          </Panel>

          {crisis.strategy && (
            <Panel eyebrow="On the record" title="What you decided, and why">
              <LedgerRow
                label="Your reading"
                working={crisis.reasoning ? "“" + crisis.reasoning.slice(0, 90) + "”" : "no reasoning recorded"}
                value={crisis.diagnosis ? DIAGNOSIS_LABELS[crisis.diagnosis] : "—"}
              />
              <LedgerRow
                label="Direction"
                working={STRATEGY_BY_ID[crisis.strategy].thesis}
                value={STRATEGY_BY_ID[crisis.strategy].name}
                strong
              />
              <LedgerRow label="Committed" working="out of this quarter's cash" value={lakh(num(crisis.commit))} strong />
              {briefing && (
                <LedgerRow
                  label="Recorded against"
                  working={"severity level " + briefing.level + " of 3, assessed from the company you built"}
                  value={briefing.name}
                />
              )}
              <p className="text-xs text-stone-500 mt-3 italic">
                This is kept and shown back to you at the end of the year, next to what actually happened.
              </p>
            </Panel>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-5 py-3 border border-stone-400 bg-white font-serif hover:border-stone-800"
          >
            Back
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance}
            className={
              "flex-1 py-3 font-serif text-lg " +
              (canAdvance ? "bg-stone-900 text-white hover:bg-rose-900" : "bg-stone-200 text-stone-400")
            }
          >
            {step === 0
              ? "Look at the evidence"
              : step === 1
                ? "Form a view"
                : step === 2
                  ? crisis.diagnosis
                    ? "Decide how to respond"
                    : "Record a reading first"
                  : crisis.strategy
                    ? "Decide what to commit"
                    : "Choose a direction first"}
          </button>
        )}
      </div>
    </div>
  );
}
