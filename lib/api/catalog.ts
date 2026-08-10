/** Department allocation catalogs — exact field keys from backend allocation schemas. */

export type DeptId =
  | "marketing"
  | "sales"
  | "rnd"
  | "operations"
  | "hr"
  | "finance_admin";

export type SpendField = {
  key: string;
  label: string;
  hint?: string;
};

export type DeptIcon =
  | "landmark"
  | "megaphone"
  | "trending-up"
  | "flask-conical"
  | "factory"
  | "users";

export type DeptCatalog = {
  id: DeptId;
  name: string;
  owner: string;
  tagline: string;
  /** In the department's own voice -- grounded in how its numbers actually feed the chain
   *  (docs/12-quarter-1-reference.md §8), not generic flavor text. */
  quote: string;
  accent: "cyan" | "teal" | "violet" | "amber" | "emerald" | "indigo";
  icon: DeptIcon;
  fields: SpendField[];
  /** R&D only — warranty is a strategic choice, not spend. */
  warranty?: boolean;
};

export const DEPARTMENTS: DeptCatalog[] = [
  {
    id: "finance_admin",
    name: "Finance & Admin",
    owner: "CFO desk",
    tagline: "Set this first — every other department is spent against it",
    quote: "We don't sell a single unit. Skip us, and next quarter's risk catches up with you.",
    accent: "indigo",
    icon: "landmark",
    fields: [
      { key: "compliance_legal", label: "Compliance & Legal" },
      { key: "financial_planning", label: "Financial Planning" },
      { key: "audit_prep", label: "Audit Prep" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    owner: "Growth desk",
    tagline: "8 channel spend lines · power-law lead formulas",
    quote: "Every rupee here buys leads. Whether Sales can use them is someone else's problem.",
    accent: "cyan",
    icon: "megaphone",
    fields: [
      { key: "google_ads", label: "Google Ads" },
      { key: "meta_ads", label: "Meta Ads" },
      { key: "social_influencer", label: "Social / Influencer" },
      { key: "content_seo", label: "Content & SEO" },
      { key: "events_pr", label: "Events & PR" },
      { key: "email_marketing", label: "Email Marketing" },
      { key: "referral", label: "Referral Programme" },
      { key: "prelaunch_buzz", label: "Prelaunch Buzz" },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    owner: "Revenue desk",
    tagline: "Rep capacity is a hard gate on marketing leads",
    quote: "Give us more leads than we can handle, and the extra ones just evaporate.",
    accent: "teal",
    icon: "trending-up",
    fields: [
      { key: "reps", label: "Sales Reps & Commissions", hint: "Sets capacity · 500 leads / ₹1 L" },
      { key: "crm_tools", label: "CRM & Sales Tools" },
      { key: "onboarding", label: "Customer Onboarding" },
    ],
  },
  {
    id: "rnd",
    name: "R&D",
    owner: "Product / Engineering",
    tagline: "Quality & innovation · subject to conversion ceiling",
    quote: "No amount of marketing spend fixes a product that isn't good enough to convert.",
    accent: "violet",
    icon: "flask-conical",
    warranty: true,
    fields: [
      { key: "quality_qa", label: "Quality & QA" },
      { key: "innovation", label: "Innovation / R&D" },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    owner: "Ops desk",
    tagline: "Manufacturing, supplier QC, logistics",
    quote: "We can build it, but we can't sell what isn't in stock.",
    accent: "amber",
    icon: "factory",
    fields: [
      { key: "manufacturing", label: "Manufacturing" },
      { key: "supplier_qc", label: "Supplier QC" },
      { key: "logistics", label: "Logistics" },
    ],
  },
  {
    id: "hr",
    name: "HR & People",
    owner: "People desk",
    tagline: "Culture, training, and the CX team",
    quote: "A tired team closes fewer deals, no matter how good the leads are.",
    accent: "emerald",
    icon: "users",
    fields: [
      { key: "culture_benefits", label: "Culture & Benefits" },
      { key: "training_development", label: "Training & Development" },
      { key: "cx_team", label: "CX Team" },
    ],
  },
];

export const CRISIS_FIELDS: SpendField[] = [
  { key: "price_match_fund", label: "Price Match Fund", hint: "Scenario A/B lever" },
  { key: "comparison_ads", label: "Comparison Ads", hint: "Scenario A/B lever" },
  { key: "retention_offers", label: "Retention Offers", hint: "Scenario A/B lever" },
  { key: "emergency_supply_fund", label: "Emergency Supply Fund", hint: "Scenario D lever" },
  { key: "crisis_choice_d_spend", label: "Choice D Spend", hint: "Active scenario's Choice D line" },
];

export const CRISIS_CHOICES = [
  { id: "A" as const, label: "Choice A" },
  { id: "B" as const, label: "Choice B" },
  { id: "C" as const, label: "Choice C" },
  { id: "D" as const, label: "Choice D" },
];

/** Format full INR amounts from the report outcome (not lakhs). */
export function formatInr(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  const sign = n < 0 ? "−" : "";
  return `${sign}₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

/** Format spend in lakhs for allocation inputs. */
export function formatLakhs(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "₹0 L";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}₹${Number.isInteger(abs) ? abs : abs.toFixed(2)} L`;
}

export function asNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
