import { Suspense } from "react";
import { NadiApp } from "@/components/nadi/NadiApp";

/**
 * The Nadi Wear four-quarter simulation, running inside the existing run shell against the
 * same company id every other run screen uses.
 *
 * `NadiApp` reads the active screen from `?tab=`, so it needs a Suspense boundary
 * (`useSearchParams` opts the subtree out of static rendering without one).
 */
export default function NadiPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-dim">Loading the simulation…</div>}
    >
      <NadiApp />
    </Suspense>
  );
}
