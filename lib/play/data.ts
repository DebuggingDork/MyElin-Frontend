import type { Scenario } from "@/lib/play/types";

/** Startup Survival — seed-stage SaaS, Quarter 1. Mock data until the API lands. */
export const startupSurvival: Scenario = {
  id: "startup-survival",
  name: "Startup Survival",
  quarterLabel: "Quarter 1",
  quarterTheme: "Planning",
  company: {
    name: "Nimbus Labs",
    stage: "Seed",
    sector: "Workflow automation SaaS",
  },
  minutes: 30,
  metrics: [
    { key: "cash", label: "Cash in bank", value: "₹5 Cr", accent: "emerald" },
    { key: "employees", label: "Employees", value: "12", accent: "cyan" },
    { key: "customers", label: "Customers", value: "4,200", accent: "violet" },
    { key: "revenue", label: "Monthly revenue", value: "₹18 L", accent: "indigo" },
    { key: "burn", label: "Burn rate", value: "₹26 L", accent: "rose" },
  ],
  panels: [
    {
      id: "co-financials",
      title: "Financials",
      icon: "coins",
      rows: [
        { label: "Cash in bank", base: 500, fmt: "money", axis: "discipline", swing: 46 },
        { label: "Quarterly burn", base: 78, fmt: "money", axis: "growth", swing: 26, invert: true },
        { label: "Runway", base: 5.8, fmt: "months", axis: "discipline", swing: 2.4 },
        { label: "Net margin", base: -34, fmt: "pct", axis: "discipline", swing: 14 },
      ],
    },
    {
      id: "co-market",
      title: "Market",
      icon: "globe",
      rows: [
        { label: "Customers", base: 4200, fmt: "count", axis: "growth", swing: 850 },
        { label: "Monthly revenue", base: 18, fmt: "money", axis: "growth", swing: 5.5 },
        { label: "Growth QoQ", base: 12, fmt: "pct", axis: "growth", swing: 9 },
        { label: "Market share", base: 2.1, fmt: "pct", axis: "growth", swing: 0.8 },
      ],
    },
    {
      id: "co-organisation",
      title: "Organisation",
      icon: "users",
      rows: [
        { label: "Employees", base: 12, fmt: "count" },
        { label: "Contractors", base: 3, fmt: "count" },
        { label: "Morale", base: 74, fmt: "pct", axis: "resilience", swing: 17 },
        { label: "Attrition risk", base: 22, fmt: "pct", axis: "resilience", swing: 12, invert: true },
      ],
    },
    {
      id: "co-delivery",
      title: "Delivery",
      icon: "layers",
      rows: [
        { label: "Uptime", base: 99.2, fmt: "pct", axis: "resilience", swing: 0.6 },
        { label: "Open defects", base: 128, fmt: "count", axis: "resilience", swing: 44, invert: true },
        { label: "Open tickets", base: 312, fmt: "count", axis: "discipline", swing: 110, invert: true },
        { label: "Releases / qtr", base: 6, fmt: "count", axis: "agility", swing: 3 },
      ],
    },
  ],
  departments: [
    {
      id: "finance",
      name: "Finance",
      owner: "Karan Mehta",
      role: "CFO",
      tagline: "Protect the runway. Fund the thesis.",
      quote: "Every rupee we commit this quarter is a vote for what Nimbus becomes.",
      budget: 50,
      accent: "emerald",
      icon: "wallet",
      panels: [
        {
          id: "fin-cash",
          title: "Cash position",
          icon: "coins",
          rows: [
            { label: "Cash in bank", base: 500, fmt: "money", axis: "discipline", swing: 46 },
            { label: "Quarterly burn", base: 78, fmt: "money", axis: "growth", swing: 26, invert: true },
            { label: "Runway", base: 5.8, fmt: "months", axis: "discipline", swing: 2.4 },
            { label: "Discretionary", base: 50, fmt: "money" },
          ],
          bar: { label: "Capital committed", source: "budget" },
        },
        {
          id: "fin-unit",
          title: "Unit economics",
          icon: "gauge",
          rows: [
            { label: "Gross margin", base: 72, fmt: "pct", axis: "discipline", swing: 6 },
            { label: "CAC payback", base: 14.5, fmt: "months", axis: "growth", swing: 4.2, invert: true },
            { label: "LTV : CAC", base: 2.4, fmt: "ratio", axis: "resilience", swing: 0.8 },
            { label: "Rule of 40", base: 18, fmt: "pct", axis: "growth", swing: 13 },
          ],
        },
        {
          id: "fin-board",
          title: "Board & capital",
          icon: "landmark",
          rows: [
            { label: "Next raise window", text: "Q3 FY26" },
            { label: "Investor confidence", base: 68, fmt: "pct", axis: "resilience", swing: 17 },
            { label: "Covenant headroom", base: 40, fmt: "pct", axis: "discipline", swing: 22 },
            { label: "Dilution if forced", base: 18, fmt: "pct", axis: "discipline", swing: 8, invert: true },
          ],
        },
      ],
      sections: [
        {
          id: "objective",
          label: "Objective & funding",
          blurb: "Set the financial thesis before the rest of the company spends.",
          decisions: [
            {
              id: "fin-objective",
              kind: "choice",
              title: "Primary objective",
              prompt:
                "The board wants one thesis. Everything else this quarter serves it.",
              severity: "critical",
              options: [
                {
                  id: "runway",
                  label: "Extend runway",
                  hint: "Cut burn. Survive long enough to prove the model.",
                  shape: {
                    growth: 20,
                    discipline: 92,
                    resilience: 80,
                    agility: 35,
                  },
                },
                {
                  id: "growth",
                  label: "Fund growth",
                  hint: "Spend into the demand signal. Accept a shorter runway.",
                  shape: {
                    growth: 94,
                    discipline: 28,
                    resilience: 40,
                    agility: 70,
                  },
                },
                {
                  id: "balance",
                  label: "Balanced bet",
                  hint: "Protect six months while funding one growth channel.",
                  shape: {
                    growth: 58,
                    discipline: 64,
                    resilience: 66,
                    agility: 55,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "budget",
          label: "Budget planning",
          blurb: "Split the ₹50L across how the company protects and grows itself.",
          decisions: [
            {
              id: "fin-budget",
              kind: "allocate",
              title: "Capital allocation",
              prompt:
                "Commit the full ₹50L. Leaving blocks uncommitted is not an option — the board wants a plan.",
              severity: "critical",
              budget: 50,
              unit: 5,
              channels: [
                {
                  id: "reserve",
                  label: "Emergency reserve",
                  hint: "Cash that only opens under a declared crisis.",
                  accent: "violet",
                  shape: {
                    growth: 10,
                    discipline: 90,
                    resilience: 95,
                    agility: 30,
                  },
                },
                {
                  id: "growth-invest",
                  label: "Growth investment",
                  hint: "Marketing + sales capacity for this quarter.",
                  accent: "cyan",
                  shape: {
                    growth: 95,
                    discipline: 25,
                    resilience: 30,
                    agility: 70,
                  },
                },
                {
                  id: "ops",
                  label: "Ops & tooling",
                  hint: "Infrastructure that keeps the product shipping.",
                  accent: "emerald",
                  shape: {
                    growth: 40,
                    discipline: 70,
                    resilience: 60,
                    agility: 55,
                  },
                },
                {
                  id: "people",
                  label: "People buffer",
                  hint: "Retention bonuses and one critical hire.",
                  accent: "amber",
                  shape: {
                    growth: 45,
                    discipline: 50,
                    resilience: 75,
                    agility: 60,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "risk",
          label: "Risk & priorities",
          blurb: "Rank the three risks that keep you awake. Order matters.",
          decisions: [
            {
              id: "fin-risk",
              kind: "priority",
              title: "Risk stack",
              prompt: "Pick and order the three risks that define this quarter.",
              severity: "high",
              pick: 3,
              items: [
                {
                  id: "runway-risk",
                  label: "Runway collapse",
                  hint: "Burn accelerates before revenue catches up.",
                },
                {
                  id: "churn-risk",
                  label: "Enterprise churn",
                  hint: "Two large accounts are already soft on renewal.",
                },
                {
                  id: "key-person",
                  label: "Key-person risk",
                  hint: "Two engineers hold 80% of the codebase context.",
                },
                {
                  id: "competitor",
                  label: "Competitor undercut",
                  hint: "Helix is rumoured to price 40% below list.",
                },
                {
                  id: "dilution",
                  label: "Forced raise",
                  hint: "Raising on bad terms if the thesis fails.",
                },
              ],
            },
          ],
        },
        {
          id: "confidence",
          label: "Confidence & reasoning",
          blurb: "How sure are you that this plan survives contact with the market?",
          decisions: [
            {
              id: "fin-conviction",
              kind: "conviction",
              title: "Stated conviction",
              prompt:
                "Calibration is scored. Overconfidence and underconfidence both cost you.",
              severity: "medium",
              low: "I am guessing",
              high: "I would bet my seat",
            },
          ],
        },
      ],
    },
    {
      id: "product",
      name: "Product",
      owner: "Ananya Rao",
      role: "Head of Product",
      tagline: "Ship the thing that earns the thesis.",
      quote: "Every feature we ship this quarter is a promise we must keep.",
      budget: 30,
      accent: "violet",
      icon: "boxes",
      panels: [
        {
          id: "prod-capacity-read",
          title: "Engineering capacity",
          icon: "cpu",
          rows: [
            { label: "Engineers", base: 7, fmt: "count" },
            { label: "Weeks available", base: 30, fmt: "count" },
            { label: "Velocity / week", base: 42, fmt: "count", axis: "agility", swing: 13 },
            { label: "Time to ship", base: 6.2, fmt: "months", axis: "agility", swing: 2.1, invert: true },
          ],
          bar: { label: "Capacity committed", source: "budget" },
        },
        {
          id: "prod-quality",
          title: "Quality",
          icon: "bug",
          rows: [
            { label: "Open defects", base: 128, fmt: "count", axis: "resilience", swing: 44, invert: true },
            { label: "Escaped / release", base: 3.4, fmt: "count", axis: "discipline", swing: 1.6, invert: true },
            { label: "Test coverage", base: 61, fmt: "pct", axis: "discipline", swing: 18 },
            { label: "Change failure rate", base: 22, fmt: "pct", axis: "resilience", swing: 9, invert: true },
          ],
        },
        {
          id: "prod-roadmap",
          title: "Roadmap",
          icon: "layers",
          rows: [
            { label: "Features committed", base: 9, fmt: "count", axis: "growth", swing: 4 },
            { label: "Tech debt ratio", base: 34, fmt: "pct", axis: "discipline", swing: 12, invert: true },
            { label: "Integrations live", base: 11, fmt: "count", axis: "growth", swing: 5 },
            { label: "Support load / release", base: 18, fmt: "hours", axis: "resilience", swing: 7, invert: true },
          ],
        },
      ],
      sections: [
        {
          id: "bet",
          label: "Product bet",
          blurb: "Choose the shape of the roadmap for this quarter.",
          decisions: [
            {
              id: "prod-bet",
              kind: "choice",
              title: "Roadmap thesis",
              prompt: "Engineering capacity is fixed. Pick one lane.",
              severity: "critical",
              options: [
                {
                  id: "platform",
                  label: "Platform depth",
                  hint: "Harden the core. Fewer logos, stickier accounts.",
                  shape: {
                    growth: 35,
                    discipline: 80,
                    resilience: 85,
                    agility: 40,
                  },
                },
                {
                  id: "surface",
                  label: "Surface area",
                  hint: "Ship integrations. Win more logos, accept support load.",
                  shape: {
                    growth: 90,
                    discipline: 30,
                    resilience: 35,
                    agility: 75,
                  },
                },
                {
                  id: "reliability",
                  label: "Reliability first",
                  hint: "Kill the top ten support tickets before anything new.",
                  shape: {
                    growth: 25,
                    discipline: 70,
                    resilience: 95,
                    agility: 45,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "capacity",
          label: "Capacity",
          blurb: "Allocate engineering weeks across the lanes you just chose.",
          decisions: [
            {
              id: "prod-capacity",
              kind: "allocate",
              title: "Engineering weeks",
              prompt: "Commit all 30 weeks of capacity this quarter.",
              severity: "high",
              budget: 30,
              unit: 5,
              channels: [
                {
                  id: "core",
                  label: "Core product",
                  hint: "Features that move the primary thesis.",
                  accent: "violet",
                  shape: {
                    growth: 70,
                    discipline: 60,
                    resilience: 50,
                    agility: 55,
                  },
                },
                {
                  id: "debt",
                  label: "Tech debt",
                  hint: "The interest rate on everything else.",
                  accent: "amber",
                  shape: {
                    growth: 20,
                    discipline: 85,
                    resilience: 80,
                    agility: 40,
                  },
                },
                {
                  id: "experiments",
                  label: "Experiments",
                  hint: "Small bets that might open a new lane.",
                  accent: "cyan",
                  shape: {
                    growth: 80,
                    discipline: 25,
                    resilience: 30,
                    agility: 95,
                  },
                },
                {
                  id: "support",
                  label: "Support tooling",
                  hint: "Give customer success a fighting chance.",
                  accent: "emerald",
                  shape: {
                    growth: 40,
                    discipline: 55,
                    resilience: 70,
                    agility: 50,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "How sure is this roadmap?",
          decisions: [
            {
              id: "prod-conviction",
              kind: "conviction",
              title: "Roadmap conviction",
              prompt: "Will this ship before the board asks again?",
              severity: "medium",
              low: "It will slip",
              high: "It ships on time",
            },
          ],
        },
      ],
    },
    {
      id: "marketing",
      name: "Marketing",
      owner: "Priya Sharma",
      role: "Head of Growth",
      tagline: "Buy attention — or earn it.",
      quote: "Spend that does not create a thesis is just noise with a receipt.",
      budget: 30,
      accent: "cyan",
      icon: "megaphone",
      panels: [
        {
          id: "mkt-funnel",
          title: "Funnel",
          icon: "filter",
          rows: [
            { label: "Monthly visitors", base: 42000, fmt: "count", axis: "growth", swing: 15000 },
            { label: "Visitor → trial", base: 3.2, fmt: "pct", axis: "growth", swing: 1.1 },
            { label: "Trial → paid", base: 18, fmt: "pct", axis: "discipline", swing: 5 },
            { label: "MQLs / quarter", base: 620, fmt: "count", axis: "growth", swing: 230 },
          ],
          bar: { label: "Spend committed", source: "budget" },
        },
        {
          id: "mkt-efficiency",
          title: "Spend efficiency",
          icon: "gauge",
          rows: [
            { label: "Blended CAC", base: 6.4, fmt: "moneyK", axis: "growth", swing: 2.3, invert: true },
            { label: "CAC payback", base: 14, fmt: "months", axis: "growth", swing: 4, invert: true },
            { label: "Paid share of mix", base: 46, fmt: "pct", axis: "growth", swing: 24, invert: true },
            { label: "Attributable pipeline", base: 96, fmt: "money", axis: "growth", swing: 38 },
          ],
        },
        {
          id: "mkt-brand",
          title: "Brand",
          icon: "globe",
          rows: [
            { label: "Share of voice", base: 11, fmt: "pct", axis: "growth", swing: 6 },
            { label: "Branded search", base: 4200, fmt: "count", axis: "resilience", swing: 1400 },
            { label: "NPS", base: 34, fmt: "count", axis: "resilience", swing: 14 },
            { label: "Inbound share", base: 38, fmt: "pct", axis: "resilience", swing: 16 },
          ],
        },
      ],
      sections: [
        {
          id: "channel",
          label: "Channel thesis",
          blurb: "Where does the next thousand accounts come from?",
          decisions: [
            {
              id: "mkt-channel",
              kind: "choice",
              title: "Acquisition thesis",
              prompt: "Pick the shape of demand this quarter.",
              severity: "high",
              options: [
                {
                  id: "paid",
                  label: "Paid acquisition",
                  hint: "Fast, measurable, stops when you stop paying.",
                  shape: {
                    growth: 90,
                    discipline: 40,
                    resilience: 25,
                    agility: 70,
                  },
                },
                {
                  id: "content",
                  label: "Content & SEO",
                  hint: "Compounds slowly. Nothing lands this quarter.",
                  shape: {
                    growth: 45,
                    discipline: 70,
                    resilience: 75,
                    agility: 40,
                  },
                },
                {
                  id: "partner",
                  label: "Channel partners",
                  hint: "Borrowed distribution. Slower, stickier.",
                  shape: {
                    growth: 60,
                    discipline: 55,
                    resilience: 65,
                    agility: 50,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "spend",
          label: "Spend plan",
          blurb: "Commit the ₹30L growth budget.",
          decisions: [
            {
              id: "mkt-spend",
              kind: "allocate",
              title: "Growth budget",
              prompt: "Every rupee here cannot answer the next surprise.",
              severity: "critical",
              budget: 30,
              unit: 5,
              channels: [
                {
                  id: "performance",
                  label: "Performance marketing",
                  hint: "Fast logos. High CAC risk.",
                  accent: "cyan",
                  shape: {
                    growth: 95,
                    discipline: 30,
                    resilience: 20,
                    agility: 75,
                  },
                },
                {
                  id: "brand",
                  label: "Brand",
                  hint: "Awareness that takes two quarters to show.",
                  accent: "violet",
                  shape: {
                    growth: 50,
                    discipline: 45,
                    resilience: 60,
                    agility: 40,
                  },
                },
                {
                  id: "events",
                  label: "Events & community",
                  hint: "High-touch. Soft pipeline.",
                  accent: "amber",
                  shape: {
                    growth: 55,
                    discipline: 40,
                    resilience: 50,
                    agility: 65,
                  },
                },
                {
                  id: "hold",
                  label: "Hold in reserve",
                  hint: "Optionality for a crisis you cannot see yet.",
                  accent: "emerald",
                  shape: {
                    growth: 15,
                    discipline: 85,
                    resilience: 90,
                    agility: 55,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "How sure is the channel bet?",
          decisions: [
            {
              id: "mkt-conviction",
              kind: "conviction",
              title: "Channel conviction",
              prompt: "Would you defend this spend in a board meeting tomorrow?",
              severity: "medium",
              low: "I would hedge",
              high: "I would double down",
            },
          ],
        },
      ],
    },
    {
      id: "sales",
      name: "Sales",
      owner: "Rohan Iyer",
      role: "VP Sales",
      tagline: "Close the right logos — or close the wrong ones faster.",
      quote: "A pipeline that is everything is a pipeline that is nothing.",
      budget: 20,
      accent: "orange",
      icon: "trending",
      panels: [
        {
          id: "sales-pipeline",
          title: "Pipeline",
          icon: "target",
          rows: [
            { label: "Qualified pipeline", base: 340, fmt: "money", axis: "growth", swing: 118 },
            { label: "Coverage ratio", base: 2.1, fmt: "ratio", axis: "discipline", swing: 0.8 },
            { label: "Win rate", base: 24, fmt: "pct", axis: "discipline", swing: 8 },
            { label: "Avg cycle", base: 46, fmt: "days", axis: "agility", swing: 14, invert: true },
          ],
          bar: { label: "Quarter committed", source: "commit" },
        },
        {
          id: "sales-team",
          title: "Team",
          icon: "users",
          rows: [
            { label: "Reps on quota", base: 6, fmt: "count" },
            { label: "Quota / rep", base: 35, fmt: "money", axis: "growth", swing: 10, invert: true },
            { label: "Attainment", base: 72, fmt: "pct", axis: "resilience", swing: 16 },
            { label: "Ramp time", base: 9, fmt: "months", axis: "agility", swing: 3, invert: true },
          ],
        },
        {
          id: "sales-risk",
          title: "Exposure",
          icon: "zap",
          rows: [
            { label: "Renewals at risk", base: 3, fmt: "count", axis: "resilience", swing: 2, invert: true },
            { label: "Discount pressure", base: 12, fmt: "pct", axis: "discipline", swing: 6, invert: true },
            { label: "Forecast this qtr", base: 96, fmt: "money", axis: "growth", swing: 32 },
            { label: "Rep attrition risk", base: 18, fmt: "pct", axis: "resilience", swing: 11, invert: true },
          ],
        },
      ],
      sections: [
        {
          id: "motion",
          label: "Sales motion",
          blurb: "Choose who you sell to and how hard.",
          decisions: [
            {
              id: "sales-motion",
              kind: "choice",
              title: "Go-to-market motion",
              prompt: "Sales capacity is six people. Pick a lane.",
              severity: "critical",
              options: [
                {
                  id: "enterprise",
                  label: "Enterprise hunt",
                  hint: "Fewer deals, longer cycles, higher ACV.",
                  shape: {
                    growth: 70,
                    discipline: 55,
                    resilience: 50,
                    agility: 35,
                  },
                },
                {
                  id: "mid-market",
                  label: "Mid-market focus",
                  hint: "The segment that already converts.",
                  shape: {
                    growth: 65,
                    discipline: 75,
                    resilience: 60,
                    agility: 55,
                  },
                },
                {
                  id: "land-expand",
                  label: "Land and expand",
                  hint: "Grow value inside the accounts you already have.",
                  shape: {
                    growth: 55,
                    discipline: 70,
                    resilience: 80,
                    agility: 50,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "quota",
          label: "Quota pressure",
          blurb: "How hard do you push the team this quarter?",
          decisions: [
            {
              id: "sales-pressure",
              kind: "choice",
              title: "Quota stance",
              prompt: "Stretch targets raise revenue and attrition risk together.",
              severity: "high",
              options: [
                {
                  id: "stretch",
                  label: "Stretch hard",
                  hint: "Hit the number. Accept the churn of people.",
                  shape: {
                    growth: 90,
                    discipline: 40,
                    resilience: 25,
                    agility: 60,
                  },
                },
                {
                  id: "sustainable",
                  label: "Sustainable",
                  hint: "Defend morale. Accept a softer quarter.",
                  shape: {
                    growth: 45,
                    discipline: 70,
                    resilience: 85,
                    agility: 50,
                  },
                },
                {
                  id: "quality",
                  label: "Quality over volume",
                  hint: "Only close accounts that fit the ICP.",
                  shape: {
                    growth: 50,
                    discipline: 85,
                    resilience: 70,
                    agility: 40,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "Will this motion hit the number?",
          decisions: [
            {
              id: "sales-conviction",
              kind: "conviction",
              title: "Pipeline conviction",
              prompt: "How sure are you the number closes?",
              severity: "medium",
              low: "We will miss",
              high: "We will beat it",
            },
          ],
        },
      ],
    },
    {
      id: "operations",
      name: "Operations",
      owner: "Meera Kapoor",
      role: "Head of Ops",
      tagline: "Keep the machine from eating itself.",
      quote: "Reliability is a strategy — until the day it is not.",
      budget: 15,
      accent: "rose",
      icon: "factory",
      panels: [
        {
          id: "ops-infra",
          title: "Infrastructure",
          icon: "server",
          rows: [
            { label: "Uptime", base: 99.2, fmt: "pct", axis: "resilience", swing: 0.6 },
            { label: "P1 incidents / qtr", base: 4, fmt: "count", axis: "resilience", swing: 2.4, invert: true },
            { label: "MTTR", base: 68, fmt: "count", axis: "agility", swing: 26, invert: true },
            { label: "Infra cost / mo", base: 9.5, fmt: "money", axis: "discipline", swing: 2.4, invert: true },
          ],
          bar: { label: "Ops budget committed", source: "budget" },
        },
        {
          id: "ops-process",
          title: "Process",
          icon: "wrench",
          rows: [
            { label: "Runbook coverage", base: 42, fmt: "pct", axis: "discipline", swing: 24 },
            { label: "Manual handoffs", base: 17, fmt: "count", axis: "agility", swing: 7, invert: true },
            { label: "Audit readiness", base: 38, fmt: "pct", axis: "discipline", swing: 26 },
            { label: "SLA breaches / qtr", base: 5, fmt: "count", axis: "resilience", swing: 3, invert: true },
          ],
        },
        {
          id: "ops-vendors",
          title: "Vendors",
          icon: "truck",
          rows: [
            { label: "Contracts up for renewal", base: 5, fmt: "count" },
            { label: "Vendor spend / qtr", base: 22, fmt: "money", axis: "discipline", swing: 6, invert: true },
            { label: "Single-vendor exposure", base: 61, fmt: "pct", axis: "resilience", swing: 20, invert: true },
            { label: "Negotiated savings", base: 4, fmt: "money", axis: "discipline", swing: 3.5 },
          ],
        },
      ],
      sections: [
        {
          id: "focus",
          label: "Ops focus",
          blurb: "What breaks first if you ignore it?",
          decisions: [
            {
              id: "ops-focus",
              kind: "choice",
              title: "Primary ops bet",
              prompt: "You cannot harden everything this quarter.",
              severity: "high",
              options: [
                {
                  id: "uptime",
                  label: "Uptime & SLAs",
                  hint: "Protect enterprise trust. Slow new shipping.",
                  shape: {
                    growth: 25,
                    discipline: 80,
                    resilience: 95,
                    agility: 30,
                  },
                },
                {
                  id: "process",
                  label: "Process coverage",
                  hint: "Document the tribal knowledge before someone quits.",
                  shape: {
                    growth: 30,
                    discipline: 90,
                    resilience: 70,
                    agility: 40,
                  },
                },
                {
                  id: "vendor",
                  label: "Vendor leverage",
                  hint: "Renegotiate infra. Free cash for other bets.",
                  shape: {
                    growth: 40,
                    discipline: 75,
                    resilience: 55,
                    agility: 60,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "spend",
          label: "Ops spend",
          blurb: "Where does the ₹15L go?",
          decisions: [
            {
              id: "ops-spend",
              kind: "allocate",
              title: "Ops budget",
              prompt: "Commit the full ops budget.",
              severity: "medium",
              budget: 15,
              unit: 5,
              channels: [
                {
                  id: "infra",
                  label: "Infrastructure",
                  hint: "Capacity that keeps the product online.",
                  accent: "rose",
                  shape: {
                    growth: 30,
                    discipline: 70,
                    resilience: 90,
                    agility: 35,
                  },
                },
                {
                  id: "tools",
                  label: "Internal tools",
                  hint: "Make the team faster than they are today.",
                  accent: "cyan",
                  shape: {
                    growth: 50,
                    discipline: 55,
                    resilience: 45,
                    agility: 80,
                  },
                },
                {
                  id: "security",
                  label: "Security & compliance",
                  hint: "The audit you will wish you started earlier.",
                  accent: "violet",
                  shape: {
                    growth: 20,
                    discipline: 85,
                    resilience: 80,
                    agility: 25,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "Will ops hold under pressure?",
          decisions: [
            {
              id: "ops-conviction",
              kind: "conviction",
              title: "Ops conviction",
              prompt: "How ready is the machine for a surprise?",
              severity: "medium",
              low: "It will crack",
              high: "It will hold",
            },
          ],
        },
      ],
    },
    {
      id: "people",
      name: "People & HR",
      owner: "Sara Khan",
      role: "Head of People",
      tagline: "Keep the team that can win.",
      quote: "Attrition is a silent burn rate — and it compounds.",
      budget: 20,
      accent: "amber",
      icon: "users",
      panels: [
        {
          id: "ppl-workforce",
          title: "Workforce",
          icon: "users",
          rows: [
            { label: "Employees", base: 12, fmt: "count" },
            { label: "Contractors", base: 3, fmt: "count" },
            { label: "Morale", base: 74, fmt: "pct", axis: "resilience", swing: 17 },
            { label: "Attrition risk", base: 22, fmt: "pct", axis: "resilience", swing: 12, invert: true },
          ],
          bar: { label: "People plan committed", source: "commit" },
        },
        {
          id: "ppl-recruit",
          title: "Recruitment",
          icon: "userPlus",
          rows: [
            { label: "Open roles", base: 3, fmt: "count" },
            { label: "Time to hire", base: 52, fmt: "days", axis: "agility", swing: 16, invert: true },
            { label: "Offer accept rate", base: 61, fmt: "pct", axis: "growth", swing: 15 },
            { label: "Cost per hire", base: 3.4, fmt: "money", axis: "discipline", swing: 1.1, invert: true },
          ],
        },
        {
          id: "ppl-capability",
          title: "Capability",
          icon: "graduation",
          rows: [
            { label: "Bench strength", base: 2, fmt: "count", axis: "resilience", swing: 1.5 },
            { label: "Training days / head", base: 1.8, fmt: "count", axis: "discipline", swing: 1.2 },
            { label: "Key-person exposure", base: 80, fmt: "pct", axis: "resilience", swing: 26, invert: true },
            { label: "Internal mobility", base: 14, fmt: "pct", axis: "agility", swing: 9 },
          ],
        },
      ],
      sections: [
        {
          id: "stance",
          label: "People stance",
          blurb: "Hire, retain, or freeze?",
          decisions: [
            {
              id: "ppl-stance",
              kind: "choice",
              title: "Headcount stance",
              prompt: "Twelve people. Two of them hold the codebase.",
              severity: "critical",
              options: [
                {
                  id: "hire",
                  label: "Hire critically",
                  hint: "One senior engineer. Burn goes up.",
                  shape: {
                    growth: 70,
                    discipline: 40,
                    resilience: 55,
                    agility: 65,
                  },
                },
                {
                  id: "retain",
                  label: "Retain hard",
                  hint: "Bonuses and title. No new seats.",
                  shape: {
                    growth: 35,
                    discipline: 60,
                    resilience: 90,
                    agility: 40,
                  },
                },
                {
                  id: "freeze",
                  label: "Freeze and focus",
                  hint: "No hires. Reassign capacity to the thesis.",
                  shape: {
                    growth: 40,
                    discipline: 85,
                    resilience: 50,
                    agility: 55,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "priorities",
          label: "People risks",
          blurb: "Order the people risks that matter this quarter.",
          decisions: [
            {
              id: "ppl-risk",
              kind: "priority",
              title: "People risk stack",
              prompt: "Pick and order the three that would hurt most.",
              severity: "high",
              pick: 3,
              items: [
                {
                  id: "key-quit",
                  label: "Key engineer quits",
                  hint: "Context walks out the door.",
                },
                {
                  id: "manager-gap",
                  label: "Manager gap",
                  hint: "No one can run a team of six yet.",
                },
                {
                  id: "morale-dip",
                  label: "Morale dip",
                  hint: "Burnout after two crunch quarters.",
                },
                {
                  id: "comp-pressure",
                  label: "Comp pressure",
                  hint: "Market offers are 30% above ours.",
                },
                {
                  id: "culture",
                  label: "Culture drift",
                  hint: "Speed without a shared thesis.",
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "Will the team stay?",
          decisions: [
            {
              id: "ppl-conviction",
              kind: "conviction",
              title: "Retention conviction",
              prompt: "How sure are you nobody critical walks?",
              severity: "medium",
              low: "Someone will leave",
              high: "The team holds",
            },
          ],
        },
      ],
    },
    {
      id: "cs",
      name: "Customer Success",
      owner: "Dev Patel",
      role: "Head of CS",
      tagline: "Keep the logos that already said yes.",
      quote: "Churn is the tax you pay for every decision you postponed.",
      budget: 15,
      accent: "pink",
      icon: "heart",
      panels: [
        {
          id: "cs-accounts",
          title: "Accounts",
          icon: "heart",
          rows: [
            { label: "Customers", base: 4200, fmt: "count", axis: "growth", swing: 850 },
            { label: "Logo churn", base: 3.1, fmt: "pct", axis: "resilience", swing: 1.4, invert: true },
            { label: "Net revenue retention", base: 104, fmt: "pct", axis: "growth", swing: 12 },
            { label: "At-risk ARR", base: 14, fmt: "money", axis: "resilience", swing: 8, invert: true },
          ],
          bar: { label: "CS budget committed", source: "budget" },
        },
        {
          id: "cs-support",
          title: "Support",
          icon: "ticket",
          rows: [
            { label: "Open tickets", base: 312, fmt: "count", axis: "discipline", swing: 110, invert: true },
            { label: "First response", base: 6.4, fmt: "hours", axis: "agility", swing: 2.6, invert: true },
            { label: "CSAT", base: 82, fmt: "pct", axis: "resilience", swing: 10 },
            { label: "Backlog age", base: 9, fmt: "days", axis: "discipline", swing: 4, invert: true },
          ],
        },
        {
          id: "cs-adoption",
          title: "Adoption",
          icon: "activity",
          rows: [
            { label: "Weekly active accounts", base: 61, fmt: "pct", axis: "growth", swing: 14 },
            { label: "Onboarding time", base: 21, fmt: "days", axis: "agility", swing: 8, invert: true },
            { label: "Expansion pipeline", base: 38, fmt: "money", axis: "growth", swing: 17 },
            { label: "Renewals this qtr", base: 26, fmt: "count" },
          ],
        },
      ],
      sections: [
        {
          id: "focus",
          label: "CS focus",
          blurb: "Where does success spend its attention?",
          decisions: [
            {
              id: "cs-focus",
              kind: "choice",
              title: "CS thesis",
              prompt: "312 open tickets. Three at-risk accounts above ₹2L ARR.",
              severity: "high",
              options: [
                {
                  id: "save",
                  label: "Save the whales",
                  hint: "White-glove the three at-risk accounts.",
                  shape: {
                    growth: 40,
                    discipline: 55,
                    resilience: 90,
                    agility: 45,
                  },
                },
                {
                  id: "scale",
                  label: "Scale the queue",
                  hint: "Automate support. Accept some enterprise risk.",
                  shape: {
                    growth: 60,
                    discipline: 70,
                    resilience: 45,
                    agility: 75,
                  },
                },
                {
                  id: "expand",
                  label: "Expand inside",
                  hint: "Upsell healthy accounts. Let risk wait.",
                  shape: {
                    growth: 85,
                    discipline: 40,
                    resilience: 35,
                    agility: 60,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "spend",
          label: "CS spend",
          blurb: "Commit the ₹15L CS budget.",
          decisions: [
            {
              id: "cs-spend",
              kind: "allocate",
              title: "CS budget",
              prompt: "Every rupee here is a renewal conversation.",
              severity: "medium",
              budget: 15,
              unit: 5,
              channels: [
                {
                  id: "success",
                  label: "Success managers",
                  hint: "Humans on the high-ACV accounts.",
                  accent: "pink",
                  shape: {
                    growth: 50,
                    discipline: 45,
                    resilience: 85,
                    agility: 40,
                  },
                },
                {
                  id: "support",
                  label: "Support capacity",
                  hint: "Clear the backlog before it becomes churn.",
                  accent: "cyan",
                  shape: {
                    growth: 35,
                    discipline: 70,
                    resilience: 75,
                    agility: 55,
                  },
                },
                {
                  id: "enablement",
                  label: "Customer enablement",
                  hint: "Docs and onboarding that scale without headcount.",
                  accent: "violet",
                  shape: {
                    growth: 55,
                    discipline: 65,
                    resilience: 60,
                    agility: 50,
                  },
                },
              ],
            },
          ],
        },
        {
          id: "conviction",
          label: "Conviction",
          blurb: "Will the at-risk accounts renew?",
          decisions: [
            {
              id: "cs-conviction",
              kind: "conviction",
              title: "Renewal conviction",
              prompt: "How sure are the three whales?",
              severity: "medium",
              low: "We will lose one",
              high: "All three renew",
            },
          ],
        },
      ],
    },
  ],
};

export function getScenario(id: string) {
  if (id === startupSurvival.id) return startupSurvival;
  return undefined;
}
