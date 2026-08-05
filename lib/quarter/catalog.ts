import type {
  CompanyState,
  MarketEvent,
  RecurringCost,
  WorkspaceCatalog,
  WorkspaceId,
} from "@/lib/quarter/types";

/* ────────────────────────────────────────────────────────────────
   Decision catalogs — mirrors the backend's per-workspace decision
   documents. Every form renders from these arrays, so when the
   backend's catalog endpoint ships, this file is replaced by a
   fetch and nothing else changes.

   Confirmed backend gaps (implementation-gaps register) are kept as
   `pending` stubs — visible in the UI, never fabricated.
   ──────────────────────────────────────────────────────────────── */

export const COMPANY = {
  name: "Nimbus Labs",
  descriptor: "Workflow automation SaaS · seed stage",
};

export const openingState: CompanyState = {
  cash_available: 240, // ₹2.4 Cr in lakhs
  monthly_burn: 26,
  quarterly_burn: 78,
  cash_runway_months: 9.2,
  valuation: 1800,
  investor_confidence_score: 62,
  current_quarter: 1,
  run_status: null,
};

export const recurringCosts: RecurringCost[] = [
  { label: "Office rent", amount: 4.5 },
  { label: "Salaries", amount: 16.8 },
  { label: "Software & infra", amount: 3.2 },
  { label: "Maintenance", amount: 1.5 },
];

export const marketEvents: MarketEvent[] = [
  {
    id: "evt-price-war",
    title: "Competitor cut prices 20%",
    body: "Helix Systems dropped list pricing on their mid tier. Two of your renewal-stage accounts have asked for a price match by email.",
    tags: ["Pricing", "Sales", "Marketing"],
    severity: "critical",
  },
  {
    id: "evt-cloud-costs",
    title: "Cloud costs up 12% this quarter",
    body: "Your infra provider revised compute pricing. The Recurring Cost Engine has already applied the increase to this quarter's software line.",
    tags: ["Finance", "Operations"],
    severity: "warning",
  },
  {
    id: "evt-enterprise-rfp",
    title: "Enterprise RFP window opened",
    body: "A 400-seat logistics firm published an RFP that matches your roadmap. Responding costs sales time now and product commitments later.",
    tags: ["Sales", "Product"],
    severity: "info",
  },
];

/* ── Finance ────────────────────────────────────────────────────── */

