"use client";

/**
 * Account settings: the onboarding answers, editable, plus a read-only history of every run
 * this user has started. `GET /companies` is already owner-scoped, so "previous simulations"
 * reads the same list `ProfileMenu`'s mini-summary and the leaderboard already read -- there is
 * no separate history endpoint to keep in sync with it.
 */

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Save, User as UserIcon } from "lucide-react";
import { easeOut } from "@/lib/media";
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
import { Action, Container, Eyebrow, Panel, Pill, type Accent } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";

const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  active: "Active",
  distressed: "Distressed",
  failed: "Failed",
  completed: "Completed",
};

const RUN_STATUS_ACCENT: Record<RunStatus, Accent> = {
  active: "teal",
  distressed: "amber",
  failed: "rose",
  completed: "emerald",
};

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
          first_name: firstName || null,
          institution,
          degree: degree || null,
          current_year: year || null,
          goals,
        });
        setProfile(res);
        setSaved(true);
      } catch (err) {
        setSaveError(err instanceof ApiError ? err.message : "Could not save your changes");
      } finally {
        setSaving(false);
      }
    },
    [firstName, institution, degree, year, goals],
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-void pb-14 pt-[68px]">
        <div className="aurora" />
        <div className="grid-lines absolute inset-0" />
        <Container wide className="relative z-10 pt-16 sm:pt-24">
          <Eyebrow accent="teal">Account</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] text-ink">
            {profile?.first_name ? `${profile.first_name}, this is you.` : "Your profile."}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
            What we collected at signup, editable any time, and every run you have started.
          </p>
        </Container>
      </section>

      <section className="border-b border-line bg-base py-16">
        <Container wide>
          {!user && (
            <Panel className="p-8 text-center">
              <p className="text-[15px] text-dim">Log in to see your profile.</p>
              <div className="mt-5 flex justify-center">
                <Action href="/login?next=/profile">Log in</Action>
              </div>
            </Panel>
          )}

          {user && loading && <p className="text-[14px] text-dim">Loading your profileâ€¦</p>}

          {user && !loading && loadError && (
            <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
              {loadError}
            </p>
          )}

          {user && !loading && !loadError && (
            <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
                <Panel className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 border-b border-line pb-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/[0.14]">
                      <UserIcon className="h-4.5 w-4.5 text-teal" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{user.email}</p>
                      <p className="text-[12px] text-faint">
                        {profile?.role ? humanizeId(profile.role) : "Student"} Â· member since{" "}
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "â€”"}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={onSave} className="mt-7 space-y-7">
                    <div>
                      <label className="eyebrow text-faint" htmlFor="profile-first-name">
                        First name
                      </label>
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
                        className="mt-3 w-full rounded-2xl border border-line bg-field px-4 py-3.5 text-[14px] text-ink placeholder:text-faint focus:border-teal/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="eyebrow text-faint" htmlFor="profile-institution">
                        College / University
                      </label>
                      <div className="mt-3">
                        <InstitutionSelect
                          id="profile-institution"
                          value={institution}
                          onChange={(value) => {
                            setSaved(false);
                            setInstitution(value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
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
                      />
                    </div>

                    <fieldset>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <legend className="eyebrow text-faint">What do you want to get better at?</legend>
                        <span className="text-[12.5px] text-faint">
                          Choose up to {MAX_GOALS} Â· {goals.length}/{MAX_GOALS}
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
                                "rounded-full border px-4 py-2.5 text-[13.5px] transition-colors",
                                selected
                                  ? "border-teal/60 bg-teal/[0.14] text-ink"
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
                      <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                        {saveError}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <Action type="submit" disabled={saving}>
                        <Save className="h-4 w-4" />
                        {saving ? "Savingâ€¦" : "Save changes"}
                      </Action>
                      {saved && <span className="text-[12.5px] text-teal">Saved.</span>}
                    </div>
                  </form>
                </Panel>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: easeOut }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="display text-[19px] text-ink">Previous simulations</h2>
                  {runs && runs.length > 0 && (
                    <span className="num text-[12px] text-faint">
                      {runs.length} run{runs.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2.5">
                  {runsError && (
                    <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
                      {runsError}
                    </p>
                  )}

                  {!runsError && runs === null && <p className="text-[13px] text-dim">Loadingâ€¦</p>}

                  {!runsError && runs && runs.length === 0 && (
                    <Panel className="p-6 text-center">
                      <p className="text-[13.5px] text-dim">No simulations started yet.</p>
                      <div className="mt-4 flex justify-center">
                        <Action href="/simulations" variant="outline">
                          Start one <ArrowRight className="h-3.5 w-3.5" />
                        </Action>
                      </div>
                    </Panel>
                  )}

                  {!runsError &&
                    runs &&
                    runs.map((run) => (
                      <Link
                        key={run.id}
                        href={runHref(run.seq)}
                        className="block rounded-2xl border border-line bg-raise/40 px-4 py-3.5 transition-colors hover:border-line-2 hover:bg-[var(--panel-2)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13.5px] font-medium text-ink">{run.name}</span>
                          <Pill accent={RUN_STATUS_ACCENT[run.run_status]}>
                            {RUN_STATUS_LABEL[run.run_status]}
                          </Pill>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-faint">
                          <span>
                            Quarter {run.quarters_locked} / {run.total_quarters}
                          </span>
                          {run.latest_ceo_score != null && (
                            <span>
                              score {formatDecimal(run.latest_ceo_score, 1)}
                              {run.latest_band ? ` Â· ${humanizeId(run.latest_band)}` : ""}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              </motion.div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
