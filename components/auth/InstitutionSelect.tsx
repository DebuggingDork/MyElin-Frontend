"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, GraduationCap, Search, X } from "lucide-react";
import {
  customInstitution,
  searchInstitutions,
  type InstitutionRef,
} from "@/lib/institutions";
import { cn } from "@/lib/utils";

/**
 * Searchable, standardized institution picker.
 *
 * Free text here would fragment the directory ("IIT Hyderabad" / "IITH" / "IIT-H" as three
 * schools), so selection is what commits a value — typing alone never does. Someone whose
 * college genuinely isn't listed can still commit their own, but it's stored `verified: false`
 * so those rows can be reconciled later instead of silently polluting the counts.
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
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchInstitutions(query), [query]);
  const trimmed = query.trim();
  // Only offer "use what I typed" once it's long enough to be a real name and nothing in the
  // directory already starts with it — otherwise it competes with the row they actually want.
  const canAddCustom =
    trimmed.length >= 3 &&
    !results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  const optionCount = results.length + (canAddCustom ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function commit(next: InstitutionRef) {
    onChange(next);
    setQuery("");
    setOpen(false);
    setActive(0);
  }

  function commitIndex(index: number) {
    if (index < results.length) {
      const hit = results[index];
      commit({ id: hit.id, name: hit.name, verified: true });
    } else if (canAddCustom) {
      commit(customInstitution(trimmed));
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (optionCount === 0) return;
      setActive((i) =>
        event.key === "ArrowDown"
          ? (i + 1) % optionCount
          : (i - 1 + optionCount) % optionCount,
      );
    } else if (event.key === "Enter") {
      if (open && optionCount > 0) {
        event.preventDefault();
        commitIndex(active);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-[var(--panel-2)] px-4 py-3.5">
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
        aria-activedescendant={
          open && optionCount > 0 ? `${inputId}-option-${active}` : undefined
        }
        autoComplete="off"
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
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-line bg-void p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
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

          {optionCount === 0 && (
            <li className="px-3 py-3 text-[13.5px] text-faint">
              No match — keep typing your institution&apos;s full name.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
