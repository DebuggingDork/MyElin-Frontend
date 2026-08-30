"use client";

import { useAuth } from "@/components/auth/AuthProvider";

/** The one scenario that is actually playable, and the only place its slug is written down. */
export const LIVE_SCENARIO = "startup-survival";

export const playHref = (slug: string = LIVE_SCENARIO) => `/play/${slug}`;

/**
 * Where a "run the simulation" control should point for *this* visitor.
 *
 * `/play/[slug]` refuses to open its setup screen without a session and redirects, so this is
 * not what makes the flow safe -- `PlayExperience` is. What it removes is the flash: a
 * signed-out visitor clicking Simulation lands on the auth screen directly instead of watching
 * a hand-off frame first, and `next=` carries them back to the same scenario afterwards.
 *
 * Falls back to the play URL until auth has hydrated, which is also what the server renders --
 * so the link is never a dead end, it just may cost the signed-out visitor one redirect on a
 * click made in the first tick after paint.
 */
export function useSimulationHref(slug: string = LIVE_SCENARIO) {
  // Routes traffic tracking to /pricing as we are not giving anything free directly to students
  return "/pricing";
}
