"use client";

/**
 * The three statements and the constraint chain, ported from the shipped `NadiWear.html`
 * bundle.
 *
 * Two copy bugs in the original are corrected here rather than reproduced: the "assets built
 * earlier" line concatenated a string with a unary `+`, which rendered a literal `NaN` (or a
 * stray `0`) mid-sentence, and the "units built" line ended on a dangling `", + "`. Both are
 * marked where they occur. Every figure and every class is otherwise unchanged.
 */

import { PRODUCTS } from "@/lib/simulation/constants";
import { cr, inr, lakh, n0, n1, n2, pct } from "@/lib/simulation/format";
import { Eyebrow, LedgerRow, Panel } from "@/components/simulation/Kit";
import type { BalanceView } from "@/lib/simulation/balance";
import type { QuarterResultShape } from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

/* ── balance sheet ────────────────────────────────────────────────── */

export function BalanceSheet({
  open,
  close,
  title,
  eyebrow,
}: {
  open: BalanceView;
  close?: BalanceView;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  const row = (label: string, key: keyof BalanceView, working: string, indent?: boolean) => {
    const move = close ? close[key] - open[key] : 0;
    return (
      <div className="grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-stone-200">
        <div
          className={
            "col-span-5 sm:col-span-4 text-sm " + (indent ? "pl-4 text-stone-700" : "font-semibold text-stone-900")
          }
        >
          {label}
        </div>
        <div className="hidden sm:block sm:col-span-3 text-xs text-stone-500 font-mono">{working}</div>
        <div className="col-span-3 sm:col-span-2 text-right font-mono text-sm text-stone-500">{inr(open[key])}</div>
        {close && (
          <>
            <div className="col-span-4 sm:col-span-2 text-right font-mono text-sm text-stone-900">{inr(close[key])}</div>
            <div
              className={
                "hidden sm:block sm:col-span-1 text-right font-mono text-xs " +
                (move >= 0 ? "text-teal-700" : "text-rose-700")
              }
            >
              {(move >= 0 ? "+" : "") + n0(move / 1000)}k
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Panel eyebrow={eyebrow} title={title}>
      <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-stone-800">
        <div className="col-span-5 sm:col-span-4" />
        <div className="hidden sm:block sm:col-span-3" />
        <div className="col-span-3 sm:col-span-2 text-right">
          <Eyebrow>Opening</Eyebrow>
        </div>
        {close && (
          <>
            <div className="col-span-4 sm:col-span-2 text-right">
              <Eyebrow>Closing</Eyebrow>
            </div>
            <div className="hidden sm:block sm:col-span-1 text-right">
              <Eyebrow>Move</Eyebrow>
            </div>
          </>
        )}
      </div>

      <div className="mt-2 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Assets</div>
      {row("Cash and equivalents", "cash", "", true)}
      {row("Accounts receivable", "ar", "uncollected sales", true)}
      {row("Inventory", "inventory", n0((close || open).invUnits) + " units at cost", true)}
      {row("Plant and equipment", "equipment", "net of depreciation", true)}
      {row("Intellectual property", "ip", "innovation board, amortised", true)}
      {row("Total assets", "assets", "")}

      <div className="mt-3 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Liabilities</div>
      {row("Accounts payable", "ap", "owed to suppliers", true)}
      {row("Borrowings", "debt", "credit facility drawn", true)}
      {row("Other liabilities", "other", "fixed", true)}
      {row("Total liabilities", "liabilities", "")}

      <div className="mt-3 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Equity</div>
      {row("Share capital", "share", "seed round", true)}
      {row("Retained earnings", "re", "accumulated profit and loss", true)}
      {row("Total equity", "equity", "")}

      <div className="mt-3 pt-2 border-t-2 border-stone-800 grid grid-cols-12 gap-2">
        <div className="col-span-5 sm:col-span-4 text-sm font-semibold">Liabilities and equity</div>
        <div className="hidden sm:block sm:col-span-3 text-xs text-stone-500 font-mono">must equal total assets</div>
        <div className="col-span-3 sm:col-span-2 text-right font-mono text-sm text-stone-500">
          {inr(open.liabilities + open.equity)}
        </div>
        {close && (
          <div className="col-span-4 sm:col-span-2 text-right font-mono text-sm font-semibold">
            {inr(close.liabilities + close.equity)}
          </div>
        )}
      </div>
    </Panel>
  );
}

/* ── profit and loss ──────────────────────────────────────────────── */

export function ProfitAndLoss({ r }: { r: QuarterResultShape }) {
  const margin = v(r, "revenueT") > 0 ? (v(r, "grossProfit") / v(r, "revenueT")) * 100 : 0;

  return (
    <Panel eyebrow="Profit and loss" title={"Quarter " + r.q}>
      {PRODUCTS.filter((p) => r.P[p.id].live && (r.sold[p.id] as number) > 0).map((p) => (
        <LedgerRow
          key={p.id}
          label={p.name + (r.P[p.id].status === "discontinued" ? " (cleared)" : "")}
          working={
            n0(r.sold[p.id] as number) +
            " × " +
            inr(r.P[p.id].price) +
            (r.P[p.id].status === "discontinued" ? " at 40% off" : "")
          }
          value={inr(r.revenue[p.id] as number)}
          indent
        />
      ))}
      <LedgerRow label="Revenue" working={n0(v(r, "unitsSold")) + " units"} value={inr(v(r, "revenueT"))} strong />
      <LedgerRow
        label="Cost of goods sold"
        working="weighted average cost of units sold"
        value={"(" + inr(v(r, "cogs")) + ")"}
        indent
      />
      <LedgerRow label="Gross profit" working={pct(margin) + " margin"} value={inr(v(r, "grossProfit"))} strong />
      {v(r, "channelMargin") > 0 && (
        <LedgerRow
          label="Distributor margin"
          working={pct(v(r, "channelShare") * 100) + " of funnel units at 18%"}
          value={"(" + inr(v(r, "channelMargin")) + ")"}
          indent
        />
      )}
      <LedgerRow
        label="Warranty provision"
        working={
          v(r, "warrantyMult")
            ? n0(v(r, "unitsSold")) + " × " + pct(v(r, "defectRate")) + " × ₹1,500 × " + n1(v(r, "warrantyMult"))
            : "6-month cover"
        }
        value={"(" + inr(v(r, "warrantyCost")) + ")"}
        indent
      />
      <LedgerRow
        label="Inventory holding"
        working={n0(v(r, "invUnitsOut")) + " units × " + inr(v(r, "holdingPerUnit"))}
        value={"(" + inr(v(r, "holdingCost")) + ")"}
        indent
      />
      <LedgerRow
        label="Salaries"
        working={n0(v(r, "headcount")) + " people across six functions"}
        value={"(" + inr(v(r, "salaries")) + ")"}
        indent
      />
      <LedgerRow label="Overhead" working="rent, platform, utilities" value={"(" + inr(v(r, "overhead")) + ")"} indent />
      {v(r, "peopleCost") > 0 && (
        <LedgerRow
          label="Recruitment and severance"
          working={n0(v(r, "totalHired")) + " hired, " + n0(v(r, "totalFired")) + " exited"}
          value={"(" + inr(v(r, "peopleCost")) + ")"}
          indent
        />
      )}
      <LedgerRow
        label="Discretionary operating spend"
        working={lakh(v(r, "opexL")) + " across all departments"}
        value={"(" + inr(v(r, "opexSpend")) + ")"}
        indent
      />
      <LedgerRow
        label="Depreciation and amortisation"
        working="5% of plant, 8% of capitalised innovation"
        value={"(" + inr(v(r, "depreciation") + v(r, "amortisation")) + ")"}
        indent
      />
      <LedgerRow
        label="Net interest"
        working={
          inr(v(r, "debtClose")) + " of borrowings at 3.5%, treasury at " + pct(v(r, "treasuryRate") * 100)
        }
        value={inr(v(r, "interestIncome") - v(r, "interestExpense"))}
        indent
      />
      <LedgerRow
        label="Net profit"
        working="carried to retained earnings"
        value={inr(v(r, "netProfit"))}
        strong
        tone={v(r, "netProfit") >= 0 ? "text-teal-800" : "text-rose-800"}
        flag={v(r, "netProfit") < 0}
      />
    </Panel>
  );
}

/* ── cash flow ────────────────────────────────────────────────────── */

export function CashFlow({ r }: { r: QuarterResultShape }) {
  const terms = r.terms as { name: string };

  return (
    <Panel
      eyebrow="Cash flow statement"
      title={"Opening " + inr(v(r, "openingCash")) + " → closing " + inr(v(r, "cash"))}
    >
      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Operating</div>
      <LedgerRow
        label="Collections from customers"
        working={"revenue less the " + n0(v(r, "arDays")) + "-day receivable"}
        value={inr(v(r, "collections"))}
        indent
      />
      <LedgerRow
        label="Paid to suppliers"
        working={inr(v(r, "prodCostTotal")) + " of production on " + terms.name.toLowerCase()}
        value={"(" + inr(v(r, "supplierPaid")) + ")"}
        indent
      />
      <LedgerRow
        label="Operating costs"
        working="salaries, overhead, opex, warranty, holding, people"
        value={
          "(" +
          inr(
            v(r, "fixedCost") +
              v(r, "opexSpend") +
              v(r, "peopleCost") +
              v(r, "warrantyCost") +
              v(r, "holdingCost") +
              v(r, "channelMargin"),
          ) +
          ")"
        }
        indent
      />
      <LedgerRow
        label="Net interest"
        working="paid less earned"
        value={inr(v(r, "interestIncome") - v(r, "interestExpense"))}
        indent
      />
      <LedgerRow
        label="Cash from operations"
        working=""
        value={inr(v(r, "operatingCF"))}
        strong
        tone={v(r, "operatingCF") >= 0 ? "text-teal-800" : "text-rose-800"}
      />

      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1 mt-2">Investing</div>
      <LedgerRow
        label="Plant and capacity"
        working={v(r, "capacityAdded") > 0 ? "+" + n0(v(r, "capacityAdded")) + " units a quarter" : "no capex"}
        value={"(" + inr(v(r, "capexSpend")) + ")"}
        indent
      />
      <LedgerRow
        label="Innovation board"
        working={
          (r.started as string[]).length
            ? (r.started as string[]).length + " card(s) started, capitalised"
            : "nothing started"
        }
        value={"(" + inr(v(r, "innoSpend")) + ")"}
        indent
      />
      <LedgerRow label="Cash used in investing" working="" value={inr(v(r, "investingCF"))} strong />

      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1 mt-2">Financing</div>
      <LedgerRow
        label="Credit drawn"
        working={v(r, "drawRejected") > 1 ? inr(v(r, "drawRejected")) + " refused" : "within the limit"}
        value={inr(v(r, "drawn"))}
        indent
      />
      <LedgerRow label="Borrowings repaid" working="" value={"(" + inr(v(r, "repaid")) + ")"} indent />
      {v(r, "equityRaised") > 0 && (
        <LedgerRow
          label="Equity investment received"
          working="term sheet accepted last quarter"
          value={inr(v(r, "equityRaised"))}
          indent
        />
      )}
      <LedgerRow label="Cash from financing" working="" value={inr(v(r, "financingCF"))} strong />
      <LedgerRow
        label="Net movement in cash"
        working={r.wcBreached ? "closes below the buffer" : "buffer intact"}
        value={inr(v(r, "netCF"))}
        strong
        tone={v(r, "netCF") >= 0 ? "text-teal-800" : "text-rose-800"}
        flag={Boolean(r.wcBreached)}
      />
    </Panel>
  );
}

/* ── the constraint chain ─────────────────────────────────────────── */

type ChainRow = {
  k: string;
  v: string;
  u: string;
  w: string;
  bind?: boolean;
  strong?: boolean;
  final?: boolean;
};

/** Every stage the quarter passed through, with the binding gate marked in ledger red. */
export function ConstraintChain({ r }: { r: QuarterResultShape }) {
  const wasted = v(r, "leadsWasted") > 1;
  const marketingShort = (r.staffing as Record<string, number>).marketing < 0.999;
  const available = PRODUCTS.reduce((sum, p) => sum + (r.avail[p.id] as number), 0);

  const rows: (ChainRow | null)[] = [
    {
      k: "Leads generated",
      v: n0(v(r, "rawLeads")),
      u: "raw leads",
      w: "Seven paid channels, this quarter's spend only",
    },
    r.crisis && v(r, "dampBefore") < 1
      ? {
          k: "Competitive dampening",
          v: "× " + n2(v(r, "damp")),
          u: "",
          w:
            "base " +
            n2(v(r, "dampBefore")) +
            (v(r, "damp") > v(r, "dampBefore") ? ", recovered by the response" : ", unrecovered"),
          bind: v(r, "damp") < 0.9,
        }
      : null,
    {
      k: "Assets built earlier",
      v: "+ " + n0(v(r, "seoFree") + v(r, "hypeFree")),
      u: "free leads",
      // Corrected: the original concatenated this with a unary `+`, printing a literal NaN.
      w:
        "SEO " +
        n0(v(r, "seoFree")) +
        (v(r, "hypeFree") > 0 ? ", pre-launch anticipation " + n0(v(r, "hypeFree")) : "") +
        " — paid for in prior quarters",
    },
    {
      k: "Brand, morale, staffing",
      v: "× " + n2(v(r, "brandMult") * v(r, "prodMult") * (r.staffing as Record<string, number>).marketing),
      u: "",
      w:
        "brand " +
        n2(v(r, "brandMult")) +
        " × morale " +
        n2(v(r, "prodMult")) +
        " × marketing staffing " +
        n2((r.staffing as Record<string, number>).marketing),
      bind: marketingShort,
    },
    { k: "Effective leads", v: n0(v(r, "effLeads")), u: "at the door", w: "everything above, compounded", strong: true },
    {
      k: "Selling capacity",
      v: n0(v(r, "capacity")),
      u: "leads workable",
      w: wasted
        ? n0(v(r, "leadsWasted")) + " leads lost — capacity is binding"
        : n0(v(r, "repCapacity")) +
          " reps + " +
          n0(v(r, "channelCapacity")) +
          " channel, " +
          n0(v(r, "idleCapacity")) +
          " idle",
      bind: wasted,
    },
    {
      k: "Leads worked",
      v: n0(v(r, "leadsUsed")),
      u: "leads",
      w: "the smaller of leads and capacity",
      strong: true,
    },
    {
      k: "Conversion",
      v: pct(v(r, "finalConv")),
      u: "",
      w:
        "raw " +
        n1(v(r, "rawConv")) +
        "% " +
        (r.ceilingBinding
          ? "capped at the " + n1(v(r, "ceiling")) + "% product ceiling"
          : "under a " + n1(v(r, "ceiling")) + "% ceiling") +
        (v(r, "warrantyBonus") ? " · warranty +" + n1(v(r, "warrantyBonus")) : "") +
        (v(r, "convPenalty") ? " · crisis −" + n1(v(r, "convPenalty")) : ""),
      bind: Boolean(r.ceilingBinding),
    },
    {
      k: "Price effect",
      v: "× " + n2(v(r, "blendedPriceMult")),
      u: "on demand",
      w: PRODUCTS.filter((p) => r.P[p.id].live)
        .map((p) => p.name.split(" ").pop() + " " + inr(r.P[p.id].price) + " vs " + inr(r.priceInfo[p.id].ref))
        .join(" · "),
      bind: v(r, "blendedPriceMult") < 0.8,
    },
    {
      k: "Demand",
      v: n0(v(r, "demandTotal")),
      u: "units wanted",
      w: n0(v(r, "funnelUnits")) + " funnel + " + n0(v(r, "repeatUnits")) + " repeat at " + pct(v(r, "repeatRate")),
      strong: true,
    },
    {
      k: "Installed capacity",
      v: n0(v(r, "installedCapacity")),
      u: "units a quarter",
      w: r.runLimited
        ? n0(v(r, "installedCapacity") - v(r, "grossRun")) + " idle — the run was funded below the plant"
        : "fully loaded at " + pct(v(r, "utilisation") * 100),
      bind: Boolean(r.runLimited && r.supplyBinding),
    },
    {
      k: "Units built",
      v: n0(v(r, "capacityUnits")),
      u: "line units",
      // Corrected: the original left a dangling ", + " on the end of this sentence.
      w:
        n0(v(r, "ownBuilt")) +
        " own after " +
        pct(100 - v(r, "supplierRel")) +
        " supplier loss and " +
        pct((1 - (r.staffing as Record<string, number>).operations) * 100) +
        " staffing loss",
    },
    {
      k: "Available to sell",
      v: n0(available),
      u: "units",
      w:
        PRODUCTS.filter((p) => r.P[p.id].live)
          .map((p) => p.name.split(" ").pop() + " " + n0(r.avail[p.id] as number))
          .join(" · ") + (r.supplyBinding ? " — " + n0(v(r, "unmetDemand")) + " units unmet" : ""),
      bind: Boolean(r.supplyBinding),
    },
    {
      k: "Units sold",
      v: n0(v(r, "unitsSold")),
      u: "units",
      w:
        PRODUCTS.filter((p) => (r.sold[p.id] as number) > 0)
          .map((p) => n0(r.sold[p.id] as number) + " " + p.name.split(" ").pop())
          .join(" + ") || "nothing sold",
      final: true,
    },
  ];

  const chain = rows.filter(Boolean) as ChainRow[];

  return (
    <div className="bg-white border border-stone-300">
      <header className="border-b border-stone-300 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Eyebrow tone="text-rose-800">Where the quarter narrowed</Eyebrow>
          <h3 className="font-serif text-lg">The constraint chain</h3>
        </div>
        <div className="text-xs text-stone-500 uppercase tracking-widest">Ledger red marks the binding gate</div>
      </header>
      <ol className="divide-y divide-stone-200">
        {chain.map((row, i) => (
          <li
            key={i}
            className={
              "px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 " +
              (row.bind
                ? "bg-rose-50 border-l-4 border-rose-700"
                : row.final
                  ? "bg-stone-900"
                  : row.strong
                    ? "bg-stone-50"
                    : "")
            }
          >
            <div
              className={
                "w-44 shrink-0 text-sm " +
                (row.final
                  ? "text-white font-semibold"
                  : row.bind
                    ? "text-rose-900 font-semibold"
                    : row.strong
                      ? "font-semibold text-stone-900"
                      : "text-stone-700")
              }
            >
              {row.k}
            </div>
            <div
              className={
                "font-mono text-lg " + (row.final ? "text-white" : row.bind ? "text-rose-800" : "text-stone-900")
              }
            >
              {row.v} <span className={"text-xs " + (row.final ? "text-stone-400" : "text-stone-500")}>{row.u}</span>
            </div>
            <div
              className={
                "text-xs font-mono flex-1 min-w-full sm:min-w-0 " +
                (row.final ? "text-stone-400" : row.bind ? "text-rose-800" : "text-stone-500")
              }
            >
              {row.w}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export { cr };
