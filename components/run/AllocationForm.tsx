"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { api } from "@/lib/api/client";
import {
  asNumber,
  CRISIS_CHOICES,
  CRISIS_FIELDS,
  DEPARTMENTS,
  formatLakhs,
  type DeptId,
} from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/types";
import type { CrisisChoice, QuarterAllocationResponse } from "@/lib/api/types";
import { accentVar } from "@/components/ui/Kit";
import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";

type SpendMap = Record<string, number>;

function emptySpend(keys: string[]): SpendMap {
  return Object.fromEntries(keys.map((k) => [k, 0]));
}

function fromAlloc(
  alloc: QuarterAllocationResponse | null,
  keys: string[],
): SpendMap {
  if (!alloc) return emptySpend(keys);
  const out: SpendMap = {};
  for (const k of keys) {
    out[k] = asNumber((alloc as unknown as Record<string, unknown>)[k] as string | number);
  }
  return out;
}

export function AllocationWorkspace({ deptId }: { deptId: DeptId }) {
  const { companyId, run, can, setAllocations, refresh } = useRun();
  const catalog = DEPARTMENTS.find((d) => d.id === deptId)!;
  const keys = catalog.fields.map((f) => f.key);
  const [spend, setSpend] = useState<SpendMap>(() => emptySpend(keys));
  const [warranty, setWarranty] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const color = accentVar[catalog.accent];
  const enabled = can("submit_allocation");
  const quarterId = run?.current_quarter_id;

  const bump = (key: string, dir: 1 | -1) => {
    setSpend((prev) => {
      const next = Math.max(0, Number((prev[key] + dir * 0.5).toFixed(2)));
      return { ...prev, [key]: next };
    });
    setSaved(false);
  };

  const setBlock = (key: string, value: number) => {
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
      </header>

      {!enabled && (
        <p className="rounded-xl border border-amber/30 bg-amber/[0.07] px-4 py-3 text-[13px] text-amber">
          submit_allocation is not in legal_moves right now — open a quarter first,
          or the quarter may already be locked.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.fields.map((field) => (
          <SpendCard
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={spend[field.key] ?? 0}
            color={color}
            disabled={!enabled}
            onBump={(d) => bump(field.key, d)}
            onSet={(v) => setBlock(field.key, v)}
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
  const keys = CRISIS_FIELDS.map((f) => f.key);
  const [choice, setChoice] = useState<CrisisChoice | null>(null);
  const [spend, setSpend] = useState<SpendMap>(() => emptySpend(keys));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Crisis submit failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-rose">
          Crisis quarter · Q{run?.crisis_quarter ?? "?"}
        </p>
        <h2 className="display mt-2 text-[28px] text-ink">Crisis response</h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-dim">
          The specific crisis scenario letter is not exposed before lock (known
          backend gap). Diagnose from your own quarter results, pick a strategic
          choice, and fund recovery lines. Ignoring the crisis (null choice, zero
          spend) is legal but penalised (−4).
        </p>
      </header>

      {!enabled && (
        <p className="rounded-xl border border-amber/30 bg-amber/[0.07] px-4 py-3 text-[13px] text-amber">
          submit_crisis_allocation is only legal in the crisis quarter.
        </p>
      )}

      <div>
        <p className="eyebrow text-faint">crisis_choice · optional</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!enabled}
            onClick={() => setChoice(null)}
            className="rounded-full border border-line px-4 py-2 text-[13px] text-dim"
          >
            Ignore (null)
          </button>
          {CRISIS_CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={!enabled}
              onClick={() => setChoice(c.id)}
              className="rounded-full border px-4 py-2 text-[13px]"
              style={{
                borderColor:
                  choice === c.id ? "var(--rose)" : "var(--line)",
                background:
                  choice === c.id
                    ? "color-mix(in srgb, var(--rose) 14%, transparent)"
                    : "transparent",
                color: choice === c.id ? "var(--ink)" : "var(--dim)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CRISIS_FIELDS.map((field) => (
          <SpendCard
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={spend[field.key] ?? 0}
            color="var(--rose)"
            disabled={!enabled}
            onBump={(d) =>
              setSpend((p) => ({
                ...p,
                [field.key]: Math.max(0, Number((p[field.key] + d * 0.5).toFixed(2))),
              }))
            }
            onSet={(v) => setSpend((p) => ({ ...p, [field.key]: v }))}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}

      <Action onClick={submit} disabled={!enabled || saving}>
        {saving ? "Saving…" : "Save crisis allocation"}
      </Action>
    </div>
  );
}

function SpendCard({
  label,
  hint,
  value,
  color,
  disabled,
  onBump,
  onSet,
}: {
  label: string;
  hint?: string;
  value: number;
  color: string;
  disabled?: boolean;
  onBump: (dir: 1 | -1) => void;
  onSet: (v: number) => void;
}) {
  const max = 20;
  const blocks = 20;
  const filled = Math.round((value / max) * blocks);

  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13.5px] font-medium text-ink">{label}</p>
          {hint && <p className="mt-0.5 text-[11.5px] text-faint">{hint}</p>}
        </div>
        <span className="num text-[13px] font-semibold text-ink">
          {formatLakhs(value)}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 gap-[2px]">
          {Array.from({ length: blocks }).map((_, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-label={`Set to ${(((i + 1) / blocks) * max).toFixed(1)}`}
              onClick={() => onSet(Number((((i + 1) / blocks) * max).toFixed(2)))}
              className="h-[18px] flex-1 rounded-[2px] disabled:opacity-40"
              style={{
                background:
                  i < filled
                    ? `color-mix(in srgb, ${color} 70%, transparent)`
                    : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onBump(-1)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim disabled:opacity-30"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBump(1)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
