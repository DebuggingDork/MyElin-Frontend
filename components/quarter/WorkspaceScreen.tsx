"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Hammer } from "lucide-react";
import { easeOut } from "@/lib/media";
import { accentVar, Action, Eyebrow } from "@/components/ui/Kit";
import { DecisionCard } from "@/components/quarter/DecisionCard";
import { EventCard } from "@/components/quarter/EventCard";
import { useQuarter } from "@/components/quarter/QuarterProvider";
import { catalogs, cxStories } from "@/lib/quarter/catalog";
import { projectedLeads, salesCapacity } from "@/lib/quarter/engine";
import {
  decisionsSetCount,
  isDecisionSet,
  WORKSPACE_ORDER,
  type DecisionDef,
  type WorkspaceId,
} from "@/lib/quarter/types";

/* Screens 3–7 — one catalog-driven form per workspace. The same
   renderer serves Finance's 14 lines and CX's 12 pending stubs. */

export function WorkspaceScreen({ ws }: { ws: WorkspaceId }) {
  const { quarter, draft } = useQuarter();
  const catalog = catalogs[ws];
  const color = accentVar[catalog.accent];
  const { done, total } = decisionsSetCount(catalog, draft.decisions[ws]);
  const financeSet = isDecisionSet(draft.decisions.finance?.["FIN-001"]);

  const index = WORKSPACE_ORDER.indexOf(ws);
  const prev = index > 0 ? WORKSPACE_ORDER[index - 1] : null;
  const next = index < WORKSPACE_ORDER.length - 1 ? WORKSPACE_ORDER[index + 1] : null;

  // Preserve group order of first appearance.
  const groups: { name: string | undefined; decisions: DecisionDef[] }[] = [];
  for (const def of catalog.decisions) {
    const last = groups[groups.length - 1];
    if (last && last.name === def.group) last.decisions.push(def);
    else groups.push({ name: def.group, decisions: [def] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Eyebrow accent={catalog.accent}>
            Workspace {String(index + 1).padStart(2, "0")} · {catalog.owner}
          </Eyebrow>
          {total > 0 && (
            <span className="num text-[12px] text-faint">
              {done}/{total} decisions set
            </span>
          )}
        </div>
        <h1 className="display mt-3 text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">
          {catalog.name}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-dim">
          {catalog.tagline}
        </p>
        {total > 0 && (
          <div className="mt-4 h-[5px] max-w-sm overflow-hidden rounded-full bg-white/[0.06]">
            <motion.span
              className="block h-full rounded-full"
              initial={false}
              animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
              transition={{ duration: 0.4, ease: easeOut }}
              style={{ background: color }}
            />
          </div>
        )}
      </motion.header>

      {/* Finance gates everyone — soft-block with a clear warning */}
      {ws !== "finance" && !financeSet && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/[0.07] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-[13px] leading-relaxed text-dim">
            <span className="font-medium text-ink">
              Finance has not allocated department budgets yet.
            </span>{" "}
            Everything you stage here draws from FIN-001, which is still unset.{" "}
            <Link
              href={`/quarter/${quarter}/workspace/finance`}
              className="text-amber underline-offset-2 hover:underline"
            >
              Set the allocation first →
            </Link>
          </p>
        </div>
      )}

      {/* Shell workspaces (Operations, CX) say so honestly */}
      {catalog.shell && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-raise/60 p-4">
          <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
          <p className="text-[13px] leading-relaxed text-dim">{catalog.shell}</p>
        </div>
      )}

      {/* CX dynamic customer stories — same pattern as market events */}
      {ws === "cx" && (
        <div className="mt-8">
          <h2 className="text-[15px] font-medium text-ink">Customer stories this quarter</h2>
          <div className="mt-3 space-y-3">
            {cxStories.map((story, i) => (
              <EventCard key={story.id} event={story} delay={i * 0.08} />
            ))}
          </div>
        </div>
      )}

      {ws === "sales" && <CapacityWidget />}
      {ws === "product" && <DependencyPanel />}

      {/* the catalog-driven form itself */}
      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <section key={group.name ?? "default"}>
            {group.name && (
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="eyebrow" style={{ color }}>
                  {group.name}
                </h2>
                {group.name === "Budget & channels" && (
                  <span className="text-[11.5px] text-faint">
                    Displayed effects are maximum base influence — Brand Strength,
                    saturation and competitor modifiers apply server-side.
                  </span>
                )}
              </div>
            )}
            <div className="grid gap-3 lg:grid-cols-2">
              {group.decisions.map((def) => {
                const wide =
                  def.input === "allocation" ||
                  def.input === "rank" ||
                  (def.options?.length ?? 0) > 3;
                return (
                  <div key={def.id} className={wide ? "lg:col-span-2" : undefined}>
                    <DecisionCard ws={ws} def={def} accent={catalog.accent} />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* footer nav */}
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Action href={`/quarter/${quarter}/workspace/${prev}`} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            {catalogs[prev].name}
          </Action>
        ) : (
          <Action href={`/quarter/${quarter}/briefing`} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Briefing
          </Action>
        )}
        <Link
          href={`/quarter/${quarter}/workspace`}
          className="text-[13px] text-dim transition-colors hover:text-ink"
        >
          All workspaces
        </Link>
        {next ? (
          <Action href={`/quarter/${quarter}/workspace/${next}`}>
            {catalogs[next].name}
            <ArrowRight className="h-4 w-4" />
          </Action>
        ) : (
          <Action href={`/quarter/${quarter}/approval`}>
            Quarter approval
            <ArrowRight className="h-4 w-4" />
          </Action>
        )}
      </footer>
    </div>
  );
}

/* ── Sales Capacity vs. Marketing Leads (hard-gate preview) ─────── */

function CapacityWidget() {
  const { draft } = useQuarter();
  const leads = projectedLeads(draft);
  const capacity = salesCapacity(draft);
  if (leads === 0 && capacity === 0) return null;

  const max = Math.max(leads, capacity, 1);
  const over = leads > capacity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="mt-8 rounded-xl border border-line bg-raise/60 p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[14.5px] font-medium text-ink">
          Capacity vs. marketing leads
        </h2>
        <span className="eyebrow text-faint">hard gate · updates live</span>
      </div>

      <div className="mt-4 space-y-3">
        <BarRow
          label="Projected leads (Marketing draft)"
          value={leads}
          max={max}
          color="var(--cyan)"
        />
        <BarRow
          label="Sales capacity (SAL-000 · 500 / ₹1 L)"
          value={capacity}
          max={max}
          color="var(--teal)"
        />
      </div>

      <p
        className="mt-4 rounded-lg px-3.5 py-2.5 text-[12.5px] leading-relaxed"
        style={{
          background: over ? "rgba(244,84,122,0.08)" : "rgba(52,211,153,0.08)",
          color: over ? "var(--rose)" : "var(--emerald)",
        }}
      >
        {capacity === 0
          ? "No rep spend committed yet — every marketing lead will go unworked."
          : over
            ? `${(leads - capacity).toLocaleString("en-IN")} projected leads exceed capacity and will simply be lost. Fund reps or cut channel spend.`
            : "Capacity covers the projected funnel. Spare capacity is wasted spend, so keep them close."}
      </p>
    </motion.div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[240px] shrink-0 text-[12.5px] text-dim">{label}</span>
      <div className="h-[14px] flex-1 overflow-hidden rounded-md bg-white/[0.05]">
        <motion.span
          className="block h-full rounded-md"
          initial={false}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.35, ease: easeOut }}
          style={{ background: color }}
        />
      </div>
      <span className="num w-[64px] shrink-0 text-right text-[13px] font-semibold text-ink">
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

