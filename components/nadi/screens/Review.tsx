"use client";

/**
 * The last screen before the quarter is committed: where the plan is tight, what the team is
 * still saying, the reflection that gets compared against the outcome, and — because this
 * run is recorded against the MyElin API — exactly what will be sent when you press close.
 */

import { useState } from "react";
import { LINE_MAP_NOTES, LOCAL_ONLY_DECISIONS, backendTotalLakh, toAllocations } from "@/lib/nadi/backend";
import { capexLakh, numericAlloc, opexLakh } from "@/lib/nadi/constants";
import { inr, lakh } from "@/lib/nadi/format";
import { BudgetMeter, Eyebrow, Inbox, Panel, ReadinessGrid } from "@/components/nadi/Kit";
import { ReflectionForm, reflectionComplete } from "@/components/nadi/Panels";
import type {
  Alloc,
  Budget,
  Constraint,
  CrisisInput,
  InboxMessage,
  PriorityId,
  Readiness,
  Reflection,
  WarrantyId,
} from "@/lib/nadi/types";

/** What the API will be sent for this quarter, shown before it is sent. */
function ReconciliationPanel({
  alloc,
  warranty,
  startInno,
}: {
  alloc: Alloc;
  warranty: WarrantyId;
  startInno: string[];
}) {
  const [open, setOpen] = useState(false);
  const payloads = toAllocations(alloc, warranty, startInno);
  const A = numericAlloc(alloc);
  const localTotal = opexLakh(A) + capexLakh(A);
  const sent = backendTotalLakh(payloads);

  return (
    <div className="border border-stone-300 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50"
      >
        <div>
          <Eyebrow>Recorded against your run</Eyebrow>
          <div className="font-serif text-base">
            {lakh(sent)} will be submitted across the six departments
          </div>
        </div>
        <span className="font-mono text-sm text-stone-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-stone-300 p-4 space-y-4">
          <p className="text-sm text-stone-600">
            This quarter is scored by the MyElin engine, which models spend as twenty-two lines across six departments.
            Your decisions carry more detail than that, so several lines are folded into their nearest counterpart. The
            totals match: {lakh(localTotal)} committed here, {lakh(sent)} sent.
          </p>

          <div>
            <Eyebrow tone="text-rose-800">How each line is recorded</Eyebrow>
            <div className="mt-2 divide-y divide-stone-200">
              {LINE_MAP_NOTES.map((m) => (
                <div key={m.from + m.to} className="py-1.5 grid grid-cols-12 gap-2 items-baseline">
                  <div className="col-span-6 sm:col-span-4 text-sm text-stone-800">{m.from}</div>
                  <div className="col-span-6 sm:col-span-3 font-mono text-xs text-stone-900">{m.to}</div>
                  <div className="col-span-12 sm:col-span-5 text-xs text-stone-500">{m.why || ""}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow tone="text-rose-800">Decisions the scoring model has no line for</Eyebrow>
            <p className="text-xs text-stone-500 mt-1">
              These still shape your company and everything on these screens. They are simply not part of the
              twenty-two-line model, so nothing is sent for them.
            </p>
            <ul className="mt-2 space-y-1">
              {LOCAL_ONLY_DECISIONS.map((d) => (
                <li key={d} className="text-sm text-stone-700 border-b border-stone-200 pb-1">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewScreen({
  quarter,
  dirs,
  inbox,
  constraint,
  reflection,
  setReflection,
  priority,
  alloc,
  warranty,
  startInno,
  budget,
  crisisLive,
  crisis,
  onClose,
  busy,
  error,
}: {
  quarter: number;
  dirs: Readiness[];
  inbox: InboxMessage[];
  constraint: Constraint | null;
  reflection: Reflection;
  setReflection: (r: Reflection) => void;
  priority: PriorityId | null;
  alloc: Alloc;
  warranty: WarrantyId;
  startInno: string[];
  budget: Budget;
  crisisLive: boolean;
  crisis: CrisisInput;
  onClose: () => void;
  busy?: boolean;
  error?: string | null;
}) {
  const ready = reflectionComplete(reflection);
  const crisisUnanswered = crisisLive && !crisis.strategy;
  const blocked = crisisUnanswered || !ready || busy;

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow tone="text-rose-800">Before you commit</Eyebrow>
        <h2 className="font-serif text-3xl">Close quarter {quarter}</h2>
      </div>

      <ReadinessGrid dirs={dirs} />

      <Panel eyebrow="Likely effect" title="What this plan looks like from here">
        <p className="text-sm text-stone-600">
          You will not see the revenue, profit or cash until the quarter closes. What you can see is where the plan is
          tight and where it has room, above. If three of those read CONSTRAINED or CRITICAL, the quarter will probably
          disappoint you somewhere.
        </p>
      </Panel>

      <Inbox messages={inbox} limit={4} eyebrow="Still outstanding" title="What your team is still saying" />

      <ReflectionForm
        constraint={constraint}
        reflection={reflection}
        setReflection={setReflection}
        priority={priority}
        alloc={alloc}
      />

      <BudgetMeter budget={budget} />
      <ReconciliationPanel alloc={alloc} warranty={warranty} startInno={startInno} />

      {budget.committed > budget.ceiling && (
        <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          You are {inr(budget.committed - budget.ceiling)} beyond what the balance sheet supports. You can still commit —
          the buffer takes it, and the record will show it.
        </div>
      )}

      {crisisUnanswered && (
        <div className="border-l-4 border-amber-600 bg-amber-50 px-4 py-3 text-sm text-stone-800">
          There is a market event live and you have not decided how to answer it.
        </div>
      )}

      {error && <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      <button
        onClick={onClose}
        disabled={blocked}
        className={"w-full py-4 font-serif text-xl " + (blocked ? "bg-stone-200 text-stone-400" : "bg-stone-900 text-white hover:bg-rose-900")}
      >
        {busy
          ? "Closing the quarter…"
          : ready
            ? "Close quarter " + quarter
            : "Answer the questions above to close the quarter"}
      </button>
    </div>
  );
}
