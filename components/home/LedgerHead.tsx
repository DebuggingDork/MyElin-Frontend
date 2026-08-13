import { cn } from "@/lib/utils";

/**
 * Section heading for the ledger page.
 *
 * Two columns rather than one left-aligned stack. Every section on the old page put a
 * `max-w-3xl` heading inside an `88rem` container, which left a dead right-hand column
 * running the full height of the page four times over; the deck now occupies it. The
 * rule above the pair is the section division, so sections need no other separator.
 *
 * Deliberately has no eyebrow and no 001/002 counter: the headline names the section,
 * and the four sections are not a sequence.
 */
export function LedgerHead({
  title,
  deck,
  action,
  className,
}: {
  title: React.ReactNode;
  deck?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line pt-8", className)}>
      <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <h2 className="ledger-display text-balance text-[clamp(2rem,4.6vw,3.5rem)] text-ink">
          {title}
        </h2>

        {(deck || action) && (
          <div className="lg:pt-2">
            {deck && (
              <div className="max-w-[46ch] space-y-4 text-pretty text-[15.5px] leading-[1.7] text-dim">
                {deck}
              </div>
            )}
            {action && <div className="mt-6">{action}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