const finance: WorkspaceCatalog = {
  id: "finance",
  name: "Finance",
  owner: "You + CFO desk",
  accent: "violet",
  tagline:
    "Owns the budget every other workspace draws from — set FIN-001 first.",
  decisions: [
    {
      id: "FIN-001",
      label: "Department Budget Allocation",
      input: "allocation",
      brief:
        "Distribute the discretionary growth budget across the five spending departments. Every other workspace draws from this.",
      affects: ["All departments"],
      allocationTotal: 60,
      buckets: [
        { id: "marketing", label: "Marketing", accent: "cyan" },
        { id: "product", label: "Product", accent: "violet" },
        { id: "sales", label: "Sales", accent: "indigo" },
        { id: "operations", label: "Operations", accent: "teal" },
        { id: "cx", label: "Customer Experience", accent: "emerald" },
      ],
    },
    {
      id: "FIN-002",
      label: "Emergency Cash Reserve",
      input: "spend",
      brief: "Cash ring-fenced against a shock. Reserved cash cannot be spent by any workspace this quarter.",
      affects: ["Runway", "Risk posture"],
      max: 40,
      step: 2,
      unit: "L",
    },
    {
      id: "FIN-003",
      label: "Capital Expenditure (CapEx)",
      input: "multiselect",
      brief: "One-time asset purchases. Each line lands on the balance sheet, not the P&L.",
      affects: ["Product", "Operations"],
      options: [
        { id: "test-rig", label: "Automated test rig", hint: "₹6 L" },
        { id: "dev-hardware", label: "Developer hardware refresh", hint: "₹4 L" },
        { id: "office-fitout", label: "Office fit-out", hint: "₹8 L" },
        { id: "none", label: "No CapEx this quarter" },
      ],
    },
    {
      id: "FIN-004",
      label: "Cost Optimisation Strategy",
      input: "dropdown",
      affects: ["Fixed costs", "Morale"],
      pending: "No coefficients in source docs yet — awaiting designer values.",
      options: [
        { id: "none", label: "No programme" },
        { id: "soft", label: "Soft freeze (travel, tools)" },
        { id: "hard", label: "Hard cuts (renegotiate everything)" },
      ],
    },
    {
      id: "FIN-005",
      label: "Debt / Credit Utilisation",
      input: "dropdown",
      brief: "Draw on the credit line only when needed — not forced every quarter.",
      affects: ["Cash", "Investor confidence"],
      optional: true,
      options: [
        { id: "none", label: "No drawdown" },
        { id: "wc-25", label: "Working-capital line · ₹25 L" },
        { id: "wc-50", label: "Working-capital line · ₹50 L" },
      ],
    },
    {
      id: "FIN-006",
      label: "Hiring Budget Approval",
      input: "spend",
      brief: "Quarterly cap on new-hire cost across all teams.",
      affects: ["People/HR", "Burn"],
      max: 24,
      step: 2,
      unit: "L",
    },
    {
      id: "FIN-007",
      label: "Growth Investment Allocation",
      input: "spend",
      brief: "Extra fuel released to growth experiments beyond the department budgets.",
      affects: ["Marketing", "Product", "Sales"],
      max: 20,
      step: 1,
      unit: "L",
    },
    {
      id: "FIN-008",
      label: "Pricing Approval",
      input: "dropdown",
      brief:
        "Finance owns final pricing — not Marketing or Sales. This is the only place list price moves.",
      affects: ["Revenue", "Churn", "Positioning"],
      options: [
        { id: "hold", label: "Maintain current pricing" },
        { id: "up5", label: "Raise +5%" },
        { id: "up10", label: "Raise +10%" },
        { id: "down5", label: "Cut −5%" },
        { id: "down10", label: "Cut −10%" },
      ],
    },
    {
      id: "FIN-009",
      label: "Production Budget Approval",
      input: "spend",
      affects: ["Operations"],
      pending: "No coefficients yet — formula pending with designer.",
      max: 20,
      unit: "L",
    },
    {
      id: "FIN-010",
      label: "Inventory Investment",
      input: "spend",
      affects: ["Operations", "Holding cost"],
      pending: "No coefficients yet — formula pending with designer.",
      max: 20,
      unit: "L",
    },
    {
      id: "FIN-011",
      label: "Dividend / Founder Withdrawal",
      input: "toggle",
      brief: "Rarely wise at seed stage. The board notices.",
      affects: ["Cash", "Investor confidence"],
      optional: true,
    },
    {
      id: "FIN-012",
      label: "Contingency Fund Allocation",
      input: "spend",
      affects: ["Risk posture"],
      pending: "No coefficients yet — formula pending with designer.",
      max: 15,
      unit: "L",
    },
    {
      id: "FIN-013",
      label: "Vendor Payment Strategy",
      input: "dropdown",
      brief: "Cash-flow timing vs. supplier goodwill and future discounts.",
      affects: ["Cash flow", "Supplier reliability"],
      options: [
        { id: "early", label: "Pay early (discount, goodwill)" },
        { id: "ontime", label: "Pay on time" },
        { id: "delay", label: "Delay 30 days (hold cash, burn goodwill)" },
      ],
    },
    {
      id: "FIN-014",
      label: "R&D Investment Approval",
      input: "spend",
      brief: "Feeds Product's Innovation Score. Subject to the R&D Conversion Ceiling gate.",
      affects: ["Product", "Innovation Score"],
      max: 25,
      step: 1,
      unit: "L",
    },
  ],
};

/* ── Marketing ──────────────────────────────────────────────────── */

const CHANNELS: [string, string][] = [
  ["MKT-google", "Google Ads"],
  ["MKT-meta", "Meta Ads"],
  ["MKT-linkedin", "LinkedIn Ads"],
  ["MKT-seo", "SEO"],
  ["MKT-content", "Content Marketing"],
  ["MKT-influencer", "Influencer"],
  ["MKT-pr", "PR"],
  ["MKT-email", "Email Marketing"],
  ["MKT-referral", "Referral Programme"],
  ["MKT-events", "Event Sponsorship"],
];

