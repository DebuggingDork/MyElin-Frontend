"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
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

/** The row every picker ends with: not an answer, a way in for the one the list is missing. */
export const OTHER_OPTION = "Others";

/**
 * A single-choice picker, drawn by us rather than by the browser.
 *
 * It was a native `<select>` with `appearance-none`, which styles the closed control and
 * nothing else: the open list is painted by the platform, and on Windows Chrome that is a
 * white sheet with a blue highlight, sitting over a dark page, opening across the whole
 * viewport when the field is low enough. `color-scheme` never reliably reached it.
 *
 * So the menu is ours: same hairline geometry as `InstitutionSelect` next to it in the same
 * form, same keyboard contract (arrows, Enter, Escape, click-outside), and it flips above the
 * field when there is more room up there than down.
 *
 * Every list ends with `OTHER_OPTION`, which opens a text field underneath rather than
 * answering anything itself: what gets typed there *is* the value the form submits, and the
 * literal string "Others" is never stored.
 */
export function SelectField({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  customNoun,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /**
   * What the manual field asks for — lowercase, singular, no article ("degree", "year").
   * It writes both the placeholder and the error, so the field reads "Enter your degree"
   * rather than a generic "Enter value". Falls back to the label when a caller omits it.
   */
  customNoun?: string;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listId = `${fieldId}-listbox`;
  const noun = (customNoun ?? label).toLowerCase();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const [otherPicked, setOtherPicked] = useState(false);
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const customRef = useRef<HTMLInputElement>(null);

  // Anything held that the list does not offer is a custom answer — including one loaded from
  // a saved profile, which is what reopens the text field with the value already in it. It is
  // held alongside `otherPicked` so the field survives someone typing an answer that happens
  // to match a row, and so it is on screen before a single character is typed.
  const isCustomValue = value !== "" && !options.includes(value);
  const other = otherPicked || isCustomValue;
  // Every field here is optional, so an empty custom box is only wrong once it has been left.
  const missingCustom = other && touched && value.trim() === "";

  // The placeholder is a row like any other, so the choice can be taken back without
  // reaching for a separate clear control; `OTHER_OPTION` closes the list at the far end.
  const rows = useMemo(() => ["", ...options, OTHER_OPTION], [options]);
  const otherRow = rows.length - 1;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Follow the keyboard down a seventeen-row list: an active option scrolled out of sight is
  // an active option nobody can see they are about to choose.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(fieldId)}-option-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active, fieldId]);

  // Choosing "Others" is only half an answer, so put the caret where the other half goes.
  // Keyed off the deliberate pick and never off a value restored from a saved profile —
  // that one would steal focus on load.
  useEffect(() => {
    if (otherPicked) customRef.current?.focus();
  }, [otherPicked]);

  function show() {
    const box = wrapRef.current?.getBoundingClientRect();
    if (box) {
      const below = window.innerHeight - box.bottom;
      // 264px is the menu at its tallest. Open upward only when down is genuinely tighter.
      setDropUp(below < 264 && box.top > below);
    }
    setActive(other ? otherRow : Math.max(0, rows.indexOf(value)));
    setOpen(true);
  }

  function commit(index: number) {
    setOpen(false);
    if (index === otherRow) {
      setOtherPicked(true);
      // Whatever listed answer was there is dropped: "Others" is not itself an answer, and
      // keeping the old one would submit a value the control no longer shows.
      if (!isCustomValue) onChange("");
      return;
    }
    // Back to a listed answer — the typed one goes with the field that held it.
    setOtherPicked(false);
    setTouched(false);
    onChange(rows[index] ?? "");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        show();
        return;
      }
      setActive((i) =>
        event.key === "ArrowDown" ? (i + 1) % rows.length : (i - 1 + rows.length) % rows.length,
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) commit(active);
      else show();
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActive(rows.length - 1);
    }
  }

  return (
    <div>
      <label className="eyebrow text-faint" htmlFor={fieldId}>
        {label}
      </label>
      <div ref={wrapRef} className="relative mt-3">
        <button
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-activedescendant={open ? `${fieldId}-option-${active}` : undefined}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={onKeyDown}
          className={cn(
            "select-field flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl",
            "border border-line py-3.5 pl-4 pr-4 text-left text-[14.5px] outline-none",
            "transition-colors hover:border-line-2 focus-visible:border-teal",
            open && "border-teal",
            value || other ? "text-ink" : "text-faint",
          )}
        >
          <span className="min-w-0 truncate">
            {other ? OTHER_OPTION : value || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-faint transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          /* `--panel` is a 5%-alpha wash, so the menu sits on the solid `--void` ground
             instead -- otherwise the fields underneath read straight through it. */
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label={label}
            className={cn(
              "select-menu absolute z-30 max-h-64 w-full overflow-y-auto rounded-2xl border",
              "border-line bg-void p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
              dropUp ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {rows.map((option, i) => {
              const isOtherRow = i === otherRow;
              const selected = isOtherRow ? other : !other && option === value;
              return (
                <li key={isOtherRow ? "__other" : option || "__placeholder"}>
                  <button
                    type="button"
                    id={`${fieldId}-option-${i}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                      i === active ? "bg-[var(--panel-2)] text-ink" : "text-dim",
                      !option && "text-faint",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-teal",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{option || placeholder}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* The other half of an "Others" answer. Same surface, radius and focus colour as the
          fields above it, so it reads as part of the form rather than as a thing that
          appeared; `.ledger` squares it off with the rest on the account page. */}
      {other && (
        <div className="mt-3">
          <label className="sr-only" htmlFor={`${fieldId}-custom`}>
            Enter your {noun}
          </label>
          <input
            ref={customRef}
            id={`${fieldId}-custom`}
            type="text"
            maxLength={80}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={missingCustom || undefined}
            aria-describedby={missingCustom ? `${fieldId}-custom-error` : undefined}
            placeholder={`Enter your ${noun}`}
            className={cn(
              "w-full rounded-2xl border bg-[var(--panel-2)] px-4 py-3.5 text-[14.5px] text-ink",
              "outline-none transition-colors placeholder:text-faint",
              missingCustom ? "border-ember/70" : "border-line focus:border-teal/60",
            )}
          />
          {missingCustom && (
            <p id={`${fieldId}-custom-error`} className="mt-2 text-[12.5px] text-ember">
              Add your {noun}, or choose one from the list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
