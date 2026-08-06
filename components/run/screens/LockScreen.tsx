"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Action, Eyebrow } from "@/components/ui/Kit";
import { DEPARTMENTS, formatLakhs, asNumber } from "@/lib/api/catalog";
import { useRun } from "@/components/run/RunProvider";

/** Screen: confirm then navigate to processing which calls POST …/lock. */
export function LockScreen({ quarterId }: { quarterId: string }) {
  const router = useRouter();
  const { companyId, run, quarter, can } = useRun();
  const [armed, setArmed] = useState(false);

  const alloc = quarter?.allocations;
  const lines = alloc
    ? Object.entries(alloc).filter(
        ([k, v]) => k !== "warranty_years" && asNumber(v) > 0,
      )
    : [];

  return (
    <div className="space-y-6">
      <header>
        <Eyebrow accent="violet">POST …/lock · irreversible compute</Eyebrow>
        <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">
          Lock Q{run?.current_quarter_number ?? "—"}
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-dim">
          This is the single mutating action that runs the simulation engine.
          Unsubmitted lines stay at ₹0. The call is idempotent — locking again
          returns the same report.
        </p>
      </header>

      <div className="rounded-xl border border-line bg-raise/50 p-5">
        <p className="eyebrow text-faint">Submitted spend so far</p>
        {lines.length === 0 ? (
          <p className="mt-3 text-[13px] text-dim">
            No non-zero allocations yet — locking will run with all zeros
            (legal, inert).
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {lines.map(([key, val]) => (
              <li
                key={key}
                className="flex justify-between text-[12.5px] text-dim"
              >
                <span>{key}</span>
                <span className="num text-ink">{formatLakhs(val)}</span>
              </li>
            ))}
          </ul>
        )}
        {quarter?.warranty_years != null && quarter.warranty_years > 0 && (
          <p className="mt-3 text-[12.5px] text-dim">
            warranty_years:{" "}
            <span className="text-ink">{quarter.warranty_years}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map((d) => (
          <Action
            key={d.id}
            variant="ghost"
            href={`/run/${companyId}/quarter/${quarterId}/allocate/${d.id}`}
          >
            Edit {d.name}
          </Action>
        ))}
      </div>

      {!armed ? (
        <Action
          onClick={() => setArmed(true)}
          disabled={!can("lock_quarter")}
        >
          <Landmark className="h-4 w-4" />
          Confirm lock
        </Action>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Action variant="outline" onClick={() => setArmed(false)}>
            Back
          </Action>
          <Action
            onClick={() =>
              router.push(
                `/run/${companyId}/quarter/${quarterId}/processing`,
              )
            }
          >
            Lock quarter — run the engine
          </Action>
        </div>
      )}

      {!can("lock_quarter") && (
        <p className="text-[13px] text-amber">
          lock_quarter is not in legal_moves — the quarter may already be
          closed, or no quarter is open.
        </p>
      )}
    </div>
  );
}