const marketing: WorkspaceCatalog = {
  id: "marketing",
  name: "Marketing",
  owner: "Head of Growth",
  accent: "cyan",
  tagline:
    "Channel spend follows power-law lead formulas — displayed effects are pre-modifier ceilings, not guarantees.",
  decisions: [
    ...CHANNELS.map(([id, label]) => ({
      id,
      label: `${label} budget`,
      input: "spend" as const,
      affects: ["Leads", "Brand"],
      max: 10,
      step: 0.5,
      unit: "L" as const,
      group: "Budget & channels",
    })),
    {
      id: "MKT-promo",
      label: "Pricing & promotion play",
      input: "choice-cards",
      affects: ["Conversion", "Margin", "Finance"],
      group: "Pricing & promotion",
      options: [
        { id: "discount", label: "10% discount", hint: "Volume now, margin later" },
        { id: "bundle", label: "Bundle products", hint: "Raise order value" },
        { id: "shipping", label: "Free onboarding", hint: "Lower entry friction" },
        { id: "premium", label: "Premium pricing", hint: "Signal quality, fewer leads" },
      ],
    },
    {
      id: "MKT-team",
      label: "Team move",
      input: "choice-cards",
      affects: ["Capacity", "Burn", "Morale"],
      group: "Team",
      options: [
        { id: "hire", label: "Hire marketing staff", hint: "+capacity, +burn" },
        { id: "train", label: "Employee training", hint: "Slow, compounding" },
        { id: "agency", label: "Outsource to agency", hint: "Fast, expensive" },
        { id: "hold", label: "Hold the current team" },
      ],
    },
    {
      id: "MKT-expansion",
      label: "Market expansion",
      input: "multiselect",
      affects: ["TAM", "Ops load", "Sales"],
      group: "Expansion & brand",
      options: [
        { id: "city", label: "Enter new city" },
        { id: "country", label: "Enter new country" },
        { id: "enterprise", label: "Target enterprise" },
        { id: "students", label: "Target students" },
        { id: "none", label: "No expansion this quarter" },
      ],
    },
    {
      id: "MKT-brand",
      label: "Brand positioning",
      input: "choice-cards",
      affects: ["Brand Strength", "Pricing power"],
      group: "Expansion & brand",
      options: [
        { id: "premium", label: "Premium positioning" },
        { id: "mass", label: "Mass market positioning" },
        { id: "sustain", label: "Sustainability campaign" },
        { id: "hold", label: "Keep current positioning" },
      ],
    },
  ],
};

/* ── Product (pipeline — later decisions gate on earlier ones) ──── */

const product: WorkspaceCatalog = {
  id: "product",
  name: "Product",
  owner: "Head of Product",
  accent: "indigo",
  tagline:
    "A dependency pipeline, not a flat list — later calls unlock as earlier ones land.",
  decisions: [
    {
      id: "PRO-001",
      label: "Select Market Opportunity",
      input: "choice-cards",
      affects: ["Roadmap", "Marketing"],
      options: [
        { id: "workflow-ai", label: "AI workflow copilot", hint: "Crowded, huge pull" },
        { id: "compliance", label: "Compliance automation", hint: "Slow sale, sticky" },
        { id: "integrations", label: "Integrations platform", hint: "Defensive moat" },
      ],
    },
    {
      id: "PRO-002",
      label: "Create New Product",
      input: "choice-cards",
      brief: "Product studio — commit the opportunity to a buildable shape.",
      affects: ["Finance", "Marketing"],
      dependsOn: ["PRO-001"],
      options: [
        { id: "mvp", label: "Thin MVP in 6 weeks" },
        { id: "full", label: "Full build, one quarter" },
        { id: "partner", label: "Co-build with design partner" },
      ],
    },
    {
      id: "PRO-003",
      label: "Prioritize Features",
      input: "rank",
      brief: "Order the backlog — top item ships first.",
      affects: ["Marketing", "Customer Success"],
      dependsOn: ["PRO-002"],
      options: [
        { id: "onboarding", label: "Self-serve onboarding" },
        { id: "api", label: "Public API" },
        { id: "reporting", label: "Usage reporting" },
        { id: "sso", label: "SSO / enterprise auth" },
      ],
    },
    {
      id: "PRO-004",
      label: "R&D Investment",
      input: "spend",
      brief: "Draws on the FIN-014 approval. Subject to the R&D Conversion Ceiling.",
      affects: ["Innovation Score", "Finance"],
      dependsOn: [],
      max: 25,
      step: 1,
      unit: "L",
    },
    {
      id: "PRO-005",
      label: "Quality Strategy",
      input: "choice-cards",
      affects: ["Marketing", "Operations", "Customer Success"],
      options: [
        { id: "speed", label: "Ship fast, patch later", hint: "Velocity over polish" },
        { id: "balance", label: "Balanced bar", hint: "Hold the current bar" },
        { id: "hard", label: "Raise the quality bar", hint: "Slower, fewer defects" },
      ],
    },
    {
      id: "PRO-006",
      label: "Approve Prototype",
      input: "toggle",
      brief: "Gated on development reaching 100%.",
      affects: ["Marketing"],
      dependsOn: ["PRO-002", "PRO-003"],
    },
    {
      id: "PRO-007",
      label: "Beta Testing",
      input: "choice-cards",
      affects: ["Marketing", "Customer Success"],
      dependsOn: ["PRO-006"],
      options: [
        { id: "closed", label: "Closed beta · 20 accounts" },
        { id: "open", label: "Open beta waitlist" },
        { id: "skip", label: "Skip beta this quarter" },
      ],
    },
    {
      id: "PRO-008",
      label: "Launch Product",
      input: "toggle",
      brief: "Executive approval, gated on Readiness ≥ threshold.",
      affects: ["All departments"],
      pending: "Launch-readiness threshold not yet specified — pending designer spec.",
      dependsOn: ["PRO-007"],
    },
    {
      id: "PRO-RET",
      label: "Product Retirement",
      input: "toggle",
      brief: "Rare, late-game. Sunset a line and free its costs.",
      affects: ["All departments"],
      optional: true,
    },
  ],
};

