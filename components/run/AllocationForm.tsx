"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/api/client";
import {
  asNumber,
  CRISIS_CHOICES,
  CRISIS_FIELDS,
  DEPARTMENTS,
  formatInr,
  formatLakhs,
  type DeptId,
} from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/types";
import type {
  CrisisBriefingResponse,
  CrisisChoice,
  QuarterAllocationResponse,
} from "@/lib/api/types";
import { accentVar } from "@/components/ui/Kit";
import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";
import { SpendDial } from "@/components/run/SpendDial";

type SpendMap = Record<string, number>;

function emptySpend(keys: string[]): SpendMap {
  return Object.fromEntries(keys.map((k) => [k, 0]));
}

/** Reads either a fresh submit response or `quarter.allocations` -- both are a flat
 *  field-name -> Money map for the same 22 columns, just typed differently. */
function fromAlloc(
  alloc: Record<string, unknown> | null | undefined,
  keys: string[],
): SpendMap {
  if (!alloc) return emptySpend(keys);
  const out: SpendMap = {};
  for (const k of keys) {
    out[k] = asNumber(alloc[k] as string | number | undefined);
  }
  return out;
}

export function AllocationWorkspace({ deptId }: { deptId: DeptId }) {
  const { companyId, run, quarter, can, setAllocations, refresh, financeUnlocked, allocatedLakhs } =
    useRun();
  const catalog = DEPARTMENTS.find((d) => d.id === deptId)!;
  const keys = catalog.fields.map((f) => f.key);
  // Seeded from `quarter.allocations` so reopening a department after saving elsewhere shows
  // what's actually on the server instead of resetting every field to ₹0.
  const [spend, setSpend] = useState<SpendMap>(() =>
    fromAlloc(quarter?.allocations, keys),
  );
  const [warranty, setWarranty] = useState(() => quarter?.warranty_years ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const color = accentVar[catalog.accent];
  const enabled = can("submit_allocation");
  const quarterId = run?.current_quarter_id;
  const locked = deptId !== "finance_admin" && !financeUnlocked;

  const setField = (key: string, value: number) => {
    setSpend((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  async function submit() {
    if (!quarterId || !enabled) return;
    setSaving(true);
    setError(null);
    try {
      let res: QuarterAllocationResponse;
      const body = { ...spend };
      switch (deptId) {
        case "marketing":
          res = await api.submitMarketing(companyId, quarterId, body);
          break;
        case "sales":
          res = await api.submitSales(companyId, quarterId, body);
          break;
        case "rnd":
          res = await api.submitRnd(companyId, quarterId, {
            ...body,
            warranty_years: warranty,
          });
          break;
        case "operations":
          res = await api.submitOperations(companyId, quarterId, body);
          break;
        case "hr":
          res = await api.submitHr(companyId, quarterId, body);
          break;
        case "finance_admin":
          res = await api.submitFinanceAdmin(companyId, quarterId, body);
          break;
      }
      setAllocations(res);
      setSpend(fromAlloc(res, keys));
      if (catalog.warranty) setWarranty(res.warranty_years);
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  const total = Object.values(spend).reduce((a, b) => a + b, 0);

  // What every *other* department already has saved (server truth), so the live figure below
  // reacts to this department's in-progress edits without double-counting its own persisted
  // values -- `allocatedLakhs` still includes this department's last-saved amount until submit.
  const persistedDeptTotal = keys.reduce(
    (s, k) => s + asNumber(quarter?.allocations?.[k]),
    0,
  );
  const cash = asNumber(quarter?.cash_balance);
  const otherDeptsInr = (allocatedLakhs - persistedDeptTotal) * 100_000;
  const projectedRemaining = cash - otherDeptsInr - total * 100_000;

  if (locked) {
    return (
      <div className="space-y-5">
        <header>
          <p className="eyebrow" style={{ color }}>
            {catalog.owner}
          </p>
          <h2 className="display mt-2 text-[28px] text-ink">{catalog.name}</h2>
          <p className="mt-1 text-[13.5px] text-dim">{catalog.tagline}</p>
        </header>
        <div className="rounded-xl border border-amber/30 bg-amber/[0.07] p-5">
          <p className="text-[13.5px] font-medium text-amber">
            Set your Finance & Admin plan first
          </p>
          <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-dim">
            Every other department is spent against the cash picture Finance &
            Admin establishes for the quarter. Save that allocation once,
            then this and the remaining departments unlock.
          </p>
          <Action
            className="mt-4"
            href={
              quarterId
                ? `/run/${companyId}/quarter/${quarterId}/allocate/finance_admin`
                : "#"
            }
          >
            Go to Finance & Admin
          </Action>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow" style={{ color }}>
          {catalog.owner}
        </p>
        <h2 className="display mt-2 text-[28px] text-ink">{catalog.name}</h2>
        <p className="mt-1 text-[13.5px] text-dim">{catalog.tagline}</p>
        <p className="num mt-3 text-[12px] text-faint">
          Department total · {formatLakhs(total)} · all fields optional (default 0)
        </p>
        <p
          className={`num mt-1 text-[12px] ${projectedRemaining < 0 ? "text-rose" : "text-faint"}`}
        >
          Cash remaining if saved as-is · {formatInr(projectedRemaining)}
        </p>
      </header>

      {!enabled && (
        <p className="rounded-xl border border-amber/30 bg-amber/[0.07] px-4 py-3 text-[13px] text-amber">
          submit_allocation is not in legal_moves right now — open a quarter first,
          or the quarter may already be locked.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.fields.map((field) => (
          <SpendDial
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={spend[field.key] ?? 0}
            color={color}
            disabled={!enabled}
            onChange={(v) => setField(field.key, v)}
          />
        ))}
      </div>

      {catalog.warranty && (
        <div className="rounded-xl border border-line bg-raise/50 p-4">
          <p className="eyebrow text-faint">warranty_years · strategic choice</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((y) => (
              <button
                key={y}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  setWarranty(y);
                  setSaved(false);
                }}
                className="rounded-full border px-4 py-2 text-[13px]"
                style={{
                  borderColor:
                    warranty === y
                      ? `color-mix(in srgb, ${color} 55%, transparent)`
                      : "var(--line)",
                  background:
                    warranty === y
                      ? `color-mix(in srgb, ${color} 14%, transparent)`
                      : "transparent",
                  color: warranty === y ? "var(--ink)" : "var(--dim)",
                }}
              >
                {y === 0 ? "None" : `${y} year${y > 1 ? "s" : ""}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Action onClick={submit} disabled={!enabled || saving}>
          {saving ? "Saving…" : saved ? "Saved — upsert again anytime" : "Save allocation"}
          {saved && <Check className="h-4 w-4" />}
        </Action>
        <span className="text-[12px] text-faint">
          POST …/allocations/{deptId}
        </span>
      </div>
    </div>
  );
}

export function CrisisWorkspace() {
  const { companyId, run, can, setAllocations, refresh } = useRun();
  const enabled = can("submit_crisis_allocation");
  const quarterId = run?.current_quarter_id;
  const [briefing, setBriefing] = useState<CrisisBriefingResponse | null>(null);
  const [briefingLoaded, setBriefingLoaded] = useState(false);
  const [choice, setChoice] = useState<CrisisChoice | null>(null);
  const [spend, setSpend] = useState<SpendMap>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The briefing decides which spend lines and Strategic Choices this scenario actually
  // responds to. Each event's recovery formulas read only a subset of the five crisis fields --
  // Feature Leapfrog reads exactly one -- so rendering all five to everyone invites a student to
  // spend their whole response budget on lines that do nothing. If the briefing can't be read we
  // fall back to the full generic form rather than blocking the response.
  useEffect(() => {
    if (!quarterId) return;
    let cancelled = false;
    void api
      .getCrisisBriefing(companyId, quarterId)
      .then((b) => {
        if (!cancelled) setBriefing(b);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setBriefingLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, quarterId]);

  const fields: { key: string; label: string; hint?: string }[] = briefing
    ? briefing.response_lines.map((line) => ({ key: line.field, label: line.label }))
    : CRISIS_FIELDS;
  const choices: { code: string; label: string; effect?: string }[] = briefing
    ? briefing.choices.map((c) => ({ code: c.code as string, label: c.label, effect: c.effect }))
    : CRISIS_CHOICES.map((c) => ({ code: c.id as string, label: c.label }));

  async function submit() {
    if (!quarterId || !enabled) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.submitCrisis(companyId, quarterId, {
        crisis_choice: choice,
        ...spend,
      });
      setAllocations(res);
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Crisis submit failed");
    } finally {
      setSaving(false);
    }
  }

  const total = Object.values(spend).reduce((a, b) => a + b, 0);
  const selected = choices.find((c) => c.code === choice);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-rose">
          Crisis quarter · Q{run?.crisis_quarter ?? "?"}
          {briefing ? ` · ${briefing.category}` : ""}
        </p>
        <h2 className="display mt-2 text-[28px] text-ink">
          {briefing ? briefing.title : "Crisis response"}
        </h2>
        {briefing ? (
          <>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-dim">
              {briefing.narrative}
            </p>
            <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-faint">
              Only the lines below feed this event&apos;s recovery -- the other crisis fields do
              nothing here. How much to spend is yours to judge from your own results.
            </p>
          </>
        ) : (
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-dim">
            {briefingLoaded
              ? "The briefing is unavailable right now, so every response line is shown below."
              : "Loading the briefing…"}
          </p>
        )}
      </header>

      {!enabled && (
        <p className="rounded-xl border border-amber/30 bg-amber/[0.07] px-4 py-3 text-[13px] text-amber">
          submit_crisis_allocation is only legal in the crisis quarter.
        </p>
      )}

      <div>
        <p className="eyebrow text-faint">Strategic choice · optional</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!enabled}
            onClick={() => setChoice(null)}
            className="rounded-full border px-4 py-2 text-[13px] disabled:opacity-40"
            style={{
              borderColor: choice === null ? "var(--rose)" : "var(--line)",
              background:
                choice === null
                  ? "color-mix(in srgb, var(--rose) 14%, transparent)"
                  : "transparent",
              color: choice === null ? "var(--ink)" : "var(--dim)",
            }}
          >
            Do nothing
          </button>
          {choices.map((c) => (
            <button
              key={c.code}
              type="button"
              disabled={!enabled}
              onClick={() => setChoice(c.code as CrisisChoice)}
              className="rounded-full border px-4 py-2 text-[13px] disabled:opacity-40"
              style={{
                borderColor: choice === c.code ? "var(--rose)" : "var(--line)",
                background:
                  choice === c.code
                    ? "color-mix(in srgb, var(--rose) 14%, transparent)"
                    : "transparent",
                color: choice === c.code ? "var(--ink)" : "var(--dim)",
              }}
            >
              {c.code} · {c.label}
            </button>
          ))}
        </div>
        {selected?.effect && (
          <p className="mt-3 max-w-2xl rounded-xl border border-line bg-raise/40 px-4 py-3 text-[12.5px] leading-relaxed text-dim">
            {selected.effect}
          </p>
        )}
        <p className="mt-2 text-[12px] text-faint">
          Doing nothing is a legal response -- it is simply penalised.
        </p>
      </div>

      <div>
        <p className="eyebrow text-faint">
          Response lines{briefing ? " that matter here" : ""} · {formatLakhs(total)}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <SpendDial
              key={field.key}
              label={field.label}
              hint={field.hint}
              value={spend[field.key] ?? 0}
              color="var(--rose)"
              disabled={!enabled}
              onChange={(v) => setSpend((p) => ({ ...p, [field.key]: v }))}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}

      <Action onClick={submit} disabled={!enabled || saving}>
        {saving ? "Saving…" : saved ? "Saved — upsert again anytime" : "Save crisis allocation"}
        {saved && <Check className="h-4 w-4" />}
      </Action>
    </div>
  );
}
