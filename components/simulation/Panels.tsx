"use client";

/**
 * The screen-specific panels that sit above and below the grouped decisions: the innovation
 * board, the product portfolio, headcount, the credit facility and supplier terms, warranty
 * policy, the product pipeline, and the closing reflection.
 *
 * Ported from the shipped `NadiWear.html` bundle.
 */

import {
  DECISION_GROUPS,
  DEPARTMENTS,
  EXPECT_OPTIONS,
  INNOVATIONS,
  INNOVATION_BY_ID,
  INNOVATION_CATEGORIES,
  INTEREST_RATE,
  PAY_TERMS,
  PIPELINE_STAGES,
  PIPELINE_STAGE_BG,
  PRICE_ELASTICITY,
  PRODUCTS,
  PRODUCT_STATUS_COPY,
  PRIORITY_BY_ID,
  RISK_OPTIONS,
  TONE_BAR,
  TONE_CARD,
  TONE_TEXT,
  WARRANTY_OPTIONS,
  groupTotal,
  headcount,
  innoSum,
  numericAlloc,
} from "@/lib/simulation/constants";
import { inr, lakh, n0, n1, n2, num, pct, pw } from "@/lib/simulation/format";
import { pipelineBoard } from "@/lib/simulation/insights";
import {
  Bar,
  Eyebrow,
  Panel,
  TeachingNote,
  optionCard,
  optionMeta,
  optionNote,
  optionTitle,
} from "@/components/simulation/Kit";
import type {
  Alloc,
  CompanyState,
  Constraint,
  PayTermsId,
  PriorityId,
  ProductId,
  ProductState,
  QuarterResultShape,
  Reflection,
  Tone,
  WarrantyId,
} from "@/lib/simulation/types";

const v = (r: QuarterResultShape, k: string) => r[k] as number;

const choiceClass = (on: boolean) =>
  "text-left border px-3 py-2 text-sm transition-colors duration-150 ease-out " +
  (on
    ? "border-teal-deep bg-chrome text-white"
    : "border-line bg-raise text-ink hover:border-teal/50 hover:bg-raise-2");

/* ── the innovation board ─────────────────────────────────────────── */

const EFFECT_ORDER = ["ceiling", "innovation", "quality", "brand", "satisfaction", "repeat", "cogs"] as const;

const EFFECT_LABELS: Record<string, string> = {
  ceiling: "conversion ceiling",
  innovation: "innovation",
  quality: "quality",
  brand: "brand",
  satisfaction: "satisfaction",
  repeat: "repeat rate",
  cogs: "cost per unit",
};