/* ── Sales ──────────────────────────────────────────────────────── */

const sales: WorkspaceCatalog = {
  id: "sales",
  name: "Sales",
  owner: "Head of Sales",
  accent: "teal",
  tagline:
    "Sales Capacity is a hard gate — leads beyond capacity are simply lost.",
  decisions: [
    {
      id: "SAL-000",
      label: "Sales reps & commissions",
      input: "spend",
      brief:
        "Sets the quarter's hard capacity ceiling: 500 leads handled per ₹1 L, plus a diminishing conversion bonus.",
      affects: ["Capacity gate", "Finance"],
      max: 12,
      step: 0.5,
      unit: "L",
    },
    {
      id: "SAL-001",
      label: "Sales Channel Prioritization",
      input: "choice-cards",
      affects: ["Marketing"],
      options: [
        { id: "inbound", label: "Inbound-first" },
        { id: "outbound", label: "Outbound-first" },
        { id: "plg", label: "Product-led, sales-assist" },
      ],
    },
    {
      id: "SAL-002",
      label: "Marketplace Strategy",
      input: "choice-cards",
      affects: ["Marketing"],
      options: [
        { id: "aws", label: "List on cloud marketplace" },
        { id: "g2", label: "Double down on review sites" },
        { id: "none", label: "Stay direct-only" },
      ],
    },
    {
      id: "SAL-003",
      label: "Enterprise / B2B Deals",
      input: "choice-cards",
      affects: ["Product", "Operations"],
      options: [
        { id: "rfp", label: "Respond to the open RFP", hint: "Ties to this quarter's event" },
        { id: "pilot", label: "Paid pilot programme" },
        { id: "pass", label: "Pass — protect focus" },
      ],
    },
    {
      id: "SAL-004",
      label: "Pricing Execution",
      input: "choice-cards",
      brief: "Executes within the band Finance approved in FIN-008.",
      affects: ["Finance"],
      options: [
        { id: "list", label: "Hold list price" },
        { id: "floor", label: "Discount to floor on strategic deals" },
        { id: "annual", label: "Push annual prepay" },
      ],
    },
    {
      id: "SAL-005",
      label: "Promotional Offers",
      input: "choice-cards",
      affects: ["Finance", "Marketing"],
      options: [
        { id: "q-end", label: "Quarter-end close-out offer" },
        { id: "upgrade", label: "Upgrade credit for existing accounts" },
        { id: "none", label: "No promotions" },
      ],
    },
    {
      id: "SAL-006",
      label: "Customer Segment Strategy",
      input: "choice-cards",
      affects: ["Marketing"],
      options: [
        { id: "smb", label: "SMB volume" },
        { id: "mid", label: "Mid-market focus" },
        { id: "ent", label: "Enterprise beachhead" },
      ],
    },
    {
      id: "SAL-007",
      label: "Distribution Expansion",
      input: "choice-cards",
      affects: ["Operations"],
      options: [
        { id: "resellers", label: "Sign two resellers" },
        { id: "direct", label: "Stay direct" },
        { id: "oem", label: "OEM conversation" },
      ],
    },
    {
      id: "SAL-008",
      label: "Sales Forecast",
      input: "dropdown",
      brief: "Your committed number. Scored on calibration, not optimism.",
      affects: ["Finance", "Marketing", "Operations"],
      options: [
        { id: "conservative", label: "Conservative · 420 units" },
        { id: "base", label: "Base case · 560 units" },
        { id: "stretch", label: "Stretch · 700 units" },
      ],
    },
    {
      id: "SAL-009",
      label: "Partnership Approval",
      input: "choice-cards",
      affects: ["Marketing"],
      options: [
        { id: "integration", label: "Integration partner" },
        { id: "co-sell", label: "Co-sell agreement" },
        { id: "none", label: "No partnerships" },
      ],
    },
    {
      id: "SAL-010",
      label: "Customer Retention Strategy",
      input: "choice-cards",
      affects: ["Customer Success"],
      options: [
        { id: "qbr", label: "QBRs for top 20 accounts" },
        { id: "success-plan", label: "Success plans on renewal risk" },
        { id: "auto", label: "Automated health scoring only" },
      ],
    },
  ],
};

