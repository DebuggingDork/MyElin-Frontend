"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { InstitutionSelect } from "@/components/auth/InstitutionSelect";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api/client";
import { easeOut } from "@/lib/media";
import type { InstitutionRef } from "@/lib/institutions";
import {
  MAX_GOALS,
  degreeOptions,
  goalOptions,
  saveProfile,
  yearOptions,
} from "@/lib/profile";
import { Action, Eyebrow } from "@/components/ui/Kit";
import { cn } from "@/lib/utils";

/**
 * Signup screen 2 — everything the first screen deliberately left out.
 *
 * The account already exists by the time this renders (screen 1 registered it), so nothing
 * here can block someone from getting in: every field is optional and the button is always
 * live. That's the trade that keeps first-run friction low while still filling the directory.
 */
export function OnboardingProfile({
  firstName,
  onFinish,
}: {
  firstName: string;
  onFinish: () => void;
}) {
  const { user } = useAuth();

  const [institution, setInstitution] = useState<InstitutionRef | null>(null);
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  function toggleGoal(goal: string) {
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((g) => g !== goal)
        : current.length >= MAX_GOALS
          ? current
          : [...current, goal],
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    saveProfile({
      user_id: user?.user_id ?? null,
      email: user?.email ?? null,
      first_name: firstName,
      institution,
      degree: degree || null,
      current_year: year || null,
      goals,
      captured_at: new Date().toISOString(),
    });
    // Fire-and-forget: a profile endpoint now exists, but this screen's whole design point is
    // that nothing here blocks getting in. `onFinish` runs immediately either way; the account
    // already has the localStorage copy saved above as a fallback if this request fails.
    void api.updateProfile({
      first_name: firstName || null,
      institution,
      degree: degree || null,
      current_year: year || null,
      goals,
    });
    onFinish();
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-line bg-void/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10"
      >
        <div className="flex items-center justify-between gap-4">
          <Eyebrow accent="violet">Step 2 of 2</Eyebrow>
          <span className="eyebrow text-faint">Takes 20 seconds</span>
        </div>

        <h1 className="display mt-5 text-[clamp(1.7rem,3vw,2.25rem)] leading-[1.08] text-ink">
          {firstName ? `${firstName}, let's ` : "Let's "}
          <span className="text-grad">personalize your experience.</span>
        </h1>
        <p className="mt-3 text-[14.5px] text-dim">
          This shapes the cases we put in front of you. Every field is optional.
        </p>

        <form onSubmit={onSubmit} className="mt-9 space-y-7">
          <div>
            <label className="eyebrow text-faint" htmlFor="onboarding-institution">
              College / University
            </label>
            <div className="mt-3">
              <InstitutionSelect
                id="onboarding-institution"
                value={institution}
                onChange={setInstitution}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="onboarding-degree"
              label="Degree / Program"
              placeholder="Select your degree"
              value={degree}
              options={degreeOptions}
              onChange={setDegree}
            />

            <SelectField
              id="onboarding-year"
              label="Current year"
              placeholder="Select your year"
              value={year}
              options={yearOptions}
              onChange={setYear}
            />
          </div>

          <fieldset>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <legend className="eyebrow text-faint">
                What do you want to get better at?
              </legend>
              <span className="text-[12.5px] text-faint">
                Choose up to {MAX_GOALS} · {goals.length}/{MAX_GOALS}
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

          <Action type="submit" className="w-full" size="lg">
            Enter Myelin
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Action>
        </form>
      </motion.div>
    </AuthShell>
  );
}

/**
 * A themed native `<select>`.
 *
 * Native on purpose -- these are short, closed lists, and the platform picker is the better
 * control on a phone. The cost is that the browser paints the popup itself: `.select-field`
 * (globals.css) is what makes that popup follow the theme instead of falling back to a white
 * sheet, and `appearance-none` means the chevron has to be drawn here, the same way the other
 * fields on this screen carry their own leading icon.
 */
export function SelectField({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="eyebrow text-faint" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-3">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "select-field w-full cursor-pointer appearance-none rounded-2xl border border-line py-3.5 pl-4 pr-11",
            "text-[14.5px] outline-none transition-colors hover:border-line-2 focus:border-teal/60",
            value ? "text-ink" : "text-faint",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      </div>
    </div>
  );
}
