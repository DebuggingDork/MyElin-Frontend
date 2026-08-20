"use client";

/**
 * The last screen before the quarter is committed: where the plan is tight, what the team is
 * still saying, the reflection that gets compared against the outcome, and — because this
 * run is recorded against the MyElin API — exactly what will be sent when you press close.
 */

import { inr } from "@/lib/simulation/format";
import { BudgetMeter, Eyebrow, Inbox, Panel, ReadinessGrid } from "@/components/simulation/Kit";
import { ReflectionForm, reflectionComplete } from "@/components/simulation/Panels";
import type {
  Alloc,
  Budget,
  Constraint,
  CrisisInput,
  InboxMessage,
  PriorityId,
  Readiness,
  Reflection,
} from "@/lib/simulation/types";

export function ReviewScreen({
  quarter,
  dirs,
  inbox,
  constraint,
  reflection,
  setReflection,
  priority,
  alloc,
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
        <Eyebrow tone="text-tone-bad">Before you commit</Eyebrow>
        <h2 className="font-serif text-3xl text-ink">Close quarter {quarter}</h2>
      </div>

      <ReadinessGrid dirs={dirs} />

      <Panel eyebrow="Likely effect" title="What this plan looks like from here">
        <p className="text-sm text-dim">
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

      {budget.committed > budget.ceiling && (
        <div className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-tone-bad">
          You are {inr(budget.committed - budget.ceiling)} beyond what the balance sheet supports. You can still commit —
          the buffer takes it, and the record will show it.
        </div>
      )}

      {crisisUnanswered && (
        <div className="border-l-4 border-ember bg-ember/10 px-4 py-3 text-sm text-ink">
          There is a market event live and you have not decided how to answer it.
        </div>
      )}

      {error && <div className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-tone-bad">{error}</div>}

      <button
        onClick={onClose}
        disabled={blocked}
        className={"w-full py-4 font-serif text-xl " + (blocked ? "bg-raise-2 text-faint" : "bg-chrome text-white hover:bg-danger-deep")}
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
