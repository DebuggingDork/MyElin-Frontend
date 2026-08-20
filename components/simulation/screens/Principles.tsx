"use client";

/** The reference tab: every teaching note in one place, grouped by category. */

import { TEACHING_NOTES } from "@/lib/simulation/constants";
import { Eyebrow, Panel } from "@/components/simulation/Kit";

export function PrinciplesScreen() {
  const categories: string[] = [];
  Object.values(TEACHING_NOTES).forEach((n) => {
    if (categories.indexOf(n.cat) < 0) categories.push(n.cat);
  });

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow tone="text-danger-deep">Reference</Eyebrow>
        <h2 className="font-serif text-3xl text-ink">Every principle the model is built on</h2>
        <p className="text-sm text-dim mt-1 max-w-2xl">
          These explain how the business behaves, not what you should do about it. Each one also appears in context on
          the screen it applies to.
        </p>
      </div>

      {categories.map((cat) => {
        const notes = Object.entries(TEACHING_NOTES).filter(([, n]) => n.cat === cat);
        return (
          <Panel key={cat} eyebrow={cat} title={notes.length + " principles"}>
            <div className="space-y-4">
              {notes.map(([id, note]) => (
                <div key={id} className="border-l-2 border-line pl-3">
                  <div className="font-serif text-base text-ink">{note.title}</div>
                  <p className="text-sm text-ink mt-1 leading-snug">{note.body}</p>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
