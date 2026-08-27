"use client";

/**
 * The last screen before the quarter is committed: where the plan is tight, what the team is
 * still saying, the reflection that gets compared against the outcome, and — because this
 * run is recorded against the MyElin API — exactly what will be sent when you press close.
 */

import { inr } from "@/lib/simulation/format";
import { balanceCommitted, balanceOpening } from "@/lib/simulation/balance";
import { BalanceSheetDoc } from "@/components/simulation/BalanceSheetDoc";
import { BudgetMeter, Eyebrow, Inbox, Panel, ReadinessGrid } from "@/components/simulation/Kit";
import { ReflectionForm, reflectionComplete } from "@/components/simulation/Panels";
import { AlertTriangle } from "lucide-react";
import type {
  Alloc,
  Budget,
  CompanyState,
  Constraint,
  CrisisInput,
  InboxMessage,
  PriorityId,
  Readiness,
  Reflection,
} from "@/lib/simulation/types";
import { Spinner } from "@/components/ui/Loading";

export function ReviewScreen({
  quarter,
  state,
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
  readOnly,
}: {
  quarter: number;
  state: CompanyState;
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
  readOnly?: boolean;
}) {
  const ready = reflectionComplete(reflection);
  const crisisUnanswered = crisisLive && !crisis.strategy;
  const blocked = crisisUnanswered || !ready || busy || readOnly;

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
        readOnly={readOnly}
      />

      <BudgetMeter budget={budget} />

      {/* The sheet, before the quarter runs.
          Everything committed is on it -- plant, the innovation board, credit drawn, a signed
          investment, and the operating spend that leaves both the bank and the reserves. What
          is deliberately *not* on it is the quarter's outcome: revenue, profit and closing cash
          stay sealed until the quarter locks, which is the whole design. */}
      <BalanceSheetDoc
        title="Balance sheet"
        caption={"As it stands before you close quarter " + quarter}
        openLabel="As at open"
        closeLabel="With this plan"
        open={balanceOpening(state)}
        close={balanceCommitted(state, budget)}
        note={
          <>
            The second column is your plan applied to the opening sheet — every rupee you have
            committed, and nothing the quarter has yet to decide. Revenue, profit and closing
            cash arrive when you close it.
          </>
        }
      />

      {budget.committed > budget.ceiling && (
        <div className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-tone-bad">
          You are {inr(budget.committed - budget.ceiling)} beyond what the balance sheet supports. You can still commit —
          the buffer takes it, and the record will show it.
        </div>
      )}

      {crisisUnanswered && (
        <div className="border-l-4 border-amber bg-amber/15 px-5 py-4 text-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-ink">Action Required: Market Event</p>
              <p className="text-ink/90 leading-relaxed">
                A market event is active this quarter. You must go to the{" "}
                <strong className="text-amber">Market event</strong> section in the sidebar 
                and decide how to respond before you can close this quarter.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm text-tone-bad">{error}</div>}

      {/* Disabled on `busy` through `blocked`, so the quarter cannot be submitted twice from
          here. The engine-side guard is in `SimulationApp.closeQuarter`. */}
      <button
        onClick={onClose}
        disabled={blocked}
        className={
          "flex w-full items-center justify-center gap-3 py-4 font-serif text-xl transition-colors " +
          (blocked ? "bg-raise-2 text-faint" : "bg-chrome text-white hover:bg-danger-deep")
        }
      >
        {busy && <Spinner size="md" />}
        {busy
          ? "Closing the quarter…"
          : ready
            ? "Close quarter " + quarter
            : "Answer the questions above to close the quarter"}
      </button>
    </div>
  );
}
