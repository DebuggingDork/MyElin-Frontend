import { Container } from "@/components/ui/Kit";

/**
 * The edition line every page opens with: what this page is on the left, what state the
 * product is in on the right.
 *
 * It exists because the pages had nothing under the nav but padding -- 68px of fixed bar and
 * then another 96px of empty container before the first word. A newspaper puts its edition
 * line immediately above the fold, and so does this: the strip closes the gap with something
 * that carries information, and gives every page the same opening rhythm.
 */
export function Masthead({
  section,
  status = "S-25 cohort open",
}: {
  section: string;
  status?: string;
}) {
  return (
    <div className="relative z-10 border-b border-line">
      <Container
        wide
        className="flex flex-wrap items-center justify-between gap-3 py-3"
      >
        <p className="tick-label">Myelin · {section}</p>
        <p className="tick-label flex items-center gap-2">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal" />
          {status}
        </p>
      </Container>
    </div>
  );
}

/**
 * A page's headline figures, set as a ledger footing: hairline-divided columns, monospace
 * numerals, label under value. No cards, no icons, no tinted panels -- the rules do the work.
 *
 * `stagger` walks the entrance across the columns; it is CSS-driven (`rise`), so the figures
 * are painted on the first frame rather than waiting for hydration.
 */
export function Figures({
  items,
  stagger = false,
}: {
  items: { value: string; label: string }[];
  stagger?: boolean;
}) {
  return (
    <div className="relative z-10 border-t border-line">
      <Container wide className="px-0 sm:px-0">
        <dl className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
          {items.map((figure, i) => (
            <div
              key={figure.label}
              className={
                "px-5 py-7 first:border-l-0 sm:px-8 rise " +
                (stagger ? ["", "rise-1", "rise-2", "rise-3"][i % 4] : "rise-3")
              }
            >
              <dt className="num text-[clamp(1.9rem,3vw,2.6rem)] leading-none text-ink">
                {figure.value}
              </dt>
              <dd className="tick-label mt-3">{figure.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
