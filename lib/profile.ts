/**
 * The signup onboarding answers (screen 2 of `/signup`).
 *
 * `OnboardingProfile` now POSTs these to `PATCH /profile` on submit (fire-and-forget, matching
 * this screen's own "nothing here blocks getting in" design) -- the local copy below is a
 * best-effort fallback for whenever that request fails, never the primary record. Shapes match
 * what the directory/analytics questions ("2,840 students from 47 institutions") need: ids, not
 * prose.
 */

import type { InstitutionRef } from "@/lib/institutions";

const PROFILE_KEY = "myelin_profile";

/**
 * The row every picker in the signup flow ends with: not an answer in itself, the way in for
 * the one the list is missing. Selecting it opens a text field, and what gets typed there is
 * what the profile stores — this string is never submitted.
 */
export const OTHER_OPTION = "Others";

export const goalOptions = [
  "Decision-making",
  "Strategic thinking",
  "Problem-solving",
  "Leadership",
  "Financial thinking",
  "Communication",
  "Negotiation",
  "Risk-taking",
  "Adaptability",
  "Entrepreneurship",
] as const;

export type Goal = (typeof goalOptions)[number];

export const MAX_GOALS = 3;

export const degreeOptions = [
  "B.Tech / B.E.",
  "B.Sc",
  "B.Com",
  "BBA",
  "BA",
  "BCA",
  "B.Des",
  "LLB",
  "MBBS",
  "M.Tech / M.E.",
  "M.Sc",
  "M.Com",
  "MBA / PGDM",
  "MCA",
  "MA",
  "PhD",
] as const;

/**
 * The trailing "Other" row is gone from the list above on purpose: it was a dead end that
 * stored the literal string "Other" and told the directory nothing. Every picker now appends
 * its own `OTHER_OPTION` row, which opens a text field and stores what the student types.
 * A profile saved with the old literal still loads — the picker reads any value outside the
 * list as a custom one and drops it into that field, ready to be corrected.
 */
export const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Postgraduate",
  "Graduated",
] as const;

export type OnboardingProfile = {
  user_id: string | null;
  email: string | null;
  first_name: string;
  institution: InstitutionRef | null;
  degree: string | null;
  current_year: string | null;
  /** At most `MAX_GOALS` entries, from `goalOptions`. */
  goals: string[];
  captured_at: string;
};

export function saveProfile(profile: OnboardingProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // A full or blocked localStorage must never cost someone their account — the answers
    // are a nice-to-have, the registration above them already succeeded.
  }
}

export function getProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}
