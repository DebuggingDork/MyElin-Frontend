/**
 * Balance-sheet views.
 *
 * The simulation engine itself lives in the backend (`app/engines/simulation/`); this file
 * is all that remains on the client, and it computes nothing -- it only reshapes a state or a
 * result the server already produced into the opening/closing columns the balance sheet
 * renders. Deliberately kept small: a second copy of any engine logic here could disagree
 * with the one that grades the quarter.
 */

import { OTHER_LIABILITIES, PRODUCTS, SHARE_CAPITAL } from "@/lib/simulation/constants";
import { num } from "@/lib/simulation/format";
import type { Budget, CompanyState, QuarterResultShape } from "@/lib/simulation/types";

/* ── balance-sheet views ──────────────────────────────────────────── */

export type BalanceView = {
  cash: number;
  ar: number;
  inventory: number;
  equipment: number;
  ip: number;
  assets: number;
  ap: number;
  debt: number;
  other: number;
  liabilities: number;
  share: number;
  re: number;
  equity: number;
  invUnits: number;
  /** Money raised into the company this quarter and not yet spent. Zero except on the
   *  committed view of a quarter with a signed term sheet behind it. */
  raised: number;
};

/** The balance sheet as the quarter opened. */
export function balanceOpening(s: CompanyState): BalanceView {
  const inventory = PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv) * num(s.products[p.id].invCost), 0);
  const assets = s.cash + s.ar + inventory + s.equipment + s.ip;
  const liabilities = s.ap + s.debt + OTHER_LIABILITIES;
  return {
    cash: s.cash,
    ar: s.ar,
    inventory,
    equipment: s.equipment,
    ip: s.ip,
    assets,
    ap: s.ap,
    debt: s.debt,
    other: OTHER_LIABILITIES,
    liabilities,
    share: SHARE_CAPITAL,
    re: s.retainedEarnings,
    equity: SHARE_CAPITAL + s.retainedEarnings,
    invUnits: PRODUCTS.reduce((sum, p) => sum + num(s.products[p.id].inv), 0),
    raised: 0,
  };
}

/** The balance sheet as the quarter closed. */
export function balanceClosing(r: QuarterResultShape): BalanceView {
  return {
    cash: r.cash as number,
    ar: r.arClose as number,
    inventory: r.invValue as number,
    equipment: r.equipment as number,
    ip: r.ipAsset as number,
    assets: r.totalAssets as number,
    ap: r.apClose as number,
    debt: r.debtClose as number,
    other: OTHER_LIABILITIES,
    liabilities: r.totalLiabilities as number,
    share: SHARE_CAPITAL,
    re: r.retainedEarnings as number,
    equity: r.equity as number,
    invUnits: r.invUnitsOut as number,
    // Already inside `equity` by the time the quarter closes.
    raised: 0,
  };
}

/**
 * The sheet as the plan leaves it, before the quarter runs.
 *
 * Deliberately *not* a forecast of the close. The quarter's revenue, profit and closing cash
 * are withheld until it locks -- that withholding is the product -- so this applies only what
 * the CEO has actually committed to the opening sheet: capitalised spend becomes an asset,
 * credit drawn becomes cash and a borrowing, and operating spend leaves both cash and reserves.
 * Nothing the engine has yet to decide appears here.
 *
 * It balances by construction: every line moves something on both sides, so total assets and
 * total equity-and-liabilities stay equal to the rupee.
 */
export function balanceCommitted(s: CompanyState, budget: Budget): BalanceView {
  const opening = balanceOpening(s);
  const financing = budget.drawn - budget.repay + budget.investment;
  // Operating spend and the people bill are expenses: they leave the bank and the reserves
  // together. Plant and the innovation board are not -- they change what the cash became.
  const expensed = budget.opex + budget.people;

  const cash = opening.cash + financing - expensed - budget.capex - budget.inno;
  const equipment = opening.equipment + budget.capex;
  const ip = opening.ip + budget.inno;
  const debt = opening.debt + budget.drawn - budget.repay;
  const re = opening.re - expensed;

  return {
    ...opening,
    cash,
    equipment,
    ip,
    assets: cash + opening.ar + opening.inventory + equipment + ip,
    debt,
    liabilities: opening.ap + debt + opening.other,
    re,
    raised: budget.investment,
    equity: SHARE_CAPITAL + re + budget.investment,
  };
}

