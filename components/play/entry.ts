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
  const { user, ready } = useAuth();
  const target = playHref(slug);
  return ready && !user ? `/login?next=${encodeURIComponent(target)}` : target;
}

/**
 * The direct "start the simulation" link, used by means that deliberately open the play flow
 * (rather than the track-traffic-to-pricing route `useSimulationHref` points every other
 * control at). This is the original auth-aware entry: an authenticated visitor lands on the
 * scenario's setup screen, and a signed-out one is sent to login with `next=` carrying them
 * back to the same scenario afterwards.
 *
 * Falls back to the play URL until auth has hydrated, which is also what the server renders --
 * so the link is never a dead end, it just may cost the signed-out visitor one redirect on a
 * click made in the first tick after paint.
 */
export function usePlaySimulationHref(slug: string = LIVE_SCENARIO) {
  const { user, ready } = useAuth();
  const target = playHref(slug);
  return ready && !user ? `/login?next=${encodeURIComponent(target)}` : target;
}
