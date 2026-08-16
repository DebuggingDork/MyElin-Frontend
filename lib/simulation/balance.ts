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
import type { CompanyState, QuarterResultShape } from "@/lib/simulation/types";

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
  };
}

