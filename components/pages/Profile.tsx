"use client";

/**
 * Account settings: the onboarding answers, editable, plus a read-only history of every run
 * this user has started. `GET /companies` is already owner-scoped, so "previous simulations"
 * reads the same list `ProfileMenu`'s mini-summary and the leaderboard already read -- there is
 * no separate history endpoint to keep in sync with it.
 *
 * Set in the same ledger vocabulary as the rest of the site: masthead under the nav, hairline
 * rules instead of stacked cards, monospace for anything that is a figure. Both themes come
 * from the shared tokens, so nothing here hard-codes a colour.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { InstitutionSelect } from "@/components/auth/InstitutionSelect";
import { SelectField } from "@/components/auth/OnboardingProfile";
import { api } from "@/lib/api/client";
import { runHref } from "@/lib/run/ref";
import type { CompanyListItem, ProfileResponse, RunStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { formatDecimal, humanizeId } from "@/lib/format/display";
import type { InstitutionRef } from "@/lib/institutions";
import { MAX_GOALS, degreeOptions, goalOptions, yearOptions } from "@/lib/profile";
import { displayName, setIdentity } from "@/lib/identity";
import { Masthead } from "@/components/layout/PageChrome";
import { Action, Container } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";
import { ButtonSpinner, InlineLoading } from "@/components/ui/Loading";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

/** Teal is the live system, vermilion is what it costs you -- the same rule the run screens use. */
const RUN_STATUS_TONE: Record<RunStatus, string> = {
  active: "text-teal",
  distressed: "text-ember-soft",
  failed: "text-ember",
  completed: "text-dim",
};

