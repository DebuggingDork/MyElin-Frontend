import { CrisisWorkspace } from "@/components/run/AllocationForm";
import { Action } from "@/components/ui/Kit";

type Props = {
  params: Promise<{ runRef: string; quarterId: string }>;
};

export default async function CrisisPage({ params }: Props) {
  const { runRef, quarterId } = await params;
  return (
    <div className="space-y-8">
      <CrisisWorkspace />
      <footer className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Action
          variant="outline"
          href={`/run/${runRef}/quarter/${quarterId}/allocate/finance_admin`}
        >
          ← Finance & Admin
        </Action>
        <Action href={`/run/${runRef}/quarter/${quarterId}/lock`}>
          Continue to lock →
        </Action>
      </footer>
    </div>
  );
}
