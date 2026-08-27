import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ============================================================================
   NADI WEAR PVT. LTD.  —  four-quarter D2C hardware operating simulation
   Single file. All state in memory. No storage, no network.
   ========================================================================== */

const num = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const pw = (x, p) => Math.pow(Math.max(0, num(x)), p);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const inr = (v) => (v < 0 ? "-" : "") + "₹" + Math.abs(Math.round(num(v))).toLocaleString("en-IN");
const lakh = (v) => "₹" + num(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + "L";
const cr = (v) => (v < 0 ? "-" : "") + "₹" + Math.abs(num(v) / 10000000).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " Cr";
const d0 = (v) => Math.round(num(v)).toLocaleString("en-IN");
const d1 = (v) => num(v).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const d2 = (v) => num(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v) => d1(v) + "%";

const WC_BUFFER = 1000000;
/* The market. One definition, used everywhere: the 2,50,000-customer
   addressable base the simulation already assumed, expressed as the units the
   whole category actually buys in a given quarter. Market share is always
   company units sold divided by this number. */
const TAM_CUSTOMERS = 250000;
const MARKET_PENETRATION = [0.048, 0.054, 0.061, 0.068];
const marketDemand = (q) => TAM_CUSTOMERS * MARKET_PENETRATION[clamp(Math.round(q), 1, 4) - 1];
// A plain-language estimate of how many buyers you could realistically reach THIS quarter,
// shown BEFORE you allocate so sizing Sales and Operations isn't a guess. It assumes you fund
// Marketing well enough to be heard and price close to the market -- the real number, shown
// after the quarter closes, depends on the choices you're about to make.
function estimateAddressableDemand(s, q) {
  const rivalGrow = Math.pow(1 + RIVAL_GROWTH, q - 1);
  const rivalTotal = RIVALS.reduce((t, rv) => t + rv.strength * rivalGrow, 0);
  const productPull = Math.max(4, 16 + num(s.brand) + 0.6 * num(s.innovation) + 0.5 * num(s.quality) + 0.25 * (num(s.satisfaction) - 50));
  const fillIdx = 0.75 + 0.25 * clamp(num(s.fillRate), 0, 1);
  const ourStrength = productPull * fillIdx;
  const attractShare = ourStrength / (ourStrength + rivalTotal);
  return Math.round(marketDemand(q) * attractShare);
}
const RIVALS = [
  { id: "kalpa", name: "Kalpa Labs", pos: "Value", strength: 52,
    note: "Shenzhen-backed, undercuts everyone on price." },
  { id: "vega", name: "Vega Health", pos: "Mass market", strength: 46,
    note: "Outspends the category on media and celebrity." },
  { id: "zenith", name: "Zenith", pos: "Premium", strength: 58,
    note: "Ships the feature everyone else copies next year." },
  { id: "tail", name: "The long tail", pos: "Unbranded", strength: 84,
    note: "Dozens of white-label brands on the marketplaces." },
];
const RIVAL_GROWTH = 0.05;          // rivals do not stand still

const OTHER_LIABILITIES = 1200000;
const SHARE_CAPITAL = 40000000;
const FIXED_OVERHEAD = 250000;
const DEP_RATE = 0.05, AMORT_RATE = 0.08, DEBT_RATE = 0.035;
const AR_FLOOR = 800000;
const PRICE_ELASTICITY = 1.2;

/* ================================= PEOPLE =================================
   Headcount is held by function. Each function does a specific job, and the
   consequence of being short in one is different from being short in another.
   ========================================================================== */
const ROLES = [
  { id: "marketing", name: "Marketing", salary: 130000, hire: 200000, sever: 240000, base: 2,
    drives: "Campaign execution",
    ifShort: "Campaigns run late and untuned. Every lead you paid for is discounted by the shortfall.",
    ifCut: "Leads fall immediately, in the same quarter, across every channel you funded." },
  { id: "sales", name: "Sales & field", salary: 120000, hire: 180000, sever: 220000, base: 4,
    drives: "Selling capacity",
    ifShort: "Leads arrive and sit unworked. Capacity is throttled to the staffing you actually have.",
    ifCut: "Selling capacity drops the same quarter and leads spill unconverted." },
  { id: "engineering", name: "Engineering & product", salary: 175000, hire: 300000, sever: 320000, base: 3,
    drives: "R&D output and the conversion ceiling",
    ifShort: "Quality, innovation and new product work all deliver less than you paid for.",
    ifCut: "The product stops improving. The conversion ceiling stalls while sales keeps pushing against it." },
  { id: "operations", name: "Operations & production", salary: 115000, hire: 160000, sever: 200000, base: 3,
    drives: "Production throughput",
    ifShort: "The line runs below the capacity you own. You build fewer units than the plant allows.",
    ifCut: "Production falls even though the plant is unchanged. Unmet demand appears immediately." },
  { id: "support", name: "Support & success", salary: 95000, hire: 130000, sever: 165000, base: 1,
    drives: "Satisfaction and repeat purchase",
    ifShort: "Satisfaction and onboarding spend under-deliver, and repeat buying slows.",
    ifCut: "Customer satisfaction falls, taking conversion and repeat purchases with it." },
  { id: "admin", name: "Finance & admin", salary: 140000, hire: 200000, sever: 250000, base: 1,
    drives: "Compliance, audit and financial control",
    ifShort: "Governance spend under-delivers and penalty risk stays high.",
    ifCut: "Compliance and audit readiness stop improving. Penalty exposure rises." },
];
const ROLE_IDS = ROLES.map((r) => r.id);
const CORE_STAFF = Object.fromEntries(ROLES.map((r) => [r.id, r.base]));
const CORE_HEADCOUNT = ROLES.reduce((t, r) => t + r.base, 0);
/* which spend lines create work for which function, and how much spend one
   person can carry in a quarter */
const ROLE_LOAD = {
  marketing: { keys: ["google", "meta", "social", "content", "events", "email", "direct", "referral", "buzz"], per: 1100000 },
  sales: { keys: ["reps", "crm", "onboarding", "salesTraining", "channel", "keyAccounts"], per: 950000 },
  engineering: { keys: ["quality", "innovation", "npd", "design"], per: 1100000 },
  operations: { keys: ["production", "capex", "contract", "supplier", "logistics", "warehouse"], per: 1300000 },
  support: { keys: ["cx", "onboarding"], per: 800000 },
  admin: { keys: ["compliance", "planning", "audit", "workingCapital", "treasury"], per: 900000 },
};

/* ============================ PRODUCT PORTFOLIO =========================== */
const PRODUCTS = [
  { id: "pulse", name: "Nadi Pulse", refPrice: 9999, cogs: 3250, capacityCost: 1.0,
    blurb: "The original. Volume product, thin margin, carries the brand." },
  { id: "pro", name: "Nadi Pulse Pro", refPrice: 14999, cogs: 5200, capacityCost: 1.4,
    blurb: "Higher price, higher margin, and it eats 1.4 units of line capacity for every one built." },
];
const PROD = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

/* ========================== INNOVATION BOARD ==============================
   Everything the product could become, as cards. Pick what to build.
   lead = quarters before it lands. cost is charged when work starts.
   ========================================================================== */
const INNOVATIONS = [
  { id: "app", cat: "Software", name: "Redesigned companion app", cost: 900000, lead: 0,
    effect: { innovation: 6, satisfaction: 5, repeat: 2 },
    blurb: "The complaint in every review. Cheap to fix, and it moves satisfaction and repeat buying." },
  { id: "sleep", cat: "Software", name: "Sleep and recovery scoring", cost: 1100000, lead: 0,
    effect: { ceiling: 3, innovation: 7, repeat: 2 },
    blurb: "The feature buyers compare on. Pure software, no bill of materials." },
  { id: "coach", cat: "Software", name: "On-device AI health coach", cost: 2600000, lead: 1,
    effect: { ceiling: 5, innovation: 10, repeat: 3, brand: 4 },
    blurb: "A quarter to ship. The one feature reviewers would lead with." },
  { id: "ecg", cat: "Sensors", name: "ECG & SpO₂ sensor suite", cost: 1800000, lead: 1,
    effect: { ceiling: 4, innovation: 8, quality: 3, cogs: 220 },
    blurb: "Medical-grade credibility. Adds ₹220 to every unit you build, forever." },
  { id: "gnss", cat: "Sensors", name: "Multi-band GNSS positioning", cost: 1500000, lead: 0,
    effect: { ceiling: 3, innovation: 5, cogs: 300 },
    blurb: "Opens the running and cycling segment. The most expensive component on this board." },
  { id: "temp", cat: "Sensors", name: "Skin temperature sensing", cost: 800000, lead: 0,
    effect: { ceiling: 2, innovation: 4, cogs: 120 },
    blurb: "Small, cheap, and it fills a line on the comparison table." },
  { id: "amoled", cat: "Hardware", name: "AMOLED always-on display", cost: 1200000, lead: 0,
    effect: { ceiling: 2, brand: 5, satisfaction: 3, cogs: 250 },
    blurb: "The first thing anyone notices in a shop. Costs ₹250 a unit to keep." },
  { id: "battery", cat: "Hardware", name: "14-day battery platform", cost: 2000000, lead: 1,
    effect: { ceiling: 4, quality: 5, satisfaction: 4 },
    blurb: "A platform change, not a part swap. A quarter of engineering, no unit cost." },
  { id: "titanium", cat: "Hardware", name: "Titanium & sapphire build", cost: 1600000, lead: 0,
    effect: { brand: 8, quality: 6, cogs: 450 },
    blurb: "Buys permission to charge more. Adds ₹450 a unit whether you raise price or not." },
  { id: "dfm", cat: "Manufacturing", name: "Design for manufacture programme", cost: 1400000, lead: 1,
    effect: { cogs: -400, quality: 4 },
    blurb: "Takes ₹400 off every unit you ever build again. Nothing a customer will ever see." },
  { id: "modular", cat: "Manufacturing", name: "Modular strap and case platform", cost: 1000000, lead: 0,
    effect: { cogs: -150, brand: 3, repeat: 2 },
    blurb: "Shared parts across both products, and an accessory habit that brings people back." },
];
const INNO = Object.fromEntries(INNOVATIONS.map((i) => [i.id, i]));
const INNO_CATS = ["Software", "Sensors", "Hardware", "Manufacturing"];
const innoSum = (ids, key) => ids.reduce((t, id) => t + num(INNO[id] && INNO[id].effect[key]), 0);

/* ------------------------------ payment terms ---------------------------- */
const PAY_TERMS = {
  advance: { id: "advance", name: "Pay on despatch", days: 0, cogsMult: 0.97, rel: 3,
    note: "3% off every unit and +3 supplier reliability. Your cash leaves first." },
  net30: { id: "net30", name: "Net 30", days: 30, cogsMult: 1.0, rel: 0,
    note: "Standard terms. A third of production financed by your supplier." },
  net60: { id: "net60", name: "Net 60", days: 60, cogsMult: 1.02, rel: -2,
    note: "2% more a unit and −2 reliability, but two thirds of production sits in payables." },
};

/* -------------------------------- allocation ----------------------------- */
const LINES = {
  google: "opex", meta: "opex", social: "opex", content: "opex", events: "opex",
  email: "opex", direct: "opex", referral: "opex", buzz: "opex",
  reps: "opex", crm: "opex", onboarding: "opex", salesTraining: "opex", channel: "opex", keyAccounts: "opex",
  quality: "opex", innovation: "opex", npd: "opex", design: "opex",
  capex: "capex", production: "opex", contract: "opex", supplier: "opex", logistics: "opex", warehouse: "opex",
  culture: "opex", hrTraining: "opex", cx: "opex",
  compliance: "opex", planning: "opex", audit: "opex", workingCapital: "opex", treasury: "opex",
  draw: "finIn", repay: "finOut",
  priceMatch: "opex", comparisonAds: "opex", retention: "opex", supplyFund: "opex",
};
ROLE_IDS.forEach((r) => { LINES["hire_" + r] = "count"; LINES["fire_" + r] = "count"; });
const ALLOC_KEYS = Object.keys(LINES);
const blankAlloc = () => Object.fromEntries(ALLOC_KEYS.map((k) => [k, ""]));
const parseAlloc = (a) => Object.fromEntries(ALLOC_KEYS.map((k) => [k, Math.max(0, num(a[k]))]));
const sumBy = (A, t) => ALLOC_KEYS.reduce((x, k) => x + (LINES[k] === t ? num(A[k]) : 0), 0);
const opexLakhs = (A) => sumBy(A, "opex");
const capexLakhs = (A) => sumBy(A, "capex");

/* --------------------------- opening balance sheet ------------------------ */
const OPENING_CASH = 15000000;
const OPENING_ASSETS = OPENING_CASH + 800000 + 600 * 3250 + 2500000 + 1000000;
const OPENING_RE = OPENING_ASSETS - OTHER_LIABILITIES - SHARE_CAPITAL;

const INITIAL = {
  quarter: 1,
  cash: OPENING_CASH, ar: 800000, ap: 0, debt: 0, pendingInvestment: 0,
  equipment: 2500000, ip: 1000000, retainedEarnings: OPENING_RE,
  installedCapacity: 2500,
  staff: { ...CORE_STAFF },
  products: {
    pulse: { live: true, status: "active", price: 9999, share: 100, inv: 600, invCost: 3250 },
    pro: { live: false, status: "active", price: 14999, share: 0, inv: 0, invCost: 5200 },
  },
  innovations: [], pipeline: {},
  customers: 4000, priorUnits: 0,
  brand: 0, seo: 0, buzzHist: {},
  quality: 0, innovation: 0, feature: 0, npd: 0,
  supplierRel: 70, logisticsEff: 60,
  empSat: 65, empEng: 60,
  compliance: 50, forecast: 55, audit: 50,
  satisfaction: 50, repeatRate: 10, attrition: 0,
  arDays: 30, payTerms: "net30", overhead: FIXED_OVERHEAD,
  marketShare: 0, fillRate: 1, priorDemand: 0,
  wcBreached: false, everInsolvent: false,
};
const headcountOf = (staff) => ROLE_IDS.reduce((t, r) => t + num(staff[r]), 0);
const salaryOf = (staff) => ROLES.reduce((t, r) => t + num(staff[r.id]) * r.salary, 0);

/* --------------------------------- crises -------------------------------- */
const CRISES = {
  A: { key: "A", name: "Price Warrior",
    headline: "Kalpa Labs launches the Kalpa One at ₹6,499.",
    body: "A Shenzhen-backed rival has entered India 35% below your price with a near-identical spec sheet. Click-throughs hold; carts die at the comparison step. You can answer with the price lever in Product, or with the response budget below, or both.",
    baseDamp: 0.75, basePenalty: 8,
    choices: [
      { id: "A1", label: "Meet them on price", note: "Removes the conversion penalty entirely, and drops your reference price so the market judges you at ₹8,499. Your own price is still yours to set." },
      { id: "A2", label: "Hold the line on value", note: "Full 8pt conversion penalty stands. Margin and positioning intact. Recoverable through comparison ads." },
      { id: "A3", label: "Bundle a ₹800 strap kit", note: "Penalty falls to 3pts. Adds ₹800 to the cost of every unit sold." },
    ] },
  B: { key: "B", name: "Marketing Blitz",
    headline: "Vega Health buys the entire festive inventory on Meta and YouTube.",
    body: "A funded competitor has committed ₹12 crore to a six-week brand blitz. Auction prices have doubled overnight. Your leads have not stopped; they have become expensive and cold.",
    baseDamp: 0.60, basePenalty: 3,
    choices: [
      { id: "B1", label: "Meet them in the auction", note: "Leads dampened to 60%. Brand erosion waived if you fund any response." },
      { id: "B2", label: "Retreat to a niche", note: "Lighter dampening at 72% — a smaller pond. Conversion penalty rises to 5pts." },
      { id: "B3", label: "Sit it out", note: "Heaviest dampening at 55% and an automatic 8-point brand erosion. Cash preserved." },
    ] },
  C: { key: "C", name: "Feature Leapfrog",
    headline: "Zenith ships FDA-cleared ECG and 14-day battery at your price point.",
    body: "Every review this month opens with the same sentence: 'but the Zenith does more.' Your spec sheet has not changed; the frame of reference has. What you already shipped from the innovation board decides how much this hurts.",
    baseDamp: 0.80, basePenalty: 6,
    choices: [
      { id: "C1", label: "Fast-follow from the board", note: "Penalty 6pts and ceiling 2pts — both largely waived at Innovation 20 or above." },
      { id: "C2", label: "Reposition on build quality", note: "Penalty 3pts at Quality 25 or above, otherwise 6pts. Ceiling 2pts stands." },
      { id: "C3", label: "Anchor down on price", note: "Penalty 3pts, and the market reference price falls ₹1,000 while the event runs." },
    ] },
  D: { key: "D", name: "Global Supply Shock",
    headline: "Your MEMS sensor supplier in Kaohsiung is on force majeure.",
    body: "An earthquake has taken your accelerometer and PPG line offline. Two of your three module vendors source from the same fab. Your contract manufacturer needs an answer this week.",
    baseDamp: 1.0, basePenalty: 0,
    choices: [
      { id: "DA", label: "Air-freight from the spot market", note: "Strongest capacity recovery. Cost per unit rises ₹900." },
      { id: "DB", label: "Qualify a second source in Pune", note: "Moderate recovery, permanent +10 supplier reliability. Cost per unit rises ₹500." },
      { id: "DC", label: "Ride it out on allocation", note: "No recovery offset. Cost per unit rises ₹500 on residual scarcity." },
    ] },
  E: { key: "E", name: "Trust Erosion",
    headline: "Return rates and negative reviews have both spiked in the same fortnight.",
    body: "Support tickets are up, and the review average has slipped below four stars for the first time this year. Whether this passes quietly or compounds into something worse depends on what the product and support teams actually did about defects before this started — and what you do about it now.",
    baseDamp: 0.85, basePenalty: 5,
    choices: [
      { id: "E1", label: "Recall and replace the affected batch", note: "Penalty removed entirely. Adds ₹700 to the cost of every unit sold this quarter." },
      { id: "E2", label: "Double down on support and QA messaging", note: "Penalty falls to 2pts if Quality Score is already 25 or above — otherwise stays at 5pts. No extra cost." },
      { id: "E3", label: "Let it run its course", note: "Full 5pt penalty stands, cash preserved. Real customer-loss risk if nothing is funded in response." },
    ] },
};

/* ============================== THE ENGINE ================================ */
function runQuarter(s, allocRaw, warranty, crisis, startInno, payTerms, products) {
  const A = parseAlloc(allocRaw);
  const q = s.quarter;
  const notes = [];
  const terms = PAY_TERMS[payTerms] || PAY_TERMS.net30;
  const P = products || s.products;

  /* --- 0. crisis ---------------------------------------------------------- */
  let damp = 1, convPenalty = 0, ceilingPenalty = 0, capMult = 1;
  let cogsSurcharge = 0, refShift = 0, logisticsHit = 0, brandErosion = 0;
  let satHit = 0, custLossBase = 0, supplierBonus = 0;
  const active = !!(crisis && crisis.variant);
  const v = active ? crisis.variant : null;
  const ch = active ? crisis.choice : null;
  if (active) {
    const C = CRISES[v];
    damp = C.baseDamp; convPenalty = C.basePenalty;
    if (v === "A") { custLossBase = 8;
      if (ch === "A1") { convPenalty = 0; refShift = -1500; }
      if (ch === "A3") { convPenalty = 3; cogsSurcharge = 800; } }
    if (v === "B") { custLossBase = 8;
      if (ch === "B2") { damp = .72; convPenalty = 5; }
      if (ch === "B3") { damp = .55; convPenalty = 3; }
      const responded = A.priceMatch + A.comparisonAds + A.retention > 0;
      if (!responded || ch === "B3") { brandErosion = 8; notes.push("Brand eroded 8 points — no air cover funded against the blitz."); } }
    if (v === "C") { custLossBase = 8;
      const armed = s.innovation >= 20;
      if (ch === "C1") { convPenalty = armed ? 2 : 6; ceilingPenalty = armed ? 0 : 2;
        if (armed) notes.push("Innovation of " + d0(s.innovation) + " at onset absorbed most of the leapfrog."); }
      if (ch === "C2") { convPenalty = s.quality >= 25 ? 3 : 6; ceilingPenalty = 2; }
      if (ch === "C3") { convPenalty = 3; ceilingPenalty = 2; refShift = -1000; } }
    if (v === "D") {
      const off = ch === "DA" ? .5 : ch === "DB" ? .25 : 0;
      cogsSurcharge = ch === "DA" ? 900 : 500;
      if (ch === "DB") { supplierBonus = 10; notes.push("Second source qualified: +10 supplier reliability, permanent."); }
      capMult = clamp(.5 + .005 * (s.supplierRel - 50) + off + .1 * pw(A.supplyFund, .5), .1, 1);
      logisticsHit = 15;
      if (A.supplyFund <= 0) { satHit = 5; notes.push("Satisfaction down 5 — no emergency supply funding, orders slipped."); } }
    if (v === "E") { custLossBase = 6;
      if (ch === "E1") { convPenalty = 0; cogsSurcharge = 700; }
      if (ch === "E2") { convPenalty = s.quality >= 25 ? 2 : 5;
        if (s.quality >= 25) notes.push("Quality Score of " + d0(s.quality) + " at onset absorbed most of the erosion."); }
      if (ch === "E3") { convPenalty = 5; }
      if (ch !== "E1" && A.retention <= 0) { satHit = 4; notes.push("Satisfaction down 4 — no retention funding while trust was shaken."); } }
    if (q === 4) { damp = Math.min(1, damp + .10); convPenalty *= .6; custLossBase *= .6;
      notes.push("The shock is a quarter old. Market pressure has eased by roughly a third."); }
  }
  const dampBefore = damp, penaltyBefore = convPenalty;
  if (active && v !== "D") damp = Math.min(1, damp + .15 * pw(A.priceMatch, .5));
  const convRecovery = active && v !== "D" ? Math.min(convPenalty, 2 * pw(A.comparisonAds, .5)) : 0;
  const netPenalty = convPenalty - convRecovery;
  const custLoss = custLossBase > 0 ? Math.max(0, custLossBase - 1.5 * pw(A.retention, .5)) : 0;

  /* --- 1. people, by function -------------------------------------------- */
  const staffOut = {}, hiredBy = {}, firedBy = {};
  let recruitCost = 0, severanceCost = 0, totalHired = 0, totalFired = 0;
  ROLES.forEach((r) => {
    const have = num(s.staff[r.id]);
    const fire = Math.min(Math.round(A["fire_" + r.id]), Math.max(0, have - r.base));
    const hire = Math.round(A["hire_" + r.id]);
    staffOut[r.id] = have - fire + hire;
    hiredBy[r.id] = hire; firedBy[r.id] = fire;
    recruitCost += hire * r.hire; severanceCost += fire * r.sever;
    totalHired += hire; totalFired += fire;
  });
  const headcount = headcountOf(staffOut);
  const salaries = salaryOf(staffOut);
  const peopleCost = recruitCost + severanceCost;
  const layoffShock = s.quarter && headcountOf(s.staff) > 0 ? totalFired / headcountOf(s.staff) : 0;
  const empSat = Math.max(0, s.empSat + 5 * pw(A.culture, .5) - 25 * layoffShock);
  const empEng = Math.max(0, s.empEng + 6 * pw(A.hrTraining, .5) - 20 * layoffShock);
  const prodMult = 1 + (empSat - 50) * .004;
  const attritionNext = Math.max(3, 15 - .12 * empEng - .4 * pw(A.salesTraining, .5) + 6 * layoffShock);
  if (totalFired > 0) notes.push(d0(totalFired) + " roles cut: " + inr(severanceCost) + " of severance, and morale carries the rest.");

  // per-function staffing: new joiners contribute 60% in their first quarter
  const staffing = {}, need = {}, effHeads = {};
  ROLES.forEach((r) => {
    const load = ROLE_LOAD[r.id];
    const spend = load.keys.reduce((t, k) => t + num(A[k]), 0) * 100000;
    need[r.id] = r.base + spend / load.per;
    effHeads[r.id] = num(s.staff[r.id]) - firedBy[r.id] + hiredBy[r.id] * 0.6;
    staffing[r.id] = clamp(effHeads[r.id] / Math.max(0.5, need[r.id]), 0.55, 1);
  });
  const shortRoles = ROLES.filter((r) => staffing[r.id] < 0.999);
  shortRoles.forEach((r) => notes.push(r.name + " is short: " + d1(effHeads[r.id]) + " people against " + d1(need[r.id]) + " the plan needs, running at " + pct(staffing[r.id] * 100) + "."));

  /* --- 2. finance --------------------------------------------------------- */
  const openInv = PRODUCTS.reduce((t, p) => t + num(P[p.id].inv) * num(P[p.id].invCost), 0);
  const openNetWorth = s.cash + s.ar + openInv + s.equipment + s.ip - s.ap - s.debt - OTHER_LIABILITIES;
  const debtLimit = Math.max(0, .6 * openNetWorth - s.debt);
  const drawn = Math.min(A.draw * 100000, debtLimit);
  const drawRejected = A.draw * 100000 - drawn;
  const repaid = Math.min(A.repay * 100000, s.debt + drawn);
  const debtClose = s.debt + drawn - repaid;
  const interestExpense = ((s.debt + debtClose) / 2) * DEBT_RATE;
  const treasuryRate = Math.min(2.5, .8 + .55 * pw(A.treasury, .5)) / 100;
  const interestIncome = Math.max(0, s.cash) * treasuryRate;
  const arDays = Math.max(10, 30 - 8 * pw(A.workingCapital, .5));
  const gov = staffing.admin;
  const compliance = s.compliance + 5 * pw(A.compliance, .5) * gov;
  const forecast = s.forecast + 6 * pw(A.planning, .5) * gov;
  const cashEffBonus = Math.max(0, forecast - 55) * .1;
  const audit = s.audit + 5 * pw(A.audit, .5) * gov;
  const penaltyRisk = Math.max(5, 40 - .25 * compliance - .10 * audit);
  const financeSpend = A.compliance + A.planning + A.audit;
  if (gov < 0.9 && financeSpend > 2) {
    notes.push("Compliance, Planning and Audit only convert at " + pct(gov * 100) + " of their normal strength this quarter — " +
      "these three specifically run through the Admin team, and Admin is short-staffed. Funding them further won't fix this on its own; " +
      "the gap is Admin headcount, not Finance budget.");
  }
  if (drawRejected > 1) notes.push("Credit capped at " + inr(debtLimit) + ". " + inr(drawRejected) + " of the requested draw was refused.");

  /* --- 3. marketing ------------------------------------------------------- */
  const mkStaff = staffing.marketing;
  const marketingSpendPre = ROLE_LOAD.marketing.keys.reduce((t, k) => t + num(A[k]), 0) * 100000;
  const referralCapLeads = .20 * s.customers;
  const referralCapSpend = (referralCapLeads * 300) / 100000;
  const mk = {
    google: 375 * pw(A.google, .68), meta: 200 * pw(A.meta, .65), social: 225 * pw(A.social, .72),
    content: 75 * pw(A.content, .62), events: 90 * pw(A.events, .62), email: 80 * pw(A.email, .55),
    direct: 160 * pw(A.direct, .60), referral: Math.min(A.referral * 100000 / 300, referralCapLeads),
  };
  const rawLeads = Object.values(mk).reduce((a, b) => a + b, 0);
  const impressions = 40000 * A.meta;
  const brandGain = 1.2 * A.meta + 2.5 * A.social + 1.5 * A.events + 1.8 * pw(A.design, .5) * staffing.engineering;
  const seoGain = 3.5 * A.content;
  const buzzGain = 4 * pw(A.buzz, .5);
  const directFatigue = .25 * Math.max(0, A.direct - 8);
  const directConv = .8 * pw(A.direct, .4);
  const referralWaste = Math.max(0, A.referral - referralCapSpend);
  const seoFree = s.seo * 25;
  const buzz1 = num(s.buzzHist[q - 1]), buzz2 = num(s.buzzHist[q - 2]);
  const buzzFree = buzz1 * 15 + buzz2 * 25;
  const buzzConvBonus = buzz2 * .3;

  /* --- 4. effective leads ------------------------------------------------- */
  const dampedRaw = rawLeads * damp;
  const brandNow = Math.max(0, s.brand + brandGain - brandErosion);
  const brandMult = 1 + brandNow / 50;
  const effLeads = (dampedRaw + seoFree + buzzFree) * brandMult * prodMult * mkStaff;

  /* --- 5. sales ----------------------------------------------------------- */
  const slStaff = staffing.sales;
  const repCapacity = 500 * A.reps * (1 - s.attrition / 100) * slStaff;
  const channelCapacity = 420 * pw(A.channel, .75);
  const capacity = repCapacity + channelCapacity;
  const channelShare = capacity > 0 ? channelCapacity / capacity : 0;
  const repsBonus = 2 * pw(A.reps, .5);
  const crmBonus = 1.5 * pw(A.crm, .4);
  const trainBonus = 2.2 * pw(A.salesTraining, .45);
  const leadsUsed = Math.min(effLeads, capacity);
  const leadsWasted = Math.max(0, effLeads - capacity);
  const idleCapacity = Math.max(0, capacity - effLeads);
  const b2bDemand = 85 * pw(A.keyAccounts, .8);

  /* --- 6. R&D, the innovation board and the product pipeline -------------- */
  const engStaff = staffing.engineering;
  const started = (startInno || []).filter((id) => INNO[id] && s.innovations.indexOf(id) < 0 && !s.pipeline[id]);
  const innoSpend = started.reduce((t, id) => t + INNO[id].cost, 0);
  const pipeline = { ...s.pipeline };
  const landed = [];
  started.forEach((id) => { if (INNO[id].lead > 0) pipeline[id] = INNO[id].lead; else landed.push(id); });
  Object.keys(s.pipeline).forEach((id) => {
    const left = s.pipeline[id] - 1;
    if (left <= 0) { landed.push(id); delete pipeline[id]; } else pipeline[id] = left;
  });
  const ownedInno = s.innovations.concat(landed);
  landed.forEach((id) => notes.push("Shipped from the innovation board: " + INNO[id].name + "."));
  Object.keys(pipeline).forEach((id) => notes.push(INNO[id].name + " is in development, landing in " + pipeline[id] + " quarter(s)."));

  const qualityGain = 6 * pw(A.quality, .5) * engStaff;
  let quality = s.quality + qualityGain + innoSum(landed, "quality");
  const defectRate = Math.max(2, 8 - 1.2 * pw(A.quality, .5) * engStaff);
  const innovGain = 5 * pw(A.innovation, .5) * engStaff;
  let innovation = s.innovation + innovGain + innoSum(landed, "innovation");
  let feature = s.feature + 8 * pw(A.innovation, .5) * engStaff;
  // last quarter's share earns awareness this quarter: a real, delayed payoff
  const shareAwareness = num(s.marketShare) * 15;
  let brandEnd = brandNow + innoSum(landed, "brand") + shareAwareness;
  let featureShipped = false;
  if (feature >= 100) { feature = 0; featureShipped = true; brandEnd += 15; quality += 10;
    notes.push("Feature milestone shipped: +15 brand, +10 quality, completeness reset."); }
  let npd = s.npd + 12 * pw(A.npd, .5) * engStaff;
  let proLaunching = false;
  if (!P.pro.live && npd >= 60) { proLaunching = true; npd = 0; brandEnd += 20; innovation += 15;
    notes.push("The Nadi Pulse Pro cleared development. It can be produced and sold from next quarter."); }
  const designCogsCut = 40 * pw(A.design, .5) * engStaff - innoSum(ownedInno, "cogs");
  const innoCeiling = innoSum(ownedInno, "ceiling");
  const ceilingGross = 22 + (quality + .5 * innovation) * .3 + innoCeiling + (P.pro.live ? 2 : 0);
  const ceiling = ceilingGross - ceilingPenalty;

  /* --- 7. satisfaction, price and conversion ------------------------------ */
  const spStaff = staffing.support;
  const supplierRel = clamp(s.supplierRel + 4 * pw(A.supplier, .5) * staffing.operations + supplierBonus + terms.rel, 0, 100);
  const logisticsEff = Math.min(100, s.logisticsEff + 5 * pw(A.logistics, .5) * staffing.operations);
  const logisticsNow = Math.max(0, logisticsEff - logisticsHit);
  const holdingPerUnit = Math.max(40, 150 - 22 * pw(A.warehouse, .5));
  const onbSat = 3 * pw(A.onboarding, .5) * spStaff;
  const onbRepeat = 3 * pw(A.onboarding, .4) * spStaff;
  const opsSat = .05 * logisticsNow + 2 * pw(A.warehouse, .5);
  const satisfaction = Math.max(0, s.satisfaction + onbSat + opsSat + 4 * pw(A.cx, .5) * spStaff
    + innoSum(landed, "satisfaction") - satHit - directFatigue);
  const satBonus = (satisfaction - 50) * .1;

  // price: each product is judged against a market reference that the crisis can move
  const priceInfo = {};
  PRODUCTS.forEach((p) => {
    const pd = P[p.id];
    const ref = p.refPrice + (p.id === "pulse" ? refShift : 0);
    const mult = clamp(Math.pow(ref / Math.max(1, pd.price), PRICE_ELASTICITY), .45, 1.75);
    priceInfo[p.id] = { ref, price: pd.price, mult, premium: (pd.price / ref - 1) * 100 };
  });
  const sellable = PRODUCTS.filter((p) => P[p.id].live && P[p.id].status !== "discontinued");
  const shareSum = sellable.reduce((t, p) => t + Math.max(0, num(P[p.id].share)), 0) || 1;
  const demandWeight = {}; sellable.forEach((p) => { demandWeight[p.id] = Math.max(0, num(P[p.id].share)) / shareSum; });
  const blendedPriceMult = sellable.reduce((t, p) => t + demandWeight[p.id] * priceInfo[p.id].mult, 0) || 1;
  const blendedPrice = sellable.reduce((t, p) => t + demandWeight[p.id] * P[p.id].price, 0) || 1;
  const blendedRef = sellable.reduce((t, p) => t + demandWeight[p.id] * priceInfo[p.id].ref, 0) || 1;

  /* --- market position -----------------------------------------------------
     Competitive pull decides how much of the category's demand is reachable.
     Price appears here and in the funnel, but the two act as alternative
     ceilings (a min), never added, so nothing is double counted. */
  const mktDemand = marketDemand(q);
  const rivalGrow = Math.pow(1 + RIVAL_GROWTH, q - 1);
  const rivalBoost = { kalpa: 1, vega: 1, zenith: 1, tail: 1 };
  if (active) {
    const surge = q === 4 ? 1.22 : 1.45;
    if (v === "A") rivalBoost.kalpa = surge;
    if (v === "B") rivalBoost.vega = surge;
    if (v === "C") rivalBoost.zenith = surge;
  }
  const rivalState = RIVALS.map((rv) => ({ ...rv, strength: rv.strength * rivalGrow * rivalBoost[rv.id] }));
  const rivalTotal = rivalState.reduce((t, rv) => t + rv.strength, 0);
  const voiceIdx = 0.55 + 0.45 * Math.min(1, marketingSpendPre / 1800000);
  if (marketingSpendPre > 1800000) {
    notes.push("Marketing was funded past the point where more spend earns more attention this quarter — roughly "
      + inr(marketingSpendPre - 1800000) + " went to a channel that had already stopped paying off. This is a "
      + "different problem than not having enough Sales or stock to sell into: the extra money never turned into "
      + "reach at all. If more growth is needed, it has to come from somewhere other than raw marketing spend.");
  }
  const priceIdx = clamp(Math.pow(blendedRef / Math.max(1, blendedPrice), 0.9), 0.55, 1.6);
  const fillIdx = 0.75 + 0.25 * clamp(num(s.fillRate), 0, 1);
  const productPull = Math.max(4, 16 + brandEnd + 0.6 * innovation + 0.5 * quality + 0.25 * (satisfaction - 50));
  const ourStrength = productPull * priceIdx * voiceIdx * fillIdx;
  const attractShare = ourStrength / (ourStrength + rivalTotal);
  const reachableDemand = mktDemand * attractShare;

  const rawConv = 19 + repsBonus + crmBonus + trainBonus + directConv + satBonus;
  const cappedConv = Math.min(rawConv, ceiling);
  const ceilingBinding = rawConv > ceiling;
  const warrantyBonus = warranty === "2yr" ? 3 : warranty === "1yr" ? 1.5 : 0;
  const warrantyMult = warranty === "2yr" ? 1.8 : warranty === "1yr" ? 1 : 0;
  const finalConv = Math.max(0, cappedConv + warrantyBonus + buzzConvBonus - netPenalty);

  /* --- 8. operations ------------------------------------------------------ */
  const opStaff = staffing.operations;
  const capacityAdded = 240 * pw(A.capex, .75);
  const installedCapacity = s.installedCapacity + capacityAdded;
  const runCapability = 420 * pw(A.production, .7);
  const grossRun = Math.min(installedCapacity, runCapability);
  const runLimited = runCapability < installedCapacity;
  const ownBuilt = grossRun * (1 - s.attrition / 100) * opStaff * (supplierRel / 100) * capMult;
  const cmBuilt = 650 * pw(A.contract, .85) * .90 * capMult;
  const utilisation = installedCapacity > 0 ? grossRun / installedCapacity : 0;
  const capacityUnits = ownBuilt + cmBuilt;   // in base-equivalent line units
  const scaleDiscount = Math.min(0.06, num(s.marketShare) * 0.25);   // volume buys terms
  const unitCostBase = Math.max(2000, 3250 - 90 * pw(A.production, .5) * opStaff - designCogsCut) * (1 - scaleDiscount);

  // production is split only across products you have left switched on
  const producing = PRODUCTS.filter((p) => P[p.id].live && P[p.id].status === "active");
  const prodShareSum = producing.reduce((t, p) => t + Math.max(0, num(P[p.id].share)), 0) || 1;
  const built = {}, unitCost = {};
  let lineUsed = 0;
  PRODUCTS.forEach((p) => {
    const w = producing.indexOf(p) >= 0 ? Math.max(0, num(P[p.id].share)) / prodShareSum : 0;
    const lineUnits = capacityUnits * w;
    built[p.id] = lineUnits / p.capacityCost;
    lineUsed += lineUnits;
    const scale = p.cogs / PROD.pulse.cogs;
    unitCost[p.id] = (Math.max(p.cogs * 0.62, unitCostBase * scale)) * terms.cogsMult + cogsSurcharge
      + (cmBuilt > 0 && capacityUnits > 0 ? 700 * (cmBuilt / capacityUnits) : 0);
  });

  /* --- 9. demand and units, product by product ---------------------------- */
  const repeatRate = s.repeatRate + 3 * pw(A.email, .5) + onbRepeat + 2 * pw(A.cx, .4) * spStaff + innoSum(landed, "repeat");
  const funnelUnits = leadsUsed * finalConv / 100;
  const repeatUnits = repeatRate / 100 * s.priorUnits;
  const funnelDemand = (funnelUnits + repeatUnits) * blendedPriceMult;
  const demandTotal = Math.min(funnelDemand, reachableDemand);
  const demandBeyondPosition = Math.max(0, funnelDemand - reachableDemand);
  const positionBinding = demandBeyondPosition > 0.5;
  const wac = {}, sold = {}, demand = {}, avail = {}, invOut = {}, revenue = {}, clearance = {};
  let unitsSold = 0, unmetDemand = 0, revTotal = 0, cogsTotal = 0, prodCostTotal = 0, invValue = 0, b2bSold = 0;
  PRODUCTS.forEach((p) => {
    const pd = P[p.id];
    const inHand = num(pd.inv), inCost = num(pd.invCost), made = built[p.id];
    wac[p.id] = inHand + made > 0 ? (inHand * inCost + made * unitCost[p.id]) / (inHand + made) : unitCost[p.id];
    avail[p.id] = inHand + made;
    prodCostTotal += made * unitCost[p.id];
    clearance[p.id] = 0;
    let b2bPart = 0;
    if (!pd.live) {
      // not developed yet: nothing to sell, nothing to price
      demand[p.id] = 0; sold[p.id] = 0; invOut[p.id] = avail[p.id]; revenue[p.id] = 0;
    } else if (pd.status === "discontinued") {
      // everything left is liquidated at 40% off and the line leaves the range
      demand[p.id] = avail[p.id];
      sold[p.id] = avail[p.id];
      clearance[p.id] = avail[p.id] * pd.price * .60;
      invOut[p.id] = 0;
      revenue[p.id] = clearance[p.id];
    } else {
      let dm = demandTotal * (demandWeight[p.id] || 0);
      if (p.id === "pulse") dm += b2bDemand;
      demand[p.id] = dm;
      sold[p.id] = Math.min(dm, avail[p.id]);
      unmetDemand += Math.max(0, dm - avail[p.id]);
      invOut[p.id] = avail[p.id] - sold[p.id];
      b2bPart = p.id === "pulse" ? Math.min(b2bDemand, sold[p.id]) : 0;
      revenue[p.id] = (sold[p.id] - b2bPart) * pd.price + b2bPart * pd.price * .78;
    }
    b2bSold += b2bPart;
    revTotal += revenue[p.id];
    cogsTotal += sold[p.id] * wac[p.id];
    invValue += invOut[p.id] * wac[p.id];
    unitsSold += sold[p.id];
  });
  const supplyBinding = unmetDemand > .5;
  const invUnitsOut = PRODUCTS.reduce((t, p) => t + invOut[p.id], 0);

  /* --- 10. profit and loss ------------------------------------------------ */
  const revenueT = revTotal;
  const grossProfit = revenueT - cogsTotal;
  const channelMargin = (revenue.pulse || 0) * channelShare * .18;
  const warrantyCost = unitsSold * (defectRate / 100) * 1500 * warrantyMult;
  const holdingCost = invUnitsOut * holdingPerUnit;
  const overhead = s.overhead;
  const fixedCost = salaries + overhead;
  const depreciation = s.equipment * DEP_RATE;
  const amortisation = s.ip * AMORT_RATE;
  const capexSpend = capexLakhs(A) * 100000;
  const opexL = opexLakhs(A); const opexSpend = opexL * 100000;
  // compliance exposure was previously computed and never charged for
  const compliancePenalty = revenueT * (penaltyRisk / 100) * 0.03;
  const netProfit = revenueT - cogsTotal - channelMargin - warrantyCost - holdingCost - fixedCost
    - opexSpend - peopleCost - compliancePenalty - depreciation - amortisation - interestExpense + interestIncome;

  /* --- 11. cash flow and balance sheet ------------------------------------ */
  const arClose = Math.max(AR_FLOOR, revenueT * (arDays / 90));
  const apClose = prodCostTotal * (terms.days / 90);
  const collections = s.ar + revenueT - arClose;
  const supplierPaid = s.ap + prodCostTotal - apClose;
  const operatingCF = collections - supplierPaid - channelMargin - warrantyCost - holdingCost
    - fixedCost - opexSpend - peopleCost - compliancePenalty - interestExpense + interestIncome;
  const investingCF = -(capexSpend + innoSpend);
  const equityRaised = num(s.pendingInvestment) || 0;
  const financingCF = drawn - repaid + equityRaised;
  const netCF = operatingCF + investingCF + financingCF;
  const cash = s.cash + netCF;
  const equipment = s.equipment - depreciation + capexSpend;
  const ipAsset = s.ip - amortisation + innoSpend;
  const totalAssets = cash + arClose + invValue + equipment + ipAsset;
  const totalLiabilities = apClose + debtClose + OTHER_LIABILITIES;
  const retainedEarnings = s.retainedEarnings + netProfit;
  const equity = SHARE_CAPITAL + retainedEarnings;
  const netWorth = totalAssets - totalLiabilities;
  const balanceCheck = totalAssets - (totalLiabilities + equity);

  /* --- 12. customers and valuation ---------------------------------------- */
  const customers = Math.min(TAM_CUSTOMERS, (s.customers + unitsSold) * (1 - custLoss / 100));
  const customersLost = (s.customers + unitsSold) * (custLoss / 100);
  /* market share: company units sold over the same category demand used above.
     Realised share is what you actually took; attractive share is what your
     position could have supported. The gap is execution. */
  const marketShare = clamp(unitsSold / mktDemand, 0, 1);
  const shareDelta = marketShare - num(s.marketShare);
  const fillRate = clamp(demandTotal > 0 ? unitsSold / demandTotal : 1, 0, 1);
  const method1 = revenueT * 4 * 3;
  const sharePremium = marketShare * 100 * 150000;
  const intangible = (brandEnd + innovation + quality) * 20000 + customers * 300 + sharePremium;
  const valuation = Math.max(0, .7 * method1 + .2 * netWorth + intangible);
  /* how much of the demand-generation spend had nowhere to land: leads that
     sales could not work, and demand that operations could not supply */
  const marketingSpend = marketingSpendPre;
  const leadWasteFrac = effLeads > 0 ? clamp(leadsWasted / effLeads, 0, 1) : 0;
  const unmetFrac = demandTotal + b2bDemand > 0 ? clamp(unmetDemand / (demandTotal + b2bDemand), 0, 1) : 0;
  const wasteFrac = clamp(leadWasteFrac + (1 - leadWasteFrac) * unmetFrac, 0, 1);
  const wastedMarketing = marketingSpend * wasteFrac;

  const wcBreached = cash < WC_BUFFER;
  const insolvent = cash < 0;
  const neutralised = active ? (v === "D" ? capMult >= .99 : damp >= .97 && netPenalty <= .5) : false;
  const runway = netCF < 0 ? cash / -netCF : 99;

  const productsOut = {};
  PRODUCTS.forEach((p) => {
    const pd = P[p.id];
    const justLaunched = p.id === "pro" && proLaunching;
    productsOut[p.id] = { ...pd, live: pd.live || justLaunched,
      // A product that just cleared development starts with a real, modest slice of the line
      // (30%) rather than silently staying at 0% forever -- the ₹ and quarters spent getting it
      // here should not evaporate for want of one un-signposted slider. Free to move it either
      // way from here; this is a starting point, not a decision made for the student.
      share: justLaunched ? Math.max(30, num(pd.share)) : pd.share,
      status: pd.status === "discontinued" ? "discontinued" : pd.status,
      inv: invOut[p.id], invCost: wac[p.id] };
  });

  const next = {
    ...s, quarter: q + 1, cash, ar: arClose, ap: apClose, debt: debtClose, pendingInvestment: 0,
    equipment, ip: ipAsset, retainedEarnings, installedCapacity,
    staff: staffOut, products: productsOut, innovations: ownedInno, pipeline,
    customers, priorUnits: unitsSold,
    brand: brandEnd, seo: s.seo + seoGain, buzzHist: { ...s.buzzHist, [q]: buzzGain },
    quality, innovation, feature, npd,
    supplierRel, logisticsEff, empSat, empEng, compliance, forecast, audit,
    satisfaction, repeatRate, attrition: attritionNext,
    arDays, payTerms: terms.id, overhead: overhead * (1 - cashEffBonus / 100),
    marketShare, fillRate, priorDemand: demandTotal,
    wcBreached: s.wcBreached || wcBreached, everInsolvent: s.everInsolvent || insolvent,
  };

  return {
    q, A, warranty, notes, neutralised, terms, entering: s, next, P,
    crisis: active ? { variant: v, choice: ch } : null,
    damp, dampBefore, convPenalty: netPenalty, penaltyBefore, convRecovery, ceilingPenalty,
    capMult, cogsSurcharge, refShift, custLoss, customersLost, brandErosion,
    staffOut, hiredBy, firedBy, totalHired, totalFired, headcount, salaries, recruitCost, severanceCost,
    peopleCost, staffing, need, effHeads, shortRoles, empSat, empEng, prodMult, attritionNext,
    overhead, fixedCost,
    openNetWorth, debtLimit, drawn, drawRejected, repaid, debtClose, interestExpense, interestIncome,
    treasuryRate, arDays, compliance, forecast, audit, cashEffBonus, penaltyRisk,
    mk, rawLeads, impressions, brandGain, seoGain, buzzGain, directFatigue, directConv,
    referralCapLeads, referralCapSpend, referralWaste, seoFree, buzzFree, buzzConvBonus,
    dampedRaw, brandNow, brandEnd, brandMult, effLeads,
    repCapacity, channelCapacity, capacity, channelShare, repsBonus, crmBonus, trainBonus,
    leadsUsed, leadsWasted, idleCapacity, b2bDemand, b2bSold,
    started, landed, pipeline, innoSpend, ownedInno, innoCeiling,
    qualityGain, quality, defectRate, innovGain, innovation, feature, featureShipped, npd, proLaunching,
    designCogsCut, ceilingGross, ceiling, ceilingBinding,
    supplierRel, logisticsEff, logisticsNow, holdingPerUnit, satisfaction, satBonus,
    priceInfo, blendedPriceMult, demandWeight, sellable, producing,
    rawConv, cappedConv, warrantyBonus, warrantyMult, finalConv,
    capacityAdded, installedCapacity, runCapability, runLimited, grossRun, utilisation,
    ownBuilt, cmBuilt, capacityUnits, lineUsed, unitCost, unitCostBase, built, wac,
    repeatRate, funnelUnits, repeatUnits, demandTotal, demand, avail, sold, invOut, clearance,
    mktDemand, rivalState, rivalTotal, ourStrength, attractShare, reachableDemand, marketShare,
    shareDelta, fillRate, funnelDemand, demandBeyondPosition, positionBinding,
    voiceIdx, priceIdx, fillIdx, productPull, blendedPrice, blendedRef, scaleDiscount,
    shareAwareness, sharePremium, compliancePenalty,
    revenue, unitsSold, unmetDemand, supplyBinding, invUnitsOut, invValue,
    revenueT, cogs: cogsTotal, grossProfit, channelMargin, warrantyCost, holdingCost,
    depreciation, amortisation, opexSpend, opexL, capexSpend, netProfit,
    arClose, apClose, prodCostTotal, collections, supplierPaid,
    operatingCF, investingCF, financingCF, equityRaised, netCF, cash, openingCash: s.cash, runway,
    inventory: invValue, equipment, ipAsset, totalAssets, totalLiabilities, retainedEarnings, equity,
    netWorth, balanceCheck, customers, method1, method2: netWorth, intangible, valuation,
    wcBreached, insolvent, marketingSpend, wastedMarketing, wasteFrac, leadWasteFrac, unmetFrac,
  };
}

/* ======================= STATEMENTS: BS / P&L / CASHFLOW =================== */
function bsFromState(s) {
  const inventory = PRODUCTS.reduce((t, p) => t + num(s.products[p.id].inv) * num(s.products[p.id].invCost), 0);
  const assets = s.cash + s.ar + inventory + s.equipment + s.ip;
  const liabilities = s.ap + s.debt + OTHER_LIABILITIES;
  return { cash: s.cash, ar: s.ar, inventory, equipment: s.equipment, ip: s.ip, assets,
    ap: s.ap, debt: s.debt, other: OTHER_LIABILITIES, liabilities,
    share: SHARE_CAPITAL, re: s.retainedEarnings, equity: SHARE_CAPITAL + s.retainedEarnings,
    invUnits: PRODUCTS.reduce((t, p) => t + num(s.products[p.id].inv), 0) };
}
const bsFromResult = (r) => ({ cash: r.cash, ar: r.arClose, inventory: r.invValue, equipment: r.equipment,
  ip: r.ipAsset, assets: r.totalAssets, ap: r.apClose, debt: r.debtClose, other: OTHER_LIABILITIES,
  liabilities: r.totalLiabilities, share: SHARE_CAPITAL, re: r.retainedEarnings, equity: r.equity,
  invUnits: r.invUnitsOut });

function BalanceSheet({ open, close, title, eyebrow }) {
  const line = (label, k, working, indent) => (
    <div className="grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-stone-200">
      <div className={"col-span-5 sm:col-span-4 text-sm " + (indent ? "pl-4 text-stone-700" : "font-semibold text-stone-900")}>{label}</div>
      <div className="hidden sm:block sm:col-span-3 text-xs text-stone-500 font-mono">{working}</div>
      <div className="col-span-3 sm:col-span-2 text-right font-mono text-sm text-stone-500">{inr(open[k])}</div>
      {close && <>
        <div className="col-span-4 sm:col-span-2 text-right font-mono text-sm text-stone-900">{inr(close[k])}</div>
        <div className={"hidden sm:block sm:col-span-1 text-right font-mono text-xs " + (close[k] - open[k] >= 0 ? "text-teal-700" : "text-rose-700")}>
          {(close[k] - open[k] >= 0 ? "+" : "") + d0((close[k] - open[k]) / 1000) + "k"}</div>
      </>}
    </div>);
  return (
    <Card eyebrow={eyebrow} title={title}>
      <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-stone-800">
        <div className="col-span-5 sm:col-span-4" /><div className="hidden sm:block sm:col-span-3" />
        <div className="col-span-3 sm:col-span-2 text-right"><Eyebrow>Opening</Eyebrow></div>
        {close && <><div className="col-span-4 sm:col-span-2 text-right"><Eyebrow>Closing</Eyebrow></div>
          <div className="hidden sm:block sm:col-span-1 text-right"><Eyebrow>Move</Eyebrow></div></>}
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Assets</div>
      {line("Cash and equivalents", "cash", "", true)}
      {line("Accounts receivable", "ar", "uncollected sales", true)}
      {line("Inventory", "inventory", d0((close || open).invUnits) + " units at cost", true)}
      {line("Plant and equipment", "equipment", "net of depreciation", true)}
      {line("Intellectual property", "ip", "innovation board, amortised", true)}
      {line("Total assets", "assets", "")}
      <div className="mt-3 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Liabilities</div>
      {line("Accounts payable", "ap", "owed to suppliers", true)}
      {line("Borrowings", "debt", "credit facility drawn", true)}
      {line("Other liabilities", "other", "fixed", true)}
      {line("Total liabilities", "liabilities", "")}
      <div className="mt-3 text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Equity</div>
      {line("Share capital", "share", "seed round", true)}
      {line("Retained earnings", "re", "accumulated profit and loss", true)}
      {line("Total equity", "equity", "")}
      <div className="mt-3 pt-2 border-t-2 border-stone-800 grid grid-cols-12 gap-2">
        <div className="col-span-5 sm:col-span-4 text-sm font-semibold">Liabilities and equity</div>
        <div className="hidden sm:block sm:col-span-3 text-xs text-stone-500 font-mono">must equal total assets</div>
        <div className="col-span-3 sm:col-span-2 text-right font-mono text-sm text-stone-500">{inr(open.liabilities + open.equity)}</div>
        {close && <div className="col-span-4 sm:col-span-2 text-right font-mono text-sm font-semibold">{inr(close.liabilities + close.equity)}</div>}
      </div>
    </Card>);
}

function ProfitAndLoss({ r }) {
  const gm = r.revenueT > 0 ? r.grossProfit / r.revenueT * 100 : 0;
  return (
    <Card eyebrow="Profit and loss" title={"Quarter " + r.q}>
      {PRODUCTS.filter((p) => r.P[p.id].live && r.sold[p.id] > 0).map((p) => (
        <Row key={p.id} label={p.name + (r.P[p.id].status === "discontinued" ? " (cleared)" : "")}
          working={d0(r.sold[p.id]) + " × " + inr(r.P[p.id].price) + (r.P[p.id].status === "discontinued" ? " at 40% off" : "")}
          value={inr(r.revenue[p.id])} indent />))}
      <Row label="Revenue" working={d0(r.unitsSold) + " units"} value={inr(r.revenueT)} strong />
      <Row label="Cost of goods sold" working={"weighted average cost of units sold"} value={"(" + inr(r.cogs) + ")"} indent />
      <Row label="Gross profit" working={pct(gm) + " margin"} value={inr(r.grossProfit)} strong />
      {r.channelMargin > 0 && <Row label="Distributor margin" working={pct(r.channelShare * 100) + " of funnel units at 18%"} value={"(" + inr(r.channelMargin) + ")"} indent />}
      <Row label="Warranty provision" working={r.warrantyMult ? d0(r.unitsSold) + " × " + pct(r.defectRate) + " × ₹1,500 × " + d1(r.warrantyMult) : "6-month cover"} value={"(" + inr(r.warrantyCost) + ")"} indent />
      <Row label="Inventory holding" working={d0(r.invUnitsOut) + " units × " + inr(r.holdingPerUnit)} value={"(" + inr(r.holdingCost) + ")"} indent />
      <Row label="Salaries" working={d0(r.headcount) + " people across six functions"} value={"(" + inr(r.salaries) + ")"} indent />
      <Row label="Overhead" working="rent, platform, utilities" value={"(" + inr(r.overhead) + ")"} indent />
      {r.peopleCost > 0 && <Row label="Recruitment and severance" working={d0(r.totalHired) + " hired, " + d0(r.totalFired) + " exited"} value={"(" + inr(r.peopleCost) + ")"} indent />}
      <Row label="Discretionary operating spend" working={lakh(r.opexL) + " across all departments"} value={"(" + inr(r.opexSpend) + ")"} indent />
      <Row label="Depreciation and amortisation" working="5% of plant, 8% of capitalised innovation" value={"(" + inr(r.depreciation + r.amortisation) + ")"} indent />
      <Row label="Net interest" working={inr(r.debtClose) + " of borrowings at 3.5%, treasury at " + pct(r.treasuryRate * 100)} value={inr(r.interestIncome - r.interestExpense)} indent />
      <Row label="Net profit" working="carried to retained earnings" value={inr(r.netProfit)} strong
        tone={r.netProfit >= 0 ? "text-teal-800" : "text-rose-800"} flag={r.netProfit < 0} />
    </Card>);
}
function CashFlow({ r }) {
  return (
    <Card eyebrow="Cash flow statement" title={"Opening " + inr(r.openingCash) + " → closing " + inr(r.cash)}>
      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1">Operating</div>
      <Row label="Collections from customers" working={"revenue less the " + d0(r.arDays) + "-day receivable"} value={inr(r.collections)} indent />
      <Row label="Paid to suppliers" working={inr(r.prodCostTotal) + " of production on " + r.terms.name.toLowerCase()} value={"(" + inr(r.supplierPaid) + ")"} indent />
      <Row label="Operating costs" working="salaries, overhead, opex, warranty, holding, people" value={"(" + inr(r.fixedCost + r.opexSpend + r.peopleCost + r.warrantyCost + r.holdingCost + r.channelMargin) + ")"} indent />
      <Row label="Net interest" working="paid less earned" value={inr(r.interestIncome - r.interestExpense)} indent />
      <Row label="Cash from operations" working="" value={inr(r.operatingCF)} strong tone={r.operatingCF >= 0 ? "text-teal-800" : "text-rose-800"} />
      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1 mt-2">Investing</div>
      <Row label="Plant and capacity" working={r.capacityAdded > 0 ? "+" + d0(r.capacityAdded) + " units a quarter" : "no capex"} value={"(" + inr(r.capexSpend) + ")"} indent />
      <Row label="Innovation board" working={r.started.length ? r.started.length + " card(s) started, capitalised" : "nothing started"} value={"(" + inr(r.innoSpend) + ")"} indent />
      <Row label="Cash used in investing" working="" value={inr(r.investingCF)} strong />
      <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold py-1 mt-2">Financing</div>
      <Row label="Credit drawn" working={r.drawRejected > 1 ? inr(r.drawRejected) + " refused" : "within the limit"} value={inr(r.drawn)} indent />
      <Row label="Borrowings repaid" working="" value={"(" + inr(r.repaid) + ")"} indent />
      {r.equityRaised > 0 && <Row label="Equity investment received" working="term sheet accepted last quarter" value={inr(r.equityRaised)} indent />}
      <Row label="Cash from financing" working="" value={inr(r.financingCF)} strong />
      <Row label="Net movement in cash" working={r.wcBreached ? "closes below the buffer" : "buffer intact"} value={inr(r.netCF)} strong
        tone={r.netCF >= 0 ? "text-teal-800" : "text-rose-800"} flag={r.wcBreached} />
    </Card>);
}

/* ========================= DEPARTMENT CONFIGURATION ======================= */
const DEPTS = [
  { id: "marketing", label: "Marketing", eyebrow: "Demand generation", scope: "marketing",
    blurb: "Nine channels. Seven make leads now, two build assets that pay out later. None of it matters if operations cannot build what it sells.",
    lines: [
      { key: "google", name: "Google Ads", formula: "Leads = 375 × x^0.68",
        preview: (x, c) => [d0(375 * pw(x, .68) * c.mk) + " leads", x > 0 ? inr(x * 100000 / Math.max(1, 375 * pw(x, .68) * c.mk)) + " a lead" : null] },
      { key: "meta", name: "Meta Ads", formula: "Leads = 200 × x^0.65 · Brand +1.2x",
        preview: (x, c) => [d0(200 * pw(x, .65) * c.mk) + " leads", "+" + d1(1.2 * x) + " brand", d0(40000 * x) + " impressions"] },
      { key: "social", name: "Social & Influencer", formula: "Leads = 225 × x^0.72 · Brand +2.5x",
        preview: (x, c) => [d0(225 * pw(x, .72) * c.mk) + " leads", "+" + d1(2.5 * x) + " brand"] },
      { key: "content", name: "Content & SEO", formula: "Leads = 75 × x^0.62 · SEO asset +3.5x",
        preview: (x, c) => [d0(75 * pw(x, .62) * c.mk) + " leads now", "+" + d1(3.5 * x) + " SEO asset", d0(3.5 * x * 25) + " free leads in Q" + (c.s.quarter + 1)] },
      { key: "events", name: "Events & PR", formula: "Leads = 90 × x^0.62 · Brand +1.5x",
        preview: (x, c) => [d0(90 * pw(x, .62) * c.mk) + " leads", "+" + d1(1.5 * x) + " brand"] },
      { key: "email", name: "Email Marketing", formula: "Leads = 80 × x^0.55 · Repeat +3√x",
        preview: (x, c) => [d0(80 * pw(x, .55) * c.mk) + " leads", "+" + d1(3 * pw(x, .5)) + "pts repeat rate"] },
      { key: "direct", name: "Direct Marketing", formula: "Leads = 160 × x^0.60 · Conversion +0.8 × x^0.4",
        preview: (x, c) => [d0(160 * pw(x, .60) * c.mk) + " high-intent leads", "+" + d1(.8 * pw(x, .4)) + "pts conversion",
          x > 8 ? "−" + d1(.25 * (x - 8)) + " satisfaction from over-contact" : "no contact fatigue below ₹8L"] },
      { key: "referral", name: "Referral Programme", formula: "₹300 a lead, capped at 20% of customers",
        cap: (c) => .2 * c.s.customers * 300 / 100000,
        preview: (x, c) => { const cp = .2 * c.s.customers * 300 / 100000;
          return [d0(Math.min(x * 100000 / 300, .2 * c.s.customers)) + " leads", "cap " + lakh(cp), x > cp ? lakh(x - cp) + " past the cap buys nothing" : null]; } },
      { key: "buzz", name: "Pre-Launch Buzz", formula: "Buzz +4√x · no leads this quarter",
        preview: (x, c) => { const b = 4 * pw(x, .5);
          return ["+" + d1(b) + " buzz", d0(b * 15) + " free leads in Q" + (c.s.quarter + 1), d0(b * 25) + " leads and +" + d1(b * .3) + "pts conversion in Q" + (c.s.quarter + 2)]; } },
    ] },
  { id: "sales", label: "Sales", eyebrow: "Route to market", scope: "sales",
    blurb: "Own reps, a distributor channel, and corporate accounts that bypass the funnel entirely.",
    lines: [
      { key: "reps", name: "Reps & Commissions", formula: "Capacity = 500x × (1 − attrition) × sales staffing",
        preview: (x, c) => [d0(500 * x * (1 - c.s.attrition / 100) * c.sl) + " leads of capacity", "+" + d1(2 * pw(x, .5)) + "pts conversion",
          c.sl < .999 ? "throttled to " + pct(c.sl * 100) + " by sales staffing" : "fully staffed"] },
      { key: "crm", name: "CRM & Tools", formula: "Conversion +1.5 × x^0.4", preview: (x) => ["+" + d1(1.5 * pw(x, .4)) + "pts conversion"] },
      { key: "salesTraining", name: "Sales Training & Enablement", formula: "Conversion +2.2 × x^0.45 · Attrition −0.4√x",
        preview: (x) => ["+" + d1(2.2 * pw(x, .45)) + "pts conversion", "−" + d1(.4 * pw(x, .5)) + "pts attrition next quarter"] },
      { key: "channel", name: "Channel Partners & Distribution", formula: "Capacity += 420 × x^0.75 · 18% of their revenue",
        preview: (x, c) => { const cc = 420 * pw(x, .75); const rep = 500 * c.A.reps * (1 - c.s.attrition / 100) * c.sl;
          return [d0(cc) + " leads of distributor capacity", pct(cc + rep > 0 ? cc / (cc + rep) * 100 : 0) + " of funnel sales via channel", "18% margin given away on those"]; } },
      { key: "keyAccounts", name: "Key Accounts & Corporate", formula: "Units = 85 × x^0.8 at 22% off, no leads consumed",
        preview: (x, c) => [d0(85 * pw(x, .8)) + " units of bulk demand", inr(c.s.products.pulse.price * .78) + " a unit", "takes production capacity, not funnel"] },
      { key: "onboarding", name: "Onboarding & Success", formula: "Satisfaction +3√x · Repeat +3 × x^0.4 · support staffing",
        preview: (x, c) => ["+" + d1(3 * pw(x, .5) * c.sp) + " satisfaction", "+" + d1(3 * pw(x, .4) * c.sp) + "pts repeat rate"] },
    ] },
  { id: "rnd", label: "Product & Innovation", eyebrow: "What you sell and what it costs", scope: "rnd",
    blurb: "The price of every product, the board of things it could become, and the ceiling on what any of it can convert.",
    lines: [
      { key: "quality", name: "Quality & QA", formula: "Quality +6√x × engineering staffing · Defect = max(2, 8 − 1.2√x)",
        preview: (x, c) => ["+" + d1(6 * pw(x, .5) * c.en) + " quality", "defect rate " + pct(Math.max(2, 8 - 1.2 * pw(x, .5) * c.en))] },
      { key: "innovation", name: "Continuous R&D", formula: "Innovation +5√x · Feature completeness +8√x",
        preview: (x, c) => { const f = c.s.feature + 8 * pw(x, .5) * c.en;
          return ["+" + d1(5 * pw(x, .5) * c.en) + " innovation", "completeness " + d1(Math.min(f, 100)) + "/100", f >= 100 ? "Milestone ships: +15 brand, +10 quality" : null]; } },
      { key: "npd", name: "New Product Development", formula: "Progress +12√x · the Pro goes on sale at 60",
        preview: (x, c) => { if (c.s.products.pro.live) return ["The Pro is already on sale"];
          const p = c.s.npd + 12 * pw(x, .5) * c.en;
          return ["progress " + d1(Math.min(p, 100)) + "/100", p >= 100 ? "The Pro can be built and priced from next quarter" : "needs " + d1(100 - p) + " more"]; } },
      { key: "design", name: "Design & Industrial Engineering", formula: "Brand +1.8√x · cost per unit −₹40√x",
        preview: (x, c) => ["+" + d1(1.8 * pw(x, .5) * c.en) + " brand", "−" + inr(40 * pw(x, .5) * c.en) + " off every unit built"] },
    ] },
  { id: "ops", label: "Operations", eyebrow: "Capacity and supply", scope: "ops",
    blurb: "Installed capacity is what you own. The production run is how much of it you switch on. Marketing spends against whatever this department can deliver.",
    lines: [
      { key: "capex", name: "Plant Capex — builds capacity", formula: "Installed capacity += 240 × x^0.75, permanent · capitalised",
        preview: (x, c) => ["+" + d0(240 * pw(x, .75)) + " units a quarter, permanently", "installed becomes " + d0(c.s.installedCapacity + 240 * pw(x, .75)), "balance sheet, not P&L"] },
      { key: "production", name: "Production Run — spends that capacity", formula: "Runs min(installed, 420 × x^0.7) × ops staffing × reliability",
        preview: (x, c) => { const inst = c.s.installedCapacity + 240 * pw(c.A.capex, .75); const run = 420 * pw(x, .7); const g = Math.min(inst, run);
          return [d0(g) + " units run of " + d0(inst) + " installed", run < inst ? "under-running the plant by " + d0(inst - run) : "plant fully loaded",
            d0(g * c.op * (c.s.supplierRel / 100) * (1 - c.s.attrition / 100)) + " actually built after losses"]; } },
      { key: "contract", name: "Contract Manufacturing", formula: "Units = 650 × x^0.85 × 0.90 · ₹700 a unit premium",
        preview: (x) => [d0(650 * pw(x, .85) * .9) + " units, no capex needed", "₹700 a unit above your own cost", "available this quarter"] },
      { key: "supplier", name: "Supplier & QC", formula: "Supplier reliability +4√x (cap 100)",
        preview: (x, c) => ["+" + d1(4 * pw(x, .5) * c.op) + " reliability", "to " + d1(Math.min(100, c.s.supplierRel + 4 * pw(x, .5) * c.op)) + " — multiplies everything built"] },
      { key: "logistics", name: "Logistics & Distribution", formula: "Efficiency +5√x · Satisfaction +0.05 × efficiency",
        preview: (x, c) => { const e = Math.min(100, c.s.logisticsEff + 5 * pw(x, .5) * c.op); return ["efficiency " + d1(e), "+" + d1(.05 * e) + " satisfaction"]; } },
      { key: "warehouse", name: "Warehousing & Fulfilment", formula: "Holding = max(40, 150 − 22√x) a unit · Satisfaction +2√x",
        preview: (x) => [inr(Math.max(40, 150 - 22 * pw(x, .5))) + " a unit to hold stock", "+" + d1(2 * pw(x, .5)) + " satisfaction"] },
    ] },
  { id: "hr", label: "People", eyebrow: "Headcount by function", scope: "hr",
    blurb: "Six functions, each doing a different job. Salaries are your largest fixed cost, and every function you starve breaks in its own specific way.",
    lines: [
      { key: "culture", name: "Culture & Benefits", formula: "Satisfaction +5√x · Productivity = 1 + (sat − 50) × 0.004",
        preview: (x, c) => { const e = c.s.empSat + 5 * pw(x, .5); return ["employee satisfaction " + d1(e), d2(1 + (e - 50) * .004) + "× on every lead"]; } },
      { key: "hrTraining", name: "Training & Development", formula: "Engagement +6√x · Attrition = max(3, 15 − 0.12 × engagement)",
        preview: (x, c) => { const e = c.s.empEng + 6 * pw(x, .5); return ["engagement " + d1(e), "attrition next quarter " + pct(Math.max(3, 15 - .12 * e))]; } },
      { key: "cx", name: "Customer Experience", formula: "Satisfaction +4√x · Repeat +2 × x^0.4 · support staffing",
        preview: (x, c) => ["+" + d1(4 * pw(x, .5) * c.sp) + " satisfaction", "+" + d1(2 * pw(x, .4) * c.sp) + "pts repeat rate"] },
    ] },
  { id: "finance", label: "Finance", eyebrow: "Capital and governance", scope: "finance",
    blurb: "The only department that changes what every other department can afford.",
    lines: [
      { key: "workingCapital", name: "Working Capital Management", formula: "Receivable days = max(10, 30 − 8√x)",
        preview: (x, c) => { const dd = Math.max(10, 30 - 8 * pw(x, .5)); return [d0(dd) + " days to collect, from " + d0(c.s.arDays), "releases cash trapped in receivables"]; } },
      { key: "treasury", name: "Treasury & Cash Management", formula: "Yield = min(2.5%, 0.8% + 0.55√x) on opening cash",
        preview: (x, c) => { const rt = Math.min(2.5, .8 + .55 * pw(x, .5)); return [pct(rt) + " a quarter on idle cash", inr(Math.max(0, c.s.cash) * rt / 100) + " of interest income"]; } },
      { key: "compliance", name: "Compliance & Legal", formula: "Compliance +5√x × admin staffing",
        preview: (x, c) => ["compliance " + d1(c.s.compliance + 5 * pw(x, .5) * c.ad)] },
      { key: "planning", name: "Financial Planning", formula: "Forecast +6√x · overhead falls by (accuracy − 55) × 0.1%",
        preview: (x, c) => { const f = c.s.forecast + 6 * pw(x, .5) * c.ad; const b = Math.max(0, f - 55) * .1;
          return ["forecast accuracy " + d1(f), "overhead " + inr(c.s.overhead * (1 - b / 100)) + " next quarter", b > 0 ? "saves " + inr(c.s.overhead * b / 100) + " every quarter" : "no saving until accuracy passes 55"]; } },
      { key: "audit", name: "Audit Preparation", formula: "Audit readiness +5√x × admin staffing",
        preview: (x, c) => { const a = c.s.audit + 5 * pw(x, .5) * c.ad;
          return ["audit readiness " + d1(a), "penalty risk " + pct(Math.max(5, 40 - .25 * c.s.compliance - .10 * a))]; } },
    ] },
];
const CRISIS_LINES = {
  ABC: [
    { key: "priceMatch", name: "Price-Match Fund", formula: "Dampening recovers to min(1.0, d + 0.15√x)",
      preview: (x, c) => { const d = c.damp || 1; const nd = Math.min(1, d + .15 * pw(x, .5));
        return ["lead dampening " + d2(d) + " → " + d2(nd), nd >= 1 ? "pressure fully closed out" : null]; } },
    { key: "comparisonAds", name: "Comparison Ads", formula: "Conversion recovery = min(penalty, 2√x)",
      preview: (x, c) => { const p = c.penalty || 0; const rc = Math.min(p, 2 * pw(x, .5));
        return ["recovers " + d1(rc) + " of " + d1(p) + "pts", "residual penalty " + d1(p - rc) + "pts"]; } },
    { key: "retention", name: "Retention Offers", formula: "Customer loss = max(0, 8 − 1.5√x)%",
      preview: (x, c) => { const l = Math.max(0, 8 - 1.5 * pw(x, .5));
        return ["customer loss " + pct(l), d0(c.s.customers * l / 100) + " customers gone"]; } },
  ],
  D: [
    { key: "supplyFund", name: "Emergency Supply Chain Fund", formula: "Capacity × min(1, max(0.10, 0.50 + 0.005(SR − 50) + offset + 0.10√x))",
      preview: (x, c) => { const off = c.choice === "DA" ? .5 : c.choice === "DB" ? .25 : 0;
        const m = clamp(.5 + .005 * (c.s.supplierRel - 50) + off + .1 * pw(x, .5), .1, 1);
        return ["capacity multiplier " + d2(m), pct((1 - m) * 100) + " of what you build is lost", x > 0 ? null : "satisfaction −5 if left unfunded"]; } },
  ],
};

/* ============================ THE CONSTRAINT CHAIN ======================== */
function ConstraintChain({ r }) {
  const capBinds = r.leadsWasted > 1;
  const mkShort = r.staffing.marketing < .999;
  const availAll = PRODUCTS.reduce((t, x) => t + r.avail[x.id], 0);
  const stages = [
    { k: "Leads generated", v: d0(r.rawLeads), u: "raw leads", w: "Seven paid channels, this quarter's spend only" },
    r.crisis && r.dampBefore < 1 ? { k: "Competitive dampening", v: "× " + d2(r.damp), u: "",
      w: "base " + d2(r.dampBefore) + (r.damp > r.dampBefore ? ", recovered by the price-match fund" : ", unrecovered"), bind: r.damp < .9 } : null,
    { k: "Assets built earlier", v: "+ " + d0(r.seoFree + r.buzzFree), u: "free leads",
      w: "SEO " + d0(r.seoFree) + " and buzz " + d0(r.buzzFree) + ", paid for in prior quarters" },
    { k: "Brand, morale, staffing", v: "× " + d2(r.brandMult * r.prodMult * r.staffing.marketing), u: "",
      w: "brand " + d2(r.brandMult) + " × morale " + d2(r.prodMult) + " × marketing staffing " + d2(r.staffing.marketing), bind: mkShort },
    { k: "Effective leads", v: d0(r.effLeads), u: "at the door", w: "everything above, compounded", strong: true },
    { k: "Selling capacity", v: d0(r.capacity), u: "leads workable",
      w: capBinds ? d0(r.leadsWasted) + " leads lost — capacity is binding"
        : d0(r.repCapacity) + " reps + " + d0(r.channelCapacity) + " channel, " + d0(r.idleCapacity) + " idle", bind: capBinds },
    { k: "Leads worked", v: d0(r.leadsUsed), u: "leads", w: "the smaller of leads and capacity", strong: true },
    { k: "Conversion", v: pct(r.finalConv), u: "",
      w: "raw " + d1(r.rawConv) + "% " + (r.ceilingBinding ? "capped at the " + d1(r.ceiling) + "% product ceiling" : "under a " + d1(r.ceiling) + "% ceiling") +
        (r.warrantyBonus ? " · warranty +" + d1(r.warrantyBonus) : "") + (r.buzzConvBonus ? " · buzz +" + d1(r.buzzConvBonus) : "") +
        (r.convPenalty ? " · crisis −" + d1(r.convPenalty) : ""), bind: r.ceilingBinding },
    { k: "Price effect", v: "× " + d2(r.blendedPriceMult), u: "on demand",
      w: PRODUCTS.filter((x) => r.P[x.id].live).map((x) => x.name.split(" ").pop() + " " + inr(r.P[x.id].price) + " vs " + inr(r.priceInfo[x.id].ref)).join(" · "),
      bind: r.blendedPriceMult < .8 },
    { k: "Demand", v: d0(r.demandTotal + r.b2bDemand), u: "units wanted",
      w: d0(r.funnelUnits) + " funnel + " + d0(r.repeatUnits) + " repeat at " + pct(r.repeatRate) + " + " + d0(r.b2bDemand) + " corporate", strong: true },
    { k: "Installed capacity", v: d0(r.installedCapacity), u: "units a quarter",
      w: r.runLimited ? d0(r.installedCapacity - r.grossRun) + " idle — the run was funded below the plant" : "fully loaded at " + pct(r.utilisation * 100),
      bind: r.runLimited && r.supplyBinding },
    { k: "Units built", v: d0(r.capacityUnits), u: "line units",
      w: d0(r.ownBuilt) + " own after " + pct(100 - r.supplierRel) + " supplier loss and " + pct((1 - r.staffing.operations) * 100) + " staffing loss, + " + d0(r.cmBuilt) + " contract" },
    { k: "Available to sell", v: d0(availAll), u: "units",
      w: PRODUCTS.filter((x) => r.P[x.id].live).map((x) => x.name.split(" ").pop() + " " + d0(r.avail[x.id])).join(" · ") +
        (r.supplyBinding ? " — " + d0(r.unmetDemand) + " units unmet" : ""), bind: r.supplyBinding },
    { k: "Units sold", v: d0(r.unitsSold), u: "units",
      w: PRODUCTS.filter((x) => r.sold[x.id] > 0).map((x) => d0(r.sold[x.id]) + " " + x.name.split(" ").pop()).join(" + ") || "nothing sold", final: true },
  ].filter(Boolean);
  return (
    <div className="bg-white border border-stone-300">
      <header className="border-b border-stone-300 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
        <div><Eyebrow tone="text-rose-800">Where the quarter narrowed</Eyebrow><h3 className="font-serif text-lg">The constraint chain</h3></div>
        <div className="text-xs text-stone-500 uppercase tracking-widest">Ledger red marks the binding gate</div>
      </header>
      <ol className="divide-y divide-stone-200">
        {stages.map((st, i) => (
          <li key={i} className={"px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 " +
            (st.bind ? "bg-rose-50 border-l-4 border-rose-700" : st.final ? "bg-stone-900" : st.strong ? "bg-stone-50" : "")}>
            <div className={"w-44 shrink-0 text-sm " + (st.final ? "text-white font-semibold" : st.bind ? "text-rose-900 font-semibold" : st.strong ? "font-semibold text-stone-900" : "text-stone-700")}>{st.k}</div>
            <div className={"font-mono text-lg " + (st.final ? "text-white" : st.bind ? "text-rose-800" : "text-stone-900")}>
              {st.v} <span className={"text-xs " + (st.final ? "text-stone-400" : "text-stone-500")}>{st.u}</span></div>
            <div className={"text-xs font-mono flex-1 min-w-full sm:min-w-0 " + (st.final ? "text-stone-400" : st.bind ? "text-rose-800" : "text-stone-500")}>{st.w}</div>
          </li>))}
      </ol>
    </div>);
}


/* ============================== SCORING RUBRIC ============================ */
const LEVEL_FACTOR = { full: 1, part: 0.5, none: 0 };
const lv = (full, part) => (full ? "full" : part ? "part" : "none");
const shareVector = (A) => { const t = opexLakhs(A) || 1; return ALLOC_KEYS.map((k) => (LINES[k] === "opex" ? num(A[k]) / t : 0)); };

function scoreQuarter(res, prior, reflection, priority, detected, budgetCeiling, q4mods) {
  const A = res.A;
  const total = res.opexL;
  const funded = total > 0.001;
  const R = reflection || {};
  const named = (R.sacrifice || []).length > 0;
  const constraintRight = detected && R.constraint === detected.primary.id;
  const constraintClose = detected && (detected.all || []).some((c) => c.id === R.constraint);
  const riskNamed = !!R.risk;
  const align = priorityAlignment(priority, A);
  const expectedOk = (() => {
    if (!R.expect) return false;
    const grew = prior ? res.unitsSold > prior.unitsSold : res.unitsSold > 0;
    const cashUp = res.netCF >= 0;
    if (R.expect === "growfast") return grew && res.unitsSold > (prior ? prior.unitsSold * 1.2 : 0);
    if (R.expect === "growslow") return grew;
    if (R.expect === "hold") return !grew || cashUp;
    if (R.expect === "shrink") return !grew || cashUp;
    return false;
  })();
  const slack = Math.max(res.leadsWasted, res.idleCapacity) / Math.max(1, res.effLeads);
  const compounding = A.content + A.buzz + A.social + A.innovation + A.npd;
  const longHorizon = compounding + A.quality + A.design + A.capex;
  const innoStarted = (res.started || []).length;
  const biggest = Math.max(0, ...ALLOC_KEYS.filter((k) => LINES[k] === "opex").map((k) => num(A[k])));
  const hrSpend = A.culture + A.hrTraining + A.cx;
  const worstStaff = ROLES.reduce((m, r) => Math.min(m, res.staffing[r.id]), 1);
  const respSpend = A.priceMatch + A.comparisonAds + A.retention + A.supplyFund;
  const demandAll = res.demandTotal + res.b2bDemand;
  const availAll = PRODUCTS.reduce((t, x) => t + res.avail[x.id], 0);

  let mixShift = null;
  if (prior) { const a = shareVector(A), b = shareVector(prior.A);
    mixShift = a.reduce((t, x, i) => t + Math.abs(x - b[i]), 0) / 2; }

  let fixedBottleneck = "none", bottleneckName = "n/a";
  if (prior) {
    if (prior.leadsWasted > prior.effLeads * 0.05) { bottleneckName = "selling capacity";
      fixedBottleneck = A.reps + A.channel > (prior.A.reps + prior.A.channel) * 1.15 ? "full" : A.reps + A.channel > prior.A.reps + prior.A.channel ? "part" : "none"; }
    else if (prior.unmetDemand > 1) { bottleneckName = "production supply";
      fixedBottleneck = A.production + A.capex + A.contract > (prior.A.production + prior.A.capex + prior.A.contract) * 1.15 ? "full" : A.production + A.capex + A.contract > prior.A.production + prior.A.capex + prior.A.contract ? "part" : "none"; }
    else if (prior.ceilingBinding) { bottleneckName = "the product conversion ceiling";
      fixedBottleneck = A.quality + A.innovation > (prior.A.quality + prior.A.innovation) * 1.15 || (res.landed || []).length ? "full" : A.quality + A.innovation > prior.A.quality + prior.A.innovation ? "part" : "none"; }
    else if (prior.shortRoles.length) { bottleneckName = prior.shortRoles.map((r) => r.name).join(" and ") + " staffing";
      const before = Math.min(...prior.shortRoles.map((r) => prior.staffing[r.id]));
      const after = Math.min(...prior.shortRoles.map((r) => res.staffing[r.id]));
      fixedBottleneck = after > before + 0.05 ? "full" : after > before ? "part" : "none"; }
    else { bottleneckName = "no single binding constraint"; fixedBottleneck = "full"; }
  }

  let crisisLevel = "none", crisisText = "No market event in play.";
  if (res.crisis) {
    crisisLevel = res.neutralised ? "full" : respSpend > 0 ? "part" : "none";
    crisisText = res.neutralised ? "Event fully neutralised."
      : respSpend > 0 ? lakh(respSpend) + " committed to the response, partially closing it out."
        : "No rupees committed to any response line.";
  }

  const T = [
    { name: "Strategic Thinking", weight: 15, subs: [
      { label: "Funnel stages sized against each other", level: funded ? lv(slack < .15, slack < .35) : "none",
        detail: funded ? d0(res.leadsWasted) + " leads past capacity, " + d0(res.idleCapacity) + " capacity idle — slack " + pct(slack * 100) : "Nothing funded, so nothing was sized." },
      { label: "At least one compounding asset funded", level: lv(compounding >= total * .10 && funded, compounding > 0),
        detail: lakh(compounding) + " into SEO, buzz, social, innovation and new product" + (funded ? " — " + pct(compounding / total * 100) + " of spend" : "") },
      { label: "Bets concentrated rather than sprinkled", level: funded ? lv(biggest >= total * .16, biggest >= total * .10) : "none",
        detail: funded ? "largest line is " + pct(biggest / total * 100) + " of operating spend" : "No operating spend committed." },
      { label: "Money followed the stated priority", level: align ? lv(align.ok, align.share !== null && align.share >= 0.2) : "none",
        detail: priority ? "Declared " + PRIORITY[priority].name.toLowerCase() + "; " + (align ? align.note : "nothing committed") + "." : "No priority declared." } ] },

    { name: "Leadership", weight: 10, subs: [
      { label: "Every function staffed for the plan", level: lv(worstStaff >= 0.999, worstStaff >= 0.85),
        detail: res.shortRoles.length ? res.shortRoles.map((r) => r.name + " " + pct(res.staffing[r.id] * 100)).join(", ") : "All six functions carrying their load." },
      { label: "Morale held through the quarter", level: lv(res.empSat >= 75, res.empSat >= 65),
        detail: "employee satisfaction " + d1(res.empSat) + (res.totalFired > 0 ? " after " + d0(res.totalFired) + " exits" : "") + ", productivity " + d2(res.prodMult) + "×" },
      { label: "Attrition kept off next quarter", level: lv(res.attritionNext <= 6, res.attritionNext <= 9),
        detail: "attrition entering next quarter " + pct(res.attritionNext) } ] },

    { name: "Adaptability", weight: 15, subs: [
      { label: "Allocation mix moved with the evidence", level: prior ? lv(mixShift >= .15, mixShift >= .06) : "part",
        detail: prior ? pct(mixShift * 100) + " of the mix reallocated" : "Opening quarter, scored as partial by default." },
      { label: res.crisis ? "Market event answered on its own terms" : "Last quarter's binding constraint addressed",
        level: res.crisis ? crisisLevel : fixedBottleneck,
        detail: res.crisis ? crisisText : (prior ? "the binding constraint was " + bottleneckName : "No prior quarter to respond to.") },
      { label: "Read the company's actual constraint correctly", level: lv(constraintRight, constraintClose),
        detail: detected ? (constraintRight ? "Named " + detected.primary.label + ", which is what the evidence says was binding."
          : constraintClose ? "Named a real pressure, but not the one that was actually binding — that was " + detected.primary.label + "."
            : "The binding constraint was " + detected.primary.label + ".") : "No reading recorded." } ] },

    { name: "Systems Thinking", weight: 20, subs: [
      { label: "Supply matched to demand", level: lv(Math.abs(availAll - demandAll) <= .10 * Math.max(1, demandAll), Math.abs(availAll - demandAll) <= .25 * Math.max(1, demandAll)),
        detail: d0(demandAll) + " units of demand against " + d0(availAll) + " available" + (res.unmetDemand > 1 ? ", " + d0(res.unmetDemand) + " unmet" : "") },
      { label: "Product ceiling kept ahead of the funnel", level: lv(res.ceiling >= res.rawConv, res.rawConv - res.ceiling <= 3),
        detail: "raw conversion " + d1(res.rawConv) + "% against a " + d1(res.ceiling) + "% ceiling" },
      { label: "Plant you own is plant you run", level: res.installedCapacity > 0 ? lv(res.utilisation >= .85, res.utilisation >= .65) : "none",
        detail: pct(res.utilisation * 100) + " utilisation on " + d0(res.installedCapacity) + " units of installed capacity" } ] },

    { name: "Risk Management", weight: 15, subs: [
      { label: "Working capital kept clear of the floor", level: lv(res.cash >= WC_BUFFER * 2.5, res.cash >= WC_BUFFER),
        detail: "closing cash " + inr(res.cash) + " against a " + inr(WC_BUFFER) + " buffer" },
      { label: "Compliance exposure contained", level: lv(res.penaltyRisk <= 12, res.penaltyRisk <= 20),
        detail: "penalty risk " + pct(res.penaltyRisk) + " (compliance " + d0(res.compliance) + ", audit " + d0(res.audit) + ")" },
      { label: "Single points of failure funded down", level: lv(res.supplierRel >= 85, res.supplierRel >= 78),
        detail: "supplier reliability " + d0(res.supplierRel) + " on " + res.terms.name.toLowerCase() + " terms" } ] },

    { name: "Capital Allocation", weight: 15, subs: [
      { label: "Cash flow controlled", level: lv(res.netCF >= 0, res.netCF >= -.15 * Math.max(1, res.openingCash)),
        detail: "net cash movement " + inr(res.netCF) + " on an opening balance of " + inr(res.openingCash) },
      { label: "Commitments held inside the ceiling", level: lv(res.opexSpend + res.capexSpend + res.innoSpend + res.peopleCost <= budgetCeiling, res.opexSpend + res.capexSpend + res.innoSpend + res.peopleCost <= budgetCeiling * 1.1),
        detail: inr(res.opexSpend + res.capexSpend + res.innoSpend + res.peopleCost) + " committed against a ceiling of " + inr(budgetCeiling) },
      { label: "Debt carried for a reason", level: res.debtClose > 0 ? lv(res.netProfit > 0 || riskNamed, riskNamed) : "full",
        detail: res.debtClose > 0 ? inr(res.debtClose) + " outstanding, " + inr(res.interestExpense) + " of interest this quarter" : "No borrowings outstanding." } ] },

    { name: "Long-Term Thinking", weight: 10, subs: [
      { label: "Assets built that outlive the quarter", level: funded ? lv(longHorizon >= total * .15, longHorizon >= total * .08) : "none",
        detail: lakh(longHorizon) + " into product, brand assets and plant" + (innoStarted ? ", plus " + inr(res.innoSpend) + " of innovation cards" : "") },
      { label: "Product moved forward", level: lv((res.qualityGain > 0 && res.defectRate <= 4) || res.proLaunching || res.landed.length > 0, res.qualityGain > 0 || res.innovGain > 0 || res.started.length > 0),
        detail: "quality +" + d1(res.qualityGain) + ", innovation +" + d1(res.innovGain) + (res.proLaunching ? ", the Pro cleared development" : "") + (res.landed.length ? ", shipped " + res.landed.map((x) => INNO[x].name).join(" and ") : "") + (res.started.length ? ", " + res.started.length + " card(s) started" : "") },
      { label: "Enterprise value trending up", level: prior ? lv(res.valuation > prior.valuation, res.valuation >= prior.valuation * .95) : lv(res.revenueT > 0, res.unitsSold > 0),
        detail: prior ? cr(prior.valuation) + " → " + cr(res.valuation) : "opening valuation " + cr(res.valuation) } ] },
  ];

  const traits = T.map((t) => { const per = t.weight / t.subs.length;
    const subs = t.subs.map((s) => ({ ...s, points: per * LEVEL_FACTOR[s.level] }));
    return { ...t, subs, points: subs.reduce((a, b) => a + b.points, 0) }; });
  const traitTotal = traits.reduce((a, b) => a + b.points, 0);

  const mods = [];
  if (A.referral > 0 && Math.abs(A.referral - res.referralCapSpend) <= Math.max(.05, res.referralCapSpend * .02))
    mods.push({ d: 2, why: "Referral funded to exactly its hard cap of " + lakh(res.referralCapSpend) + " — no rupee spent past the ceiling." });
  if (res.capacity > 0 && res.leadsWasted < 1 && res.effLeads > 1)
    mods.push({ d: 2, why: "Zero leads lost to selling capacity — every effective lead was worked." });
  if (availAll > 0 && availAll - demandAll >= 0 && availAll - demandAll <= Math.max(50, .05 * availAll))
    mods.push({ d: 2, why: "Units built landed inside a deliberate buffer of units sold — no stockpile, no shortfall." });
  if (res.installedCapacity > 0 && res.utilisation < .6 && res.capexSpend > 0)
    mods.push({ d: -2, why: "Capital spent on plant while only " + pct(res.utilisation * 100) + " of the plant you already own was running." });
  if (prior) {
    const cuts = [["content", "SEO"], ["buzz", "pre-launch buzz"], ["social", "brand and social"], ["innovation", "innovation"], ["npd", "new product development"]]
      .filter(([k]) => prior.A[k] > 0 && A[k] === 0).map(([, n]) => n);
    if (cuts.length && !named)
      mods.push({ d: -2, why: "Compounding asset cut to zero (" + cuts.join(", ") + ") without naming it as a deliberate sacrifice." });
  }
  if (res.rawConv - res.ceiling > 3)
    mods.push({ d: -2, why: "Raw conversion overshot the product ceiling by " + d1(res.rawConv - res.ceiling) + " points — selling paid for demand the product could not close." });
  if (res.wcBreached) mods.push({ d: -3, why: "Working capital buffer breached — closing cash below " + inr(WC_BUFFER) + "." });
  if (res.insolvent) mods.push({ d: -5, why: "Cash closed negative. The company traded while insolvent." });
  if (res.drawn > 0 && !riskNamed)
    mods.push({ d: -2, why: inr(res.drawn) + " of debt drawn without naming the risk being accepted." });
  if (worstStaff < .85)
    mods.push({ d: -2, why: res.shortRoles.map((x) => x.name).join(" and ") + " ran at " + pct(worstStaff * 100) + " — the spend plan was funded well beyond the people available to deliver it." });
  if (res.wastedMarketing > res.marketingSpend * 0.2 && res.marketingSpend > 100000)
    mods.push({ d: -3, why: inr(res.wastedMarketing) + " of demand generation — " + pct(res.wasteFrac * 100) + " of the marketing budget — had nowhere to land, with neither the selling capacity nor the stock behind it." });
  if (expectedOk) mods.push({ d: 1, why: "The quarter landed roughly where you said you expected it to." });
  if (res.positionBinding && res.marketingSpend > 800000)
    mods.push({ d: -2, why: "Heavy demand generation against a market position that could not absorb it — " + d0(res.demandBeyondPosition) + " units of interest went to competitors." });
  if (res.marketShare > 0.10 && res.grossProfit / Math.max(1, res.revenueT) < 0.35)
    mods.push({ d: -3, why: "Share of " + pct(res.marketShare * 100) + " bought at a gross margin of " + pct(res.grossProfit / Math.max(1, res.revenueT) * 100) + " — volume without economics." });
  if (res.marketingSpend > 100000 && res.wasteFrac < 0.02 && res.unitsSold > 0)
    mods.push({ d: 2, why: "Every rupee of demand generation converted — selling capacity and production both sized to the marketing behind them." });
  const losers = PRODUCTS.filter((x) => res.P[x.id].live && res.P[x.id].status === "active" && res.sold[x.id] > 0 && res.wac[x.id] >= res.P[x.id].price);
  if (losers.length) mods.push({ d: -4, why: losers.map((x) => x.name).join(" and ") + " sold below unit cost — every sale destroyed value." });
  if (res.crisis) {
    if (res.neutralised) mods.push({ d: 3, why: res.crisis.variant === "D" ? "Market event fully neutralised — the capacity multiplier was carried back to 1.00." : "Market event fully neutralised — dampening and conversion penalty both closed out." });
    if (res.crisis.variant === "C" && res.entering.innovation >= 20) mods.push({ d: 3, why: "Crisis-proofed in advance — innovation of " + d0(res.entering.innovation) + " at onset absorbed the leapfrog." });
    if (res.crisis.variant === "D" && res.entering.supplierRel >= 85) mods.push({ d: 3, why: "Crisis-proofed in advance — supplier reliability of " + d0(res.entering.supplierRel) + " carried the capacity multiplier." });
    if (res.crisis.variant === "E" && res.entering.quality >= 25) mods.push({ d: 3, why: "Crisis-proofed in advance — a Quality Score of " + d0(res.entering.quality) + " at onset meant the erosion barely landed." });
    if (res.crisis.choice === "DB") mods.push({ d: 2, why: "Structural improvement made under pressure — a second source qualified permanently." });
    if (respSpend <= 0) mods.push({ d: -4, why: "Market event ignored — nothing committed to any response line." });
  }
  (q4mods || []).forEach((m) => mods.push(m));

  const modTotal = mods.reduce((a, b) => a + b.d, 0);
  const final = traitTotal + modTotal;
  const band = final >= 90 ? "Exceptional" : final >= 75 ? "Strong" : final >= 60 ? "Competent" : final >= 40 ? "Weak" : "Poor";
  return { traits, traitTotal, mods, modTotal, final, band };
}
const BAND_STYLE = { Exceptional: "bg-emerald-800 text-emerald-50", Strong: "bg-teal-700 text-teal-50",
  Competent: "bg-amber-600 text-amber-50", Weak: "bg-orange-700 text-orange-50", Poor: "bg-rose-800 text-rose-50" };

/* ============================== CRISIS PANEL ============================== */
function crisisBase(v, ch, s, q) {
  const C = CRISES[v];
  let damp = C.baseDamp, penalty = C.basePenalty;
  if (v === "A") { if (ch === "A1") penalty = 0; if (ch === "A3") penalty = 3; }
  if (v === "B") { if (ch === "B2") { damp = .72; penalty = 5; } if (ch === "B3") { damp = .55; penalty = 3; } }
  if (v === "C") { const armed = s.innovation >= 20;
    if (ch === "C1") penalty = armed ? 2 : 6;
    if (ch === "C2") penalty = s.quality >= 25 ? 3 : 6;
    if (ch === "C3") penalty = 3; }
  if (q === 4) { damp = Math.min(1, damp + .10); penalty *= .6; }
  return { damp, penalty };
}
function CrisisPanel({ s, variant, choice, setChoice, alloc, setAlloc, locked, budget }) {
  const C = CRISES[variant];
  const base = crisisBase(variant, choice, s, s.quarter);
  const lines = variant === "D" ? CRISIS_LINES.D : CRISIS_LINES.ABC;
  const ctx = { s, A: parseAlloc(alloc), damp: base.damp, penalty: base.penalty, choice, mk: 1, sl: 1, en: 1, sp: 1, op: 1, ad: 1 };
  const spent = lines.reduce((t, l) => t + num(alloc[l.key]), 0);
  const rd = variant === "D" ? 1 : Math.min(1, base.damp + .15 * pw(alloc.priceMatch, .5));
  const rp = variant === "D" ? 0 : Math.max(0, base.penalty - Math.min(base.penalty, 2 * pw(alloc.comparisonAds, .5)));
  return (
    <div className="space-y-4">
      <div className="bg-stone-900 text-white p-5">
        <Eyebrow tone="text-rose-400">Quarter {s.quarter} · Market event {C.key} · {C.name}</Eyebrow>
        <h2 className="font-serif text-2xl mt-1">{C.headline}</h2>
        <p className="text-sm text-stone-300 mt-3 max-w-3xl leading-relaxed">{C.body}</p>
      </div>
      <Card eyebrow={locked ? "Strategic choice, locked from quarter 3" : "Strategic choice"}
        title={locked ? "You committed to this line last quarter" : "Pick one. It changes the shape of the problem, not just its size."}>
        <div className="grid gap-3 sm:grid-cols-3">
          {C.choices.map((c) => {
            const on = choice === c.id;
            return (
              <button key={c.id} disabled={locked} onClick={() => setChoice(c.id)}
                className={"text-left border p-3 " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800") + (locked && !on ? " opacity-40" : "")}>
                <div className="font-serif text-base leading-snug">{c.label}</div>
                <div className={"text-xs mt-2 " + (on ? "text-stone-300" : "text-stone-500")}>{c.note}</div>
              </button>);
          })}
        </div>
        {!choice && <p className="text-sm text-rose-800 mt-3">Choose a response before closing the quarter.</p>}
      </Card>
      {choice && (
        <>
          <Card eyebrow={variant === "D" ? "Emergency supply chain fund" : "Competitive response — a department that only exists this quarter"} title="Fund the response">
            {lines.map((l) => (
              <SpendLine key={l.key} line={l} value={alloc[l.key]} ctx={ctx} onChange={(v) => setAlloc({ ...alloc, [l.key]: v })} />))}
          </Card>
          <Card eyebrow="Resolution" title={"What " + lakh(spent) + " buys you"}>
            {variant === "D" ? (<>
              <Row label="Supplier reliability at onset" working="carried in — this is your crisis-proofing" value={d1(s.supplierRel)} />
              <Row label="Choice offset" working={choice === "DA" ? "air freight" : choice === "DB" ? "second source" : "allocation only"} value={"+" + d2(choice === "DA" ? .5 : choice === "DB" ? .25 : 0)} />
              <Row label="Fund contribution" working={"0.10 × √" + d1(num(alloc.supplyFund))} value={"+" + d2(.1 * pw(alloc.supplyFund, .5))} />
              <Row label="Capacity multiplier" working="applied to everything you build" strong tone="text-rose-800"
                value={d2(clamp(.5 + .005 * (s.supplierRel - 50) + (choice === "DA" ? .5 : choice === "DB" ? .25 : 0) + .1 * pw(alloc.supplyFund, .5), .1, 1))} />
              <Row label="Cost per unit surcharge" working="scarcity pricing" value={"+" + inr(choice === "DA" ? 900 : 500)} />
              <Row label="Logistics efficiency" working="this quarter only" value={"−15"} />
            </>) : (<>
              <Row label="Lead dampening" working={"base " + d2(base.damp) + " + 0.15 × √" + d1(num(alloc.priceMatch))} value={d2(rd)} strong tone={rd >= .97 ? "text-teal-800" : "text-rose-800"} />
              <Row label="Conversion penalty" working={"base " + d1(base.penalty) + "pts less 2 × √" + d1(num(alloc.comparisonAds))} value={"−" + d1(rp) + "pts"} strong tone={rp <= .5 ? "text-teal-800" : "text-rose-800"} />
              <Row label="Customer loss" working={"max(0, 8 − 1.5 × √" + d1(num(alloc.retention)) + ")"} value={pct(Math.max(0, 8 - 1.5 * pw(alloc.retention, .5)))} />
              {variant === "B" && <Row label="Brand erosion" working={spent > 0 && choice !== "B3" ? "waived, air cover funded" : "no air cover funded"}
                value={spent > 0 && choice !== "B3" ? "0" : "−8"} tone={spent > 0 && choice !== "B3" ? "text-teal-800" : "text-rose-800"} />}
            </>)}
          </Card>
        </>)}
      <BudgetStrip budget={budget} />
    </div>
  );
}

/* ============================== Q4 TERM SHEET ============================= */
function buildTermSheet(history, s) {
  const [q1, q2, q3] = history;
  const thriving = q3.netCF > 0 && q2.valuation > q1.valuation && q3.valuation > q2.valuation;
  // A 3-quarter cash decline only reads as genuine distress if the losses are flat or widening.
  // A company whose loss is narrowing quarter over quarter is recovering, not distressed, even
  // if it hasn't crossed into profit yet — the trend is what should be judged, not the sign alone.
  const cashDeclining = q3.netCF < 0 && q3.cash < q2.cash && q2.cash < q1.cash;
  const lossWorsening = q3.netCF <= q2.netCF;
  const distressed = s.wcBreached || s.everInsolvent || (cashDeclining && lossWorsening);
  const tier = thriving ? "THRIVING" : distressed ? "DISTRESSED" : "STABLE";
  const V = Math.max(1, q3.valuation);
  // the raw ratio degenerates when Q1 was tiny, so the base is floored and the score clamped
  const q1Base = Math.max(q1.unitsSold, 250);
  const M = clamp(Math.pow(q3.unitsSold / q1Base, 0.5) - 1, -0.5, 1.5);
  const trueContinuation = V * (1 + M);
  const mk = (invPct, covMult, hitMult, missHaircut, ratchet) => {
    const investment = invPct * V;
    return { investment, equity: investment / (V + investment), covenant: q3.unitsSold * (1 + covMult * M), hitMult, missHaircut, ratchet };
  };
  let offers;
  if (tier === "THRIVING") {
    const a = mk(.25, 1.3, 1.60, .60, 1.6);
    offers = [
      { id: "A", kind: "invest", title: "Growth Investor", who: "Sattva Capital, Series A",
        pitch: "They like the trajectory and want you to spend into it. The money is real; so is the covenant attached to it.",
        terms: [["Investment", inr(a.investment) + " (25% of your Q3 valuation)"], ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", d0(a.covenant) + " units sold"], ["If you hit it", "Q4 valuation marked up 1.60×"],
          ["If you miss", "capped at 60% of Q3, stake ratchets to " + pct(a.equity * a.ratchet * 100)]], ...a },
      { id: "B", kind: "acquire", title: "Acquisition Offer", who: "Meridian Consumer Devices",
        pitch: "Cash today, no covenant, no Q4 risk. The number on the page is the whole story — or the part of it they want you to read.",
        price: V * (1.00 + .15 * Math.min(1, M / .60)),
        terms: [["Offer price", inr(V * (1.00 + .15 * Math.min(1, M / .60)))], ["Premium over Q3", pct(15 * Math.min(1, M / .60))],
          ["Structure", "All cash, closes on signature"], ["Your Q4", "Does not happen. The simulation ends here."]] },
      { id: "C", kind: "solo", title: "Stay Independent", who: "No counterparty",
        pitch: "No cash in, no covenant, no dilution. Q4 runs on your own balance sheet and you are graded on consistency.",
        terms: [["Investment", "None"], ["Dilution", "None"], ["Q4", "Runs normally"], ["Grading", "Consistency of execution"]] },
    ];
  } else if (tier === "STABLE") {
    const a = mk(.15, 1.1, 1.35, .75, 1.3);
    offers = [
      { id: "A", kind: "invest", title: "Growth Investor — measured terms", who: "Sattva Capital, bridge round",
        pitch: "A smaller cheque against a gentler covenant. They are buying optionality, not conviction.",
        terms: [["Investment", inr(a.investment) + " (15% of your Q3 valuation)"], ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", d0(a.covenant) + " units sold"], ["If you hit it", "Q4 valuation marked up 1.35×"],
          ["If you miss", "25% haircut, stake ratchets to " + pct(a.equity * a.ratchet * 100)]], ...a },
      { id: "B", kind: "acquire", title: "Acquisition Offer — at value", who: "Meridian Consumer Devices",
        pitch: "A fair price, honestly struck. Whether fair is enough depends on what you believe the next four quarters hold.",
        price: V,
        terms: [["Offer price", inr(V)], ["Premium over Q3", "None — struck at value"],
          ["Structure", "All cash, closes on signature"], ["Your Q4", "Does not happen. The simulation ends here."]] },
      { id: "C", kind: "solo", title: "Stay Independent, Prove Stability", who: "No counterparty",
        pitch: "Nobody is forcing your hand. Run a clean quarter and let the numbers make the argument.",
        terms: [["Investment", "None"], ["Dilution", "None"], ["Q4", "Runs normally"], ["Grading", "Consistency of execution"]] },
    ];
  } else {
    const a = mk(.40, 0, 1.0, 0, 1.0); a.covenant = 0;
    offers = [
      { id: "A", kind: "invest", title: "Rescue Financing", who: "Sattva Capital, structured rescue",
        pitch: "The cheque is large because the situation is bad and they know it. No markup on the other side — only survival.",
        terms: [["Investment", inr(a.investment) + " (40% of your Q3 valuation)"], ["Equity given up", pct(a.equity * 100)],
          ["Q4 covenant", "Close the quarter solvent. No unit target."], ["If you survive", "Valuation stands, no markup"],
          ["If you do not", "Game over — the company is wound up"]], ...a },
      { id: "B", kind: "acquire", title: "Fire-Sale", who: "Meridian Consumer Devices",
        pitch: "A genuine discount on a genuinely distressed asset. It ends the risk and it ends the upside.",
        price: V * .68,
        terms: [["Offer price", inr(V * .68)], ["Discount to Q3 valuation", "32%"],
          ["Structure", "All cash, closes on signature"], ["Your Q4", "Does not happen. The simulation ends here."]] },
      { id: "C", kind: "solo", title: "Continue — High Risk", who: "No counterparty",
        pitch: "No cheque, no floor. If the cash runs out before the quarter closes, it runs out.",
        terms: [["Investment", "None"], ["Dilution", "None"], ["Q4", "Runs, with a real chance of insolvency"], ["Grading", "Survival and execution"]] },
    ];
  }
  return { tier, V, M, trueContinuation, offers, q1, q2, q3 };
}

function resolveEndgame(ts, deal, res4) {
  const offer = ts.offers.find((o) => o.id === deal);
  const b = ts.offers.find((o) => o.id === "B");
  const gap = ts.trueContinuation - b.price;
  const mods = [];
  const out = { deal, offer, mods };
  if (deal === "B") {
    out.ended = true; out.price = b.price; out.trueContinuation = ts.trueContinuation; out.gap = gap;
    out.finalValuation = b.price;
    if (gap <= b.price * .02) mods.push({ d: 4, why: "Acquisition accepted correctly — momentum was weak and the price sat at or above a continuation value of " + cr(ts.trueContinuation) + "." });
    else if (gap > b.price * .15) mods.push({ d: -3, why: "Acquisition accepted leaving " + cr(gap) + " of continuation value unexamined — momentum implied the business was worth more." });
    else mods.push({ d: 1, why: "Acquisition accepted at a defensible price — " + cr(gap) + " left on the table, within a reasonable margin for risk." });
    return out;
  }
  if (gap > b.price * .15) mods.push({ d: 4, why: "Acquisition rejected correctly — momentum implied a continuation value of " + cr(ts.trueContinuation) + " against an offer of " + cr(b.price) + "." });
  if (deal === "A") {
    // Distressed rescue: "survived" means closed above the working capital buffer, the same
    // bar used everywhere else in the sim — not just technically above zero, which understated
    // how easy the covenant was to clear for any company with a non-trivial rescue cheque.
    const hit = ts.tier === "DISTRESSED" ? res4.cash > WC_BUFFER : res4.unitsSold >= offer.covenant;
    out.covenantHit = hit; out.covenant = offer.covenant;
    out.equity = hit ? offer.equity : offer.equity * offer.ratchet;
    if (ts.tier === "DISTRESSED") {
      out.finalValuation = hit ? res4.valuation : 0; out.gameOver = !hit;
      mods.push(hit ? { d: 5, why: "Rescue covenant met — the company closed Q4 solvent." }
        : { d: -8, why: "Rescue covenant missed — the company did not close the quarter solvent." });
    } else {
      out.finalValuation = hit ? res4.valuation * offer.hitMult : Math.min(res4.valuation, ts.V * offer.missHaircut);
      mods.push(hit ? { d: 5, why: "Covenant hit — " + d0(res4.unitsSold) + " units against a target of " + d0(offer.covenant) + "." }
        : { d: -8, why: "Covenant missed — " + d0(res4.unitsSold) + " units against a target of " + d0(offer.covenant) + ". Valuation haircut and the stake ratcheted." });
    }
    return out;
  }
  out.finalValuation = res4.valuation;
  out.gameOver = ts.tier === "DISTRESSED" && res4.cash <= 0;
  if (out.gameOver) mods.push({ d: -8, why: "Continued unfunded from a distressed position and ran out of cash." });
  return out;
}

function TermSheetScreen({ ts, onAccept }) {
  const [picked, setPicked] = useState(null);
  const copy = { THRIVING: "Q3 closed cash-positive and the valuation rose in both Q2 and Q3. Three parties want a piece of what happens next.",
    STABLE: "The company is neither running away nor falling over. The terms on the table reflect exactly that.",
    DISTRESSED: "The buffer was breached, or cash has been falling against negative flow. Everything on this page is priced for that." };
  return (
    <div className="space-y-5">
      <div className="bg-stone-900 text-white p-6">
        <Eyebrow tone="text-rose-400">Quarter 4 · The term sheet</Eyebrow>
        <h2 className="font-serif text-3xl mt-1">You are classified {ts.tier.toLowerCase()}</h2>
        <p className="text-sm text-stone-300 mt-3 max-w-3xl leading-relaxed">{copy[ts.tier]}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 font-mono text-sm">
          <div><span className="block text-xs uppercase tracking-widest text-stone-500">Q3 valuation</span>{cr(ts.V)}</div>
          <div><span className="block text-xs uppercase tracking-widest text-stone-500">Momentum</span>{d2(ts.M)}</div>
          <div><span className="block text-xs uppercase tracking-widest text-stone-500">Q1 → Q3 units</span>{d0(ts.q1.unitsSold)} → {d0(ts.q3.unitsSold)}</div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {ts.offers.map((o) => {
          const on = picked === o.id;
          return (
            <button key={o.id} onClick={() => setPicked(o.id)}
              className={"text-left border flex flex-col " + (on ? "border-stone-900 border-2 bg-white" : "border-stone-300 bg-white hover:border-stone-800")}>
              <div className={"px-4 py-3 border-b " + (on ? "bg-stone-900 text-white border-stone-900" : "border-stone-200")}>
                <Eyebrow tone={on ? "text-stone-400" : "text-stone-500"}>Path {o.id} · {o.who}</Eyebrow>
                <div className="font-serif text-xl leading-snug">{o.title}</div>
              </div>
              <div className="p-4 flex-1">
                <p className="text-sm text-stone-600 leading-relaxed">{o.pitch}</p>
                <dl className="mt-4 space-y-2">
                  {o.terms.map(([k, val], i) => (
                    <div key={i} className="border-b border-stone-200 pb-2">
                      <dt className="text-xs uppercase tracking-widest text-stone-500">{k}</dt>
                      <dd className="font-mono text-sm text-stone-900">{val}</dd>
                    </div>))}
                </dl>
              </div>
            </button>);
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-300 px-4 py-4">
        <p className="text-sm text-stone-600 max-w-xl">Your choice is final and it is graded. Read the covenant arithmetic, not the headline number.</p>
        <button disabled={!picked} onClick={() => onAccept(picked)}
          className={"px-6 py-3 font-serif text-lg " + (picked ? "bg-rose-800 text-white hover:bg-rose-900" : "bg-stone-200 text-stone-400")}>
          {picked ? "Sign path " + picked : "Choose a path"}
        </button>
      </div>
    </div>
  );
}


/* ============================================================================
   THE CONSEQUENCE LAYER
   Everything below reads the engine and turns it into things a CEO would
   actually be told. No new state, no new numbers — only interpretation.
   ========================================================================== */

const QUARTER_STAGE = [
  { n: 1, title: "Prove the machine",
    brief: "You have a product, four thousand customers and twelve months of cash. Nobody knows yet whether this business works. Find out what actually sells before you scale anything." },
  { n: 2, title: "Scale",
    brief: "You know a little more than you did. Now the question is whether the machine holds together when you push on it — and which part gives way first." },
  { n: 3, title: "Survive competition",
    brief: "The category has noticed you. Somebody with more money is about to make this quarter difficult, and what you built in the first half decides how much it costs you." },
  { n: 4, title: "Create value",
    brief: "One quarter left. Whatever the company is going to be worth, it will be worth it because of what happens now and what you already put in place." },
];

/* ------------------------------ company health --------------------------- */
const healthTone = (v) => (v >= 70 ? "good" : v >= 45 ? "watch" : "bad");
function companyHealth(s, last) {
  const r = last;
  const cashH = clamp((s.cash / (WC_BUFFER * 6)) * 100, 0, 100);
  const demandH = r ? clamp((r.attractShare / 0.22) * 100, 0, 100) : 35;
  const productH = clamp(((s.quality + 0.6 * s.innovation) / 90) * 100, 0, 100);
  const opsH = r ? clamp((r.utilisation * 60 + (r.supplierRel - 50) * 0.8), 0, 100) : clamp((s.supplierRel - 40) * 1.6, 0, 100);
  const peopleH = clamp((s.empSat - 35) * 1.6, 0, 100);
  const custH = clamp((s.satisfaction - 35) * 1.4, 0, 100);
  const riskParts = [
    s.cash > WC_BUFFER * 2.5 ? 25 : s.cash > WC_BUFFER ? 12 : 0,
    s.debt === 0 ? 20 : 10,
    s.supplierRel >= 85 ? 25 : s.supplierRel >= 75 ? 14 : 5,
    s.compliance + s.audit >= 150 ? 30 : s.compliance + s.audit >= 120 ? 18 : 6,
  ];
  const riskH = clamp(riskParts.reduce((a, b) => a + b, 0), 0, 100);
  return [
    { key: "cash", label: "Cash", value: cashH, note: inr(s.cash) + " on hand" },
    { key: "demand", label: "Demand", value: demandH, note: r ? pct(r.attractShare * 100) + " of the category is reachable" : "no trading history yet" },
    { key: "product", label: "Product", value: productH, note: "quality " + d0(s.quality) + ", innovation " + d0(s.innovation) },
    { key: "operations", label: "Operations", value: opsH, note: "supplier reliability " + d0(s.supplierRel) },
    { key: "people", label: "People", value: peopleH, note: d0(headcountOf(s.staff)) + " people, morale " + d0(s.empSat) },
    { key: "customers", label: "Customers", value: custH, note: "satisfaction " + d0(s.satisfaction) + ", repeat " + pct(s.repeatRate) },
    { key: "risk", label: "Risk cover", value: riskH, note: s.debt > 0 ? inr(s.debt) + " of debt outstanding" : "no debt, buffer is your only cushion" },
  ].map((h) => ({ ...h, tone: healthTone(h.value) }));
}

/* --------------------------- directional readouts ------------------------
   During planning the student sees pressure, not answers. No projected
   revenue, profit or cash is ever shown before the quarter closes.        */
const LEVELS = { strong: "STRONG", adequate: "ADEQUATE", tight: "TIGHT", constrained: "CONSTRAINED", critical: "CRITICAL", none: "NONE" };
const LEVEL_TONE = { STRONG: "good", ADEQUATE: "good", TIGHT: "watch", CONSTRAINED: "watch", CRITICAL: "bad", NONE: "flat" };
function directional(p, s) {
  if (!p) return [];
  const leadRatio = p.capacity > 0 ? p.effLeads / p.capacity : 9;
  const supplyRatio = p.demandTotal > 0 ? (p.avail.pulse + p.avail.pro) / p.demandTotal : 9;
  const ceilGap = p.ceiling - p.rawConv;
  const cashAfter = p.cash;
  return [
    { id: "demand", label: "Demand generation",
      level: p.effLeads < 200 ? "NONE" : p.effLeads > p.capacity * 1.4 ? "STRONG" : p.effLeads > p.capacity * 0.75 ? "ADEQUATE" : "TIGHT",
      note: "How much interest the plan creates relative to what you can work." },
    { id: "sales", label: "Sales capacity",
      level: leadRatio > 1.35 ? "CRITICAL" : leadRatio > 1.05 ? "CONSTRAINED" : leadRatio > 0.7 ? "ADEQUATE" : "TIGHT",
      note: leadRatio > 1.05 ? "Interest is running ahead of the team." : leadRatio < 0.7 ? "The team has room you are not filling." : "Team and interest are roughly matched." },
    { id: "production", label: "Production capacity",
      level: supplyRatio < 0.85 ? "CRITICAL" : supplyRatio < 1 ? "CONSTRAINED" : supplyRatio < 1.35 ? "ADEQUATE" : "TIGHT",
      note: supplyRatio < 1 ? "You will not be able to fill everything you sell." : supplyRatio > 1.35 ? "You are building well past what will sell." : "Supply roughly matches demand." },
    { id: "ceiling", label: "Product ceiling",
      level: ceilGap < 0 ? "CRITICAL" : ceilGap < 2 ? "CONSTRAINED" : ceilGap < 6 ? "ADEQUATE" : "STRONG",
      note: ceilGap < 0 ? "The product cannot close what the funnel is bringing." : "Headroom between selling effort and what the product supports." },
    { id: "position", label: "Market position",
      level: p.positionBinding ? "CONSTRAINED" : p.attractShare > (num(s.marketShare) || 0.02) * 1.3 ? "STRONG" : "ADEQUATE",
      note: p.positionBinding ? "You are generating more interest than your position can convert into buyers." : "Your standing against the category." },
    { id: "cash", label: "Cash pressure",
      level: cashAfter < 0 ? "CRITICAL" : cashAfter < WC_BUFFER ? "CRITICAL" : cashAfter < WC_BUFFER * 2 ? "CONSTRAINED" : cashAfter < WC_BUFFER * 4 ? "ADEQUATE" : "STRONG",
      note: "Where this plan leaves the balance at the end of the quarter." },
    { id: "people", label: "Staffing",
      level: p.shortRoles.length === 0 ? "ADEQUATE" : p.shortRoles.length > 2 ? "CRITICAL" : "CONSTRAINED",
      note: p.shortRoles.length ? p.shortRoles.map((x) => x.name).join(", ") + " cannot deliver what you have funded." : "Every function can deliver the plan." },
  ];
}

/* -------------------------- the biggest constraint ------------------------ */
function detectConstraint(r, s) {
  if (!r) {
    // opening quarter: no trading history, so the reading comes from the state itself
    const inv = PRODUCTS.reduce((t, p) => t + num(s.products[p.id].inv), 0);
    return { primary: { id: "position", label: "An unproven market position",
      why: "You hold roughly " + pct((4000 / TAM_CUSTOMERS) * 100) + " of a market that buys about " + d0(marketDemand(1)) +
        " units this quarter. Quality and innovation are both at zero, so the product carries a conversion ceiling of 22% and nothing above it.",
      impact: "There are " + d0(inv) + " units in stock and " + inr(s.cash) + " in the bank. Nothing about this business is proven yet, including whether anybody will buy it at " + inr(s.products.pulse.price) + ".",
      next: "Find out what actually sells before committing to scale. Premature scaling is the most expensive mistake available to you this quarter." },
      all: [{ id: "position", label: "An unproven market position" }, { id: "cash", label: "Cash" },
        { id: "ceiling", label: "Product conversion ceiling" }, { id: "demand", label: "Market demand" }] };
  }
  const cands = [];
  const avail = r.avail.pulse + r.avail.pro;
  if (r.cash < WC_BUFFER) cands.push({ id: "cash", rank: 100, label: "Cash",
    why: "Closing cash of " + inr(r.cash) + " sits below the " + inr(WC_BUFFER) + " working-capital buffer.",
    impact: "Everything else becomes academic if the company cannot pay for it.",
    next: "Cut committed spend, draw on the facility, or convert inventory and receivables into cash." });
  if (r.leadsWasted > Math.max(60, r.effLeads * 0.08)) cands.push({ id: "sales", rank: 80 + (r.leadsWasted / Math.max(1, r.effLeads)) * 40, label: "Sales capacity",
    why: "You generated " + d0(r.effLeads) + " effective leads but the team could only work " + d0(r.leadsUsed) + ".",
    impact: "About " + d0(r.leadsWasted) + " leads went unworked — roughly " + inr(r.marketingSpend * (r.leadsWasted / Math.max(1, r.effLeads))) + " of demand generation with nothing behind it.",
    next: "Either add selling capacity, or stop paying for demand you cannot serve." });
  if (r.unmetDemand > Math.max(40, r.demandTotal * 0.08)) cands.push({ id: "production", rank: 80 + (r.unmetDemand / Math.max(1, r.demandTotal)) * 40, label: "Production capacity",
    why: "Demand reached " + d0(r.demandTotal + r.b2bDemand) + " units against " + d0(avail) + " available to sell.",
    impact: d0(r.unmetDemand) + " units of demand could not be filled. Those are orders you won and could not honour.",
    next: "Fund the production run, add contract manufacturing, or buy installed capacity — or slow demand down." });
  if (r.ceilingBinding) cands.push({ id: "ceiling", rank: 70 + (r.rawConv - r.ceiling) * 4, label: "Product conversion ceiling",
    why: "Selling effort supports " + pct(r.rawConv) + " conversion but the product only carries " + pct(r.ceiling) + ".",
    impact: "Everything spent pushing conversion above " + pct(r.ceiling) + " bought nothing.",
    next: "Quality, innovation or the innovation board — or stop paying for conversion the product cannot deliver." });
  if (r.positionBinding) cands.push({ id: "position", rank: 68, label: "Market position",
    why: "Your funnel produced " + d0(r.funnelDemand) + " units of interest, but your standing in the category only reaches " + d0(r.reachableDemand) + ".",
    impact: d0(r.demandBeyondPosition) + " units of interest went to competitors instead.",
    next: "Position is brand, product, price and availability. Advertising alone will not move it." });
  if (r.shortRoles.length) { const w = r.shortRoles.reduce((a, x) => (r.staffing[x.id] < r.staffing[a.id] ? x : a), r.shortRoles[0]);
    cands.push({ id: "staffing", rank: 60 + (1 - r.staffing[w.id]) * 60, label: "Staffing — " + w.name,
      why: w.name + " is running at " + pct(r.staffing[w.id] * 100) + " of what the plan needs.",
      impact: w.ifShort, next: "Hire into that function, or fund it less until you can." }); }
  if (r.invUnitsOut > Math.max(250, r.unitsSold * 0.4)) cands.push({ id: "wc", rank: 55, label: "Working capital",
    why: d0(r.invUnitsOut) + " units are sitting in stock, worth " + inr(r.invValue) + ".",
    impact: "That is cash you have already spent and cannot use, costing " + inr(r.holdingCost) + " a quarter to hold.",
    next: "Build to demand rather than to capacity, or sell it down." });
  if (r.supplierRel < 76) cands.push({ id: "supplier", rank: 50 + (76 - r.supplierRel), label: "Supplier reliability",
    why: "Reliability of " + d0(r.supplierRel) + " means " + pct(100 - r.supplierRel) + " of everything you build is lost before it reaches a customer.",
    impact: "You are paying to manufacture units that never arrive.", next: "Supplier and QC spend, or a second source." });
  if (r.satisfaction < 52 || r.repeatRate < 12) cands.push({ id: "retention", rank: 48, label: "Customer retention",
    why: "Satisfaction is " + d0(r.satisfaction) + " and repeat purchase is " + pct(r.repeatRate) + ".",
    impact: "Every quarter you have to buy your entire customer base again.",
    next: "Support, onboarding and product quality all move this." });
  if (!cands.length) cands.push({ id: "demand", rank: 40, label: "Market demand",
    why: "Nothing inside the company is binding. The limit is how many people want the product at this price.",
    impact: "Growth now comes from position — brand, product and price — rather than from fixing a bottleneck.",
    next: "Build position, or accept the current run rate and protect margin." });
  cands.sort((a, b) => b.rank - a.rank);
  return { primary: cands[0], all: cands.slice(0, 4) };
}

/* ------------------------------ what changed ----------------------------- */
function whatChanged(prev, last, s) {
  if (!last) return [{ dir: "flat", label: "The company opens for trading", detail: "Four thousand customers, six hundred units in stock and twelve months of runway." }];
  const out = [];
  const mv = (cond, dir, label, detail) => { if (cond) out.push({ dir, label, detail }); };
  const dShare = last.shareDelta * 100;
  mv(Math.abs(dShare) > 0.15, dShare > 0 ? "up" : "down", "Market share " + (dShare > 0 ? "rose" : "fell") + " " + d1(Math.abs(dShare)) + " points",
    "You now hold " + pct(last.marketShare * 100) + " of a category buying " + d0(last.mktDemand) + " units a quarter.");
  if (prev) {
    mv(last.satisfaction < prev.satisfaction - 1, "down", "Customer satisfaction fell", "Down to " + d0(last.satisfaction) + " from " + d0(prev.satisfaction) + ". Repeat purchase follows this with a lag.");
    mv(last.satisfaction > prev.satisfaction + 2, "up", "Customer satisfaction improved", "Up to " + d0(last.satisfaction) + ", which feeds conversion and repeat buying.");
    mv(last.supplierRel < prev.supplierRel - 1, "down", "Supplier reliability declined", "Now " + d0(last.supplierRel) + ". More of what you build is lost before it ships.");
    mv(last.cash < prev.cash * 0.7, "down", "Cash runway shortened sharply", "The balance fell from " + inr(prev.cash) + " to " + inr(last.cash) + ".");
    mv(last.attritionNext > prev.attritionNext + 1, "down", "Employee attrition increased", "Now " + pct(last.attritionNext) + " entering this quarter, which drags selling and production.");
    mv(last.unitsSold > prev.unitsSold * 1.25, "up", "Sales grew " + pct((last.unitsSold / Math.max(1, prev.unitsSold) - 1) * 100), d0(last.unitsSold) + " units against " + d0(prev.unitsSold) + " the quarter before.");
    mv(last.unitsSold < prev.unitsSold * 0.9, "down", "Sales fell", d0(last.unitsSold) + " units against " + d0(prev.unitsSold) + " the quarter before.");
  }
  mv(last.ceilingBinding, "down", "The product conversion ceiling was reached", "Selling effort is being capped at " + pct(last.ceiling) + " by what the product can carry.");
  mv(last.unmetDemand > 40, "down", "Demand exceeded production capacity", d0(last.unmetDemand) + " units of demand went unfilled.");
  mv(last.leadsWasted > Math.max(60, last.effLeads * 0.08), "down", "The sales pipeline outgrew the team", d0(last.leadsWasted) + " leads were generated and never worked.");
  last.landed.forEach((id) => mv(true, "up", "Shipped: " + INNO[id].name, INNO[id].blurb));
  mv(last.proLaunching, "up", "The Nadi Pulse Pro cleared development",
    "It's been given 30% of the production line to start and can be priced from the Product tab — move that share up or down, but it's live and sellable this quarter.");
  if (last.crisis) mv(true, "down", CRISES[last.crisis.variant].name + " is still in play", "The market event that started last quarter has not finished with you.");
  mv(last.netProfit > 0, "up", "The company turned a profit", inr(last.netProfit) + " of net profit — the first time the machine paid for itself.");
  return out.slice(0, 7);
}

/* ------------------------------- board pressure -------------------------- */
function boardPressure(s, last, history) {
  const growth = history.length >= 2 ? last.unitsSold / Math.max(1, history[history.length - 2].unitsSold) - 1 : null;
  const runway = last && last.netCF < 0 ? s.cash / -last.netCF : 99;
  return [
    { who: "The board", ask: "Growth has to accelerate.",
      met: growth === null ? null : growth >= 0.25,
      detail: growth === null ? "No trading history to judge yet." : "Units moved " + pct(growth * 100) + " last quarter against an expectation of 25%." },
    { who: "Your CFO", ask: "Keep runway above two quarters.",
      met: runway >= 2,
      detail: runway >= 99 ? "Operations are funding themselves." : d1(runway) + " quarters of cash at the current burn." },
    { who: "Customers", ask: "The product needs to get better.",
      met: s.satisfaction >= 60 && s.quality >= 20,
      detail: "Satisfaction " + d0(s.satisfaction) + ", quality " + d0(s.quality) + "." },
    { who: "Your team", ask: "The workload has to be sustainable.",
      met: s.empSat >= 65 && s.attrition <= 8,
      detail: "Morale " + d0(s.empSat) + ", attrition " + pct(s.attrition) + "." },
  ];
}

/* ================================ CEO INBOX ===============================
   Messages from the people who work for you. Every one is generated from a
   simulation variable; none are decorative.
   ========================================================================== */
const EXECS = {
  cfo: { name: "Meera Rajagopal", role: "Chief Financial Officer" },
  sales: { name: "Arjun Nair", role: "Head of Sales" },
  product: { name: "Ishaan Verma", role: "Head of Product" },
  ops: { name: "Fatima Sheikh", role: "Head of Operations" },
  cs: { name: "Divya Menon", role: "Customer Success" },
  people: { name: "Rohit Bansal", role: "People & Talent" },
  market: { name: "Market intelligence", role: "Weekly briefing" },
};
function buildInbox(p, s, history, closed) {
  if (!p) return [];
  const M = [];
  const add = (from, tone, subject, body, action) => M.push({ from, ...EXECS[from], tone, subject, body, action });
  const avail = p.avail.pulse + p.avail.pro;

  if (p.cash < 0) add("cfo", "critical", "We are out of cash",
    "The quarter closes " + inr(Math.abs(p.cash)) + " overdrawn. I need committed spend cut or the facility drawn before we trade another day.", true);
  else if (p.cash < WC_BUFFER) add("cfo", "critical", "We will breach the working-capital buffer",
    "This plan leaves us below the " + inr(WC_BUFFER) + " floor we agreed with the board. I would rather we slowed growth than went through that.", true);
  else if (p.netCF < 0 && p.cash / -p.netCF < 2) add("cfo", "warning", "Runway is under two quarters",
    "At this burn we have " + d1(p.cash / -p.netCF) + " quarters left. The board's covenant is two. We should either raise, or spend less.", true);
  if (p.drawRejected > 1) add("cfo", "warning", "The bank refused part of the draw",
    "Our facility is capped at 60% of net worth. " + inr(p.drawRejected) + " of what you asked for is not available.", true);
  if (p.debtClose > 0 && p.netProfit < 0) add("cfo", "info", "We are borrowing to fund losses",
    inr(p.debtClose) + " outstanding at " + inr(p.interestExpense) + " of interest this quarter, against a loss. That is survivable once. Not repeatedly.", false);
  if (p.penaltyRisk > 20) add("cfo", "info", "Compliance exposure is costing us real money",
    "Penalty risk sits at " + pct(p.penaltyRisk) + ", which charged us " + inr(p.compliancePenalty) + " this quarter. Compliance and audit spend both reduce it.", false);

  if (p.leadsWasted > Math.max(60, p.effLeads * 0.08)) add("sales", "critical", "We cannot work the leads marketing is sending",
    "We will generate around " + d0(p.effLeads) + " qualified leads this quarter and my team can work about " + d0(p.leadsUsed) +
    ". Either I need more people, or we should spend less on acquisition. Right now we are paying for conversations nobody has.", true);
  else if (p.idleCapacity > p.capacity * 0.3 && p.capacity > 500) add("sales", "warning", "The team is under-used",
    "We are staffed and paid to work " + d0(p.capacity) + " leads and marketing is sending " + d0(p.effLeads) +
    ". I can carry more, or you can redeploy some of my cost.", false);
  if (p.channelShare > 0.35) add("sales", "info", "The channel is becoming most of our volume",
    pct(p.channelShare * 100) + " of funnel sales now go through distributors, and we hand them 18% of that revenue. It is growth we do not own.", false);

  if (p.ceilingBinding) add("product", "critical", "The product is now the bottleneck",
    "Sales and marketing between them support " + pct(p.rawConv) + " conversion. The product only carries " + pct(p.ceiling) +
    ". Anything spent pushing harder is landing on a wall I have to move.", true);
  if (Object.keys(p.pipeline).length) { const id = Object.keys(p.pipeline)[0];
    add("product", "info", INNO[id].name + " is in development",
      "It lands in " + p.pipeline[id] + " quarter(s). The money is already committed. Starting something else now means splitting the same engineering team.", false); }
  if (p.staffing.engineering < 0.9) add("product", "warning", "Engineering cannot absorb what you are funding",
    "We are running at " + pct(p.staffing.engineering * 100) + ". Quality and innovation spend are both delivering less than you are paying for.", true);
  if (!s.products.pro.live && p.npd > 55) add("product", "info", "The Pro is close",
    "New product development is at " + d0(p.npd) + " of 60. Stopping now wastes everything spent so far — there is no partial credit.", false);

  if (p.unmetDemand > Math.max(40, p.demandTotal * 0.08)) add("ops", "critical", "Demand is running ahead of the line",
    "We can supply " + d0(avail) + " units against demand of " + d0(p.demandTotal + p.b2bDemand) +
    ". Contract manufacturing can close the gap this quarter, but it costs ₹700 a unit more than building it ourselves.", true);
  if (p.runLimited && p.utilisation < 0.75 && p.invUnitsOut < p.unitsSold * 0.3) add("ops", "warning", "We are running the plant below what we own",
    "Installed capacity is " + d0(p.installedCapacity) + " units and we are running " + d0(p.grossRun) +
    ". The plant is paid for either way.", true);
  if (p.invUnitsOut > Math.max(250, p.unitsSold * 0.4)) add("ops", "warning", "Stock is building up",
    d0(p.invUnitsOut) + " units in the warehouse, " + inr(p.invValue) + " of cash we have already spent, " + inr(p.holdingCost) + " a quarter to hold.", true);
  if (p.supplierRel < 78) add("ops", "warning", "Supplier reliability is hurting us",
    "At " + d0(p.supplierRel) + " we lose " + pct(100 - p.supplierRel) + " of everything we build before it reaches a customer.", true);

  if (p.satisfaction < 55) add("cs", "warning", "Satisfaction is slipping",
    "We are at " + d0(p.satisfaction) + ". This shows up in repeat purchase two quarters from now, not this one, which is exactly why it gets ignored.", true);
  if (p.repeatRate < 14 && history.length >= 1) add("cs", "info", "We are buying the same customers twice",
    "Repeat purchase is " + pct(p.repeatRate) + ". Almost every unit has to be won again through paid acquisition.", false);
  if (p.custLoss > 3) add("cs", "critical", "We are losing customers to the competition",
    pct(p.custLoss) + " of the base is leaving this quarter. Retention offers slow it; nothing stops it entirely while the event runs.", true);

  if (p.totalFired > 0) add("people", "warning", d0(p.totalFired) + " people are leaving",
    inr(p.severanceCost) + " in severance, morale down to " + d0(p.empSat) + ", and attrition rises to " + pct(p.attritionNext) +
    " next quarter. The people who stay noticed.", false);
  if (p.attritionNext > 9) add("people", "warning", "Attrition is climbing",
    pct(p.attritionNext) + " next quarter. That comes straight off selling capacity and production before you spend a rupee.", true);
  p.shortRoles.filter((x) => x.id !== "engineering").slice(0, 2).forEach((x) =>
    add("people", "info", x.name + " is short-staffed",
      "Running at " + pct(p.staffing[x.id] * 100) + " of the plan. " + x.ifShort, true));

  if (p.positionBinding) add("market", "warning", "We are generating interest we cannot convert into share",
    "The funnel is producing " + d0(p.funnelDemand) + " units of intent but our position in the category only reaches " + d0(p.reachableDemand) +
    ". The difference is going to competitors. Position moves on brand, product, price and availability — not on ad spend.", false);
  const dear = PRODUCTS.filter((x) => p.P[x.id].live && p.P[x.id].status === "active" && p.priceInfo[x.id].premium > 18);
  if (dear.length) add("market", "info", dear[0].name + " is priced above the market",
    "We are " + d0(p.priceInfo[dear[0].id].premium) + "% above the reference price. Demand is running at " + d2(p.priceInfo[dear[0].id].mult) +
    " times what it would be at parity. That is a choice, not an error — but it is a choice.", false);
  const cheap = PRODUCTS.filter((x) => p.P[x.id].live && p.P[x.id].status === "active" && p.sold[x.id] > 0 && p.wac[x.id] >= p.P[x.id].price);
  if (cheap.length) add("market", "critical", cheap[0].name + " is selling below cost",
    "Unit cost " + inr(p.wac[cheap[0].id]) + " against a price of " + inr(p.P[cheap[0].id].price) + ". Every unit we sell destroys value.", true);

  const order = { critical: 0, warning: 1, info: 2 };
  return M.sort((a, b) => order[a.tone] - order[b.tone]);
}

/* ================================ UI ATOMS ================================ */
const Eyebrow = ({ children, tone = "text-stone-500" }) => (
  <div className={"text-xs uppercase tracking-widest font-semibold " + tone}>{children}</div>
);
const Card = ({ eyebrow, title, right, children, className = "" }) => (
  <section className={"bg-white border border-stone-300 " + className}>
    {(eyebrow || title) && (
      <header className="border-b border-stone-300 px-4 py-3 flex flex-wrap items-end justify-between gap-2">
        <div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          {title && <h3 className="font-serif text-lg text-stone-900 leading-snug">{title}</h3>}</div>
        {right}
      </header>)}
    <div className="p-4">{children}</div>
  </section>
);
const Stat = ({ label, value, sub, tone = "text-stone-900" }) => (
  <div className="border-l-2 border-stone-300 pl-3">
    <Eyebrow>{label}</Eyebrow>
    <div className={"font-mono text-xl leading-tight " + tone}>{value}</div>
    {sub && <div className="text-xs text-stone-500 mt-0.5">{sub}</div>}
  </div>
);
const Bar = ({ value, max, tone = "bg-stone-800" }) => (
  <div className="h-1.5 w-full bg-stone-200">
    <div className={"h-1.5 " + tone} style={{ width: clamp((value / (max || 1)) * 100, 0, 100) + "%" }} />
  </div>
);
const Row = ({ label, working, value, tone = "text-stone-900", strong, flag, indent }) => (
  <div className={"grid grid-cols-12 gap-2 items-baseline py-1.5 border-b border-stone-200 " + (flag ? "bg-rose-50" : "")}>
    <div className={"col-span-6 sm:col-span-4 text-sm " + (indent ? "pl-4 " : "") + (strong ? "font-semibold text-stone-900" : "text-stone-700")}>{label}</div>
    <div className="col-span-6 sm:col-span-5 text-xs text-stone-500 font-mono break-words order-3 sm:order-none">{working}</div>
    <div className={"col-span-6 sm:col-span-3 text-right font-mono text-sm " + tone + (strong ? " font-semibold" : "")}>{value}</div>
  </div>
);
const TONE_TEXT = { good: "text-teal-800", watch: "text-amber-700", bad: "text-rose-800", flat: "text-stone-900" };
const TONE_BAR = { good: "bg-teal-700", watch: "bg-amber-600", bad: "bg-rose-700", flat: "bg-stone-400" };
const TONE_CHIP = { good: "bg-teal-50 border-teal-700", watch: "bg-amber-50 border-amber-600", bad: "bg-rose-50 border-rose-700", flat: "bg-white border-stone-300" };
const MSG_STYLE = { critical: { border: "border-rose-700", tag: "bg-rose-800 text-white", label: "Urgent" },
  warning: { border: "border-amber-600", tag: "bg-amber-600 text-white", label: "Needs a view" },
  info: { border: "border-stone-400", tag: "bg-stone-700 text-white", label: "For information" } };

function Inbox({ messages, limit, title = "Your inbox", eyebrow = "This morning" }) {
  const list = limit ? messages.slice(0, limit) : messages;
  if (!list.length) return (
    <Card eyebrow={eyebrow} title={title}><p className="text-sm text-stone-500">Nothing from your team. Quiet quarters are rarer than they look.</p></Card>);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div><Eyebrow tone="text-rose-800">{eyebrow}</Eyebrow><h3 className="font-serif text-xl">{title}</h3></div>
        {limit && messages.length > limit && <span className="text-xs font-mono text-stone-500">{messages.length - limit} more on the dashboard</span>}
      </div>
      <div className="space-y-2">
        {list.map((m, i) => (
          <div key={i} className={"bg-white border-l-4 border border-stone-300 px-4 py-3 " + MSG_STYLE[m.tone].border}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-serif text-base text-stone-900">{m.name}</span>
              <span className="text-xs uppercase tracking-widest text-stone-500">{m.role}</span>
              <span className={"px-1.5 py-0.5 text-xs uppercase tracking-widest font-semibold ml-auto " + MSG_STYLE[m.tone].tag}>{MSG_STYLE[m.tone].label}</span>
            </div>
            <div className="font-semibold text-stone-900 text-sm mt-1">{m.subject}</div>
            <p className="text-sm text-stone-700 mt-1 leading-snug">{m.body}</p>
          </div>))}
      </div>
    </div>);
}

/* ============================ CEO-LEVEL DECISIONS =========================
   Every group writes into the same allocation object the engine already uses.
   Nothing is hidden from the engine; the detail is hidden from the CEO until
   they ask for it.
   ========================================================================== */
const GROUPS = {
  marketing: { question: "What demand are we trying to create?", scope: "marketing",
    items: [
      { id: "paid", name: "Paid acquisition", keys: { google: .45, meta: .30, direct: .25 },
        gain: "Leads this quarter, measurable and fast",
        cost: "Stops the moment you stop paying. Buys nothing you keep." },
      { id: "brand", name: "Brand building", keys: { social: .55, events: .45 },
        gain: "Brand score, which multiplies every other channel from now on",
        cost: "Slow. Almost none of it converts in the quarter you spend it." },
      { id: "organic", name: "Organic and search", keys: { content: .65, buzz: .35 },
        gain: "An asset that generates free leads next quarter and the one after",
        cost: "Close to nothing this quarter. Pure deferred return." },
      { id: "retention", name: "Retention and referral", keys: { email: .5, referral: .5 },
        gain: "The cheapest demand available, plus repeat purchase",
        cost: "Hard-capped by how many customers you already have." },
    ] },
  sales: { question: "Can our team convert the demand we create?", scope: "sales",
    items: [
      { id: "capacity", name: "Selling capacity", keys: { reps: 1 },
        gain: "Leads your team can actually work, and conversion", cost: "Commission and headcount that persists whether demand arrives or not." },
      { id: "process", name: "Process and enablement", keys: { crm: .5, salesTraining: .5 },
        gain: "Conversion on the leads you already have, and lower attrition", cost: "Adds no capacity at all. Multiplies, never creates." },
      { id: "channel", name: "Channel and distribution", keys: { channel: 1 },
        gain: "Capacity without hiring, and reach you do not have", cost: "18% of the revenue on those units, permanently, and a customer you do not own." },
      { id: "accounts", name: "Key accounts and corporate", keys: { keyAccounts: 1 },
        gain: "Bulk volume that bypasses the funnel entirely", cost: "22% off the price, and it eats production capacity like any other order." },
      { id: "success", name: "Onboarding and success", keys: { onboarding: 1 },
        gain: "Satisfaction and repeat purchase", cost: "No new demand. Everything here pays out later." },
    ] },
  rnd: { question: "What should the product become?", scope: "rnd",
    items: [
      { id: "quality", name: "Quality and reliability", keys: { quality: 1 },
        gain: "Conversion ceiling, and a lower defect rate on the warranty bill", cost: "Customers never see quality work directly. It shows in what does not happen." },
      { id: "improve", name: "Continuous improvement", keys: { innovation: 1 },
        gain: "Innovation score and progress toward a feature milestone", cost: "Diffuse. Slower than buying a specific capability off the board." },
      { id: "newproduct", name: "New product development", keys: { npd: 1 },
        gain: "A second product at a higher price and margin", cost: "Nothing at all until it reaches 100. Stop halfway and the whole spend is wasted." },
      { id: "dfc", name: "Design for cost", keys: { design: 1 },
        gain: "Permanently lower cost on every unit you ever build", cost: "Invisible to customers, and it competes with features for the same engineers." },
    ] },
  ops: { question: "Can we deliver what customers want?", scope: "ops",
    items: [
      { id: "run", name: "Production run", keys: { production: 1 },
        gain: "Units, this quarter, from plant you already own", cost: "Every unit built and not sold becomes stock you paid for and must hold." },
      { id: "capex", name: "Capacity investment", keys: { capex: 1 },
        gain: "Permanent installed capacity, on the balance sheet rather than the P&L", cost: "Buys nothing on its own. Capacity you do not run is capacity you wasted." },
      { id: "contract", name: "Contract manufacturing", keys: { contract: 1 },
        gain: "Units this quarter with no capital and no commitment", cost: "₹700 a unit more than building it yourself. Flexibility has a price." },
      { id: "supplier", name: "Supplier resilience", keys: { supplier: 1 },
        gain: "Reliability, which multiplies everything you build — and cover if the chain breaks", cost: "Adds no capacity. Pure insurance until the day it is not." },
      { id: "inventory", name: "Logistics and inventory", keys: { logistics: .5, warehouse: .5 },
        gain: "Cheaper holding, faster delivery, higher satisfaction", cost: "Makes carrying stock survivable, which makes overbuilding easier to ignore." },
    ] },
  hr: { question: "Do we have the capability to execute the plan?", scope: "hr",
    items: [
      { id: "culture", name: "Culture and pay", keys: { culture: 1 },
        gain: "Morale, which multiplies every lead the company generates", cost: "Recurring, and invisible until it is gone." },
      { id: "develop", name: "Training and development", keys: { hrTraining: 1 },
        gain: "Engagement, which sets next quarter's attrition", cost: "Pays out entirely in future quarters." },
      { id: "cx", name: "Customer experience", keys: { cx: 1 },
        gain: "Satisfaction and repeat purchase", cost: "The first line every CEO cuts, and the one that costs most two quarters later." },
    ] },
  finance: { question: "Can we afford the plan, and what does it cost to be wrong?", scope: "finance",
    items: [
      { id: "governance", name: "Governance and compliance", keys: { compliance: .4, audit: .3, planning: .3 },
        gain: "Lower penalty exposure and permanently lower overhead", cost: "Makes no sale. Buys the absence of a problem." },
      { id: "workcap", name: "Working capital", keys: { workingCapital: 1 },
        gain: "Cash released from receivables, faster", cost: "Administrative effort against money you have already earned." },
      { id: "treasury", name: "Treasury", keys: { treasury: 1 },
        gain: "A return on cash that is otherwise doing nothing", cost: "Only worth anything if you are actually holding cash." },
    ] },
};
const groupTotal = (A, item) => Object.keys(item.keys).reduce((t, k) => t + num(A[k]), 0);
function setGroup(alloc, item, value) {
  const out = { ...alloc };
  const v = Math.max(0, num(value));
  Object.keys(item.keys).forEach((k) => { out[k] = v === 0 ? "" : String(Math.round(v * item.keys[k] * 100) / 100); });
  return out;
}
const isCustom = (A, item) => {
  const t = groupTotal(A, item); if (t <= 0) return false;
  return Object.keys(item.keys).some((k) => Math.abs(num(A[k]) - t * item.keys[k]) > 0.05);
};

/* ---------------------------- decision component -------------------------- */
function DecisionGroup({ item, alloc, setAlloc, ctx, cash }) {
  const total = groupTotal(alloc, item);
  const custom = isCustom(alloc, item);
  const runwayDays = cash > 0 ? Math.round((total * 100000 / cash) * 90) : 0;
  return (
    <div className="border border-stone-300 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-lg text-stone-900">{item.name}</div>
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 mt-2">
            <div className="text-xs text-teal-800 leading-snug"><span className="uppercase tracking-widest font-semibold">You gain</span><br />{item.gain}</div>
            <div className="text-xs text-rose-800 leading-snug"><span className="uppercase tracking-widest font-semibold">You give up</span><br />{item.cost}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-mono text-sm">&#8377;</span>
            <input type="number" min="0" step="1" value={total === 0 ? "" : total} placeholder="0"
              onChange={(e) => setAlloc(setGroup(alloc, item, e.target.value.replace(/^-/, "")))}
              className="w-24 border border-stone-400 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
            <span className="text-xs uppercase tracking-widest text-stone-500">lakh</span>
          </div>
          {total > 0 && (
            <div className="text-xs font-mono text-stone-500 mt-1">
              {inr(total * 100000)}{cash > 0 ? " · " + runwayDays + " days of cash" : ""}
            </div>)}
          {custom && <div className="text-xs text-amber-700 mt-1">set in detail view</div>}
        </div>
      </div>
    </div>);
}

/* --------------------------- detailed (advanced) view --------------------- */
function SpendLine({ line, value, onChange, ctx }) {
  const x = num(value);
  const previews = (line.preview ? line.preview(x, ctx) : []).filter(Boolean);
  const capL = line.cap ? line.cap(ctx) : null;
  const over = capL != null && x > capL + .001;
  return (
    <div className="border-b border-stone-200 py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-stone-900">{line.name}</div>
          <div className="text-xs font-mono text-stone-500 mt-0.5">{line.formula}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-stone-500 font-mono text-sm">&#8377;</span>
          <input type="number" min="0" step="0.5" value={value} placeholder="0"
            onChange={(e) => onChange(e.target.value.replace(/^-/, ""))}
            className={"w-24 border px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 " +
              (over ? "border-rose-700 text-rose-800" : "border-stone-400")} />
          <span className="text-xs uppercase tracking-widest text-stone-500 w-10">lakh</span>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {previews.map((p, i) => <span key={i} className={"text-xs font-mono " + (i === 0 ? "text-teal-800" : "text-stone-600")}>{p}</span>)}
      </div>
    </div>);
}

/* ---------------------------- directional panel --------------------------- */
function Directional({ dirs, only }) {
  const list = only ? dirs.filter((d) => only.indexOf(d.id) >= 0) : dirs;
  if (!list.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((d) => {
        const tone = LEVEL_TONE[d.level];
        return (
          <div key={d.id} className={"border p-3 " + TONE_CHIP[tone]}>
            <Eyebrow>{d.label}</Eyebrow>
            <div className={"font-mono text-base font-semibold mt-0.5 " + TONE_TEXT[tone]}>{d.level}</div>
            <div className="text-xs text-stone-600 mt-1 leading-snug">{d.note}</div>
          </div>);
      })}
    </div>);
}

/* ------------------------------ health bars ------------------------------ */
function HealthPanel({ health, compact }) {
  return (
    <Card eyebrow="Orientation" title="Company health">
      <div className={"grid gap-x-6 gap-y-3 " + (compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {health.map((h) => (
          <div key={h.key}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-stone-800">{h.label}</span>
              <span className={"text-xs font-mono " + TONE_TEXT[h.tone]}>{d0(h.value)}</span>
            </div>
            <div className="mt-1"><Bar value={h.value} max={100} tone={TONE_BAR[h.tone]} /></div>
            <div className="text-xs text-stone-500 mt-1">{h.note}</div>
          </div>))}
      </div>
    </Card>);
}

/* =============================== CEO BRIEFING =============================
   The first thing you see every quarter. Where the company is, what moved,
   what is holding it back, and what you say you are going to do about it.
   ========================================================================== */
const PRIORITIES = [
  { id: "grow", name: "Grow faster", desc: "Take share now and worry about economics later.",
    keys: ["google", "meta", "social", "direct", "events", "reps", "channel", "keyAccounts"] },
  { id: "cash", name: "Protect cash", desc: "Extend runway. Accept a slower quarter to stay alive.", keys: [] },
  { id: "product", name: "Improve the product", desc: "Raise what the product can convert and keep.",
    keys: ["quality", "innovation", "npd", "design"] },
  { id: "ops", name: "Fix operations", desc: "Build and deliver what has already been sold.",
    keys: ["production", "capex", "contract", "supplier", "logistics", "warehouse"] },
  { id: "retain", name: "Keep the customers we have", desc: "Satisfaction and repeat buying over new acquisition.",
    keys: ["cx", "onboarding", "email", "referral"] },
  { id: "risk", name: "Prepare for risk", desc: "Buy cover before you need it.",
    keys: ["supplier", "compliance", "audit", "planning", "workingCapital"] },
  { id: "longterm", name: "Build long-term value", desc: "Assets that pay out after this year is over.",
    keys: ["content", "buzz", "npd", "innovation", "capex", "design"] },
];
const PRIORITY = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]));

function priorityAlignment(priority, A) {
  const p = PRIORITY[priority];
  const total = opexLakhs(A) + capexLakhs(A);
  if (!p || total <= 0.01) return null;
  if (p.id === "cash") {
    return { share: null, ok: total * 100000 < 4000000, note: inr(total * 100000) + " committed in total" };
  }
  const on = p.keys.reduce((t, k) => t + num(A[k]), 0);
  return { share: on / total, ok: on / total >= 0.35, note: pct(on / total * 100) + " of committed spend went to it" };
}

function CeoBriefing({ s, history, health, changes, constraint, board, priority, setPriority, onStart, canRewind, rewindsUsed, onRewind, ts }) {
  const stage = QUARTER_STAGE[s.quarter - 1];
  const last = history[history.length - 1];
  const runway = last && last.netCF < 0 ? s.cash / -last.netCF : 99;
  const headline = [
    { label: "Cash", value: inr(s.cash), tone: s.cash < WC_BUFFER ? "bad" : s.cash < WC_BUFFER * 3 ? "watch" : "good" },
    { label: "Runway", value: runway >= 99 ? "Self-funding" : d1(runway) + " qtr", tone: runway >= 3 ? "good" : runway >= 2 ? "watch" : "bad" },
    { label: "Revenue last quarter", value: last ? cr(last.revenueT) : "—", tone: "flat" },
    { label: "Gross margin", value: last && last.revenueT > 0 ? pct(last.grossProfit / last.revenueT * 100) : "—",
      tone: last && last.revenueT > 0 ? (last.grossProfit / last.revenueT > .55 ? "good" : last.grossProfit / last.revenueT > .4 ? "watch" : "bad") : "flat" },
    { label: "Net profit", value: last ? inr(last.netProfit) : "—", tone: last ? (last.netProfit >= 0 ? "good" : "bad") : "flat" },
    { label: "Market share", value: last ? pct(last.marketShare * 100) : "—",
      tone: last ? (last.shareDelta >= 0 ? "good" : "bad") : "flat",
      sub: last ? (last.shareDelta >= 0 ? "+" : "") + d1(last.shareDelta * 100) + " pts" : null },
    { label: "Addressable demand", value: last ? d0(last.reachableDemand) + " units" : "—", tone: "flat",
      sub: "what your brand, price and reach could realistically pull last quarter" },
    { label: "Customers", value: d0(s.customers), tone: "flat", sub: "repeat " + pct(s.repeatRate) },
    { label: "Capacity used", value: last ? pct(last.utilisation * 100) : "—",
      tone: last ? (last.utilisation > .8 ? "good" : last.utilisation > .6 ? "watch" : "bad") : "flat",
      sub: d0(s.installedCapacity) + " units installed" },
    { label: "Headcount", value: d0(headcountOf(s.staff)), tone: "flat", sub: "morale " + d0(s.empSat) },
    { label: "Valuation", value: last ? cr(last.valuation) : "—", tone: "flat" },
  ];
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-stone-900 text-white p-6">
        <Eyebrow tone="text-rose-400">Quarter {s.quarter} of 4 · {stage.title}</Eyebrow>
        <h1 className="font-serif text-4xl mt-1">Monday morning, and the company is yours</h1>
        <p className="text-sm text-stone-300 mt-3 max-w-3xl leading-relaxed">{stage.brief}</p>
      </div>

      <Card eyebrow="Where the company stands" title="The numbers that matter this morning">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {headline.map((h) => (
            <div key={h.label} className="border-l-2 border-stone-300 pl-3">
              <Eyebrow>{h.label}</Eyebrow>
              <div className={"font-mono text-lg leading-tight " + TONE_TEXT[h.tone]}>{h.value}</div>
              {h.sub && <div className="text-xs text-stone-500">{h.sub}</div>}
            </div>))}
        </div>
        {last && <p className="text-xs text-stone-500 mt-4 italic">
          Sizing Sales and Operations well above {d0(last.reachableDemand)} units buys you nothing this quarter —
          that was the ceiling on what the market would actually give you last time. Building past it only pays off
          if Marketing, R&amp;D or Brand spend this quarter genuinely raises that ceiling first.
        </p>}
      </Card>

      <div>
        <Eyebrow tone="text-rose-800">Since you last looked</Eyebrow>
        <h3 className="font-serif text-xl mb-2">What changed</h3>
        <div className="space-y-1">
          {changes.map((c, i) => (
            <div key={i} className={"bg-white border border-stone-300 border-l-4 px-4 py-2 flex flex-wrap items-baseline gap-x-3 " +
              (c.dir === "up" ? "border-l-teal-700" : c.dir === "down" ? "border-l-rose-700" : "border-l-stone-400")}>
              <span className={"font-mono text-xs " + (c.dir === "up" ? "text-teal-700" : c.dir === "down" ? "text-rose-700" : "text-stone-500")}>
                {c.dir === "up" ? "▲" : c.dir === "down" ? "▼" : "●"}
              </span>
              <span className="text-sm font-semibold text-stone-900">{c.label}</span>
              <span className="text-sm text-stone-600 flex-1 min-w-full sm:min-w-0">{c.detail}</span>
            </div>))}
        </div>
      </div>

      {constraint && (
        <div className="bg-white border-2 border-rose-800">
          <header className="bg-rose-800 text-white px-4 py-2">
            <Eyebrow tone="text-rose-200">Your biggest constraint</Eyebrow>
            <h3 className="font-serif text-2xl">{constraint.primary.label}</h3>
          </header>
          <div className="p-4 space-y-3">
            <div><Eyebrow>The evidence</Eyebrow><p className="text-sm text-stone-800 mt-0.5">{constraint.primary.why}</p></div>
            <div><Eyebrow>What it cost you</Eyebrow><p className="text-sm text-stone-800 mt-0.5">{constraint.primary.impact}</p></div>
            <div className="border-t border-stone-200 pt-3">
              <p className="text-sm text-stone-500 italic">
                This is what the evidence says is binding. It is not necessarily what you should fix — that is your call,
                and fixing it will cost you something else.
              </p>
            </div>
            {constraint.all.length > 1 && (
              <div className="text-xs text-stone-500 font-mono">
                Also pressing: {constraint.all.slice(1).map((c) => c.label).join(" · ")}
              </div>)}
          </div>
        </div>)}

      <HealthPanel health={health} />

      <Card eyebrow="Everyone wants something" title="Around the table">
        <div className="grid gap-3 sm:grid-cols-2">
          {board.map((b, i) => (
            <div key={i} className={"border p-3 " + (b.met === null ? TONE_CHIP.flat : b.met ? TONE_CHIP.good : TONE_CHIP.bad)}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-base">{b.who}</span>
                <span className={"text-xs uppercase tracking-widest font-semibold " + (b.met === null ? "text-stone-500" : b.met ? "text-teal-800" : "text-rose-800")}>
                  {b.met === null ? "Watching" : b.met ? "Satisfied" : "Not satisfied"}
                </span>
              </div>
              <div className="text-sm text-stone-800 mt-1">&ldquo;{b.ask}&rdquo;</div>
              <div className="text-xs text-stone-500 font-mono mt-1">{b.detail}</div>
            </div>))}
        </div>
        <p className="text-xs text-stone-500 mt-3 italic">
          They cannot all be satisfied at once, and none of them is automatically right.
        </p>
      </Card>

      <Card eyebrow="Before you start" title="What are you going to prioritise this quarter?">
        <p className="text-sm text-stone-600 mb-3">
          Say it now, out loud, before you see the levers. At the end of the quarter we will compare what you said,
          what you actually funded, and what the company turned out to need.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PRIORITIES.map((p) => {
            const on = priority === p.id;
            return (
              <button key={p.id} onClick={() => setPriority(p.id)}
                className={"text-left border p-3 " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800")}>
                <div className="font-serif text-base leading-snug">{p.name}</div>
                <div className={"text-xs mt-1 leading-snug " + (on ? "text-stone-300" : "text-stone-500")}>{p.desc}</div>
              </button>);
          })}
        </div>
      </Card>

      {history.length > 0 && (
        <div className="bg-white border border-stone-300 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-serif text-base">Not happy with last quarter?</div>
            <div className="text-xs text-stone-500">
              {ts ? "Rewinding is no longer available once the Term Sheet has been decided — that offer was built from Q3's actual result."
                : "You can go back and re-decide Quarter " + (s.quarter - 1) + " from scratch, discarding what actually happened. "
                  + "Allowed twice across the whole simulation — " + (2 - rewindsUsed) + " left"
                  + (rewindsUsed > 0 ? " (used " + rewindsUsed + ")" : "") + "."}
            </div>
          </div>
          <button onClick={onRewind} disabled={!canRewind}
            className={"px-4 py-2 text-sm font-serif border " + (canRewind ? "border-rose-800 text-rose-800 hover:bg-rose-800 hover:text-white" : "border-stone-300 text-stone-300 cursor-not-allowed")}>
            {canRewind ? "Rewind to Quarter " + (s.quarter - 1) : (ts ? "Locked in" : "No rewinds left")}
          </button>
        </div>)}

      <button onClick={onStart} disabled={!priority}
        className={"w-full py-4 font-serif text-xl " + (priority ? "bg-rose-800 text-white hover:bg-rose-900" : "bg-stone-200 text-stone-400")}>
        {priority ? "Start the quarter" : "Choose a priority to begin"}
      </button>
    </div>);
}

function BudgetStrip({ budget }) {
  const remaining = budget.ceiling - budget.committed;
  const over = remaining < 0;
  return (
    <div className={"border px-4 py-3 " + (over ? "border-rose-700 bg-rose-50" : "border-stone-300 bg-white")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <Eyebrow tone={over ? "text-rose-800" : "text-stone-500"}>{over ? "Over the quarter's ceiling" : "Cash left to commit"}</Eyebrow>
        <div className={"font-mono text-lg " + (over ? "text-rose-800" : "text-stone-900")}>
          {inr(remaining)} <span className="text-stone-400 text-xs">of {inr(budget.ceiling)}</span></div>
      </div>
      <Bar value={budget.committed} max={budget.ceiling} tone={over ? "bg-rose-700" : budget.committed > budget.ceiling * .85 ? "bg-amber-600" : "bg-stone-800"} />
      <div className="text-xs text-stone-500 mt-2 font-mono">
        {inr(budget.opex)} operating + {inr(budget.capex)} plant + {inr(budget.inno)} innovation + {inr(budget.people)} people.
        Ceiling = cash + credit drawn, less fixed costs and the {inr(WC_BUFFER)} buffer.
      </div>
    </div>);
}


/* --------------------------- the innovation board ------------------------- */
function InnovationBoard({ s, startInno, setStartInno, p }) {
  const toggle = (id) => setStartInno(startInno.indexOf(id) >= 0 ? startInno.filter((t) => t !== id) : startInno.concat(id));
  const spend = startInno.reduce((t, id) => t + INNO[id].cost, 0);
  const effects = ["ceiling", "innovation", "quality", "brand", "satisfaction", "repeat", "cogs"];
  const label = { ceiling: "conversion ceiling", innovation: "innovation", quality: "quality", brand: "brand",
    satisfaction: "satisfaction", repeat: "repeat rate", cogs: "cost per unit" };
  return (
    <Card eyebrow="The innovation board" title="Pick what the product becomes"
      right={<div className="text-right"><Eyebrow>Starting this quarter</Eyebrow><div className="font-mono text-lg">{inr(spend)}</div></div>}>
      <p className="text-sm text-stone-600 mb-4">
        Every card is capitalised to the balance sheet and amortised at 8% a quarter, not expensed. Cards marked
        with a lead time are paid for now and land later — you are choosing what the product will be next
        quarter, not this one.
      </p>
      {INNO_CATS.map((cat) => (
        <div key={cat} className="mb-5 last:mb-0">
          <Eyebrow tone="text-rose-800">{cat}</Eyebrow>
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {INNOVATIONS.filter((m) => m.cat === cat).map((m) => {
              const owned = s.innovations.indexOf(m.id) >= 0;
              const inFlight = !!s.pipeline[m.id];
              const on = startInno.indexOf(m.id) >= 0;
              return (
                <button key={m.id} disabled={owned || inFlight} onClick={() => toggle(m.id)}
                  className={"text-left border p-3 " + (owned ? "border-teal-700 bg-teal-50" : inFlight ? "border-amber-600 bg-amber-50"
                    : on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800")}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-serif text-base leading-snug">{m.name}</div>
                    <div className="font-mono text-sm shrink-0">
                      {owned ? "Shipped" : inFlight ? d0(s.pipeline[m.id]) + "q left" : inr(m.cost)}
                    </div>
                  </div>
                  <div className={"text-xs mt-1 " + (on ? "text-stone-300" : "text-stone-500")}>{m.blurb}</div>
                  <div className="flex flex-wrap gap-x-3 mt-2">
                    {effects.filter((e) => m.effect[e]).map((e) => (
                      <span key={e} className={"text-xs font-mono " +
                        (on ? (m.effect[e] > 0 && e !== "cogs" ? "text-teal-300" : "text-rose-300")
                          : (e === "cogs" ? (m.effect[e] > 0 ? "text-rose-700" : "text-teal-800") : "text-teal-800"))}>
                        {e === "cogs" ? (m.effect[e] > 0 ? "+" : "−") + inr(Math.abs(m.effect[e])) + " a unit"
                          : "+" + m.effect[e] + " " + label[e]}
                      </span>))}
                    {m.lead > 0 && <span className={"text-xs font-mono " + (on ? "text-amber-300" : "text-amber-700")}>lands in {m.lead} quarter</span>}
                  </div>
                </button>);
            })}
          </div>
        </div>))}
      {p && (
        <div className="border-t border-stone-300 pt-3 mt-2 text-sm text-stone-600">
          With everything shipped, the product would carry a conversion ceiling of
          {" "}<span className="font-mono text-stone-900">{pct(p.ceiling)}</span>.
          {p.ceilingBinding ? " On this plan, that is the binding constraint." : " On this plan, the product is not the constraint."}
        </div>)}
    </Card>);
}


/* ------------------- product portfolio: price, mix, status ---------------- */
const STATUS_NOTE = {
  active: "Built and sold. Takes its share of the line.",
  paused: "Not built. Existing stock still sells, and the line goes to the other product.",
  discontinued: "Not built. All remaining stock is cleared this quarter at 40% off, and it leaves the range for good.",
};
function ProductManager({ s, products, setProducts, p }) {
  const setP = (id, patch) => setProducts({ ...products, [id]: { ...products[id], ...patch } });
  const live = PRODUCTS.filter((x) => products[x.id].live);
  return (
    <div className="space-y-4">
      <Card eyebrow="Product portfolio" title={live.length > 1 ? "Two products, one production line" : "One product on sale"}>
        <p className="text-sm text-stone-600 mb-4">
          Price is yours to set. Demand moves against a market reference of {inr(PRODUCTS[0].refPrice)} for the Pulse
          and {inr(PRODUCTS[1].refPrice)} for the Pro — charge less and volume rises, charge more and it falls,
          roughly to the power of {d1(PRICE_ELASTICITY)}.
        </p>
        <div className="space-y-4">
          {PRODUCTS.map((x) => {
            const pd = products[x.id];
            const info = p ? p.priceInfo[x.id] : null;
            if (!pd.live) return (
              <div key={x.id} className="border border-dashed border-stone-400 p-4 flex items-center gap-4">
                <div className="opacity-30 flex-shrink-0"><WatchIllustration variant={x.id} size={64} /></div>
                <div>
                  <div className="font-serif text-lg text-stone-500">{x.name}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    Not developed yet — {d0(s.npd)} of 60. Fund New Product Development to bring it to market.
                  </div>
                </div>
              </div>);
            return (
              <div key={x.id} className={"border p-4 " + (pd.status === "discontinued" ? "border-rose-700 bg-rose-50" : pd.status === "paused" ? "border-amber-600 bg-amber-50" : "border-stone-300")}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0"><WatchIllustration variant={x.id} size={72} /></div>
                    <div><div className="font-serif text-xl">{x.name}</div>
                      <div className="text-xs text-stone-500">{x.blurb}</div></div>
                  </div>
                  <div className="text-right">
                    <Eyebrow>Stock on hand</Eyebrow>
                    <div className="font-mono text-lg">{d0(num(pd.inv))} units</div>
                    <div className="text-xs text-stone-500">at {inr(num(pd.invCost))} each</div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div>
                    <Eyebrow>Price</Eyebrow>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-stone-500 font-mono">&#8377;</span>
                      <input type="number" min="0" step="100" value={pd.price}
                        onChange={(e) => setP(x.id, { price: Math.max(0, num(e.target.value)) })}
                        className="w-32 border border-stone-400 px-2 py-1 text-right font-mono focus:outline-none focus:ring-2 focus:ring-stone-800" />
                    </div>
                    {info && (
                      <div className="text-xs font-mono mt-2 space-y-0.5">
                        <div className={Math.abs(info.premium) > 20 ? "text-amber-700" : "text-stone-600"}>
                          {info.premium >= 0 ? "+" : ""}{d0(info.premium)}% against a market reference of {inr(info.ref)}
                        </div>
                        <div className={info.mult >= 1 ? "text-teal-800" : "text-rose-800"}>demand ×{d2(info.mult)}</div>
                        {num(pd.invCost) > 0 && (
                          <div className={pd.price > num(pd.invCost) ? "text-stone-600" : "text-rose-800 font-semibold"}>
                            {inr(pd.price - num(pd.invCost))} a unit above your last known cost of {inr(num(pd.invCost))}
                          </div>)}
                      </div>)}
                  </div>
                  <div>
                    <Eyebrow>Share of the production line</Eyebrow>
                    <div className="flex items-center gap-3 mt-1">
                      <input type="range" min="0" max="100" step="5" value={num(pd.share)}
                        disabled={pd.status !== "active"}
                        onChange={(e) => setP(x.id, { share: num(e.target.value) })} className="flex-1" />
                      <div className="font-mono text-xl w-14 text-right">{d0(num(pd.share))}%</div>
                    </div>
                    <div className="text-xs font-mono text-stone-600 mt-2">
                      {x.capacityCost !== 1 ? "each unit uses " + d1(x.capacityCost) + " units of line capacity" : "one unit of line capacity each"}
                      
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Eyebrow>Production decision</Eyebrow>
                  <div className="grid gap-2 sm:grid-cols-3 mt-1">
                    {["active", "paused", "discontinued"].map((st) => {
                      const on = pd.status === st;
                      return (
                        <button key={st} onClick={() => setP(x.id, { status: st })}
                          className={"text-left border p-2 " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800")}>
                          <div className="font-serif capitalize">{st === "active" ? "Keep building" : st === "paused" ? "Pause production" : "Discontinue"}</div>
                          <div className={"text-xs mt-1 " + (on ? "text-stone-300" : "text-stone-500")}>{STATUS_NOTE[st]}</div>
                        </button>);
                    })}
                  </div>
                </div>
              </div>);
          })}
        </div>
      </Card>
    </div>);
}

/* ------------------ people: hire and fire, function by function ----------- */
function PeoplePanel({ s, alloc, setAlloc, p }) {
  const set = (k, v) => setAlloc({ ...alloc, [k]: v.replace(/^-/, "") });
  return (
    <Card eyebrow="Headcount by function" title={d0(headcountOf(s.staff)) + " people today, " + (p ? d0(p.headcount) : "—") + " at quarter end"}>
      <p className="text-sm text-stone-600 mb-4">
        Each function does one job. Hire and the salary is yours every quarter from now on, and new joiners work
        at 60% for their first. Cut and you pay severance once, lose the work immediately, and take morale and
        attrition with it. Nobody can be cut below the founding team in that function.
      </p>
      <div className="space-y-3">
        {ROLES.map((r) => {
          const have = num(s.staff[r.id]);
          const hire = Math.round(num(alloc["hire_" + r.id]));
          const fire = Math.min(Math.round(num(alloc["fire_" + r.id])), Math.max(0, have - r.base));
          const end = have + hire - fire;
          const st = p ? p.staffing[r.id] : 1;
          const need = p ? p.need[r.id] : r.base;
          const tk = st >= .999 ? "good" : st >= .85 ? "watch" : "bad";
          return (
            <div key={r.id} className={"border p-3 " + (st >= .999 ? "border-stone-300 bg-white" : TONE_CHIP[tk])}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="font-serif text-lg">{r.name}</div>
                  <div className="text-xs text-stone-500">{r.drives} · {inr(r.salary)} a quarter each</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">{d0(have)} → {d0(end)}</div>
                  <div className={"text-xs font-mono " + TONE_TEXT[tk]}>
                    {p ? "needs " + d1(need) + ", running at " + pct(st * 100) : ""}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-stone-500 w-10">Hire</span>
                  <input type="number" min="0" step="1" value={alloc["hire_" + r.id]} placeholder="0"
                    onChange={(e) => set("hire_" + r.id, e.target.value)}
                    className="w-20 border border-stone-400 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
                  <span className="text-xs font-mono text-stone-600">
                    {hire > 0 ? inr(hire * r.hire) + " now, " + inr(hire * r.salary) + " every quarter" : inr(r.hire) + " each to recruit"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-stone-500 w-10">Cut</span>
                  <input type="number" min="0" max={Math.max(0, have - r.base)} step="1" value={alloc["fire_" + r.id]} placeholder="0"
                    onChange={(e) => set("fire_" + r.id, e.target.value)}
                    className="w-20 border border-stone-400 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
                  <span className="text-xs font-mono text-stone-600">
                    {fire > 0 ? inr(fire * r.sever) + " severance, saves " + inr(fire * r.salary) + " a quarter"
                      : d0(Math.max(0, have - r.base)) + " above the founding " + d0(r.base)}
                  </span>
                </div>
              </div>
              <div className={"text-xs mt-2 leading-snug " + (fire > 0 ? "text-rose-800" : st < .999 ? TONE_TEXT[tk] : "text-stone-500")}>
                {fire > 0 ? "If you cut here: " + r.ifCut : st < .999 ? r.ifShort : "Fully staffed for what you have funded."}
              </div>
            </div>);
        })}
      </div>
    </Card>);
}


/* ---------------------------- capital structure --------------------------- */
function CapitalPanel({ s, alloc, setAlloc, payTerms, setPayTerms, p }) {
  const limit = p ? p.debtLimit : 0;
  const drawn = p ? p.drawn : 0;
  const over = num(alloc.draw) * 100000 > limit + 1;
  return (
    <div className="space-y-4">
      <Card eyebrow="Credit facility" title={"Up to " + inr(limit) + " available"}>
        <p className="text-sm text-stone-600 mb-3">
          Capped at 60% of net worth, less what you already owe. Interest runs at 3.5% a quarter on the average
          balance. Drawn cash raises this quarter's ceiling for every department.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow>Draw down</Eyebrow>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-stone-500 font-mono text-sm">&#8377;</span>
              <input type="number" min="0" step="1" value={alloc.draw} placeholder="0"
                onChange={(e) => setAlloc({ ...alloc, draw: e.target.value.replace(/^-/, "") })}
                className={"w-28 border px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 " + (over ? "border-rose-700 text-rose-800" : "border-stone-400")} />
              <span className="text-xs uppercase tracking-widest text-stone-500">lakh</span>
            </div>
            <div className="text-xs font-mono text-stone-600 mt-2 space-y-0.5">
              <div className="text-teal-800">{inr(drawn)} into cash today</div>
              <div>{inr((s.debt + drawn) * DEBT_RATE)} of interest this quarter</div>
              {over && <div className="text-rose-800">{inr(num(alloc.draw) * 100000 - limit)} over the limit will be refused.</div>}
            </div>
          </div>
          <div>
            <Eyebrow>Repay</Eyebrow>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-stone-500 font-mono text-sm">&#8377;</span>
              <input type="number" min="0" step="1" value={alloc.repay} placeholder="0"
                onChange={(e) => setAlloc({ ...alloc, repay: e.target.value.replace(/^-/, "") })}
                className="w-28 border border-stone-400 px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
              <span className="text-xs uppercase tracking-widest text-stone-500">lakh</span>
            </div>
            <div className="text-xs font-mono text-stone-600 mt-2 space-y-0.5">
              <div>{inr(s.debt)} outstanding today</div>
              <div>{inr(p ? p.debtClose : s.debt)} at quarter end</div>
            </div>
          </div>
        </div>
      </Card>
      <Card eyebrow="Supplier payment terms" title="Where your working capital sits">
        <p className="text-sm text-stone-600 mb-3">
          One choice that moves your cost per unit, your supplier reliability and how much cash the balance sheet
          holds. It reaches straight into Operations.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(PAY_TERMS).map((t) => {
            const on = payTerms === t.id;
            return (
              <button key={t.id} onClick={() => setPayTerms(t.id)}
                className={"text-left border p-3 " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800")}>
                <div className="font-serif text-base">{t.name}</div>
                <div className={"text-xs font-mono mt-1 " + (on ? "text-teal-300" : "text-teal-800")}>
                  cost {t.cogsMult === 1 ? "unchanged" : (t.cogsMult < 1 ? "−" : "+") + pct(Math.abs(1 - t.cogsMult) * 100)}
                  {" · reliability " + (t.rel >= 0 ? "+" : "") + t.rel}
                </div>
                <div className={"text-xs mt-1 " + (on ? "text-stone-400" : "text-stone-500")}>{t.note}</div>
              </button>);
          })}
        </div>
      </Card>
    </div>);
}

/* -------------------------------- warranty -------------------------------- */
const WARRANTIES = [
  { id: "6mo", name: "6 months", conv: "+0 conversion points", cost: "No provision", mult: 0 },
  { id: "1yr", name: "1 year", conv: "+1.5 conversion points", cost: "units × defect rate × ₹1,500", mult: 1 },
  { id: "2yr", name: "2 years", conv: "+3.0 conversion points", cost: "units × defect rate × ₹1,500 × 1.8", mult: 1.8 },
];
function WarrantyPicker({ warranty, setWarranty, p }) {
  const defect = p ? p.defectRate : 8;
  return (
    <Card eyebrow="Warranty policy" title={"Defect rate this quarter: " + pct(defect)}>
      <div className="grid gap-3 sm:grid-cols-3">
        {WARRANTIES.map((w) => {
          const on = warranty === w.id;
          return (
            <button key={w.id} onClick={() => setWarranty(w.id)}
              className={"text-left border p-3 " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800")}>
              <div className="font-serif text-lg">{w.name}</div>
              <div className={"text-xs mt-1 " + (on ? "text-teal-300" : "text-teal-800")}>{w.conv}</div>
              <div className={"text-xs mt-1 " + (on ? "text-stone-400" : "text-stone-500")}>{w.cost}</div>
              <div className={"text-xs font-mono mt-2 " + (on ? "text-stone-300" : "text-stone-600")}>
                {w.mult ? inr(1000 * (defect / 100) * 1500 * w.mult) + " per 1,000 units" : "₹0 per 1,000 units"}
              </div>
            </button>);
        })}
      </div>
    </Card>);
}


/* ============================ DEPARTMENT SCREEN =========================== */
const DEPT_META = {
  marketing: { label: "Marketing", question: GROUPS.marketing.question, dirs: ["demand", "position"] },
  sales: { label: "Sales", question: GROUPS.sales.question, dirs: ["sales", "demand"] },
  rnd: { label: "Product", question: GROUPS.rnd.question, dirs: ["ceiling", "position"] },
  ops: { label: "Operations", question: GROUPS.ops.question, dirs: ["production", "sales"] },
  hr: { label: "People", question: GROUPS.hr.question, dirs: ["people"] },
  finance: { label: "Finance", question: GROUPS.finance.question, dirs: ["cash"] },
};
const RAW_LINES = Object.fromEntries(DEPTS.map((d) => [d.id, d.lines]));

function DeptScreen({ id, s, alloc, setAlloc, ctx, budget, dirs, inbox, advanced, setAdvanced, extraTop, extra }) {
  const meta = DEPT_META[id];
  const grp = GROUPS[id];
  const spent = grp.items.reduce((t, it) => t + groupTotal(parseAlloc(alloc), it), 0);
  const A = parseAlloc(alloc);
  const mine = inbox.filter((m) => ({ marketing: ["market"], sales: ["sales"], rnd: ["product"], ops: ["ops"], hr: ["people"], finance: ["cfo"] }[id] || []).indexOf(m.from) >= 0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow tone="text-rose-800">{meta.label}</Eyebrow>
          <h2 className="font-serif text-3xl text-stone-900">{meta.question}</h2>
        </div>
        <div className="text-right">
          <Eyebrow>Committed here</Eyebrow>
          <div className="font-mono text-2xl">{lakh(spent)}</div>
        </div>
      </div>
      <Directional dirs={dirs} only={meta.dirs} />
      {mine.length > 0 && <Inbox messages={mine} eyebrow="From this function" title="What your team is telling you" />}
      {extraTop}
      <div className="space-y-3">
        {grp.items.map((it) => (
          <DecisionGroup key={it.id} item={it} alloc={alloc} setAlloc={setAlloc} ctx={ctx} cash={s.cash} />))}
      </div>
      {extra}
      <div className="border border-stone-300 bg-white">
        <button onClick={() => setAdvanced(!advanced)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50">
          <div>
            <Eyebrow>Detailed planning</Eyebrow>
            <div className="font-serif text-base">{advanced ? "Hide the underlying lines" : "Open the underlying lines and formulas"}</div>
          </div>
          <span className="font-mono text-sm text-stone-500">{advanced ? "−" : "+"}</span>
        </button>
        {advanced && (
          <div className="border-t border-stone-300 p-4">
            <p className="text-sm text-stone-600 mb-3">
              Every published formula, exactly as the engine runs it. Editing here overrides the grouped decision above.
            </p>
            {(RAW_LINES[id] || []).map((l) => (
              <SpendLine key={l.key} line={l} value={alloc[l.key]} ctx={ctx} onChange={(v) => setAlloc({ ...alloc, [l.key]: v })} />))}
          </div>)}
      </div>
      <BudgetStrip budget={budget} />
    </div>);
}

/* ================================ DASHBOARD =============================== */
function Dashboard({ s, history, health, constraint, dirs, inbox, priority, budget, onGo }) {
  const last = history[history.length - 1];
  const runway = last && last.netCF < 0 ? s.cash / -last.netCF : 99;
  const shareSeries = history.map((h) => ({ q: "Q" + h.q, share: Math.round(h.marketShare * 1000) / 10,
    units: Math.round(h.unitsSold), demand: Math.round(h.mktDemand) }));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Quarter" value={s.quarter + " of 4"} sub={QUARTER_STAGE[s.quarter - 1].title} />
        <Stat label="Cash" value={inr(s.cash)} tone={TONE_TEXT[s.cash < WC_BUFFER ? "bad" : "flat"]} sub={"left to commit " + inr(budget.ceiling - budget.committed)} />
        <Stat label="Runway" value={runway >= 99 ? "Self-funding" : d1(runway) + " qtr"} tone={TONE_TEXT[runway >= 2 ? "good" : "bad"]} />
        <Stat label="Revenue" value={last ? cr(last.revenueT) : "—"} sub="last closed quarter" />
        <Stat label="Market share" value={last ? pct(last.marketShare * 100) : "—"}
          sub={last ? (last.shareDelta >= 0 ? "+" : "") + d1(last.shareDelta * 100) + " pts" : "no history yet"}
          tone={TONE_TEXT[last ? (last.shareDelta >= 0 ? "good" : "bad") : "flat"]} />
        <Stat label="Valuation" value={last ? cr(last.valuation) : "—"} />
      </div>

      {constraint && (
        <div className="bg-white border-2 border-rose-800">
          <div className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <Eyebrow tone="text-rose-800">Your biggest constraint right now</Eyebrow>
              <h3 className="font-serif text-2xl">{constraint.primary.label}</h3>
              <p className="text-sm text-stone-700 mt-1 max-w-2xl">{constraint.primary.why}</p>
            </div>
            <div className="text-right">
              <Eyebrow>You said you would prioritise</Eyebrow>
              <div className="font-serif text-lg">{priority ? PRIORITY[priority].name : "—"}</div>
            </div>
          </div>
        </div>)}

      <div>
        <Eyebrow tone="text-rose-800">Before you allocate</Eyebrow>
        <h3 className="font-serif text-xl mb-2">Roughly how many buyers you could reach this quarter</h3>
        <p className="font-mono text-3xl text-stone-900">{d0(estimateAddressableDemand(s, s.quarter))} <span className="text-sm text-stone-500 font-sans">buyers, if you fund marketing and pricing well</span></p>
        <p className="text-xs text-stone-500 mt-2 italic">
          Size Sales capacity and how much you plan to produce against this number, not against how much cash you have.
          It's an estimate from where the company stands right now — the real figure depends on what you actually
          decide, and will differ once the quarter closes.
        </p>
      </div>

      <div>
        <Eyebrow tone="text-rose-800">Where the plan puts pressure</Eyebrow>
        <h3 className="font-serif text-xl mb-2">Operating readiness</h3>
        <Directional dirs={dirs} />
        <p className="text-xs text-stone-500 mt-2 italic">
          Direction only. You will not know the exact revenue, profit or cash until the quarter closes — which is
          the situation you would actually be in.
        </p>
      </div>

      <Inbox messages={inbox} limit={5} />
      <HealthPanel health={health} />

      {history.length > 0 && (
        <Card eyebrow="Market share" title="Your share of a category that is growing without you">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={shareSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" />
                <XAxis dataKey="q" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ fontFamily: "monospace", fontSize: 12, borderColor: "#d6d3d1" }} />
                <Line type="monotone" dataKey="share" name="Market share %" stroke="#9f1239" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {history.map((h) => (
            <Row key={h.q} label={"Quarter " + h.q}
              working={d0(h.unitsSold) + " units of a " + d0(h.mktDemand) + "-unit category"}
              value={pct(h.marketShare * 100)} />))}
        </Card>)}

      <button onClick={onGo} className="w-full bg-stone-900 text-white py-4 font-serif text-xl hover:bg-rose-900">
        Go to review and close the quarter
      </button>
    </div>);
}

/* ============================ REFLECTION (pre-close) ======================
   Structured, short, and judged on reasoning rather than word count.
   ========================================================================== */
const RISKS = [
  { id: "cash", label: "Running the cash balance down" },
  { id: "stock", label: "Building stock we may not sell" },
  { id: "quality", label: "Shipping with the product behind the market" },
  { id: "people", label: "Asking the team to carry more than it can" },
  { id: "share", label: "Losing ground to competitors while we fix something else" },
  { id: "debt", label: "Taking on debt and the interest that comes with it" },
  { id: "none", label: "Nothing material — this was a low-risk quarter" },
];
const EXPECTATIONS = [
  { id: "growfast", label: "Grow strongly" }, { id: "growslow", label: "Grow modestly" },
  { id: "hold", label: "Hold roughly flat" }, { id: "shrink", label: "Go backwards, deliberately" },
];
function Reflection({ constraint, reflection, setR, priority, alloc }) {
  const A = parseAlloc(alloc);
  const funded = Object.entries(GROUPS).flatMap(([dept, g]) => g.items.map((it) => ({ dept, it, v: groupTotal(A, it) })))
    .filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const unfunded = Object.entries(GROUPS).flatMap(([dept, g]) => g.items.map((it) => ({ dept, it, v: groupTotal(A, it) })))
    .filter((x) => x.v <= 0);
  const set = (k, v) => setR({ ...reflection, [k]: v });
  const toggle = (id) => set("sacrifice", (reflection.sacrifice || []).indexOf(id) >= 0
    ? reflection.sacrifice.filter((x) => x !== id) : (reflection.sacrifice || []).concat(id));
  const pill = (on) => "text-left border px-3 py-2 text-sm " + (on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-800");
  return (
    <Card eyebrow="Before you close" title="Why did you make these decisions?">
      <div className="space-y-5">
        <div>
          <div className="font-serif text-base">1. What was the biggest constraint you were solving?</div>
          <div className="grid gap-2 sm:grid-cols-2 mt-2">
            {(constraint ? constraint.all : []).map((c) => (
              <button key={c.id} onClick={() => set("constraint", c.id)} className={pill(reflection.constraint === c.id)}>{c.label}</button>))}
            <button onClick={() => set("constraint", "other")} className={pill(reflection.constraint === "other")}>Something else entirely</button>
          </div>
        </div>
        <div>
          <div className="font-serif text-base">2. What did you fund?</div>
          <p className="text-xs text-stone-500 mt-1">Taken from your decisions, not your description of them.</p>
          <div className="mt-2 text-sm text-stone-800 font-mono">
            {funded.length ? funded.slice(0, 4).map((f) => f.it.name + " " + lakh(f.v)).join("  ·  ") : "Nothing funded this quarter."}
          </div>
          {priority && <div className="text-xs text-stone-500 mt-1">You said you would prioritise: {PRIORITY[priority].name.toLowerCase()}.</div>}
        </div>
        <div>
          <div className="font-serif text-base">3. What did you deliberately choose not to fund?</div>
          <p className="text-xs text-stone-500 mt-1">Naming a sacrifice is the difference between a trade-off and an oversight.</p>
          <div className="grid gap-2 sm:grid-cols-3 mt-2">
            {unfunded.slice(0, 9).map((u) => (
              <button key={u.it.id} onClick={() => toggle(u.it.id)} className={pill((reflection.sacrifice || []).indexOf(u.it.id) >= 0)}>{u.it.name}</button>))}
          </div>
        </div>
        <div>
          <div className="font-serif text-base">4. What risk are you accepting?</div>
          <div className="grid gap-2 sm:grid-cols-2 mt-2">
            {RISKS.map((r) => <button key={r.id} onClick={() => set("risk", r.id)} className={pill(reflection.risk === r.id)}>{r.label}</button>)}
          </div>
        </div>
        <div>
          <div className="font-serif text-base">5. What do you expect to happen?</div>
          <div className="grid gap-2 sm:grid-cols-4 mt-2">
            {EXPECTATIONS.map((e) => <button key={e.id} onClick={() => set("expect", e.id)} className={pill(reflection.expect === e.id)}>{e.label}</button>)}
          </div>
        </div>
        <div>
          <div className="font-serif text-base">Anything else, in a sentence or two? <span className="text-stone-500 text-sm">(optional)</span></div>
          <textarea value={reflection.note || ""} onChange={(e) => set("note", e.target.value)} rows={2}
            placeholder="Only if there is something the four answers above do not capture."
            className="w-full border border-stone-400 p-3 text-sm bg-white mt-2 focus:outline-none focus:ring-2 focus:ring-stone-800" />
        </div>
      </div>
    </Card>);
}
const reflectionComplete = (r) => !!(r && r.constraint && r.risk && r.expect);

/* ========================== WHAT WENT WRONG / RIGHT ======================= */
function postMortem(r, prior) {
  const wrong = [], right = [];
  const avail = r.avail.pulse + r.avail.pro;
  if (r.leadsWasted > Math.max(60, r.effLeads * .08)) wrong.push("Marketing generated more demand than sales could handle. " + d0(r.leadsWasted) + " leads were never worked, and roughly " + inr(r.marketingSpend * r.leadWasteFrac) + " of acquisition spend went with them.");
  if (r.unmetDemand > Math.max(40, r.demandTotal * .08)) wrong.push("Production capacity limited revenue. " + d0(r.unmetDemand) + " units of demand could not be filled.");
  if (r.ceilingBinding) wrong.push("The product became the bottleneck. Selling effort supported " + pct(r.rawConv) + " conversion; the product carried " + pct(r.ceiling) + ".");
  if (r.positionBinding) wrong.push("Your position in the category could not absorb the interest you created. " + d0(r.demandBeyondPosition) + " units of intent went to competitors.");
  if (r.cash < WC_BUFFER) wrong.push("Cash fell below the safety level the board set. Closing balance " + inr(r.cash) + ".");
  if (r.invUnitsOut > Math.max(200, r.unitsSold * .35)) wrong.push(d0(r.invUnitsOut) + " units were built and not sold, tying up " + inr(r.invValue) + " and costing " + inr(r.holdingCost) + " to hold.");
  if (r.shortRoles.length) wrong.push(r.shortRoles.map((x) => x.name).join(" and ") + " could not deliver what you funded, so part of that spend under-performed.");
  if (r.wastedMarketing > r.marketingSpend * .2 && r.marketingSpend > 100000) wrong.push(pct(r.wasteFrac * 100) + " of the demand-generation budget had nowhere to land — " + inr(r.wastedMarketing) + ".");
  if (r.compliancePenalty > 200000) wrong.push("Compliance exposure cost " + inr(r.compliancePenalty) + " this quarter, which is the price of not funding governance.");

  if (r.supplierRel >= 85) right.push("Supplier reliability of " + d0(r.supplierRel) + " protected production — very little of what you built was lost.");
  if (!r.ceilingBinding && r.quality > 10) right.push("Product improvement kept the conversion ceiling ahead of what sales could push, so nothing was wasted against it.");
  if (r.repeatRate > 18) right.push("Repeat purchase reached " + pct(r.repeatRate) + ", delivering " + d0(r.repeatUnits) + " units you did not have to buy.");
  if (r.leadsWasted < 1 && r.effLeads > 200) right.push("Every lead you paid for was worked. Sales capacity and demand generation were sized against each other.");
  if (Math.abs(avail - r.demandTotal) < r.demandTotal * .12 && r.unitsSold > 100) right.push("Supply and demand landed within a few per cent of each other — no shortfall, no stockpile.");
  if (r.shareDelta > 0.005) right.push("Market share rose " + d1(r.shareDelta * 100) + " points to " + pct(r.marketShare * 100) + " while the category itself grew.");
  if (r.netProfit > 0) right.push("The quarter turned a net profit of " + inr(r.netProfit) + ".");
  if (r.neutralised) right.push("The market event was fully neutralised.");
  if (r.landed.length) right.push("Shipped " + r.landed.map((i) => INNO[i].name).join(" and ") + ", which the product will carry from now on.");
  if (!wrong.length) wrong.push("Nothing broke. That is rarer than it sounds, and usually means you are either well balanced or not pushing hard enough.");
  if (!right.length) right.push("Little went right this quarter. The company survived it, which is not the same thing.");
  return { wrong: wrong.slice(0, 5), right: right.slice(0, 5) };
}

/* --------------------- concise management assessment --------------------- */
function assessmentLines(sc) {
  const word = (p, w) => (p / w >= .8 ? "strong" : p / w >= .6 ? "sound" : p / w >= .4 ? "mixed" : "weak");
  return sc.traits.map((t) => ({ name: t.name, verdict: word(t.points, t.weight),
    tone: t.points / t.weight >= .7 ? "good" : t.points / t.weight >= .45 ? "watch" : "bad",
    line: t.subs.filter((x) => x.level !== "full")[0] ? t.subs.filter((x) => x.level !== "full")[0].detail : t.subs[0].detail }));
}

/* ============================ QUARTER CLOSE SCREEN ======================== */
function QuarterClose({ r, prior, sc, constraint, priority, reflection, onNext }) {
  const pm = postMortem(r, prior);
  const [open, setOpen] = useState(null);
  const align = priorityAlignment(priority, r.A);
  const assess = assessmentLines(sc);
  const needed = constraint ? constraint.primary : null;
  const said = priority ? PRIORITY[priority] : null;
  return (
    <div className="space-y-6">
      <div className="bg-stone-900 text-white p-6">
        <Eyebrow tone="text-rose-400">Quarter {r.q} closed · {QUARTER_STAGE[r.q - 1].title}</Eyebrow>
        <h2 className="font-serif text-4xl mt-1">{d0(r.unitsSold)} units, {cr(r.revenueT)} of revenue</h2>
      </div>

      <div>
        <Eyebrow tone="text-rose-800">What happened</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-2">
          <Stat label="Revenue" value={cr(r.revenueT)} sub={d0(r.unitsSold) + " units"} />
          <Stat label="Market share" value={pct(r.marketShare * 100)} tone={TONE_TEXT[r.shareDelta >= 0 ? "good" : "bad"]}
            sub={(r.shareDelta >= 0 ? "+" : "") + d1(r.shareDelta * 100) + " pts of a " + d0(r.mktDemand) + "-unit category"} />
          <Stat label="Gross margin" value={pct(r.revenueT > 0 ? r.grossProfit / r.revenueT * 100 : 0)} sub={"cost " + inr(r.wac.pulse) + " a unit"} />
          <Stat label="Net profit" value={inr(r.netProfit)} tone={TONE_TEXT[r.netProfit >= 0 ? "good" : "bad"]} />
          <Stat label="Cash" value={inr(r.cash)} tone={TONE_TEXT[r.cash < WC_BUFFER ? "bad" : "flat"]} sub={"moved " + inr(r.netCF)} />
          <Stat label="Customers" value={d0(r.customers)} sub={"repeat " + pct(r.repeatRate)} />
          <Stat label="Valuation" value={cr(r.valuation)} tone={TONE_TEXT[prior ? (r.valuation > prior.valuation ? "good" : "bad") : "flat"]} />
          <Stat label="Headcount" value={d0(r.headcount)} sub={"attrition " + pct(r.attritionNext) + " next quarter"} />
        </div>
      </div>

      {r.notes.length > 0 && (
        <Card eyebrow="Events" title="Things that happened without being asked">
          <ul className="space-y-1">{r.notes.map((n, i) => <li key={i} className="text-sm text-stone-700 border-b border-stone-200 pb-1">{n}</li>)}</ul>
        </Card>)}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-white border border-stone-300">
          <header className="border-b border-stone-300 px-4 py-3"><Eyebrow tone="text-rose-800">What went wrong</Eyebrow></header>
          <ul className="p-4 space-y-2">{pm.wrong.map((w, i) => <li key={i} className="text-sm text-stone-800 flex gap-2"><span className="text-rose-700">—</span><span>{w}</span></li>)}</ul>
        </div>
        <div className="bg-white border border-stone-300">
          <header className="border-b border-stone-300 px-4 py-3"><Eyebrow tone="text-teal-800">What went right</Eyebrow></header>
          <ul className="p-4 space-y-2">{pm.right.map((w, i) => <li key={i} className="text-sm text-stone-800 flex gap-2"><span className="text-teal-700">—</span><span>{w}</span></li>)}</ul>
        </div>
      </div>

      {needed && (
        <Card eyebrow="Your biggest bottleneck" title={needed.label}>
          <div className="space-y-3">
            <div><Eyebrow>Why</Eyebrow><p className="text-sm text-stone-800 mt-0.5">{needed.why}</p></div>
            <div><Eyebrow>Impact</Eyebrow><p className="text-sm text-stone-800 mt-0.5">{needed.impact}</p></div>
            <div><Eyebrow>Next quarter</Eyebrow><p className="text-sm text-stone-800 mt-0.5">{needed.next}</p></div>
          </div>
        </Card>)}

      {said && (
        <Card eyebrow="Said, did, needed" title="Were you consistent?">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Eyebrow>You said you would prioritise</Eyebrow><div className="font-serif text-lg mt-1">{said.name}</div></div>
            <div><Eyebrow>What your money actually did</Eyebrow>
              <div className="font-serif text-lg mt-1">{align ? (align.ok ? "Matched it" : "Went elsewhere") : "Nothing committed"}</div>
              <div className="text-xs text-stone-500 font-mono">{align ? align.note : ""}</div></div>
            <div><Eyebrow>What the company needed</Eyebrow><div className="font-serif text-lg mt-1">{needed ? needed.label : "—"}</div>
              <div className="text-xs text-stone-500">{reflection.constraint === (needed && needed.id) ? "You read it correctly." : "You read it differently."}</div></div>
          </div>
        </Card>)}

      <div>
        <Eyebrow tone="text-rose-800">How the quarter narrowed</Eyebrow>
        <h3 className="font-serif text-xl mb-2">The constraint chain</h3>
        <ConstraintChain r={r} />
      </div>

      <Card eyebrow="Management assessment" title="How you ran the company this quarter">
        <div className="grid gap-3 sm:grid-cols-2">
          {assess.map((a) => (
            <div key={a.name} className={"border p-3 " + TONE_CHIP[a.tone]}>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base">{a.name}</span>
                <span className={"text-xs uppercase tracking-widest font-semibold " + TONE_TEXT[a.tone]}>{a.verdict}</span>
              </div>
              <div className="text-xs text-stone-600 mt-1">{a.line}</div>
            </div>))}
        </div>
      </Card>

      <div className="bg-white border border-stone-300">
        {[["pl", "Profit and loss"], ["cf", "Cash flow"], ["bs", "Balance sheet"]].map(([k, label]) => (
          <div key={k} className="border-b border-stone-200 last:border-b-0">
            <button onClick={() => setOpen(open === k ? null : k)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50">
              <span className="font-serif text-base">{label}</span>
              <span className="font-mono text-sm text-stone-500">{open === k ? "−" : "+"}</span>
            </button>
            {open === k && <div className="border-t border-stone-200">
              {k === "pl" && <ProfitAndLoss r={r} />}
              {k === "cf" && <CashFlow r={r} />}
              {k === "bs" && <BalanceSheet eyebrow="Balance sheet" title={"Quarter " + r.q} open={bsFromState(r.entering)} close={bsFromResult(r)} />}
            </div>}
          </div>))}
      </div>

      <button onClick={onNext} className="w-full bg-stone-900 text-white py-4 font-serif text-xl hover:bg-rose-900">
        {r.q === 3 ? "The board has called a meeting" : r.q === 4 ? "See how the year closed" : "Open quarter " + (r.q + 1)}
      </button>
    </div>);
}

/* ============================ CEO PERFORMANCE REPORT ===================== */
function managementProfile(scores) {
  const names = ["Strategic Thinking", "Leadership", "Adaptability", "Systems Thinking", "Risk Management", "Capital Allocation", "Long-Term Thinking"];
  return names.map((n) => {
    const rows = scores.map((s) => s.traits.find((t) => t.name === n)).filter(Boolean);
    const pts = rows.reduce((a, b) => a + b.points, 0), wt = rows.reduce((a, b) => a + b.weight, 0);
    return { name: n, pct: wt ? pts / wt * 100 : 0 };
  }).sort((a, b) => b.pct - a.pct);
}
function styleLabel(history, scores) {
  const h = history;
  const avgSpend = h.reduce((t, r) => t + r.opexSpend + r.capexSpend, 0) / h.length;
  const debt = h.some((r) => r.debtClose > 2000000);
  const prod = h.reduce((t, r) => t + r.A.quality + r.A.innovation + r.A.npd + r.A.design, 0);
  const mktg = h.reduce((t, r) => t + r.marketingSpend, 0) / 100000;
  const waste = h.reduce((t, r) => t + r.wasteFrac, 0) / h.length;
  const endCash = h[h.length - 1].cash;
  if (waste > .25) return { label: "Reactive Manager", why: "Spend consistently ran ahead of the company's ability to convert it — on average " + pct(waste * 100) + " of demand generation had nowhere to land." };
  if (prod > mktg * .6) return { label: "Product-Led Strategist", why: "More went into what the product could do than into telling people about it, and the conversion ceiling stayed ahead of the funnel." };
  if (avgSpend > 9000000 && debt) return { label: "Aggressive Growth Operator", why: "You spent hard and borrowed to do it, betting that scale would arrive before the cash ran out." };
  if (endCash > WC_BUFFER * 4 && avgSpend < 6000000) return { label: "Capital-Conscious Builder", why: "You kept the balance sheet comfortable throughout and grew only as fast as the company could fund itself." };
  if (h.every((r) => r.supplierRel > 80) && h.every((r) => r.cash > WC_BUFFER)) return { label: "Risk-Aware Operator", why: "Reliability and the cash buffer were never allowed to slip, even when that cost you growth." };
  return { label: "Balanced CEO", why: "No single instinct dominated. You moved money between constraints as they appeared rather than committing to one theory of the business." };
}
function findMoments(history, scores, priorities) {
  const T = [];
  history.forEach((r, i) => {
    const q = i + 1;
    const acts = [];
    const A = r.A;
    const top = Object.entries(GROUPS).flatMap(([d, g]) => g.items.map((it) => ({ it, v: groupTotal(A, it) })))
      .sort((a, b) => b.v - a.v)[0];
    if (top && top.v > 0) acts.push("Put " + lakh(top.v) + " into " + top.it.name.toLowerCase());
    if (r.totalHired > 0) acts.push("hired " + d0(r.totalHired));
    if (r.totalFired > 0) acts.push("cut " + d0(r.totalFired));
    if (r.started.length) acts.push("started " + r.started.map((x) => INNO[x].name).join(" and "));
    if (r.drawn > 0) acts.push("drew " + inr(r.drawn) + " of credit");
    if (r.crisis) acts.push("met the " + CRISES[r.crisis.variant].name.toLowerCase());
    const cons = [];
    if (r.leadsWasted > Math.max(60, r.effLeads * .08)) cons.push(d0(r.leadsWasted) + " leads went unworked");
    if (r.unmetDemand > 40) cons.push(d0(r.unmetDemand) + " units of demand went unfilled");
    if (r.ceilingBinding) cons.push("the product capped conversion at " + pct(r.ceiling));
    if (r.cash < WC_BUFFER) cons.push("cash closed below the buffer");
    cons.push(d0(r.unitsSold) + " units, " + cr(r.revenueT) + ", share " + pct(r.marketShare * 100));
    T.push({ q, priority: priorities[i] ? PRIORITY[priorities[i]].name : null,
      decision: acts.join(", ") || "committed almost nothing", consequence: cons.join("; ") });
  });
  return T;
}

/* --------------------- strengths, mistakes and moments ------------------- */
function biggestStrength(scores, history) {
  const prof = managementProfile(scores);
  const best = prof[0];
  const ev = { "Systems Thinking": "You sized the stages of the business against each other rather than funding them in isolation.",
    "Capital Allocation": "Money went where it earned a return, and the balance sheet was never left to chance.",
    "Risk Management": "Cover was bought before it was needed, which is the only time it is available.",
    "Adaptability": "You changed the plan when the evidence changed, rather than defending the previous quarter's decision.",
    "Leadership": "The company kept the people it needed and they were able to deliver what you funded.",
    "Long-Term Thinking": "You funded assets that paid out after the quarter they were bought in.",
    "Strategic Thinking": "You concentrated resources rather than spreading them thin, and said what you were doing before you did it." };
  return { name: best.name, pct: best.pct, why: ev[best.name] };
}
function biggestMistake(scores, history) {
  let worst = null;
  scores.forEach((sc, i) => sc.mods.filter((m) => m.d < 0).forEach((m) => {
    if (!worst || m.d < worst.d) worst = { ...m, q: i + 1 };
  }));
  if (worst) return { title: "Quarter " + worst.q, why: worst.why };
  const prof = managementProfile(scores);
  const w = prof[prof.length - 1];
  return { title: w.name, why: "The weakest of the seven dimensions across the year, at " + d0(w.pct) + "% of the available marks." };
}
function mostImportantDecision(history, priorities) {
  let best = null;
  history.forEach((r, i) => {
    const prev = history[i - 1];
    const swing = prev ? Math.abs(r.valuation - prev.valuation) : r.valuation;
    const A = r.A;
    const top = Object.entries(GROUPS).flatMap(([d, g]) => g.items.map((it) => ({ it, v: groupTotal(A, it) }))).sort((a, b) => b.v - a.v)[0];
    const label = r.started.length ? "starting " + r.started.map((x) => INNO[x].name).join(" and ")
      : r.totalFired > 2 ? "cutting " + d0(r.totalFired) + " roles"
        : r.drawn > 0 ? "drawing " + inr(r.drawn) + " of credit"
          : top && top.v > 0 ? "putting " + lakh(top.v) + " into " + top.it.name.toLowerCase() : "holding the line";
    if (!best || swing > best.swing) best = { q: i + 1, swing, label,
      effect: "Valuation moved " + cr(swing) + " that quarter, to " + cr(r.valuation) + ", on " + d0(r.unitsSold) + " units and " + pct(r.marketShare * 100) + " share." };
  });
  return best;
}
function unexpectedConsequence(history) {
  for (let i = 1; i < history.length; i++) {
    const a = history[i - 1], b = history[i];
    if (a.A.cx + a.A.onboarding < 1 && b.satisfaction < a.satisfaction)
      return { title: "Cutting customer experience came back two quarters later",
        body: "In Q" + i + " you funded almost nothing into support and onboarding. Satisfaction fell from " + d0(a.satisfaction) + " to " + d0(b.satisfaction) + " in Q" + (i + 1) + ", and repeat purchase followed it down — which meant buying customers again through paid acquisition." };
    if (a.leadsWasted > a.effLeads * .15 && b.A.reps > a.A.reps)
      return { title: "The marketing you paid for in Q" + i + " only worked in Q" + (i + 1),
        body: "You generated " + d0(a.effLeads) + " leads in Q" + i + " with capacity for " + d0(a.leadsUsed) + ". By the time you added selling capacity in Q" + (i + 1) + ", the earlier demand was gone. Roughly " + inr(a.marketingSpend * a.leadWasteFrac) + " of it." };
    if (a.A.capex > 3 && b.utilisation < .7)
      return { title: "The plant you bought in Q" + i + " sat half idle in Q" + (i + 1),
        body: "Capacity investment added " + d0(a.capacityAdded) + " units a quarter, but the production run in Q" + (i + 1) + " only used " + pct(b.utilisation * 100) + " of installed capacity. Capital assets do not run themselves." };
    if (a.totalFired > 0 && b.attritionNext > a.attritionNext)
      return { title: "The layoffs in Q" + i + " kept costing you afterwards",
        body: "Cutting " + d0(a.totalFired) + " roles saved salary immediately. Morale fell to " + d0(a.empSat) + " and attrition rose to " + pct(b.attritionNext) + " — so you lost more people you had not chosen to lose." };
    if (a.A.content + a.A.buzz > 3 && b.seoFree + b.buzzFree > 500)
      return { title: "The assets you built in Q" + i + " paid out in Q" + (i + 1),
        body: "Content and buzz spend in Q" + i + " delivered " + d0(b.seoFree + b.buzzFree) + " leads in Q" + (i + 1) + " that cost nothing. Almost nobody funds these because they show no return in the quarter they are bought." };
  }
  return { title: "No single delayed consequence dominated the year",
    body: "Decisions and outcomes stayed close together, which usually means the company was never pushed hard enough for a lag to open up." };
}
function missedOpportunity(history, s) {
  const last = history[history.length - 1];
  if (!s.products.pro.live && history.some((r) => r.A.npd > 0))
    return { title: "The second product was started and never finished",
      body: "New product development reached " + d0(s.npd) + " of 60. Everything spent on it returned nothing, because there is no partial credit — the Pro either goes on sale or it does not." };
  if (!s.innovations.length)
    return { title: "The innovation board was never used",
      body: "Eleven capabilities were available all year, capitalised rather than expensed. Not one was bought, so the conversion ceiling only ever moved at the speed of continuous R&D." };
  if (history.every((r) => r.A.referral < r.referralCapSpend * .5))
    return { title: "Referral was never funded to its cap",
      body: "The cheapest demand in the model, hard-capped at 20% of your customer base, and you left most of it unfunded every quarter." };
  if (last.utilisation < .7)
    return { title: "You never ran the plant you owned",
      body: "The year ended at " + pct(last.utilisation * 100) + " utilisation on " + d0(last.installedCapacity) + " units of installed capacity. The fixed cost of that plant was paid whether it ran or not." };
  if (last.attractShare > last.marketShare * 1.6)
    return { title: "Your position was better than your execution",
      body: "By the close your standing in the category could have reached " + pct(last.attractShare * 100) + " of the market. You converted " + pct(last.marketShare * 100) + ". The gap was capacity and supply, not desirability." };
  return { title: "Little was left on the table",
    body: "The obvious levers were all pulled at some point in the year. What remained was a question of degree rather than omission." };
}

/* ============================ CEO PERFORMANCE REPORT ===================== */
function CeoReport({ ts, eg, scores, history, priorities, s, onRestart }) {
  const last = history[history.length - 1];
  const composite = scores.reduce((a, b) => a + b.final, 0) / Math.max(1, scores.length);
  const band = composite >= 90 ? "Exceptional" : composite >= 75 ? "Strong" : composite >= 60 ? "Competent" : composite >= 40 ? "Weak" : "Poor";
  const prof = managementProfile(scores);
  const style = styleLabel(history, scores);
  const strength = biggestStrength(scores, history);
  const mistake = biggestMistake(scores, history);
  const moment = mostImportantDecision(history, priorities);
  const delayed = unexpectedConsequence(history);
  const missed = missedOpportunity(history, s);
  const timeline = findMoments(history, scores, priorities);
  const acquired = eg && eg.deal === "B";
  const [showFac, setShowFac] = useState(false);
  return (
    <div className="space-y-6">
      <div className="bg-stone-900 text-white p-6">
        <Eyebrow tone="text-rose-400">CEO performance report</Eyebrow>
        <h2 className="font-serif text-4xl mt-1">
          {acquired ? "You sold the company." : eg && eg.gameOver ? "The company did not make it."
            : eg && eg.deal === "A" ? (eg.covenantHit ? "You took the money and hit the covenant." : "You took the money and missed the covenant.")
              : "You finished the year independent."}
        </h2>
        <p className="text-sm text-stone-300 mt-2">{style.why}</p>
        <div className="mt-4 inline-block border border-stone-600 px-3 py-1">
          <Eyebrow tone="text-stone-400">Management style</Eyebrow>
          <div className="font-serif text-xl">{style.label}</div>
        </div>
      </div>

      <Card eyebrow="Final company outcome" title="Where twelve months left the business">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Revenue, final quarter" value={cr(last.revenueT)} sub={d0(last.unitsSold) + " units"} />
          <Stat label="Net profit" value={inr(last.netProfit)} tone={TONE_TEXT[last.netProfit >= 0 ? "good" : "bad"]} />
          <Stat label="Cash" value={inr(last.cash)} tone={TONE_TEXT[last.cash < WC_BUFFER ? "bad" : "flat"]} />
          <Stat label="Customers" value={d0(last.customers)} sub={"repeat " + pct(last.repeatRate)} />
          <Stat label="Market share" value={pct(last.marketShare * 100)} sub={"of a " + d0(last.mktDemand) + "-unit category"} />
          <Stat label="Valuation" value={cr(eg ? eg.finalValuation : last.valuation)} />
          <Stat label="Headcount" value={d0(last.headcount)} sub={"morale " + d0(last.empSat)} />
          <Stat label="Market position" value={pct(last.attractShare * 100)} sub="share your standing could reach" />
        </div>
      </Card>

      <Card eyebrow="Market share" title="Across the year">
        {history.map((h) => (
          <Row key={h.q} label={"Quarter " + h.q} working={d0(h.unitsSold) + " units of a " + d0(h.mktDemand) + "-unit category"}
            value={pct(h.marketShare * 100)} tone={h.shareDelta >= 0 ? "text-teal-800" : "text-rose-800"} />))}
      </Card>

      <Card eyebrow="Management profile" title="How you ran it, across seven dimensions">
        <div className="space-y-3">
          {prof.map((p) => (
            <div key={p.name}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-stone-800">{p.name}</span>
                <span className={"text-xs font-mono " + TONE_TEXT[p.pct >= 70 ? "good" : p.pct >= 45 ? "watch" : "bad"]}>{d0(p.pct)}%</span>
              </div>
              <Bar value={p.pct} max={100} tone={TONE_BAR[p.pct >= 70 ? "good" : p.pct >= 45 ? "watch" : "bad"]} />
            </div>))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card eyebrow="Biggest strength" title={strength.name}><p className="text-sm text-stone-700">{strength.why}</p></Card>
        <Card eyebrow="Biggest mistake" title={mistake.title}><p className="text-sm text-stone-700">{mistake.why}</p></Card>
        <Card eyebrow="Most important decision" title={"Quarter " + moment.q + ": " + moment.label}><p className="text-sm text-stone-700">{moment.effect}</p></Card>
        <Card eyebrow="Unexpected consequence" title={delayed.title}><p className="text-sm text-stone-700">{delayed.body}</p></Card>
        <Card eyebrow="Missed opportunity" title={missed.title} className="lg:col-span-2"><p className="text-sm text-stone-700">{missed.body}</p></Card>
      </div>

      <Card eyebrow="How the year ran" title="Decision and consequence">
        <div className="space-y-3">
          {timeline.map((t) => (
            <div key={t.q} className="border-l-2 border-stone-800 pl-4">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-serif text-lg">Quarter {t.q}</span>
                {t.priority && <span className="text-xs uppercase tracking-widest text-stone-500">said: {t.priority}</span>}
              </div>
              <div className="text-sm text-stone-800 mt-1"><span className="text-stone-500">Decision — </span>{t.decision}</div>
              <div className="text-sm text-stone-700"><span className="text-stone-500">Consequence — </span>{t.consequence}</div>
            </div>))}
        </div>
      </Card>

      {acquired && (
        <Card eyebrow="The reveal" title="What the business was worth if you had kept it">
          <Row label="Offer accepted" working="all cash, signed at the term sheet" value={inr(eg.price)} strong />
          <Row label="True continuation value" working={"Q3 valuation × (1 + momentum of " + d2(ts.M) + ")"} value={inr(ts.trueContinuation)} strong
            tone={eg.gap > 0 ? "text-rose-800" : "text-teal-800"} />
          <Row label={eg.gap > 0 ? "Value left on the table" : "Value captured above continuation"} working="difference"
            value={inr(Math.abs(eg.gap))} strong tone={eg.gap > 0 ? "text-rose-800" : "text-teal-800"} />
        </Card>)}
      {eg && eg.deal === "A" && (
        <Card eyebrow="Covenant settlement" title={eg.covenantHit ? "Covenant met" : "Covenant missed"}>
          <Row label="Target" working={ts.tier === "DISTRESSED" ? "close the quarter solvent" : "units sold"} value={ts.tier === "DISTRESSED" ? "solvency" : d0(eg.covenant) + " units"} />
          <Row label="Delivered" working="quarter four" value={d0(last.unitsSold) + " units"} strong tone={eg.covenantHit ? "text-teal-800" : "text-rose-800"} />
          <Row label="Equity given up" working={eg.covenantHit ? "as signed" : "ratcheted on the miss"} value={pct(eg.equity * 100)} />
          <Row label="Final valuation" working={eg.covenantHit ? "marked up" : "haircut"} value={cr(eg.finalValuation)} strong />
        </Card>)}

      <div className="bg-white border border-stone-300">
        <button onClick={() => setShowFac(!showFac)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50">
          <div><Eyebrow>Facilitator record</Eyebrow>
            <div className="font-serif text-base">Full scoring detail, quarter by quarter</div></div>
          <span className="font-mono text-sm text-stone-500">{showFac ? "−" : "+"}</span>
        </button>
        {showFac && (
          <div className="border-t border-stone-300 p-4 space-y-4">
            <Row label="Composite" working={band + " · mean of the quarters played"} value={d1(composite) + "/100"} strong />
            {scores.map((sc, i) => (
              <div key={i}>
                <Row label={"Quarter " + (i + 1)} working={d1(sc.traitTotal) + " on traits, " + (sc.modTotal >= 0 ? "+" : "") + d0(sc.modTotal) + " modifiers · declared: " + (priorities[i] ? PRIORITY[priorities[i]].name : "—")} value={d1(sc.final) + " · " + sc.band} strong />
                <ul className="pl-4 py-1 space-y-0.5">
                  {sc.mods.map((m, j) => <li key={j} className={"text-xs font-mono " + (m.d > 0 ? "text-teal-800" : "text-rose-800")}>{(m.d > 0 ? "+" : "") + m.d} {m.why}</li>)}
                </ul>
              </div>))}
            <BalanceSheet eyebrow="Full year" title="Opening to closing" open={bsFromState(history[0].entering)} close={bsFromResult(last)} />
          </div>)}
      </div>

      <button onClick={onRestart} className="w-full bg-stone-900 text-white py-4 font-serif text-xl hover:bg-rose-900">Run the year again</button>
    </div>);
}

/* ============================ THE PRODUCT PIPELINE ========================
   Everything the product could become, everything being built, and everything
   already selling — read from the same state the engine runs on.
   ========================================================================== */
function pipelineModel(s, p, startInno) {
  const owned = s.innovations;
  const inFlight = Object.keys(s.pipeline);
  const starting = startInno || [];
  const backlog = INNOVATIONS.filter((m) => owned.indexOf(m.id) < 0 && inFlight.indexOf(m.id) < 0 && starting.indexOf(m.id) < 0);
  const landingNow = p ? p.landed : [];
  const items = [];

  // the second product, if it is not on sale yet
  if (!s.products.pro.live) {
    const NPD_TARGET = 60; // real completion point -- rescaled to a 0-100 display below
    const now = s.npd, after = p ? p.npd : now, gain = Math.max(0, after - now);
    const left = Math.max(0, NPD_TARGET - after);
    items.push({ kind: "product", id: "pro", name: PRODUCTS[1].name, tag: "New product",
      stage: p && p.proLaunching ? "ready" : after > 0 ? "development" : "idea",
      pct: clamp(after / NPD_TARGET * 100, 0, 100), label: "Development progress",
      eta: p && p.proLaunching ? "Goes on sale next quarter"
        : gain > 0.5 ? "About " + Math.max(1, Math.ceil(left / gain)) + " more quarter(s) at this rate"
          : now > 0 ? "Stalled — nothing funded this quarter" : "Not started",
      note: "Sells at " + inr(PRODUCTS[1].refPrice) + " and uses " + d1(PRODUCTS[1].capacityCost) + " units of line capacity each. " +
        "A single well-funded quarter of New Product Development (roughly \u20b925,00,000) is enough on its own to clear " +
        "development and go on sale the quarter after — provided Engineering was already staffed before this quarter. " +
        "Hiring and funding NPD in the same quarter needs a bit more, since new hires ramp up gradually.",
      warn: gain <= 0.5 && now > 0 });
  }
  // innovation cards already in development
  inFlight.forEach((id) => {
    const m = INNO[id], left = s.pipeline[id];
    items.push({ kind: "inno", id, name: m.name, tag: m.cat, stage: left <= 1 ? "ready" : "development",
      pct: clamp((m.lead - left + 1) / (m.lead + 1) * 100, 0, 100), label: "Engineering progress",
      eta: left <= 1 ? "Ships at the end of this quarter" : left + " quarters remaining",
      note: m.blurb, warn: false });
  });
  // cards being started this quarter
  starting.forEach((id) => {
    const m = INNO[id];
    items.push({ kind: "inno", id, name: m.name, tag: m.cat, stage: m.lead > 0 ? "development" : "ready",
      pct: m.lead > 0 ? 8 : 100, label: "Starting this quarter",
      eta: m.lead > 0 ? "Lands in " + m.lead + " quarter(s)" : "Ships at the end of this quarter",
      note: inr(m.cost) + " capitalised. " + m.blurb, warn: false });
  });
  // what is on sale
  PRODUCTS.filter((x) => s.products[x.id].live).forEach((x) => {
    const pd = s.products[x.id];
    items.push({ kind: "live", id: x.id, name: x.name, tag: pd.status === "active" ? "Selling" : pd.status,
      stage: "live", pct: 100, label: "On the market",
      eta: inr(pd.price) + " · " + d0(num(pd.inv)) + " units in stock",
      note: x.blurb, warn: pd.status !== "active" });
  });
  return { backlog, items, counts: {
    idea: backlog.length,
    development: inFlight.length + starting.filter((id) => INNO[id].lead > 0).length + (!s.products.pro.live && (p ? p.npd : s.npd) > 0 && !(p && p.proLaunching) ? 1 : 0),
    ready: starting.filter((id) => INNO[id].lead === 0).length + inFlight.filter((id) => s.pipeline[id] <= 1).length + (p && p.proLaunching ? 1 : 0),
    live: owned.length + PRODUCTS.filter((x) => s.products[x.id].live).length,
  } };
}

const STAGE_DEF = [
  { id: "idea", n: 1, label: "On the board", sub: "available, not started" },
  { id: "development", n: 2, label: "In development", sub: "funded, not yet shipped" },
  { id: "ready", n: 3, label: "Ships this quarter", sub: "lands at quarter end" },
  { id: "live", n: 4, label: "Shipped and selling", sub: "in the product now" },
];
const STAGE_TONE = { idea: "bg-stone-700", development: "bg-amber-700", ready: "bg-teal-800", live: "bg-stone-900" };

/* Clean line-art watch illustrations -- deliberately not photos of any real branded product,
   so nothing here is mistaken for (or borrowed from) an actual competitor's device. Styled to
   match the app's own serif/stone/rose palette rather than looking like a stock photo dropped in. */
function WatchIllustration({ variant = "pulse", size = 96 }) {
  const isPro = variant === "pro";
  const face = isPro ? "#292524" : "#44403c";       // stone-800 / stone-700
  const accent = isPro ? "#9f1239" : "#78716c";      // rose-800 / stone-500
  const strap = "#d6d3d1";                            // stone-300
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="4" width="36" height="18" rx="4" fill={strap} />
      <rect x="30" y="74" width="36" height="18" rx="4" fill={strap} />
      <rect x="18" y="20" width="60" height="56" rx={isPro ? 14 : 20} fill={face} />
      <rect x="26" y="28" width="44" height="40" rx={isPro ? 8 : 14} fill="#f5f5f4" opacity="0.08" />
      <circle cx="48" cy="48" r="17" fill="#1c1917" />
      <circle cx="48" cy="48" r="17" fill="none" stroke={accent} strokeWidth="2" />
      {isPro && <circle cx="48" cy="48" r="10" fill="none" stroke={accent} strokeWidth="1" opacity="0.6" />}
      <rect x="76" y="40" width="6" height="10" rx="2" fill={face} />
      {isPro && <rect x="76" y="54" width="6" height="7" rx="2" fill={face} />}
    </svg>
  );
}

/* ==================================== MECHANICS GLOSSARY =================================== */
/* REMOVED: a FacilitatorGuide component with the same purpose already exists further down this
   file, properly wired to its own "guide" phase with navigation. This duplicate block is
   intentionally left empty rather than deleted outright, so a diff against the delivered file
   shows exactly what was added and then retracted, and why. */

function ProductPipeline({ s, p, last, startInno, alloc }) {
  const model = pipelineModel(s, p, startInno);
  const A = parseAlloc(alloc);
  const delta = (now, before) => {
    if (before === undefined || before === null) return null;
    const d = now - before;
    return Math.abs(d) < 0.05 ? null : { up: d > 0, txt: (d > 0 ? "+" : "") + d1(d) };
  };
  const scores = [
    { label: "Innovation score", value: d0(p ? p.innovation : s.innovation), unit: "", d: delta(p ? p.innovation : s.innovation, last ? last.innovation : null) },
    { label: "Product quality", value: d0(p ? p.quality : s.quality), unit: "", d: delta(p ? p.quality : s.quality, last ? last.quality : null) },
    { label: "Conversion ceiling", value: p ? pct(p.ceiling) : "—", unit: "", d: delta(p ? p.ceiling : null, last ? last.ceiling : null) },
    { label: "Defect rate", value: p ? pct(p.defectRate) : "—", unit: "", d: delta(p ? p.defectRate : null, last ? last.defectRate : null), lowerBetter: true },
  ];
  const rndSpend = (A.quality + A.innovation + A.npd + A.design) * 100000;
  const innoSpend = (startInno || []).reduce((t, id) => t + INNO[id].cost, 0);
  const engBand = p ? p.staffing.engineering : 1;
  const quartersLeft = 5 - s.quarter;

  /* what these choices move — direction only, no outcome forecast */
  const ceilMove = innoSum(startInno.filter((id) => INNO[id].lead === 0), "ceiling")
    + innoSum(Object.keys(s.pipeline).filter((id) => s.pipeline[id] <= 1), "ceiling")
    + (p && last ? p.ceiling - last.ceiling : (p ? p.ceiling - 22 : 0));
  const costMove = innoSum(startInno, "cogs") - 40 * pw(A.design, .5);
  const brandMove = innoSum(startInno, "brand") + 1.8 * pw(A.design, .5);
  const satMove = innoSum(startInno, "satisfaction");
  const band = (v, hi, mid) => (Math.abs(v) >= hi ? "High" : Math.abs(v) >= mid ? "Medium" : Math.abs(v) > 0.01 ? "Low" : "None");
  const impacts = [
    { label: "Conversion ceiling", v: ceilMove, band: band(ceilMove, 5, 2), good: ceilMove > 0 },
    { label: "Cost per unit", v: costMove, band: band(costMove, 300, 120), good: costMove < 0 },
    { label: "Brand value", v: brandMove, band: band(brandMove, 6, 2), good: brandMove > 0 },
    { label: "Customer satisfaction", v: satMove, band: band(satMove, 4, 2), good: satMove > 0 },
    { label: "Time to a second product", v: A.npd, band: band(A.npd, 6, 3), good: A.npd > 0 },
  ];

  return (
    <div className="space-y-4">
      <Card eyebrow="Product focus" title="Build the right product, and know what state it is in">
        <div className="grid gap-4 sm:grid-cols-4">
          {scores.map((sc) => (
            <div key={sc.label} className="border-l-2 border-stone-300 pl-3">
              <Eyebrow>{sc.label}</Eyebrow>
              <div className="font-mono text-2xl leading-tight">{sc.value}</div>
              {sc.d && (
                <div className={"text-xs font-mono " + ((sc.lowerBetter ? !sc.d.up : sc.d.up) ? "text-teal-700" : "text-rose-700")}>
                  {(sc.lowerBetter ? !sc.d.up : sc.d.up) ? "▲" : "▼"} {sc.d.txt} vs last quarter
                </div>)}
            </div>))}
        </div>
      </Card>

      <div className="bg-white border border-stone-300">
        <header className="border-b border-stone-300 px-4 py-3">
          <Eyebrow tone="text-rose-800">Product pipeline</Eyebrow>
          <h3 className="font-serif text-lg">Where everything stands</h3>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 border-b border-stone-200">
          {STAGE_DEF.map((st) => (
            <div key={st.id} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={"w-5 h-5 flex items-center justify-center text-xs font-mono text-white " + STAGE_TONE[st.id]}>{st.n}</span>
                <span className="text-sm font-semibold text-stone-900">{st.label}</span>
              </div>
              <div className="font-mono text-2xl mt-1">{model.counts[st.id]}</div>
              <div className="text-xs text-stone-500">{st.sub}</div>
            </div>))}
        </div>
        <div className="p-4">
          {model.counts.development + model.counts.ready === 0 && (
            <div className="border-l-4 border-amber-600 bg-amber-50 px-3 py-2 mb-3 text-sm text-stone-800">
              Nothing is in development. The product will only improve at the speed of continuous R&amp;D, and the
              conversion ceiling moves with it — which is what caps every rupee sales and marketing spend.
            </div>)}
          {model.items.length === 0 ? (
            <p className="text-sm text-stone-500">Nothing to show yet.</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {model.items.map((it) => (
                <div key={it.kind + it.id} className={"border p-3 " + (it.warn ? "border-amber-600 bg-amber-50" : it.stage === "live" ? "border-stone-300 bg-stone-50" : "border-stone-300 bg-white")}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-serif text-base leading-snug">{it.name}</div>
                    <span className={"px-1.5 py-0.5 text-xs uppercase tracking-widest shrink-0 " +
                      (it.stage === "live" ? "bg-stone-900 text-white" : it.stage === "ready" ? "bg-teal-800 text-white" : "bg-amber-700 text-white")}>{it.tag}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-stone-500">{it.label}</span><span>{d0(it.pct)}%</span>
                    </div>
                    <Bar value={it.pct} max={100} tone={it.stage === "live" ? "bg-stone-800" : it.stage === "ready" ? "bg-teal-700" : "bg-amber-600"} />
                  </div>
                  <div className={"text-xs font-mono mt-2 " + (it.warn ? "text-amber-800" : "text-stone-700")}>{it.eta}</div>
                  <div className="text-xs text-stone-500 mt-1 leading-snug">{it.note}</div>
                </div>))}
            </div>)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow="Resources and constraints" title="What engineering can actually absorb">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm"><span>R&amp;D committed this quarter</span>
                <span className="font-mono">{inr(rndSpend + innoSpend)}</span></div>
              <div className="text-xs text-stone-500 font-mono">{inr(rndSpend)} expensed, {inr(innoSpend)} capitalised to the balance sheet</div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Engineering bandwidth</span>
                <span className={"font-mono " + TONE_TEXT[engBand >= .999 ? "good" : engBand >= .85 ? "watch" : "bad"]}>{pct(engBand * 100)}</span></div>
              <Bar value={engBand * 100} max={100} tone={TONE_BAR[engBand >= .999 ? "good" : engBand >= .85 ? "watch" : "bad"]} />
              <div className="text-xs text-stone-500 mt-1">
                {engBand >= .999 ? "The team can deliver everything you have funded."
                  : "Every rupee of quality, innovation and new product work is delivering " + pct(engBand * 100) + " of what you paid for. Hire engineers or fund less."}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Cards left on the board</span>
                <span className="font-mono">{model.backlog.length} of {INNOVATIONS.length}</span></div>
              <div className="text-xs text-stone-500">Cheapest unstarted: {model.backlog.length ? model.backlog.reduce((a, b) => (a.cost < b.cost ? a : b)).name + " at " + inr(model.backlog.reduce((a, b) => (a.cost < b.cost ? a : b)).cost) : "everything is started or shipped"}</div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Time left in the year</span>
                <span className="font-mono">{quartersLeft} quarter{quartersLeft === 1 ? "" : "s"}</span></div>
              <div className="text-xs text-stone-500">
                Anything with a lead time started after Q3 will not ship before the year closes.
              </div>
            </div>
          </div>
        </Card>

        <Card eyebrow="Decision impact" title="What these product choices move">
          <p className="text-xs text-stone-500 mb-3">
            Direction and magnitude of the product decisions on this screen. Not a forecast of the quarter.
          </p>
          <div className="space-y-2">
            {impacts.map((im) => (
              <div key={im.label} className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                <span className="text-sm text-stone-800">{im.label}</span>
                <span className={"text-xs uppercase tracking-widest font-semibold " +
                  (im.band === "None" ? "text-stone-400" : im.good ? "text-teal-800" : "text-rose-800")}>
                  {im.band === "None" ? "—" : (im.good ? "▲ " : "▼ ") + im.band}
                </span>
              </div>))}
          </div>
          {p && p.ceilingBinding && (
            <div className="mt-3 border-l-4 border-rose-700 bg-rose-50 px-3 py-2 text-xs text-rose-900">
              The product is the binding constraint right now. Selling harder cannot help until this moves.
            </div>)}
        </Card>
      </div>
    </div>);
}

/* ================================== INTRO ================================= */
function Intro({ onStart }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Eyebrow tone="text-rose-800">Four quarters. One company. You.</Eyebrow>
        <h1 className="font-serif text-5xl text-stone-900 leading-none mt-2">Nadi Wear</h1>
        <p className="font-mono text-sm text-stone-500 mt-2">Pvt. Ltd. · Bengaluru, Karnataka</p>
      </div>
      <p className="text-lg text-stone-700 leading-relaxed">
        You are the chief executive. The company sells a smartwatch called the Nadi Pulse at {inr(9999)},
        has four thousand customers, fourteen people and {inr(OPENING_CASH)} in the bank. The category
        buys about {d0(marketDemand(1))} units a quarter and you are a small part of that. Three funded
        competitors would like you to stay small.
      </p>
      <Card eyebrow="How this works" title="Four decisions a quarter, and one you cannot take back">
        <p className="text-sm text-stone-600">
          Each quarter opens with a briefing: what changed, what is holding the company back, and what
          everyone around you wants. You declare a priority, make your decisions, and close the quarter.
          Then you find out what actually happened.
        </p>
        <p className="text-sm text-stone-600 mt-3">
          You will not be shown your revenue before you commit. You will be shown pressure — where the
          company is tight, where it has room — and you will have to decide with that. That is the
          situation the job is actually conducted in.
        </p>
      </Card>
      <Card eyebrow="What is being assessed" title="Judgment, not arithmetic">
        <p className="text-sm text-stone-600">
          Every quarter you say what you are prioritising and what you are giving up. At the close, those
          are compared with what your money actually did and what the company turned out to need.
          Consequences arrive late and out of order, which is the point.
        </p>
      </Card>
      <Card eyebrow="How you'll be judged" title="Seven things, every quarter">
        <p className="text-sm text-stone-600 mb-3">
          You'll see a verdict on each of these after every quarter closes — not just at the end. None of
          them are measured by a single number you can chase; they're read from the pattern of what you
          actually funded, what you said you were doing, and what happened next.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div><span className="font-semibold text-stone-900">Strategic Thinking</span> — <span className="text-stone-600">did you concentrate resources on a stated plan, or spread them thin and hope?</span></div>
          <div><span className="font-semibold text-stone-900">Systems Thinking</span> — <span className="text-stone-600">did you size departments against each other, or fund them in isolation?</span></div>
          <div><span className="font-semibold text-stone-900">Risk Management</span> — <span className="text-stone-600">did you buy cover before you needed it, which is the only time it's available?</span></div>
          <div><span className="font-semibold text-stone-900">Capital Allocation</span> — <span className="text-stone-600">did money go where it earned a return?</span></div>
          <div><span className="font-semibold text-stone-900">Adaptability</span> — <span className="text-stone-600">did you change the plan when the evidence changed?</span></div>
          <div><span className="font-semibold text-stone-900">Leadership</span> — <span className="text-stone-600">did the company keep the people it needed to deliver what you funded?</span></div>
          <div><span className="font-semibold text-stone-900">Long-Term Thinking</span> — <span className="text-stone-600">did you fund anything that only pays out after the quarter you bought it in?</span></div>
        </div>
      </Card>
      <Card eyebrow="Before you start" title="Ground rules">
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-4">
          <li>You'll be told the situation and your options. You will not be told the exact formula behind
          them — reading your own results correctly is part of the job, not a step before it.</li>
          <li>Once a quarter is closed, the decision stands — the company moves on to the next one. You may
          go back and re-decide the immediately preceding quarter, but only twice across the whole simulation,
          so use it for a genuine misread, not to keep re-rolling for a better number.</li>
          <li>Quarter 3 brings a real event, not a scripted one you're meant to see coming. How you'd
          prepared for it in the quarters before is what actually determines how much it costs you.</li>
          <li><b className="text-stone-900">Headcount is not decoration.</b> Every department runs at a
          fraction of what its budget alone would produce if it's understaffed for what you're asking of
          it — sometimes well under half. Money and people are two separate decisions. Fund both, or the
          first one won't show up in the results the way you'd expect.</li>
        </ul>
      </Card>
      <button onClick={onStart} className="w-full bg-rose-800 text-white py-4 font-serif text-xl hover:bg-rose-900">Take the job</button>
    </div>);
}

/* ============================ FACILITATOR GUIDE ===========================
   For whoever is running the exercise, not shown to students during play.
   Explains the mechanisms in plain language -- no formulas, no exact numbers
   a student could use to reverse-engineer the "right" allocation.
   ========================================================================== */
function FacilitatorGuide({ onBack }) {
  const items = [
    { q: "Why did a smaller budget sometimes score higher than a bigger one?",
      a: "Every department has a real ceiling on how much a given rupee amount can achieve this quarter -- Sales can only handle so many leads, a factory can only run so much of what's already been built, and Marketing specifically stops earning more attention past a certain spend level, no matter how much more is poured in. Spending past any of these ceilings doesn't just do nothing -- it actively costs the score, because the model treats an unusable rupee as a real decision quality problem, not a neutral one." },
    { q: "What's the difference between 'not enough Sales capacity' and 'Marketing stopped paying off'?",
      a: "These look similar to a student (both show up as wasted marketing spend) but have opposite fixes. If Sales or stock is the limit, the fix is funding Sales or Operations more. If the Marketing spend itself has crossed its own ceiling, funding Sales won't help at all -- the leads were never real to begin with. The simulation now flags these as two distinct notes so a team can tell which problem they actually have." },
    { q: "Why does the same crisis hit some teams harder than others?",
      a: "Every market event this quarter is calibrated against something the company already built in an earlier quarter -- product quality, supplier relationships, or similar. A team that invested there sees the event mostly absorbed 'for free.' A team that didn't gets the full hit. This is deliberate: it's testing whether a team's earlier, less glamorous investments were real, not just testing their reaction speed this quarter." },
    { q: "Why do the Term Sheet offers differ so much between teams?",
      a: "The Q4 financing offer is calculated from that specific team's own trajectory, not a fixed script. A team with strong, improving results gets a bigger, better-termed offer than a team that struggled -- and one path (the acquisition offer) is deliberately calibrated to look more attractive the stronger a team's momentum is, while actually undervaluing that same momentum. It rewards teams who check the math rather than just the headline number." },
    { q: "What does 'market share' actually reward, if not just spending on Marketing?",
      a: "Marketing spend earns attention only up to a point, after which it's flat. What keeps earning, with no ceiling, is everything that makes the product itself genuinely more compelling -- product quality, ongoing innovation, brand-building (not just paid ads), and customer satisfaction. A team chasing market share by only spending more on ads will plateau; a team building the underlying product and brand will keep climbing." },
    { q: "What is the rewind allowed to do, and what is it not meant to teach?",
      a: "Each team may rewind to the start of the immediately preceding quarter, twice across the whole simulation, discarding that quarter's result and re-deciding it. This is meant to let a team recover from a genuine misread of the interface or a clear mechanical mistake -- not to let them iteratively guess their way to a perfect score. Consider debriefing on WHY a team chose to use a rewind, not just what they changed -- that reasoning is often more revealing than the final number." },
  ];
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Eyebrow tone="text-rose-800">Facilitator Guide</Eyebrow>
        <h1 className="font-serif text-3xl">What's actually happening underneath</h1>
        <p className="text-stone-600 mt-2">Not shown to students during play. Use this after a run to explain the
          mechanisms behind what a team just experienced -- no exact formulas, just how to read the results.</p>
      </div>
      {items.map((it, i) => (
        <div key={i} className="bg-white border border-stone-200 p-5">
          <h3 className="font-serif text-lg mb-2">{it.q}</h3>
          <p className="text-sm text-stone-700 leading-relaxed">{it.a}</p>
        </div>
      ))}
      <button onClick={onBack} className="w-full bg-stone-900 text-white py-3 font-serif text-lg hover:bg-rose-900">
        Back
      </button>
    </div>);
}

/* ==================================== APP ================================= */

export default function NadiWearSimulation() {
  const [phase, setPhase] = useState("intro");
  const [guideReturnPhase, setGuideReturnPhase] = useState("intro");
  const [snapshots, setSnapshots] = useState([INITIAL]);
  const [rewindsUsed, setRewindsUsed] = useState(0);
  const [s, setS] = useState(INITIAL);
  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [alloc, setAlloc] = useState(blankAlloc());
  const [warranty, setWarranty] = useState("6mo");
  const [payTerms, setPayTerms] = useState("net30");
  const [startInno, setStartInno] = useState([]);
  const [products, setProducts] = useState(INITIAL.products);
  const [priority, setPriority] = useState(null);
  const [reflection, setReflection] = useState({ sacrifice: [] });
  const [advanced, setAdvanced] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [variant, setVariant] = useState(() => "ABCD"[Math.floor(Math.random() * 4)]);
  const [choice, setChoice] = useState(null);
  const [ts, setTs] = useState(null);
  const [deal, setDeal] = useState(null);
  const [eg, setEg] = useState(null);
  const [result, setResult] = useState(null);

  const crisisLive = s.quarter >= 3;
  const A = parseAlloc(alloc);

  /* the engine runs live so the company can react, but only pressure is shown */
  const projection = useMemo(() => {
    try { return runQuarter(s, alloc, warranty, crisisLive && choice ? { variant, choice } : null, startInno, payTerms, products); }
    catch (e) { return null; }
  }, [s, alloc, warranty, crisisLive, choice, variant, startInno, payTerms, products]);

  const last = history[history.length - 1];
  const prior = history[history.length - 2];
  const health = useMemo(() => companyHealth(s, last), [s, last]);
  const changes = useMemo(() => whatChanged(prior, last, s), [prior, last, s]);
  const constraintPrev = useMemo(() => detectConstraint(last, s), [last, s]);
  const constraintNow = useMemo(() => detectConstraint(projection, s), [projection, s]);
  const board = useMemo(() => boardPressure(s, last, history), [s, last, history]);
  const dirs = useMemo(() => directional(projection, s), [projection, s]);
  const inbox = useMemo(() => buildInbox(projection, s, history, false), [projection, s, history]);

  const budget = useMemo(() => {
    const p = projection;
    const opex = opexLakhs(A) * 100000, capex = capexLakhs(A) * 100000;
    const inno = startInno.reduce((t, id) => t + INNO[id].cost, 0);
    const people = p ? p.peopleCost : 0;
    const repay = A.repay * 100000, drawn = p ? p.drawn : 0;
    const fixed = p ? p.salaries + p.overhead : salaryOf(s.staff) + s.overhead;
    return { opex, capex, inno, people, repay, drawn, committed: opex + capex + inno + people + repay,
      ceiling: Math.max(0, s.cash + num(s.pendingInvestment) + drawn - fixed - WC_BUFFER) };
  }, [projection, alloc, startInno, s]);

  const ctx = { s, A, alloc,
    mk: projection ? projection.staffing.marketing : 1, sl: projection ? projection.staffing.sales : 1,
    en: projection ? projection.staffing.engineering : 1, op: projection ? projection.staffing.operations : 1,
    sp: projection ? projection.staffing.support : 1, ad: projection ? projection.staffing.admin : 1 };

  const urgent = inbox.filter((m) => m.tone === "critical").length;
  const tabs = [
    { id: "dashboard", label: "Company", badge: urgent },
    ...Object.keys(DEPT_META).map((k) => ({ id: k, label: DEPT_META[k].label })),
    ...(crisisLive ? [{ id: "crisis", label: "Market event", hot: true }] : []),
    { id: "review", label: "Close the quarter" },
  ];

  const reset = () => {
    setPhase("intro"); setS(INITIAL); setHistory([]); setScores([]); setPriorities([]); setReflections([]);
    setAlloc(blankAlloc()); setWarranty("6mo"); setPayTerms("net30"); setStartInno([]);
    setProducts(INITIAL.products); setPriority(null); setReflection({ sacrifice: [] }); setTab("dashboard");
    setChoice(null); setTs(null); setDeal(null); setEg(null); setResult(null);
    setSnapshots([INITIAL]); setRewindsUsed(0);
    setVariant("ABCD"[Math.floor(Math.random() * 4)]);
  };
  const closeQuarter = () => {
    const r = runQuarter(s, alloc, warranty, crisisLive ? { variant, choice } : null, startInno, payTerms, products);
    let q4mods = [];
    if (s.quarter === 4 && ts && deal) { const e = resolveEndgame(ts, deal, r); q4mods = e.mods; setEg(e); }
    const sc = scoreQuarter(r, last || null, reflection, priority, constraintNow, budget.ceiling, q4mods);
    setResult(r); setHistory([...history, r]); setScores([...scores, sc]);
    setPriorities([...priorities, priority]); setReflections([...reflections, reflection]);
    setPhase("closed");
  };
  const advance = () => {
    const r = result;
    setS(r.next); setAlloc(blankAlloc()); setWarranty("6mo"); setStartInno([]);
    setProducts(r.next.products); setPayTerms(r.next.payTerms); setPriority(null);
    setReflection({ sacrifice: [] }); setAdvanced(false); setTab("dashboard");
    setSnapshots([...snapshots, r.next]);
    if (r.q === 3) { setTs(buildTermSheet(history, r.next)); setPhase("termsheet"); }
    else if (r.q === 4) setPhase("final"); else setPhase("briefing");
  };
  const canRewind = rewindsUsed < 2 && history.length > 0 && !ts;
  const rewind = () => {
    if (!canRewind) return;
    const targetQ = history.length; // rewinding the most recently closed quarter
    const priorState = snapshots[targetQ - 1]; // state as it was BEFORE that quarter ran
    setS(priorState);
    setHistory(history.slice(0, -1));
    setScores(scores.slice(0, -1));
    setPriorities(priorities.slice(0, -1));
    setReflections(reflections.slice(0, -1));
    setSnapshots(snapshots.slice(0, -1));
    setRewindsUsed(rewindsUsed + 1);
    setAlloc(blankAlloc()); setWarranty("6mo"); setStartInno([]);
    setProducts(priorState.products); setPayTerms(priorState.payTerms); setPriority(null);
    setReflection({ sacrifice: [] }); setAdvanced(false); setTab("dashboard");
    setTs(null); setDeal(null); setEg(null);
    setPhase("briefing");
  };
  const acceptDeal = (id) => {
    setDeal(id);
    const offer = ts.offers.find((o) => o.id === id);
    if (id === "B") {
      const e = resolveEndgame(ts, "B", null); setEg(e);
      const sc = scores.slice(); const l = sc[sc.length - 1];
      const add = e.mods.reduce((a, b) => a + b.d, 0);
      sc[sc.length - 1] = { ...l, mods: [...l.mods, ...e.mods], modTotal: l.modTotal + add, final: l.final + add };
      setScores(sc); setPhase("final"); return;
    }
    if (id === "A") setS((x) => ({ ...x, pendingInvestment: offer.investment }));
    setPhase("briefing"); setTab("dashboard");
  };

  const shell = (children, nav) => (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl">Nadi Wear</span>
            <span className="text-xs uppercase tracking-widest text-stone-500">Chief Executive</span>
          </div>
          {nav && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-sm">
              <span><span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Quarter</span>{s.quarter}/4</span>
              <span><span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Cash</span>{inr(s.cash)}
                {s.pendingInvestment > 0 && <span className="text-teal-300 ml-1">+{inr(s.pendingInvestment)} pending</span>}</span>
              {priority && <span className="text-teal-300"><span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Priority</span>{PRIORITY[priority].name}</span>}
              <span className={budget.committed > budget.ceiling ? "text-rose-400" : "text-stone-300"}>
                <span className="text-stone-500 text-xs uppercase tracking-widest mr-2">Left</span>{inr(budget.ceiling - budget.committed)}</span>
            </div>)}
        </div>
        {nav && (
          <nav className="border-t border-stone-700">
            <div className="max-w-6xl mx-auto px-2 flex overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={"px-3 py-2 text-sm whitespace-nowrap border-b-2 flex items-center gap-1.5 " +
                    (tab === t.id ? "border-rose-500 text-white" : t.hot ? "border-transparent text-rose-400 hover:text-rose-200" : "border-transparent text-stone-400 hover:text-white")}>
                  {t.label}{t.badge > 0 && <span className="px-1.5 bg-rose-700 text-white text-xs font-mono">{t.badge}</span>}
                </button>))}
            </div>
          </nav>)}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="max-w-6xl mx-auto px-4 pb-10 pt-2 text-xs text-stone-400 font-mono flex items-center justify-between">
        <span>Teaching simulation. All figures fictional.</span>
        <button onClick={() => { setGuideReturnPhase(phase); setPhase("guide"); }}
          className="underline hover:text-stone-600">Facilitator guide</button>
      </footer>
    </div>);

  if (phase === "guide") return shell(<FacilitatorGuide onBack={() => setPhase(guideReturnPhase)} />, false);

  if (phase === "intro") return shell(<Intro onStart={() => setPhase("briefing")} />, false);
  if (phase === "briefing") return shell(
    <CeoBriefing s={s} history={history} health={health} changes={changes} constraint={constraintPrev}
      board={board} priority={priority} setPriority={setPriority} onStart={() => { setPhase("play"); setTab("dashboard"); }}
      canRewind={canRewind} rewindsUsed={rewindsUsed} onRewind={rewind} ts={ts} />, false);
  if (phase === "closed") return shell(
    <QuarterClose r={result} prior={prior} sc={scores[scores.length - 1]} constraint={detectConstraint(result, s)}
      priority={priorities[priorities.length - 1]} reflection={reflections[reflections.length - 1] || {}} onNext={advance} />, false);
  if (phase === "termsheet") return shell(<TermSheetScreen ts={ts} onAccept={acceptDeal} />, false);
  if (phase === "final") return shell(
    <CeoReport ts={ts} eg={eg} scores={scores} history={history} priorities={priorities} s={s} onRestart={reset} />, false);

  let body;
  if (tab === "dashboard") body = (
    <Dashboard s={s} history={history} health={health} constraint={constraintNow} dirs={dirs} inbox={inbox}
      priority={priority} budget={budget} onGo={() => setTab("review")} />);
  else if (tab === "crisis") body = (
    <div className="space-y-5">
      <Directional dirs={dirs} only={["demand", "position", "production"]} />
      <CrisisPanel s={s} variant={variant} choice={choice} setChoice={setChoice} alloc={alloc} setAlloc={setAlloc}
        locked={s.quarter === 4} budget={budget} />
    </div>);
  else if (tab === "review") body = (
    <div className="space-y-5">
      <div><Eyebrow tone="text-rose-800">Before you commit</Eyebrow>
        <h2 className="font-serif text-3xl">Close quarter {s.quarter}</h2></div>
      <Directional dirs={dirs} />
      <Card eyebrow="Likely effect" title="What this plan looks like from here">
        <p className="text-sm text-stone-600">
          You will not see the revenue, profit or cash until the quarter closes. What you can see is where the
          plan is tight and where it has room, above. If three of those read CONSTRAINED or CRITICAL, the
          quarter will probably disappoint you somewhere.
        </p>
      </Card>
      <Inbox messages={inbox} limit={4} eyebrow="Still outstanding" title="What your team is still saying" />
      <Reflection constraint={constraintNow} reflection={reflection} setR={setReflection} priority={priority} alloc={alloc} />
      <BudgetStrip budget={budget} />
      {budget.committed > budget.ceiling && (
        <div className="border-l-4 border-rose-700 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          You are {inr(budget.committed - budget.ceiling)} beyond what the balance sheet supports. You can still
          commit — the buffer takes it, and the record will show it.
        </div>)}
      {crisisLive && !choice && (
        <div className="border-l-4 border-amber-600 bg-amber-50 px-4 py-3 text-sm text-stone-800">
          There is a market event live and you have not decided how to answer it.
        </div>)}
      <button onClick={closeQuarter} disabled={(crisisLive && !choice) || !reflectionComplete(reflection)}
        className={"w-full py-4 font-serif text-xl " + ((crisisLive && !choice) || !reflectionComplete(reflection) ? "bg-stone-200 text-stone-400" : "bg-stone-900 text-white hover:bg-rose-900")}>
        {!reflectionComplete(reflection) ? "Answer the questions above to close the quarter" : "Close quarter " + s.quarter}
      </button>
    </div>);
  else {
    const extraTop = tab === "rnd" ? <><ProductPipeline s={s} p={projection} last={last} startInno={startInno} alloc={alloc} />
        <ProductManager s={s} products={products} setProducts={setProducts} p={projection} /></>
      : tab === "hr" ? <PeoplePanel s={s} alloc={alloc} setAlloc={setAlloc} p={projection} /> : null;
    const extra = tab === "rnd" ? <><InnovationBoard s={s} startInno={startInno} setStartInno={setStartInno} p={projection} />
        <WarrantyPicker warranty={warranty} setWarranty={setWarranty} p={projection} /></>
      : tab === "finance" ? <CapitalPanel s={s} alloc={alloc} setAlloc={setAlloc} payTerms={payTerms} setPayTerms={setPayTerms} p={projection} />
      : null;
    body = <DeptScreen id={tab} s={s} alloc={alloc} setAlloc={setAlloc} ctx={ctx} budget={budget} dirs={dirs}
      inbox={inbox} advanced={advanced} setAdvanced={setAdvanced} extraTop={extraTop} extra={extra} />;
  }
  return shell(body, true);
}