/* ── Operations (shell — no decision catalog document yet) ──────── */

const operations: WorkspaceCatalog = {
  id: "operations",
  name: "Operations",
  owner: "Head of Ops",
  accent: "amber",
  tagline: "Capacity, cost and reliability engines.",
  shell:
    "The Operations formulas are validated on the backend, but the OPS-001…N decision catalog document hasn't been issued yet. This workspace renders from the same catalog-driven form as the others — the moment the catalog lands, it populates with zero UI rework.",
  decisions: [],
};

/* ── Customer Experience (12 named decisions, formulas pending) ─── */

const CX_ENGINES = [
  "Retention Engine",
  "Referral Engine",
  "Crisis Engine",
  "Loyalty Engine",
  "Trust Engine",
  "Reputation Engine",
  "Adoption Engine",
  "Engagement Engine",
  "Customer Value Engine",
  "Support Quality Engine",
  "Community Engine",
  "Feedback Loop Engine",
];

const cx: WorkspaceCatalog = {
  id: "cx",
  name: "Customer Experience",
  owner: "Head of CX",
  accent: "emerald",
  tagline:
    "12 engines plus a closing approval — structure confirmed, formulas an open P1 gap.",
  shell:
    "All twelve CX decisions are named but none have formulas yet — a confirmed open P1 gap, not something to guess at. They render below as honest pending stubs.",
  decisions: CX_ENGINES.map((label, i) => ({
    id: `CX-${String(i + 1).padStart(3, "0")}`,
    label,
    input: "dropdown" as const,
    affects: ["Product", "Marketing", "Sales", "Operations", "Finance"],
    pending: "Formula pending — confirmed open P1 gap on the backend.",
    options: [
      { id: "invest", label: "Invest" },
      { id: "maintain", label: "Maintain" },
      { id: "pause", label: "Pause" },
    ],
  })),
};

/** CX customer stories — same structural pattern as market-event cards. */
export const cxStories: MarketEvent[] = [
  {
    id: "story-viral",
    title: "Viral complaint thread",
    body: "A churned admin posted a detailed teardown of your onboarding on Reddit. It's the third result for your brand name.",
    tags: ["Reputation", "Marketing", "Product"],
    severity: "critical",
  },
  {
    id: "story-feature-surge",
    title: "Feature request surge",
    body: "Forty-one accounts asked for the same export API this month. Product hasn't ranked it.",
    tags: ["Product", "Retention"],
    severity: "warning",
  },
];

export const catalogs: Record<WorkspaceId, WorkspaceCatalog> = {
  finance,
  marketing,
  product,
  sales,
  operations,
  cx,
};

/** Confirmed CX scoring weights — used on the results screen later. */
export const CX_SCORE_WEIGHTS = [
  ["Customer-Centric Thinking", 30],
  ["Strategic Thinking", 20],
  ["Problem Solving", 15],
  ["Brand Building", 10],
  ["Long-Term Thinking", 10],
  ["Decision Quality", 10],
  ["Crisis Management", 5],
] as const;
