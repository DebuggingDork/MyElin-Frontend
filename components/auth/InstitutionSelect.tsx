"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, GraduationCap, Pencil, Search, X } from "lucide-react";
import {
  customInstitution,
  searchInstitutions,
  type InstitutionRef,
} from "@/lib/institutions";
import { OTHER_OPTION } from "@/lib/profile";
import { cn } from "@/lib/utils";

/**
 * Searchable, standardized institution picker.
 *
 * Free text here would fragment the directory ("IIT Hyderabad" / "IITH" / "IIT-H" as three
 * schools), so selection is what commits a value — typing alone never does. Someone whose
 * college genuinely isn't listed can still commit their own, but it's stored `verified: false`
 * so those rows can be reconciled later instead of silently polluting the counts.
 *
 * There are two ways to reach that: the "Use …" row, which turns what has already been typed
 * into the search box into an entry, and the `OTHER_OPTION` row the list always ends with,
 * which opens a plain text field for people who never got a match worth typing towards. The
 * two agree on the outcome — a `customInstitution`, never the literal word "Others".
 */
export function InstitutionSelect({
  value,
  onChange,
  id,
}: {
  value: InstitutionRef | null;
  onChange: (value: InstitutionRef | null) => void;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // "Others" mode: the search box is replaced by a field that asks for the name outright.
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const manualRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchInstitutions(query), [query]);
  const trimmed = query.trim();
  // Only offer "use what I typed" once it's long enough to be a real name and nothing in the
  // directory already starts with it — otherwise it competes with the row they actually want.
  const canAddCustom =
    trimmed.length >= 3 &&
    !results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  // The last row is always "Others", so the list is never a dead end.
  const otherIndex = results.length + (canAddCustom ? 1 : 0);
  const optionCount = otherIndex + 1;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Asking for the name and then leaving the caret somewhere else is asking twice.
  useEffect(() => {
    if (manual) manualRef.current?.focus();
  }, [manual]);

  function commit(next: InstitutionRef) {
    onChange(next);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  /** Hand over to the text field, carrying anything already typed rather than dropping it. */
  function startManual() {
    setManual(true);
    setOpen(false);
    setQuery("");
    setActive(0);
    setManualName(trimmed);
    // Commit as we go, so an abandoned form still carries what is on screen.
    onChange(trimmed ? customInstitution(trimmed) : null);
  }

  function commitIndex(index: number) {
    if (index < results.length) {
      const hit = results[index];
      commit({ id: hit.id, name: hit.name, verified: true });
    } else if (canAddCustom && index === results.length) {
      commit(customInstitution(trimmed));
    } else if (index === otherIndex) {
      startManual();
    }
    // Anything else is an index the list no longer has -- results shrink as the query grows,
    // and an Enter against a stale row must do nothing rather than pick the row that moved
    // into its place.
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) =>
        event.key === "ArrowDown"
          ? (i + 1) % optionCount
          : (i - 1 + optionCount) % optionCount,
      );
    } else if (event.key === "Enter") {
      if (open) {
        event.preventDefault();
        commitIndex(active);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // ── "Others": name it yourself ──────────────────────────────────────────
  // Takes precedence over the chip below, because the value is being typed *into* this field;
  // it is already committed on every keystroke, and Enter is only what puts the chip back.
  if (manual) {
    return (
      <div className="relative">
        <Pencil className="pointer-events-none absolute left-4 top-[1.15rem] h-4 w-4 -translate-y-1/2 text-teal" />
        <input
          ref={manualRef}
          id={inputId}
          type="text"
          autoComplete="off"
          maxLength={255}
          value={manualName}
          onChange={(e) => {
            const next = e.target.value;
            setManualName(next);
            onChange(next.trim() ? customInstitution(next) : null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && manualName.trim()) {
              event.preventDefault();
              setManual(false);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setManual(false);
              setManualName("");
              onChange(null);
            }
          }}
          placeholder="Enter your institution name"
          className="w-full rounded-2xl border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-11 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
        />
        <button
          type="button"
          onClick={() => {
            setManual(false);
            setManualName("");
            onChange(null);
          }}
          aria-label="Back to the institution list"
          className="absolute right-4 top-[1.15rem] -translate-y-1/2 rounded-full p-1 text-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value) {
    return (
      <div className="institution-field flex items-center gap-3 rounded-2xl border border-line bg-[var(--panel-2)] px-4 py-3.5">
        <GraduationCap className="h-4 w-4 shrink-0 text-teal" />
        <span className="min-w-0 flex-1 truncate text-[14.5px] text-ink">
          {value.name}
        </span>
        {!value.verified && (
          <span className="eyebrow shrink-0 text-faint">not listed</span>
        )}
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          aria-label="Change institution"
          className="shrink-0 rounded-full p-1 text-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <Search className="pointer-events-none absolute left-4 top-[1.15rem] h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${inputId}-option-${active}` : undefined}
        autoComplete="off"
        maxLength={255}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search your institution"
        className="w-full rounded-2xl border border-line bg-[var(--panel-2)] py-3.5 pl-11 pr-5 text-[14.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-teal/60"
      />

      {/* `--panel` is a 5%-alpha wash, so the popover sits on the solid `--void` ground
          instead — otherwise the fields underneath read straight through it. */}
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="institution-menu absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-line bg-void p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        >
          {results.map((institution, i) => (
            <li key={institution.id}>
              <button
                type="button"
                id={`${inputId}-option-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => commitIndex(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                  i === active ? "bg-[var(--panel-2)] text-ink" : "text-dim",
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-teal",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{institution.name}</span>
              </button>
            </li>
          ))}

          {canAddCustom && (
            <li>
              <button
                type="button"
                id={`${inputId}-option-${results.length}`}
                role="option"
                aria-selected={results.length === active}
                onMouseEnter={() => setActive(results.length)}
                onClick={() => commitIndex(results.length)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                  results.length === active
                    ? "bg-[var(--panel-2)] text-ink"
                    : "text-dim",
                )}
              >
                <span className="eyebrow shrink-0 text-teal">Add</span>
                <span className="min-w-0 flex-1 truncate">
                  Use &ldquo;{trimmed}&rdquo;
                </span>
              </button>
            </li>
          )}

          {results.length === 0 && !canAddCustom && (
            <li className="px-3 py-3 text-[13.5px] text-faint">
              No match — keep typing your institution&apos;s full name.
            </li>
          )}

          <li>
            <button
              type="button"
              id={`${inputId}-option-${otherIndex}`}
              role="option"
              aria-selected={otherIndex === active}
              onMouseEnter={() => setActive(otherIndex)}
              onClick={() => commitIndex(otherIndex)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors",
                otherIndex === active ? "bg-[var(--panel-2)] text-ink" : "text-dim",
              )}
            >
              <Pencil className="h-3.5 w-3.5 shrink-0 text-teal" />
              <span className="min-w-0 flex-1 truncate">
                {OTHER_OPTION} — type my institution
              </span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
