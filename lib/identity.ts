/**
 * Who the signed-in person is, in one place.
 *
 * The account menu used to fetch the profile only when it was *opened*, so the chip in the nav
 * — the one thing on screen at all times — could never show anything but the email address,
 * however long ago the name had been saved. And the profile page kept its own copy, so saving
 * a name there left the chip stale until a reload.
 *
 * One cached profile, loaded once per session, shared by both, and updated in place when the
 * profile page saves. Same module-store shape `AuthProvider` already uses, for the same
 * reason: it has to survive remounts of the components that read it.
 */

import { api } from "@/lib/api/client";
import type { ProfileResponse } from "@/lib/api/types";

let cached: ProfileResponse | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeIdentity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The snapshot `useSyncExternalStore` renders from. Stable between notifications. */
export function identitySnapshot(): ProfileResponse | null {
  return cached;
}

/** The server has no session to read, so it always renders the email fallback. */
export function identityServerSnapshot(): ProfileResponse | null {
  return null;
}

/** Fetch once per session. Safe to call from every mount -- later calls are no-ops. */
export function primeIdentity(): void {
  if (cached || inflight) return;
  inflight = api
    .getProfile()
    .then((profile) => {
      cached = profile;
      emit();
    })
    .catch(() => {
      // A profile that will not load is not worth an error on a nav bar: the email fallback
      // below still names the account.
    })
    .finally(() => {
      inflight = null;
    });
}

/** Called by the profile page after a successful save, so the chrome updates with the form. */
export function setIdentity(profile: ProfileResponse | null): void {
  cached = profile;
  emit();
}

/** Called when the session changes. A stale name under a new session is worse than none. */
export function clearIdentity(): void {
  cached = null;
  inflight = null;
  emit();
}

/**
 * A name to greet someone by, from an address like `mamidala.mani1355@…`.
 *
 * Used only when no first name has been saved. It reads the local part rather than inventing
 * anything: split on the separators people actually use, drop the digits that make an address
 * unique rather than descriptive, and take the first word. Display only -- never stored, and
 * the saved name always wins.
 */
export function nameFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? "").trim();
  const word = local
    .split(/[._\-+]/)
    .map((part) => part.replace(/\d+$/, ""))
    .find((part) => part.length >= 2);
  if (!word) return local || "there";
  return word[0].toUpperCase() + word.slice(1);
}

/** What the chip, the menu header and the profile masthead all call this person. */
export function displayName(profile: ProfileResponse | null, email: string): string {
  return profile?.first_name?.trim() || nameFromEmail(email);
}

/** Up to two letters for the avatar: the saved name first, the address only as a fallback. */
export function initials(email: string, firstName?: string | null): string {
  if (firstName?.trim()) {
    const parts = firstName.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._\-+]/).filter(Boolean);
  const chars = parts.length >= 2 ? [parts[0]?.[0], parts[1]?.[0]] : [local[0], local[1]];
  return chars.filter(Boolean).join("").toUpperCase() || "?";
}
