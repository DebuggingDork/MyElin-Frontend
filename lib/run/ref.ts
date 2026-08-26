/**
 * The public handle for a run: the owner's run number (`/run/2`), not the uuid.
 *
 * `seq` is assigned once by the backend and never reassigned, so it is a stable, ownable label
 * -- but it is only a label. Nothing below ever sends it to the API: every call still takes the
 * uuid, which is what this module resolves the number back into. Keeping that translation in one
 * place is the point; if a component ever needs to build a `/run/...` href it should reach for
 * `runHref`, and if it needs to call the API it should reach for the `companyId` the provider
 * already resolved.
 */

import { api } from "@/lib/api/client";
import type { CompanyListItem } from "@/lib/api/types";

/** A run number as it appears in a URL. */
const RUN_NUMBER = /^[1-9]\d*$/;

export function isRunNumber(ref: string): boolean {
  return RUN_NUMBER.test(ref);
}

export function runHref(ref: string | number, path = ""): string {
  return `/run/${ref}${path}`;
}

export type ResolvedRun = {
  /** The uuid. The only value any API path takes. */
  companyId: string;
  /** What the URL should say. The run number when this caller owns the run; otherwise the uuid
   *  it was given, so an instructor's deep link keeps working rather than 404ing. */
  ref: string;
  /** True when `ref` differs from the segment in the URL, i.e. the URL should be rewritten. */
  canonical: boolean;
};

/**
 * One in-memory copy of the caller's run list, shared by every resolution in a session.
 *
 * Client-side navigation between run screens re-runs the provider, and refetching the whole
 * list each time would put a request in front of every screen change for an answer that cannot
 * have changed. A hard refresh starts from empty and pays the one request -- which is the case
 * that has to work from the URL alone, and does.
 */
let cached: Promise<CompanyListItem[]> | null = null;

function ownedRuns(): Promise<CompanyListItem[]> {
  if (!cached) {
    cached = api
      .listCompanies({ limit: 1000 })
      .then(({ entries }) => entries)
      .catch((err) => {
        // Never cache a failure: a request that failed because the token was mid-refresh must
        // not poison every later resolution in the session.
        cached = null;
        throw err;
      });
  }
  return cached;
}

/** Drop the cached list after starting a run, so the new number resolves immediately. */
export function forgetRunIndex() {
  cached = null;
}

export class UnknownRunError extends Error {
  constructor(ref: string) {
    super(`Run ${ref} is not one of yours.`);
    this.name = "UnknownRunError";
  }
}

/**
 * Turn whatever the URL carries into the uuid the API needs.
 *
 * A number is looked up in the caller's own runs. A uuid is passed straight through -- so links
 * that predate the numbered URLs, and instructor links to runs the caller does not own, keep
 * resolving -- and is reported back with its number when the caller does own it, which is what
 * lets the URL be rewritten into the readable form.
 */
export async function resolveRunRef(ref: string): Promise<ResolvedRun> {
  if (isRunNumber(ref)) {
    const number = Number(ref);
    const match = (await ownedRuns()).find((r) => r.seq === number);
    if (!match) throw new UnknownRunError(ref);
    return { companyId: match.id, ref, canonical: true };
  }

  // A uuid. Usable as-is; the lookup is only to find the number to rewrite the URL to.
  const owned = await ownedRuns().catch(() => [] as CompanyListItem[]);
  const match = owned.find((r) => r.id === ref);
  return match
    ? { companyId: ref, ref: String(match.seq), canonical: false }
    : { companyId: ref, ref, canonical: true };
}