/* ── Product cross-department dependency panel ──────────────────── */

const DEP_ROWS: [string, boolean[]][] = [
  ["Product Creation", [true, true, false, false, false]],
  ["Feature Priority", [false, true, false, false, true]],
  ["R&D Investment", [true, false, false, false, false]],
  ["Quality Strategy", [false, true, false, true, true]],
  ["Prototype Approval", [false, true, false, false, false]],
  ["Beta Testing", [false, true, false, false, true]],
  ["Launch Approval", [true, true, true, true, true]],
  ["Product Retirement", [true, true, true, true, true]],
];
const DEP_COLS = ["Finance", "Marketing", "Sales", "Operations", "CX"];

function DependencyPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="mt-8 overflow-x-auto rounded-xl border border-line bg-raise/60 p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[14.5px] font-medium text-ink">
          Where product decisions ripple
        </h2>
        <span className="eyebrow text-faint">systems thinking is scored</span>
      </div>
      <table className="mt-4 w-full min-w-[520px] text-left">
        <thead>
          <tr>
            <th className="pb-2 text-[11.5px] font-normal text-faint">Decision</th>
            {DEP_COLS.map((col) => (
              <th key={col} className="pb-2 text-center text-[11.5px] font-normal text-faint">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {DEP_ROWS.map(([label, hits]) => (
            <tr key={label}>
              <td className="py-2 text-[12.5px] text-dim">{label}</td>
              {hits.map((hit, i) => (
                <td key={i} className="py-2 text-center">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      background: hit ? "var(--indigo)" : "rgba(255,255,255,0.09)",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
