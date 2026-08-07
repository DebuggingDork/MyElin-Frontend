import { notFound } from "next/navigation";
import { AllocationWorkspace } from "@/components/run/AllocationForm";
import { NextAfterAllocationLink } from "@/components/run/NextAfterAllocationLink";
import { DEPARTMENTS, type DeptId } from "@/lib/api/catalog";
import { Action } from "@/components/ui/Kit";

type Props = {
  params: Promise<{ companyId: string; quarterId: string; dept: string }>;
};

export default async function AllocateDeptPage({ params }: Props) {
  const { companyId, quarterId, dept } = await params;
  if (!DEPARTMENTS.some((d) => d.id === dept)) notFound();

  const index = DEPARTMENTS.findIndex((d) => d.id === dept);
  const next = DEPARTMENTS[index + 1];
  const prev = DEPARTMENTS[index - 1];

  return (
    <div className="space-y-8">
      <AllocationWorkspace deptId={dept as DeptId} />
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Action
            variant="outline"
            href={`/run/${companyId}/quarter/${quarterId}/allocate/${prev.id}`}
          >
            ← {prev.name}
          </Action>
        ) : (
          <Action
            variant="outline"
            href={`/run/${companyId}/quarter/${quarterId}/briefing`}
          >
            ← Briefing
          </Action>
        )}
        {next ? (
          <Action
            href={`/run/${companyId}/quarter/${quarterId}/allocate/${next.id}`}
          >
            {next.name} →
          </Action>
        ) : (
          <NextAfterAllocationLink companyId={companyId} quarterId={quarterId} />
        )}
      </footer>
    </div>
  );
}
