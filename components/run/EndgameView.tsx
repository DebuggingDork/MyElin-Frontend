"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { asNumber, formatInr } from "@/lib/api/catalog";
import type {
  EndgamePath,
  EndgamePreviewResponse,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Action } from "@/components/ui/Kit";
import { useRun } from "@/components/run/RunProvider";

export function EndgameView() {
  const { companyId, run, can, refresh } = useRun();
  const quarterId = run?.current_quarter_id;
  const [fetched, setFetched] = useState<EndgamePreviewResponse | null>(null);
  const preview = fetched ?? run?.endgame_preview ?? null;
  const [path, setPath] = useState<EndgamePath | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!quarterId || !can("read_endgame_preview")) return;
    let cancelled = false;
    void api
      .getEndgame(companyId, quarterId)
      .then((p) => {
        if (!cancelled) setFetched(p);
      })
      .catch(() => {
        /* preview may also come from run state */
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, quarterId, can]);

  if (!preview) {
    return (
      <p className="text-[14px] text-dim">
        Endgame preview appears once the final quarter is open.
      </p>
    );
  }

  const menu = [
    { path: "A" as const, name: preview.term_sheet_menu.path_a_name },
    { path: "B" as const, name: preview.term_sheet_menu.path_b_name },
    { path: "C" as const, name: preview.term_sheet_menu.path_c_name },
  ];

  async function submit() {
    if (!quarterId || !path || !can("submit_endgame_decision")) return;
    const sheet = menu.find((m) => m.path === path);
    if (!sheet) return;
    setPending(true);
    setError(null);
    try {
      await api.submitEndgame(companyId, quarterId, {
        path,
        term_sheet_name: sheet.name,
        reasoning: reasoning || null,
      });
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Endgame submit failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-amber">Endgame · Q{run?.current_quarter_number}</p>
        <h2 className="display mt-2 text-[28px] text-ink">
          Tier: {preview.tier}
        </h2>
        <p className="mt-2 max-w-2xl text-[13.5px] text-dim">
          {preview.tier_detail}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Momentum score"
          value={`${(asNumber(preview.momentum_score) * 100).toFixed(1)}%`}
        />
        <Stat
          label="Covenant units (Path A)"
          value={asNumber(preview.covenant_units).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}
        />
        <Stat
          label="Continuation value"
          value={formatInr(preview.true_continuation_value_inr)}
        />
      </div>

      {preview.acquisition_trap_offer_inr != null && (
        <p className="text-[13px] text-dim">
          Acquisition trap offer:{" "}
          <span className="num text-ink">
            {formatInr(preview.acquisition_trap_offer_inr)}
          </span>
        </p>
      )}

      <div>
        <h3 className="text-[15px] font-medium text-ink">
          Term sheet menu — pick a path
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {menu.map((item) => {
            const active = path === item.path;
            return (
              <button
                key={item.path}
                type="button"
                disabled={!can("submit_endgame_decision")}
                onClick={() => {
                  setPath(item.path);
                  setSaved(false);
                }}
                className="rounded-xl border p-4 text-left transition-colors disabled:opacity-40"
                style={{
                  borderColor: active
                    ? "color-mix(in srgb, var(--violet) 55%, transparent)"
                    : "var(--line)",
                  background: active
                    ? "color-mix(in srgb, var(--violet) 10%, transparent)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <p className="eyebrow text-faint">Path {item.path}</p>
                <p className="mt-2 text-[14px] font-medium text-ink">
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="eyebrow text-faint" htmlFor="endgame-reasoning">
          reasoning · optional
        </label>
        <textarea
          id="endgame-reasoning"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          rows={3}
          disabled={!can("submit_endgame_decision")}
          className="mt-2 w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] text-ink outline-none focus:border-teal/50"
          placeholder="Why this path?"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose/30 bg-rose/[0.07] px-4 py-3 text-[13px] text-rose">
          {error}
        </p>
      )}

      <Action
        onClick={submit}
        disabled={!path || !can("submit_endgame_decision") || pending}
      >
        {pending ? "Submitting…" : saved ? "Decision saved" : "Submit endgame decision"}
      </Action>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-raise/50 p-4">
      <p className="eyebrow text-faint">{label}</p>
      <p className="num mt-2 text-[18px] font-semibold text-ink">{value}</p>
    </div>
  );
}
