"use client";

import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";

/**
 * The "next" action after the last department (finance_admin). Routes through the crisis
 * screen when this quarter is the scenario's crisis quarter -- the guide's documented step
 * order is "6 departments, crisis (Q3 only), then lock" (frontend-integration-guide.md section
 * 1); without this, the wizard's own forward chain skipped straight to /lock and the crisis
 * screen was only reachable via the sidebar, which a student clicking "next" repeatedly would
 * never see.
 */
export function NextAfterAllocationLink({
  companyId,
  quarterId,
}: {
  companyId: string;
  quarterId: string;
}) {
  const { run } = useRun();
  const isCrisisQuarter =
    run?.crisis_quarter != null && run.crisis_quarter === run.current_quarter_number;

  if (isCrisisQuarter) {
    return (
      <Action href={`/run/${companyId}/quarter/${quarterId}/crisis`}>
        Crisis response →
      </Action>
    );
  }

  return (
    <Action href={`/run/${companyId}/quarter/${quarterId}/lock`}>
      Lock quarter →
    </Action>
  );
}