/** One label-over-value row. The whole page is built from these plus the rules between them. */
function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="tick-label">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Profile() {
  const { user, ready } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [runs, setRuns] = useState<CompanyListItem[] | null>(null);
  const [runsError, setRunsError] = useState<string | null>(null);

  // Draft form state, seeded from `profile` once it loads.
  const [firstName, setFirstName] = useState("");
  const [institution, setInstitution] = useState<InstitutionRef | null>(null);
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await api.getProfile();
        if (cancelled) return;
        setProfile(res);
        setIdentity(res);
        setFirstName(res.first_name ?? "");
        setInstitution(res.institution);
        setDegree(res.degree ?? "");
        setYear(res.current_year ?? "");
        setGoals(res.goals);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    void (async () => {
      try {
        const { entries } = await api.listCompanies();
        if (!cancelled) setRuns(entries);
      } catch (err) {
        if (!cancelled) setRunsError(err instanceof ApiError ? err.message : "Could not load your runs");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  function toggleGoal(goal: string) {
    setSaved(false);
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((g) => g !== goal)
        : current.length >= MAX_GOALS
          ? current
          : [...current, goal],
    );
  }

  const onSave = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setSaving(true);
      setSaveError(null);
      setSaved(false);
      try {
        const res = await api.updateProfile({
          // Degree and year can now be typed rather than picked, so they arrive exactly as
          // they were keyed -- and an "Others" row opened but never filled in leaves an
          // empty string. Both save as `null` rather than as a blank row.
          first_name: firstName || null,
          institution,
          degree: degree.trim() || null,
          current_year: year.trim() || null,
          goals,
        });
        setProfile(res);
        // Publish it: the account menu in the nav reads the same store, so the chip changes
        // name with the form rather than on the next reload.
        setIdentity(res);
        setSaved(true);
      } catch (err) {
        setSaveError(err instanceof ApiError ? err.message : "Could not save your changes");
      } finally {
        setSaving(false);
      }
    },
    [firstName, institution, degree, year, goals],
  );

  const completed = runs?.filter((r) => r.run_status === "completed").length ?? 0;

  return (
    <>
      {/* ── the opening band ──────────────────────────────────────── */}
      <section className="relative border-b border-line pt-[68px]">
        <div className="grid-lines absolute inset-0" />
        <Masthead section="Account" status={user ? "Signed in" : "Signed out"} />

        <Container
          wide
          className="relative z-10 grid gap-x-16 gap-y-8 py-[clamp(2.5rem,6vh,4.5rem)] lg:grid-cols-[1.15fr_1fr] lg:items-end"
        >
          <div>
            <h1 className="ledger-display rise text-balance text-[clamp(2.2rem,4.8vw,3.8rem)] text-ink">
              {user ? (
                <>
                  {displayName(profile, user.email)},{" "}
                  <span className="italic text-teal">this is you.</span>
                </>
              ) : (
                <>
                  Your <span className="italic text-teal">profile.</span>
                </>
              )}
            </h1>
            <div className="rise rise-1 mt-7 max-w-[48ch] border-t border-line pt-6">
              <p className="text-pretty text-[16px] leading-[1.7] text-dim">
                What we collected at signup, editable any time, and every run you
                have started.
              </p>
            </div>
          </div>

          {/* The identity readout. Facts you cannot edit, so they are set as a ledger rather
              than as fields you might mistake for one. */}
          {user && (
            <dl className="rise rise-2 border border-line bg-[var(--panel)]">
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
                <dt className="tick-label">Name</dt>
                <dd className="min-w-0 truncate text-[13.5px] text-ink">
                  {displayName(profile, user.email)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
                <dt className="tick-label">Email</dt>
                <dd className="min-w-0 truncate text-[13.5px] text-dim">{user.email}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
                <dt className="tick-label">Role</dt>
                <dd className="text-[13.5px] text-ink">
                  {profile?.role ? humanizeId(profile.role) : "Student"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
                <dt className="tick-label">Member since</dt>
                <dd className="num text-[13px] text-ink">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                <dt className="tick-label">Runs</dt>
                <dd className="num text-[13px] text-ink">
                  {runs === null ? "—" : `${runs.length} started · ${completed} closed`}
                </dd>
              </div>
            </dl>
          )}
        </Container>
      </section>

      {/* ── the sheet ─────────────────────────────────────────────── */}
      <section className="relative">
        <Container wide className="relative z-10 py-[clamp(3rem,6vw,5rem)]">
          {!user && (
            <div className="border border-line px-6 py-12 text-center">
              <p className="text-[15px] text-dim">Log in to see your profile.</p>
              <div className="mt-6 flex justify-center">
                <Action href="/login?next=/profile">Log in</Action>
              </div>
            </div>
          )}

          {user && loading && <InlineLoading label="Loading your profile…" />}

          {user && !loading && loadError && (
            <p className="border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
              {loadError}
            </p>
          )}

          {user && !loading && !loadError && (
            <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1fr_360px]">
              {/* ── the editable half ── */}
              <form onSubmit={onSave}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                  <p className="tick-label">Your Background</p>
                  <p className="tick-label">Editable</p>
                </div>
                
                <div className="space-y-8 pt-8 pb-14 text-sm">
                  <Field label="Current status">
                     <div className="w-full border border-line bg-[var(--field)] px-4 py-3.5 text-[14px] text-ink cursor-not-allowed opacity-80 flex items-center justify-between">
                       <span>Student</span>
                       <span className="text-xs text-dim italic">Derived from account role</span>
                     </div>
                  </Field>
                  <Field label="Work experience">
                    <input
                      type="text"
                      maxLength={120}
                      onChange={() => setSaved(false)}
                      placeholder="e.g. 2 years in marketing"
                      className="w-full border border-line bg-[var(--field)] px-4 py-3.5 text-[14px] text-ink placeholder:text-faint focus:border-teal focus:outline-none"
                    />
                  </Field>
                  <Field label="Current role / designation">
                    <input
                      type="text"
                      maxLength={120}
                      onChange={() => setSaved(false)}
                      placeholder="What is your current role?"
                      className="w-full border border-line bg-[var(--field)] px-4 py-3.5 text-[14px] text-ink placeholder:text-faint focus:border-teal focus:outline-none"
                    />
                  </Field>
                  <Field label="Industry / sector">
                    <input
                      type="text"
                      maxLength={120}
                      onChange={() => setSaved(false)}
                      placeholder="Which industry do you operate in?"
                      className="w-full border border-line bg-[var(--field)] px-4 py-3.5 text-[14px] text-ink placeholder:text-faint focus:border-teal focus:outline-none"
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                  <p className="tick-label">Educational details</p>
                  <p className="tick-label">Editable</p>
                </div>

                <div className="space-y-8 pt-8">
                  <Field label="First name">
                    <input
                      id="profile-first-name"
                      type="text"
                      maxLength={120}
                      value={firstName}
                      onChange={(e) => {
                        setSaved(false);
                        setFirstName(e.target.value);
                      }}
                      placeholder="What should we call you?"
                      className="w-full border border-line bg-[var(--field)] px-4 py-3.5 text-[14px] text-ink placeholder:text-faint focus:border-teal focus:outline-none"
                    />
                  </Field>

                  <Field label="College / University">
                    <InstitutionSelect
                      id="profile-institution"
                      value={institution}
                      onChange={(value) => {
                        setSaved(false);
                        setInstitution(value);
                      }}
                    />
                  </Field>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <SelectField
                      id="profile-degree"
                      label="Degree / Program"
                      placeholder="Select your degree"
                      value={degree}
                      options={degreeOptions}
                      onChange={(v) => {
                        setSaved(false);
                        setDegree(v);
                      }}
                      customNoun="degree"
                    />
                    <SelectField
                      id="profile-year"
                      label="Current year"
                      placeholder="Select your year"
                      value={year}
                      options={yearOptions}
                      onChange={(v) => {
                        setSaved(false);
                        setYear(v);
                      }}
                      customNoun="year"
                    />
                  </div>

                  <fieldset>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <legend className="tick-label">What do you want to get better at?</legend>
                      <span className="num text-[11.5px] text-faint">
                        {goals.length}/{MAX_GOALS}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {goalOptions.map((goal) => {
                        const selected = goals.includes(goal);
                        const blocked = !selected && goals.length >= MAX_GOALS;
                        return (
                          <button
                            key={goal}
                            type="button"
                            role="checkbox"
                            aria-checked={selected}
                            disabled={blocked}
                            onClick={() => toggleGoal(goal)}
                            className={cn(
                              "border px-4 py-2.5 text-[13.5px] transition-colors duration-200",
                              selected
                                ? "border-teal bg-teal/[0.12] text-ink"
                                : "border-line text-dim hover:border-line-2 hover:text-ink",
                              blocked && "cursor-not-allowed opacity-40 hover:border-line hover:text-dim",
                            )}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {saveError && (
                    <p className="border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
                      {saveError}
                    </p>
                  )}

                  <div className="flex items-center gap-4 border-t border-line pt-7">
                    <Action type="submit" disabled={saving}>
                      {saving ? <ButtonSpinner /> : <Save className="h-4 w-4" />}
                      {saving ? "Saving…" : "Save changes"}
                    </Action>
                    {saved && <span className="tick-label text-teal">Saved</span>}
                  </div>
                </div>
              </form>

              {/* ── the record ── */}
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                  <p className="tick-label">Previous simulations</p>
                  {runs && runs.length > 0 && (
                    <p className="num text-[11.5px] text-faint">
                      {runs.length} run{runs.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>

                {runsError && (
                  <p className="mt-4 border border-ember/40 bg-ember/[0.08] px-4 py-3 text-[13px] text-ember">
                    {runsError}
                  </p>
                )}

                {!runsError && runs === null && (
                  <p className="py-5 text-[13px] text-dim">Loading…</p>
                )}

                {!runsError && runs && runs.length === 0 && (
                  <div className="border-b border-line px-1 py-8 text-center">
                    <p className="text-[13.5px] text-dim">No simulations started yet.</p>
                    <div className="mt-5 flex justify-center">
                      <Action href="/simulations" variant="outline">
                        Start one <ArrowRight className="h-3.5 w-3.5" />
                      </Action>
                    </div>
                  </div>
                )}

                {!runsError &&
                  runs &&
                  runs.map((run) => (
                    <Link
                      key={run.id}
                      href={runHref(run.seq)}
                      className="block border-b border-line px-1 py-4 transition-colors duration-200 hover:bg-[var(--panel)]"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-[14px] text-ink">{run.name}</span>
                        <span
                          className={cn(
                            "tick-label shrink-0",
                            RUN_STATUS_TONE[run.run_status],
                          )}
                        >
                          {RUN_STATUS_LABEL[run.run_status]}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between gap-3">
                        <span className="num text-[11.5px] text-faint">
                          Q{run.quarters_locked}/{run.total_quarters}
                        </span>
                        {run.latest_ceo_score != null && (
                          <span className="num text-[11.5px] text-dim">
                            {formatDecimal(run.latest_ceo_score, 1)}
                            {run.latest_band ? ` · ${humanizeId(run.latest_band)}` : ""}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