export function InnovationBoard({
  s,
  startInno,
  setStartInno,
  p,
}: {
  s: CompanyState;
  startInno: string[];
  setStartInno: (ids: string[]) => void;
  p: QuarterResultShape | null;
}) {
  const toggle = (id: string) =>
    setStartInno(startInno.indexOf(id) >= 0 ? startInno.filter((x) => x !== id) : startInno.concat(id));
  const committed = startInno.reduce((sum, id) => sum + INNOVATION_BY_ID[id].cost, 0);

  return (
    <Panel
      eyebrow="The innovation board"
      title="Pick what the product becomes"
      right={
        <div className="text-right">
          <Eyebrow>Starting this quarter</Eyebrow>
          <div className="font-mono text-lg">{inr(committed)}</div>
        </div>
      }
    >
      <p className="text-sm text-dim mb-4">
        Every card is capitalised to the balance sheet and amortised at 8% a quarter, not expensed. Cards marked with a
        lead time are paid for now and land later — you are choosing what the product will be next quarter, not this one.
      </p>
      <TeachingNote id="capitalised" inline />
      <TeachingNote id="leadtime" inline />

      {INNOVATION_CATEGORIES.map((cat) => (
        <div key={cat} className="mb-5 last:mb-0">
          <Eyebrow tone="text-danger-deep">{cat}</Eyebrow>
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {INNOVATIONS.filter((c) => c.cat === cat).map((card) => {
              const shipped = s.innovations.indexOf(card.id) >= 0;
              const inFlight = Boolean(s.pipeline[card.id]);
              const picked = startInno.indexOf(card.id) >= 0;

              return (
                <button
                  key={card.id}
                  disabled={shipped || inFlight}
                  onClick={() => toggle(card.id)}
                  className={
                    "text-left border p-3 transition-colors duration-150 ease-out " +
                    (shipped
                      ? "border-teal-deep bg-teal/10 text-ink"
                      : inFlight
                        ? "border-ember bg-ember/10 text-ink"
                        : picked
                          ? "border-teal-deep bg-chrome text-white"
                          : "border-line bg-raise text-ink hover:border-teal/50 hover:bg-raise-2")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className={"font-serif text-base leading-snug " + optionTitle(picked)}>{card.name}</div>
                    <div className="font-mono text-sm shrink-0">
                      {shipped ? "Shipped" : inFlight ? n0(s.pipeline[card.id]) + "q left" : inr(card.cost)}
                    </div>
                  </div>
                  <div className={"text-xs mt-1 " + (picked ? "text-faint" : "text-dim")}>{card.blurb}</div>
                  <div className="flex flex-wrap gap-x-3 mt-2">
                    {EFFECT_ORDER.filter((k) => card.effect[k]).map((k) => {
                      const amount = card.effect[k] as number;
                      return (
                        <span
                          key={k}
                          className={
                            "text-xs font-mono " +
                            (picked
                              ? amount > 0 && k !== "cogs"
                                ? "text-teal-bright"
                                : "text-danger-soft"
                              : k === "cogs" && amount > 0
                                ? "text-danger"
                                : "text-teal-deep")
                          }
                        >
                          {k === "cogs"
                            ? (amount > 0 ? "+" : "−") + inr(Math.abs(amount)) + " a unit"
                            : "+" + amount + " " + EFFECT_LABELS[k]}
                        </span>
                      );
                    })}
                    {card.lead > 0 && (
                      <span className={"text-xs font-mono " + (picked ? "text-ember-soft" : "text-ember-deep")}>
                        lands in {card.lead} quarter
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {p && (
        <div className="border-t border-line pt-3 mt-2 text-sm text-dim">
          With everything shipped, the product would carry a conversion ceiling of{" "}
          <span className="font-mono text-ink">{pct(v(p, "ceiling"))}</span>.
          {p.ceilingBinding
            ? " On this plan, that is the binding constraint."
            : " On this plan, the product is not the constraint."}
        </div>
      )}
    </Panel>
  );
}

/* ── the product portfolio ────────────────────────────────────────── */

export function ProductPortfolio({
  s,
  products,
  setProducts,
  p,
}: {
  s: CompanyState;
  products: Record<ProductId, ProductState>;
  setProducts: (v: Record<ProductId, ProductState>) => void;
  p: QuarterResultShape | null;
}) {
  const update = (id: ProductId, patch: Partial<ProductState>) =>
    setProducts({ ...products, [id]: { ...products[id], ...patch } });
  const live = PRODUCTS.filter((prod) => products[prod.id].live);

  return (
    <div className="space-y-4">
      <Panel
        eyebrow="Product portfolio"
        title={live.length > 1 ? "Two products, one production line" : "One product on sale"}
      >
        <p className="text-sm text-dim mb-4">
          Price is yours to set. Demand moves against a market reference of {inr(PRODUCTS[0].refPrice)} for the Pulse and{" "}
          {inr(PRODUCTS[1].refPrice)} for the Pro — charge less and volume rises, charge more and it falls, roughly to
          the power of {n1(PRICE_ELASTICITY)}.
        </p>
        <TeachingNote id="pricing" inline />

        <div className="space-y-4">
          {PRODUCTS.map((prod) => {
            const cur = products[prod.id];
            const info = p ? p.priceInfo[prod.id] : null;

            if (!cur.live) {
              return (
                <div key={prod.id} className="border border-dashed border-line-2 p-4">
                  <div className="font-serif text-lg text-dim">{prod.name}</div>
                  <div className="text-sm text-dim mt-1">
                    Not developed yet — {n0(s.npd)} of 100. Fund New Product Development to bring it to market.
                  </div>
                </div>
              );
            }

            return (
              <div
                key={prod.id}
                className={
                  "border p-4 " +
                  (cur.status === "discontinued"
                    ? "border-danger bg-danger/10"
                    : cur.status === "paused"
                      ? "border-ember bg-ember/10"
                      : "border-line")
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-serif text-xl text-ink">{prod.name}</div>
                    <div className="text-xs text-dim">{prod.blurb}</div>
                  </div>
                  <div className="text-right">
                    <Eyebrow>Stock on hand</Eyebrow>
                    <div className="font-mono text-lg text-ink">{n0(num(cur.inv))} units</div>
                    <div className="text-xs text-dim">at {inr(num(cur.invCost))} each</div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div>
                    <Eyebrow>Price</Eyebrow>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-dim font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={cur.price}
                        onChange={(e) => update(prod.id, { price: Math.max(0, num(e.target.value)) })}
                        className="w-32 border border-line-2 px-2 py-1 text-right font-mono focus:outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                    {info && (
                      <div className="text-xs font-mono mt-2 space-y-0.5">
                        <div className={Math.abs(info.premium) > 20 ? "text-ember-deep" : "text-dim"}>
                          {info.premium >= 0 ? "+" : ""}
                          {n0(info.premium)}% against a market reference of {inr(info.ref)}
                        </div>
                        <div className={info.mult >= 1 ? "text-teal-deep" : "text-danger-deep"}>demand ×{n2(info.mult)}</div>
                        {num(cur.invCost) > 0 && (
                          <div className={cur.price > num(cur.invCost) ? "text-dim" : "text-danger-deep font-semibold"}>
                            {inr(cur.price - num(cur.invCost))} a unit above your last known cost of{" "}
                            {inr(num(cur.invCost))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Eyebrow>Share of the production line</Eyebrow>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={num(cur.share)}
                        disabled={cur.status !== "active"}
                        onChange={(e) => update(prod.id, { share: num(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="font-mono text-xl w-14 text-right">{n0(num(cur.share))}%</div>
                    </div>
                    <div className="text-xs font-mono text-dim mt-2">
                      {prod.capacityCost !== 1
                        ? "each unit uses " + n1(prod.capacityCost) + " units of line capacity"
                        : "one unit of line capacity each"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Eyebrow>Production decision</Eyebrow>
                  <div className="grid gap-2 sm:grid-cols-3 mt-1">
                    {(["active", "paused", "discontinued"] as const).map((status) => {
                      const on = cur.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => update(prod.id, { status })}
                          className={optionCard(on, "p-2")}
                        >
                          <div className={"font-serif capitalize " + optionTitle(on)}>
                            {status === "active" ? "Keep building" : status === "paused" ? "Pause production" : "Discontinue"}
                          </div>
                          <div className={"text-xs mt-1 " + optionNote(on)}>
                            {PRODUCT_STATUS_COPY[status]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ── headcount ────────────────────────────────────────────────────── */

export function PeoplePanel({
  s,
  alloc,
  setAlloc,
  p,
}: {
  s: CompanyState;
  alloc: Alloc;
  setAlloc: (a: Alloc) => void;
  p: QuarterResultShape | null;
}) {
  const set = (key: string, val: string) => setAlloc({ ...alloc, [key]: val.replace(/^-/, "") });

  return (
    <Panel
      eyebrow="Headcount by function"
      title={n0(headcount(s.staff)) + " people today, " + (p ? n0(v(p, "headcount")) : "—") + " at quarter end"}
    >
      <p className="text-sm text-dim mb-4">
        Each function does one job. Hire and the salary is yours every quarter from now on, and new joiners work at 60%
        for their first. Cut and you pay severance once, lose the work immediately, and take morale and attrition with
        it. Nobody can be cut below the founding team in that function.
      </p>
      <TeachingNote id="ramp" inline />
      <TeachingNote id="attrition" inline />

      <div className="space-y-3">
        {DEPARTMENTS.map((d) => {
          const now = num(s.staff[d.id]);
          const hire = Math.round(num(alloc["hire_" + d.id]));
          const cut = Math.min(Math.round(num(alloc["fire_" + d.id])), Math.max(0, now - d.base));
          const after = now + hire - cut;
          const ratio = p ? (p.staffing as Record<string, number>)[d.id] : 1;
          const needed = p ? (p.need as Record<string, number>)[d.id] : d.base;
          const tone: Tone = ratio >= 0.999 ? "good" : ratio >= 0.85 ? "watch" : "bad";

          return (
            <div key={d.id} className={"border p-3 " + (ratio >= 0.999 ? "border-line bg-raise" : TONE_CARD[tone])}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="font-serif text-lg text-ink">{d.name}</div>
                  <div className="text-xs text-dim">
                    {d.drives} · {inr(d.salary)} a quarter each
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg text-ink">
                    {n0(now)} → {n0(after)}
                  </div>
                  <div className={"text-xs font-mono " + TONE_TEXT[tone]}>
                    {p ? "needs " + n1(needed) + ", running at " + pct(ratio * 100) : ""}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-dim w-10">Hire</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={alloc["hire_" + d.id]}
                    placeholder="0"
                    onChange={(e) => set("hire_" + d.id, e.target.value)}
                    className="w-20 border border-line-2 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                  />
                  <span className="text-xs font-mono text-dim">
                    {hire > 0
                      ? inr(hire * d.hire) + " now, " + inr(hire * d.salary) + " every quarter"
                      : inr(d.hire) + " each to recruit"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-dim w-10">Cut</span>
                  <input
                    type="number"
                    min="0"
                    max={Math.max(0, now - d.base)}
                    step="1"
                    value={alloc["fire_" + d.id]}
                    placeholder="0"
                    onChange={(e) => set("fire_" + d.id, e.target.value)}
                    className="w-20 border border-line-2 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                  />
                  <span className="text-xs font-mono text-dim">
                    {cut > 0
                      ? inr(cut * d.sever) + " severance, saves " + inr(cut * d.salary) + " a quarter"
                      : n0(Math.max(0, now - d.base)) + " above the founding " + n0(d.base)}
                  </span>
                </div>
              </div>

              <div className={"text-xs mt-2 leading-snug " + (cut > 0 ? "text-danger-deep" : ratio < 0.999 ? TONE_TEXT[tone] : "text-dim")}>
                {cut > 0 ? "If you cut here: " + d.ifCut : ratio < 0.999 ? d.ifShort : "Fully staffed for what you have funded."}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── credit and supplier terms ────────────────────────────────────── */

export function FinancePanel({
  s,
  alloc,
  setAlloc,
  payTerms,
  setPayTerms,
  p,
}: {
  s: CompanyState;
  alloc: Alloc;
  setAlloc: (a: Alloc) => void;
  payTerms: PayTermsId;
  setPayTerms: (v: PayTermsId) => void;
  p: QuarterResultShape | null;
}) {
  const limit = p ? v(p, "debtLimit") : 0;
  const drawn = p ? v(p, "drawn") : 0;
  const overLimit = num(alloc.draw) * 1e5 > limit + 1;

  return (
    <div className="space-y-4">
      <Panel eyebrow="Credit facility" title={"Up to " + inr(limit) + " available"}>
        <p className="text-sm text-dim mb-3">
          Capped at 60% of net worth, less what you already owe. Interest runs at 3.5% a quarter on the average balance.
          Drawn cash raises this quarter&apos;s ceiling for every department.
        </p>
        <TeachingNote id="gearing" inline />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Draw down</Eyebrow>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-dim font-mono text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={alloc.draw}
                placeholder="0"
                onChange={(e) => setAlloc({ ...alloc, draw: e.target.value.replace(/^-/, "") })}
                className={
                  "w-28 border px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ink " +
                  (overLimit ? "border-danger text-danger-deep" : "border-line-2")
                }
              />
              <span className="text-xs uppercase tracking-widest text-dim">lakh</span>
            </div>
            <div className="text-xs font-mono text-dim mt-2 space-y-0.5">
              <div className="text-teal-deep">{inr(drawn)} into cash today</div>
              <div>{inr((s.debt + drawn) * INTEREST_RATE)} of interest this quarter</div>
              {overLimit && (
                <div className="text-danger-deep">{inr(num(alloc.draw) * 1e5 - limit)} over the limit will be refused.</div>
              )}
            </div>
          </div>

          <div>
            <Eyebrow>Repay</Eyebrow>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-dim font-mono text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={alloc.repay}
                placeholder="0"
                onChange={(e) => setAlloc({ ...alloc, repay: e.target.value.replace(/^-/, "") })}
                className="w-28 border border-line-2 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <span className="text-xs uppercase tracking-widest text-dim">lakh</span>
            </div>
            <div className="text-xs font-mono text-dim mt-2 space-y-0.5">
              <div>{inr(s.debt)} outstanding today</div>
              <div>{inr(p ? v(p, "debtClose") : s.debt)} at quarter end</div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Supplier payment terms" title="Where your working capital sits">
        <p className="text-sm text-dim mb-3">
          One choice that moves your cost per unit, your supplier reliability and how much cash the balance sheet holds.
          It reaches straight into Operations.
        </p>
        <TeachingNote id="payables" inline />

        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(PAY_TERMS).map((t) => {
            const on = payTerms === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPayTerms(t.id)}
                className={optionCard(on)}
              >
                <div className={"font-serif text-base " + optionTitle(on)}>{t.name}</div>
                <div className={"text-xs font-mono mt-1 " + optionMeta(on)}>
                  cost {t.cogsMult === 1 ? "unchanged" : (t.cogsMult < 1 ? "−" : "+") + pct(Math.abs(1 - t.cogsMult) * 100)} ·
                  reliability {(t.rel >= 0 ? "+" : "") + t.rel}
                </div>
                <div className={"text-xs mt-1 " + optionNote(on)}>{t.note}</div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ── warranty ─────────────────────────────────────────────────────── */

export function WarrantyPanel({
  warranty,
  setWarranty,
  p,
}: {
  warranty: WarrantyId;
  setWarranty: (v: WarrantyId) => void;
  p: QuarterResultShape | null;
}) {
  const defect = p ? v(p, "defectRate") : 8;

  return (
    <Panel eyebrow="Warranty policy" title={"Defect rate this quarter: " + pct(defect)}>
      <div className="grid gap-3 sm:grid-cols-3">
        {WARRANTY_OPTIONS.map((opt) => {
          const on = warranty === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setWarranty(opt.id)}
              className={optionCard(on)}
            >
              <div className={"font-serif text-lg " + optionTitle(on)}>{opt.name}</div>
              <div className={"text-xs mt-1 " + optionMeta(on)}>{opt.conv}</div>
              <div className={"text-xs mt-1 " + optionNote(on)}>{opt.cost}</div>
              <div className={"text-xs font-mono mt-2 " + optionNote(on)}>
                {opt.mult ? inr(1000 * (defect / 100) * 1500 * opt.mult) + " per 1,000 units" : "₹0 per 1,000 units"}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

/* ── the product pipeline ─────────────────────────────────────────── */

export function ProductFocus({
  s,
  p,
  last,
  startInno,
  alloc,
}: {
  s: CompanyState;
  p: QuarterResultShape | null;
  last: QuarterResultShape | undefined;
  startInno: string[];
  alloc: Alloc;
}) {
  const board = pipelineBoard(s, p, startInno);
  const A = numericAlloc(alloc);

  const delta = (now: number, before: number | null) => {
    if (before == null) return null;
    const d = now - before;
    if (Math.abs(d) < 0.05) return null;
    return { up: d > 0, txt: (d > 0 ? "+" : "") + n1(d) };
  };

  const headline = [
    {
      label: "Innovation score",
      value: n0(p ? v(p, "innovation") : s.innovation),
      d: delta(p ? v(p, "innovation") : s.innovation, last ? v(last, "innovation") : null),
    },
    {
      label: "Product quality",
      value: n0(p ? v(p, "quality") : s.quality),
      d: delta(p ? v(p, "quality") : s.quality, last ? v(last, "quality") : null),
    },
    {
      label: "Conversion ceiling",
      value: p ? pct(v(p, "ceiling")) : "—",
      d: p ? delta(v(p, "ceiling"), last ? v(last, "ceiling") : null) : null,
    },
    {
      label: "Defect rate",
      value: p ? pct(v(p, "defectRate")) : "—",
      d: p ? delta(v(p, "defectRate"), last ? v(last, "defectRate") : null) : null,
      lowerBetter: true,
    },
  ];

  const rndExpensed = (A.quality + A.npd + A.design) * 1e5;
  const rndCapitalised = (startInno || []).reduce((sum, id) => sum + INNOVATION_BY_ID[id].cost, 0);
  const engBandwidth = p ? (p.staffing as Record<string, number>).engineering : 1;
  const quartersLeft = 5 - s.quarter;

  const ceilingMove =
    innoSum(startInno.filter((id) => INNOVATION_BY_ID[id].lead === 0), "ceiling") +
    innoSum(Object.keys(s.pipeline).filter((id) => s.pipeline[id] <= 1), "ceiling") +
    (p && last ? v(p, "ceiling") - v(last, "ceiling") : p ? v(p, "ceiling") - 22 : 0);
  const cogsMove = innoSum(startInno, "cogs") - 40 * pw(A.design, 0.5);
  const brandMove = innoSum(startInno, "brand") + 1.8 * pw(A.design, 0.5);
  const satMove = innoSum(startInno, "satisfaction");

  const band = (x: number, high: number, mid: number) =>
    Math.abs(x) >= high ? "High" : Math.abs(x) >= mid ? "Medium" : Math.abs(x) > 0.01 ? "Low" : "None";

  const impacts = [
    { label: "Conversion ceiling", band: band(ceilingMove, 5, 2), good: ceilingMove > 0 },
    { label: "Cost per unit", band: band(cogsMove, 300, 120), good: cogsMove < 0 },
    { label: "Brand value", band: band(brandMove, 6, 2), good: brandMove > 0 },
    { label: "Customer satisfaction", band: band(satMove, 4, 2), good: satMove > 0 },
    { label: "Time to a second product", band: band(A.npd, 6, 3), good: A.npd > 0 },
  ];

  const cheapest = board.backlog.length
    ? board.backlog.reduce((a, b) => (a.cost < b.cost ? a : b))
    : null;

  return (
    <div className="space-y-4">
      <Panel eyebrow="Product focus" title="Build the right product, and know what state it is in">
        <div className="grid gap-4 sm:grid-cols-4">
          {headline.map((h) => (
            <div key={h.label} className="border-l-2 border-line pl-3">
              <Eyebrow>{h.label}</Eyebrow>
              <div className="font-mono text-2xl leading-tight">{h.value}</div>
              {h.d && (
                <div
                  className={
                    "text-xs font-mono " +
                    ((h.lowerBetter ? !h.d.up : h.d.up) ? "text-teal-deep" : "text-danger")
                  }
                >
                  {(h.lowerBetter ? !h.d.up : h.d.up) ? "▲" : "▼"} {h.d.txt} vs last quarter
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="bg-raise border border-line">
        <header className="border-b border-line px-4 py-3">
          <Eyebrow tone="text-danger-deep">Product pipeline</Eyebrow>
          <h3 className="font-serif text-lg text-ink">Where everything stands</h3>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-line border-b border-line">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "w-5 h-5 flex items-center justify-center text-xs font-mono text-white " + PIPELINE_STAGE_BG[stage.id]
                  }
                >
                  {stage.n}
                </span>
                <span className="text-sm font-semibold text-ink">{stage.label}</span>
              </div>
              <div className="font-mono text-2xl mt-1 text-ink">{board.counts[stage.id as keyof typeof board.counts]}</div>
              <div className="text-xs text-dim">{stage.sub}</div>
            </div>
          ))}
        </div>

        <div className="p-4">
          {board.counts.development + board.counts.ready === 0 && (
            <div className="border-l-4 border-ember bg-ember/10 px-3 py-2 mb-3 text-sm text-ink">
              Nothing is in development. The product will only improve at the speed of continuous R&amp;D, and the
              conversion ceiling moves with it — which is what caps every rupee sales and marketing spend.
            </div>
          )}
          {board.items.length === 0 ? (
            <p className="text-sm text-dim">Nothing to show yet.</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {board.items.map((item) => (
                <div
                  key={item.kind + item.id}
                  className={
                    "border p-3 " +
                    (item.warn
                      ? "border-ember bg-ember/10"
                      : item.stage === "live"
                        ? "border-line bg-raise"
                        : "border-line bg-raise")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-serif text-base leading-snug text-ink">{item.name}</div>
                    <span
                      className={
                        "px-1.5 py-0.5 text-xs uppercase tracking-widest shrink-0 " +
                        (item.stage === "live"
                          ? "bg-chrome text-white"
                          : item.stage === "ready"
                            ? "bg-teal-deep text-white"
                            : "bg-ember-deep text-white")
                      }
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-dim">{item.label}</span>
                      <span>{n0(item.pct)}%</span>
                    </div>
                    <Bar
                      value={item.pct}
                      max={100}
                      tone={item.stage === "live" ? "bg-chrome" : item.stage === "ready" ? "bg-teal-deep" : "bg-ember"}
                    />
                  </div>
                  <div className={"text-xs font-mono mt-2 " + (item.warn ? "text-ember-deep" : "text-ink")}>
                    {item.eta}
                  </div>
                  <div className="text-xs text-dim mt-1 leading-snug">{item.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-1">
        <TeachingNote id="npd" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel eyebrow="Resources and constraints" title="What engineering can actually absorb">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>R&amp;D committed this quarter</span>
                <span className="font-mono">{inr(rndExpensed + rndCapitalised)}</span>
              </div>
              <div className="text-xs text-dim font-mono">
                {inr(rndExpensed)} expensed, {inr(rndCapitalised)} capitalised to the balance sheet
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Engineering bandwidth</span>
                <span
                  className={
                    "font-mono " + TONE_TEXT[engBandwidth >= 0.999 ? "good" : engBandwidth >= 0.85 ? "watch" : "bad"]
                  }
                >
                  {pct(engBandwidth * 100)}
                </span>
              </div>
              <Bar
                value={engBandwidth * 100}
                max={100}
                tone={TONE_BAR[engBandwidth >= 0.999 ? "good" : engBandwidth >= 0.85 ? "watch" : "bad"]}
              />
              <div className="text-xs text-dim mt-1">
                {engBandwidth >= 0.999
                  ? "The team can deliver everything you have funded."
                  : "Every rupee of quality, innovation and new product work is delivering " +
                    pct(engBandwidth * 100) +
                    " of what you paid for. Hire engineers or fund less."}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Cards left on the board</span>
                <span className="font-mono">
                  {board.backlog.length} of {INNOVATIONS.length}
                </span>
              </div>
              <div className="text-xs text-dim">
                Cheapest unstarted:{" "}
                {cheapest ? cheapest.name + " at " + inr(cheapest.cost) : "everything is started or shipped"}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Time left in the year</span>
                <span className="font-mono">
                  {quartersLeft} quarter{quartersLeft === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-xs text-dim">
                Anything with a lead time started after Q3 will not ship before the year closes.
              </div>
              <TeachingNote id="leadtime" />
            </div>
          </div>
        </Panel>

        <Panel eyebrow="Decision impact" title="What these product choices move">
          <p className="text-xs text-dim mb-3">
            Direction and magnitude of the product decisions on this screen. Not a forecast of the quarter.
          </p>
          <div className="space-y-2">
            {impacts.map((impact) => (
              <div key={impact.label} className="flex items-center justify-between border-b border-line pb-1.5">
                <span className="text-sm text-ink">{impact.label}</span>
                <span
                  className={
                    "text-xs uppercase tracking-widest font-semibold " +
                    (impact.band === "None" ? "text-faint" : impact.good ? "text-teal-deep" : "text-danger-deep")
                  }
                >
                  {impact.band === "None" ? "—" : (impact.good ? "▲ " : "▼ ") + impact.band}
                </span>
              </div>
            ))}
          </div>
          {Boolean(p?.ceilingBinding) && (
            <div className="mt-3 border-l-4 border-danger bg-danger/10 px-3 py-2 text-xs text-danger-deep">
              The product is the binding constraint right now. Selling harder cannot help until this moves.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ── the closing reflection ───────────────────────────────────────── */

/** A reflection is complete once the constraint, the risk and the expectation are answered. */
export const reflectionComplete = (r: Reflection | undefined): boolean =>
  Boolean(r && r.constraint && r.risk && r.expect);

export function ReflectionForm({
  constraint,
  reflection,
  setReflection,
  priority,
  alloc,
}: {
  constraint: Constraint | null;
  reflection: Reflection;
  setReflection: (r: Reflection) => void;
  priority: PriorityId | null;
  alloc: Alloc;
}) {
  const A = numericAlloc(alloc);
  const all = Object.entries(DECISION_GROUPS).flatMap(([dept, g]) =>
    g.items.map((it) => ({ dept, it, v: groupTotal(A, it) })),
  );
  const funded = all.filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const unfunded = all.filter((x) => x.v <= 0);

  const set = (key: keyof Reflection, val: unknown) => setReflection({ ...reflection, [key]: val });
  const toggleSacrifice = (id: string) =>
    set(
      "sacrifice",
      (reflection.sacrifice || []).indexOf(id) >= 0
        ? (reflection.sacrifice || []).filter((x) => x !== id)
        : (reflection.sacrifice || []).concat(id),
    );

  return (
    <Panel eyebrow="Before you close" title="Why did you make these decisions?">
      <div className="space-y-5">
        <div>
          <div className="font-serif text-base text-ink">1. What was the biggest constraint you were solving?</div>
          <div className="grid gap-2 sm:grid-cols-2 mt-2">
            {(constraint ? constraint.all : []).map((c) => (
              <button key={c.id} onClick={() => set("constraint", c.id)} className={choiceClass(reflection.constraint === c.id)}>
                {c.label}
              </button>
            ))}
            <button onClick={() => set("constraint", "other")} className={choiceClass(reflection.constraint === "other")}>
              Something else entirely
            </button>
          </div>
        </div>

        <div>
          <div className="font-serif text-base text-ink">2. What did you fund?</div>
          <p className="text-xs text-dim mt-1">Taken from your decisions, not your description of them.</p>
          <div className="mt-2 text-sm text-ink font-mono">
            {funded.length
              ? funded
                  .slice(0, 4)
                  .map((x) => x.it.name + " " + lakh(x.v))
                  .join("  ·  ")
              : "Nothing funded this quarter."}
          </div>
          {priority && (
            <div className="text-xs text-dim mt-1">
              You said you would prioritise: {PRIORITY_BY_ID[priority].name.toLowerCase()}.
            </div>
          )}
        </div>

        <div>
          <div className="font-serif text-base text-ink">3. What did you deliberately choose not to fund?</div>
          <p className="text-xs text-dim mt-1">
            Naming a sacrifice is the difference between a trade-off and an oversight.
          </p>
          <TeachingNote id="reflection" inline />
          <div className="grid gap-2 sm:grid-cols-3 mt-2">
            {unfunded.slice(0, 9).map((x) => (
              <button
                key={x.it.id}
                onClick={() => toggleSacrifice(x.it.id)}
                className={choiceClass((reflection.sacrifice || []).indexOf(x.it.id) >= 0)}
              >
                {x.it.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-serif text-base text-ink">4. What risk are you accepting?</div>
          <div className="grid gap-2 sm:grid-cols-2 mt-2">
            {RISK_OPTIONS.map((o) => (
              <button key={o.id} onClick={() => set("risk", o.id)} className={choiceClass(reflection.risk === o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-serif text-base text-ink">5. What do you expect to happen?</div>
          <div className="grid gap-2 sm:grid-cols-4 mt-2">
            {EXPECT_OPTIONS.map((o) => (
              <button key={o.id} onClick={() => set("expect", o.id)} className={choiceClass(reflection.expect === o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-serif text-base text-ink">
            Anything else, in a sentence or two? <span className="text-dim text-sm">(optional)</span>
          </div>
          <textarea
            value={reflection.note || ""}
            onChange={(e) => set("note", e.target.value)}
            rows={2}
            placeholder="Only if there is something the four answers above do not capture."
            className="w-full border border-line-2 p-3 text-sm bg-raise mt-2 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>
    </Panel>
  );
}
