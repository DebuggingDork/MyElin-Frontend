import { EndgameView } from "@/components/run/EndgameView";
import { Action } from "@/components/ui/Kit";

type Props = {
  params: Promise<{ runRef: string; quarterId: string }>;
};

export default async function EndgamePage({ params }: Props) {
  const { runRef, quarterId } = await params;
  return (
    <div className="space-y-8">
      <EndgameView />
      <footer className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Action
          variant="outline"
          href={`/run/${runRef}/quarter/${quarterId}/briefing`}
        >
          ← Briefing
        </Action>
        <Action href={`/run/${runRef}/quarter/${quarterId}/lock`}>
          Continue to lock →
        </Action>
      </footer>
    </div>
  );
}
