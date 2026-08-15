"use client";

/**
 * The Q4 term sheet.
 *
 * The tier and the three path names come from the API's `endgame_preview`, so the deal shown
 * is the deal the API will accept; the covenant arithmetic and the copy are the simulation's.
 * Signing posts `{path, term_sheet_name, reasoning}` to `POST .../endgame`.
 */

import { cr, n0, n2 } from "@/lib/nadi/format";
import { Eyebrow, TeachingNote } from "@/components/nadi/Kit";
import { useState } from "react";
import type { TermSheet } from "@/lib/nadi/types";

const TIER_COPY: Record<string, string> = {
  THRIVING:
    "Q3 closed cash-positive and the valuation rose in both Q2 and Q3. Three parties want a piece of what happens next.",
  STABLE: "The company is neither running away nor falling over. The terms on the table reflect exactly that.",
  DISTRESSED:
    "The buffer was breached, or cash has been falling against negative flow. Everything on this page is priced for that.",
};

export function TermSheetScreen({
  ts,
  onAccept,
  busy,
  error,
}: {
  ts: TermSheet;
  onAccept: (path: "A" | "B" | "C", termSheetName: string, reasoning: string) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const [picked, setPicked] = useState<"A" | "B" | "C" | null>(null);
  const [reasoning, setReasoning] = useState("");
  const chosen = ts.offers.find((o) => o.id === picked);

  return (
    <div className="space-y-5">
      <div className="bg-stone-900 text-white p-6">
        <Eyebrow tone="text-rose-400">Quarter 4 · The term sheet</Eyebrow>
        <h2 className="font-serif text-3xl mt-1">You are classified {ts.tier.toLowerCase()}</h2>
        <p className="text-sm text-stone-300 mt-3 max-w-3xl leading-relaxed">{TIER_COPY[ts.tier]}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 font-mono text-sm">
          <div>
            <span className="block text-xs uppercase tracking-widest text-stone-500">Q3 valuation</span>
            {cr(ts.V)}
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-stone-500">Momentum</span>
            {n2(ts.M)}
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-stone-500">Q1 → Q3 units</span>
            {n0(ts.q1.unitsSold as number)} → {n0(ts.q3.unitsSold as number)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ts.offers.map((offer) => {
          const on = picked === offer.id;
          return (
            <button
              key={offer.id}
              onClick={() => setPicked(offer.id)}
              className={
                "text-left border flex flex-col " +
                (on ? "border-stone-900 border-2 bg-white" : "border-stone-300 bg-white hover:border-stone-800")
              }
            >
              <div className={"px-4 py-3 border-b " + (on ? "bg-stone-900 text-white border-stone-900" : "border-stone-200")}>
                <Eyebrow tone={on ? "text-stone-400" : "text-stone-500"}>
                  Path {offer.id} · {offer.who}
                </Eyebrow>
                <div className="font-serif text-xl leading-snug">{offer.title}</div>
              </div>
              <div className="p-4 flex-1">
                <p className="text-sm text-stone-600 leading-relaxed">{offer.pitch}</p>
                <dl className="mt-4 space-y-2">
                  {offer.terms.map(([label, value], i) => (
                    <div key={i} className="border-b border-stone-200 pb-2">
                      <dt className="text-xs uppercase tracking-widest text-stone-500">{label}</dt>
                      <dd className="font-mono text-sm text-stone-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-stone-300 px-4 py-4 space-y-4">
        <div className="max-w-xl">
          <p className="text-sm text-stone-600">
            Your choice is final and it is graded. Read the covenant arithmetic, not the headline number.
          </p>
          <TeachingNote id="covenant" inline />
          <TeachingNote id="continuation" inline />
        </div>

        <div>
          <div className="font-serif text-base">
            Why this path? <span className="text-stone-500 text-sm">(recorded with the decision)</span>
          </div>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={2}
            placeholder="A sentence on what in the last three quarters makes this the right call."
            className="w-full border border-stone-400 p-3 text-sm bg-white mt-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
        </div>

        {error && <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

        <div className="flex justify-end">
          <button
            disabled={!chosen || busy}
            onClick={() => chosen && onAccept(chosen.id, chosen.title, reasoning)}
            className={
              "px-6 py-3 font-serif text-lg " +
              (chosen && !busy ? "bg-rose-800 text-white hover:bg-rose-900" : "bg-stone-200 text-stone-400")
            }
          >
            {busy ? "Signing…" : chosen ? "Sign path " + chosen.id : "Choose a path"}
          </button>
        </div>
      </div>
    </div>
  );
}
