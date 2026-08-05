import type { Level } from "@/lib/simulation/types";

/** Mock scenario data. Swap for API payloads once the backend lands. */

const foundation: Level = {
  id: "foundation",
  name: "Startup Survival",
  tier: "Level 01",
  difficulty: "Easy",
  blurb:
    "Seed-stage SaaS with real demand and no focus. Four quarters to prove the model before the money runs thin.",
  company: {
    name: "Nimbus Labs",
    stage: "Seed",
    sector: "B2B SaaS · Workflow automation",
    founded: "2023",
    location: "Bengaluru, IN",
    mandate:
      "You have just been handed the CEO seat. Understand before you act.",
    dossier: [
      "Nimbus Labs sells a workflow automation layer to mid-market operations teams.",
      "Inbound demand is climbing faster than the team can serve it.",
      "Two engineers hold 80% of the codebase context. Nobody has written it down.",
      "The board expects a clear thesis by the end of Q4 — not four experiments.",
    ],
  },
  start: {
    cash: 500,
    revenue: 18,
    customers: 4200,
    employees: 12,
    morale: 78,
    share: 3,
    trust: 70,
    burn: 26,
  },
  quarters: [
    {
      id: "f-q1",
      index: 1,
      label: "Quarter 1",
      headline: "Demand is real. Focus is not.",
      brief: [
        "Quarter 1 opens with real demand and no shared thesis.",
        "4,200 accounts are active. Win rates are soft.",
        "Finance, product, sales, and people all want the same ₹30L.",
        "WARNING: three priorities are competing for one budget.",
      ],
      situation:
        "Inbound leads are up 41% quarter over quarter, but win rates are falling. Sales is chasing every segment at once. You have ₹30 lakh of discretionary spend and one quarter to establish what Nimbus is actually for.",
      signals: [
        { label: "Inbound leads", value: "+41%", tone: "up" },
        { label: "Win rate", value: "18% → 12%", tone: "down" },
        { label: "Sales cycle", value: "34 days", tone: "flat" },
        { label: "Engineering queue", value: "9 weeks", tone: "down" },
      ],
      hidden: [
        "Two thirds of inbound leads were never a fit for the current product.",
        "Your best-retaining accounts all came from one narrow segment.",
      ],
      blocks: [
        {
          kind: "select",
          id: "f-q1-objective",
          title: "Primary objective",
          prompt:
            "Everything downstream serves this one goal. Pick the shape of the quarter.",
          severity: "critical",
          owner: "You · CEO",
          options: [
            {
              id: "growth",
              label: "Aggressive growth",
              hint: "Maximise new logos. Accept messy fit.",
              effects: { customers: 900, revenue: 4, burn: 4, morale: -6, share: 1 },
              scores: { strategy: 8, judgment: 6, risk: 4, adaptability: 12, leadership: 8, uncertainty: 8 },
              consequence:
                "Logo count jumps. Support tickets jump harder — the team is underwater by week six.",
              delayed:
                "Poorly-fit accounts from Q1 begin churning at 3× the normal rate.",
            },
            {
              id: "focus",
              label: "Efficient conversion",
              hint: "Tighten the funnel to the segment that already works.",
              effects: { customers: 420, revenue: 6, burn: 1, morale: 4, share: 1 },
              scores: { strategy: 17, judgment: 18, risk: 15, adaptability: 12, leadership: 13, uncertainty: 16 },
              consequence:
                "Fewer new accounts, materially better ones. Win rate recovers to 21% by quarter end.",
            },
            {
              id: "brand",
              label: "Brand building",
              hint: "Invest in long-term recognition and trust.",
              effects: { customers: 210, revenue: 1, burn: 3, trust: 9, share: 1 },
              scores: { strategy: 12, judgment: 9, risk: 11, adaptability: 8, leadership: 12, uncertainty: 9 },
              consequence:
                "Recall improves and inbound quality lifts slightly, but this quarter's revenue barely moves.",
            },
            {
              id: "retention",
              label: "Retention focus",
              hint: "Grow value inside the accounts you already have.",
              effects: { customers: 90, revenue: 5, morale: 6, trust: 7 },
              scores: { strategy: 14, judgment: 15, risk: 16, adaptability: 9, leadership: 12, uncertainty: 12 },
              consequence:
                "Expansion revenue arrives quietly. The board asks why new-logo growth stalled.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "f-q1-budget",
          title: "Growth budget",
          prompt:
            "₹30 lakh of discretionary spend. Every rupee committed here cannot answer the next surprise.",
          severity: "high",
          owner: "Priya Sharma · Marketing",
          budget: 30,
          step: 5,
          channels: [
            {
              id: "performance",
              label: "Performance marketing",
              hint: "Fast, measurable, stops the moment you stop paying.",
              perUnit: { customers: 220, revenue: 1.4, burn: 1.6 },
              perUnitScores: { adaptability: 3, judgment: 1 },
              saturates: 15,
            },
            {
              id: "content",
              label: "Content & SEO",
              hint: "Compounds slowly. Nothing lands this quarter.",
              perUnit: { customers: 70, revenue: 0.4, trust: 2 },
              perUnitScores: { strategy: 4, uncertainty: 2 },
              saturates: 10,
            },
            {
              id: "partners",
              label: "Channel partnerships",
              hint: "Borrowed distribution. Slower, stickier.",
              perUnit: { customers: 140, revenue: 1.1, share: 0.4 },
              perUnitScores: { strategy: 3, leadership: 2 },
              saturates: 10,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "Optionality for the crisis you cannot see yet.",
              perUnit: { cash: 10, trust: 1 },
              perUnitScores: { risk: 5, uncertainty: 3 },
              saturates: 20,
            },
          ],
        },
        {
          kind: "confidence",
          id: "f-q1-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that your current ideal-customer profile is the right one?",
          severity: "medium",
          owner: "Reflection log",
          truth: 58,
          reveal:
            "Cohort analysis put ICP confidence at 58%. Retention was concentrated in one segment you had not named yet.",
        },
      ],
    },
    {
      id: "f-q2",
      index: 2,
      label: "Quarter 2",
      headline: "The first churn signal.",
      brief: [
        "Quarter 2 — the choices from Q1 are starting to mature.",
        "Retention cohorts show an anomaly in the mid-market band.",
        "Support is carrying 312 open tickets.",
        "ALERT: three accounts above ₹2L ARR are flagged at-risk.",
      ],
      situation:
        "Churn moved from 1.8% to 4.1% monthly. Sales says pricing. Support says onboarding. Engineering says the accounts were never a fit. All three are partly right, and only one of them is worth ₹40 lakh.",
      signals: [
        { label: "Monthly churn", value: "1.8% → 4.1%", tone: "down" },
        { label: "Support backlog", value: "312 tickets", tone: "down" },
        { label: "NPS", value: "31", tone: "flat" },
        { label: "Expansion revenue", value: "+₹3.2L", tone: "up" },
      ],
      hidden: [
        "74% of churn traced back to onboarding, not price.",
        "The loudest complaining account was never going to renew.",
      ],
      blocks: [
        {
          kind: "select",
          id: "f-q2-churn",
          title: "Churn response",
          prompt: "Choose the intervention you will defend to the board.",
          severity: "critical",
          owner: "Divya Nair · Operations",
          options: [
            {
              id: "onboarding",
              label: "Rebuild onboarding",
              hint: "Fix the first 14 days of the customer's life.",
              effects: { customers: -120, revenue: 3, morale: 5, trust: 8, burn: 2 },
              scores: { strategy: 16, judgment: 18, risk: 14, adaptability: 14, leadership: 14, uncertainty: 15 },
              consequence:
                "Churn falls to 2.2% by quarter end. Slow, unglamorous, and the correct read.",
            },
            {
              id: "discount",
              label: "Discount to lock in renewals",
              hint: "Buy time with margin.",
              effects: { customers: 60, revenue: -3, cash: -20, trust: -5 },
              scores: { strategy: 6, judgment: 5, risk: 7, adaptability: 10, leadership: 6, uncertainty: 7 },
              consequence:
                "Renewals hold this quarter. You have taught the market that your price is negotiable.",
              delayed:
                "Discounted accounts now anchor every renewal conversation to the lower price.",
            },
            {
              id: "csm",
              label: "Hire two success managers",
              hint: "Add humans to absorb the problem.",
              effects: { employees: 2, burn: 7, customers: -60, trust: 5, morale: 3 },
              scores: { strategy: 11, judgment: 12, risk: 10, adaptability: 11, leadership: 13, uncertainty: 10 },
              consequence:
                "At-risk accounts stabilise. Burn climbs ₹7L a month and the root cause is still live.",
            },
            {
              id: "ship",
              label: "Ship features faster",
              hint: "Out-build the objection.",
              effects: { customers: -220, revenue: -1, morale: -7, trust: -6 },
              scores: { strategy: 5, judgment: 4, risk: 3, adaptability: 8, leadership: 5, uncertainty: 6 },
              consequence:
                "Two releases land. Churn keeps climbing — the leak was never a missing feature.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "f-q2-budget",
          title: "Quarterly budget",
          prompt: "₹40 lakh across the functions competing for the same fix.",
          severity: "high",
          owner: "Karan Mehta · Finance",
          budget: 40,
          step: 5,
          channels: [
            {
              id: "product",
              label: "Product & engineering",
              hint: "Close the gap the data actually points to.",
              perUnit: { revenue: 1.2, trust: 2, morale: 1 },
              perUnitScores: { strategy: 3, judgment: 3 },
              saturates: 20,
            },
            {
              id: "success",
              label: "Customer success",
              hint: "Human intervention on at-risk accounts.",
              perUnit: { customers: 90, trust: 3, burn: 1.2 },
              perUnitScores: { leadership: 3, risk: 2 },
              saturates: 15,
            },
            {
              id: "sales",
              label: "Sales capacity",
              hint: "Replace what leaks with new logos.",
              perUnit: { customers: 180, revenue: 1.1, burn: 1.5 },
              perUnitScores: { adaptability: 2 },
              saturates: 15,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "Runway is a strategy too.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 4, uncertainty: 2 },
              saturates: 20,
            },
          ],
        },
        {
          kind: "confidence",
          id: "f-q2-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that churn is product-driven rather than price-driven?",
          severity: "medium",
          owner: "Reflection log",
          truth: 74,
          reveal:
            "Post-mortem attributed 74% of churn to onboarding and product friction. Price was a symptom people found easier to say out loud.",
        },
      ],
    },
    {
      id: "f-q3",
      index: 3,
      label: "Quarter 3",
      headline: "A competitor prices below cost.",
      brief: [
        "Quarter 3 — an external shock lands mid-cycle.",
        "Helix launches at 40% below your list price.",
        "Twenty-two deals in the pipeline pause overnight.",
        "ALERT: two enterprise prospects ask for price matching.",
      ],
      situation:
        "Helix, venture-funded and three times your size, just priced 40% under you. Twenty-two deals paused within a week. Your team wants to match. Nobody in the room knows how long Helix can sustain it.",
      signals: [
        { label: "Deals paused", value: "22", tone: "down" },
        { label: "Helix price", value: "-40% vs list", tone: "down" },
        { label: "Your gross margin", value: "71%", tone: "flat" },
        { label: "Renewal cohort", value: "89% intact", tone: "up" },
      ],
      hidden: [
        "Helix was burning ₹9 for every ₹10 of revenue at that price.",
        "Your paused deals valued integration depth over price by a 2:1 margin.",
      ],
      blocks: [
        {
          kind: "select",
          id: "f-q3-pricing",
          title: "Pricing response",
          prompt: "The market is watching what you do in the next two weeks.",
          severity: "critical",
          owner: "Arjun Rao · Sales",
          options: [
            {
              id: "match",
              label: "Match the price",
              hint: "Protect the pipeline. Absorb the margin hit.",
              effects: { revenue: -4, customers: 340, cash: -30, trust: -4, share: 1 },
              scores: { strategy: 7, judgment: 6, risk: 5, adaptability: 12, leadership: 8, uncertainty: 7 },
              consequence:
                "Deals unfreeze. Your margin story is now identical to a company with ten times your funding.",
              delayed:
                "Helix raises prices two quarters later. Your customers do not let you follow.",
            },
            {
              id: "hold",
              label: "Hold price, sharpen positioning",
              hint: "Compete on depth, not on discount.",
              effects: { customers: 150, revenue: 5, trust: 7, share: 1, morale: 4 },
              scores: { strategy: 18, judgment: 17, risk: 16, adaptability: 13, leadership: 15, uncertainty: 17 },
              consequence:
                "You lose six price-shoppers and win nine integration-led deals. Margin intact.",
            },
            {
              id: "segment",
              label: "Introduce a stripped tier",
              hint: "Fight at the bottom without moving the top.",
              effects: { customers: 260, revenue: 2, burn: 3, trust: 2 },
              scores: { strategy: 14, judgment: 13, risk: 12, adaptability: 15, leadership: 11, uncertainty: 13 },
              consequence:
                "The cheap tier sells. So does the confusion about which product you actually are.",
            },
            {
              id: "wait",
              label: "Wait one quarter and watch",
              hint: "Let the data mature before committing.",
              effects: { customers: -80, revenue: 1, cash: 15, trust: -2 },
              scores: { strategy: 12, judgment: 12, risk: 15, adaptability: 6, leadership: 7, uncertainty: 14 },
              consequence:
                "You keep your powder dry and lose four deals you could have held. Helix's burn becomes visible.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "f-q3-budget",
          title: "Defence budget",
          prompt: "₹45 lakh. Choose where the competitive answer actually lives.",
          severity: "high",
          owner: "Karan Mehta · Finance",
          budget: 45,
          step: 5,
          channels: [
            {
              id: "depth",
              label: "Product depth",
              hint: "Widen the moat the price-cutter cannot copy.",
              perUnit: { revenue: 1.4, trust: 3, share: 0.3 },
              perUnitScores: { strategy: 4, judgment: 2 },
              saturates: 20,
            },
            {
              id: "enterprise",
              label: "Enterprise motion",
              hint: "Move upmarket where price matters less.",
              perUnit: { revenue: 1.8, customers: 40, burn: 1.4 },
              perUnitScores: { strategy: 3, uncertainty: 2 },
              saturates: 20,
            },
            {
              id: "priceshield",
              label: "Price protection fund",
              hint: "Selective discounts for accounts worth keeping.",
              perUnit: { customers: 120, revenue: -0.4, cash: -2 },
              perUnitScores: { risk: 2, adaptability: 2 },
              saturates: 10,
            },
            {
              id: "efficiency",
              label: "Cost efficiency",
              hint: "Lower the floor you can survive at.",
              perUnit: { burn: -2, cash: 4, morale: -1 },
              perUnitScores: { risk: 4, judgment: 2 },
              saturates: 15,
            },
          ],
        },
        {
          kind: "confidence",
          id: "f-q3-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that Helix can sustain this price for four more quarters?",
          severity: "medium",
          truth: 24,
          owner: "Reflection log",
          reveal:
            "Helix's own filings later showed the price was sustainable for roughly two quarters. Confidence above 50% here was reading the threat, not the balance sheet.",
        },
      ],
    },
    {
      id: "f-q4",
      index: 4,
      label: "Quarter 4",
      headline: "The bridge round decision.",
      brief: [
        "Quarter 4 — the board review is on the calendar.",
        "Runway is being re-projected against the last three quarters.",
        "One inbound term sheet. One solicited. Both imperfect.",
        "ALERT: your co-founder has asked for a private conversation.",
      ],
      situation:
        "Nine months of decisions are about to be priced. You have one inbound term sheet at a flat valuation, an option to bootstrap on current revenue, and a co-founder who thinks you have been too cautious. The board meets in three weeks.",
      signals: [
        { label: "Runway", value: "compute below", tone: "flat" },
        { label: "Term sheet", value: "Flat, 18% dilution", tone: "flat" },
        { label: "Net revenue retention", value: "104%", tone: "up" },
        { label: "Co-founder alignment", value: "Strained", tone: "down" },
      ],
      hidden: [
        "The inbound investor would have moved 15% on valuation if pushed once.",
        "Two senior engineers were waiting to see whether you chose growth or discipline.",
      ],
      blocks: [
        {
          kind: "select",
          id: "f-q4-funding",
          title: "Funding posture",
          prompt: "This choice sets the next 18 months, not the next 90 days.",
          severity: "critical",
          owner: "You · CEO",
          options: [
            {
              id: "raise",
              label: "Take the bridge",
              hint: "Buy certainty. Pay in ownership.",
              effects: { cash: 350, trust: 5, morale: 4, burn: 6 },
              scores: { strategy: 13, judgment: 12, risk: 14, adaptability: 12, leadership: 12, uncertainty: 12 },
              consequence:
                "Runway extends past 18 months. Dilution is real and permanent.",
            },
            {
              id: "negotiate",
              label: "Negotiate once, then decide",
              hint: "Test the price before accepting it.",
              effects: { cash: 320, trust: 8, morale: 5, burn: 4 },
              scores: { strategy: 18, judgment: 18, risk: 16, adaptability: 15, leadership: 16, uncertainty: 18 },
              consequence:
                "One conversation moved the valuation 15%. The same cash, materially less dilution.",
            },
            {
              id: "bootstrap",
              label: "Bootstrap on revenue",
              hint: "Keep control. Accept a slower ceiling.",
              effects: { cash: -40, revenue: 3, morale: -3, trust: 3, burn: -4 },
              scores: { strategy: 14, judgment: 15, risk: 17, adaptability: 10, leadership: 11, uncertainty: 13 },
              consequence:
                "You stay in control and grow 30% slower. Two hires you needed do not happen.",
            },
            {
              id: "aggressive",
              label: "Raise big, spend hard",
              hint: "Buy the market while capital is available.",
              effects: { cash: 600, burn: 22, employees: 8, morale: -5, share: 2 },
              scores: { strategy: 9, judgment: 7, risk: 4, adaptability: 13, leadership: 9, uncertainty: 8 },
              consequence:
                "Headcount doubles in a quarter. So does the burn, and nobody has fixed onboarding.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "f-q4-budget",
          title: "Next-quarter commitment",
          prompt: "₹50 lakh pre-committed for the quarter after this one.",
          severity: "high",
          owner: "Karan Mehta · Finance",
          budget: 50,
          step: 5,
          channels: [
            {
              id: "core",
              label: "Core product",
              hint: "Protect the thing that retains.",
              perUnit: { revenue: 1.5, trust: 2, morale: 1 },
              perUnitScores: { strategy: 3, judgment: 3 },
              saturates: 25,
            },
            {
              id: "gtm",
              label: "Go-to-market",
              hint: "Convert the thesis you proved into pipeline.",
              perUnit: { customers: 200, revenue: 1.2, burn: 1.4 },
              perUnitScores: { adaptability: 3, leadership: 1 },
              saturates: 20,
            },
            {
              id: "team",
              label: "Team & retention",
              hint: "The people who carry the context.",
              perUnit: { morale: 4, trust: 2, burn: 1.6 },
              perUnitScores: { leadership: 4, risk: 2 },
              saturates: 15,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "The surprise you have not met yet.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 5, uncertainty: 3 },
              saturates: 25,
            },
          ],
        },
        {
          kind: "confidence",
          id: "f-q4-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that Nimbus reaches profitability without another raise?",
          severity: "medium",
          owner: "Reflection log",
          truth: 46,
          reveal:
            "Modelled against your final metrics, unaided profitability sat near 46%. Both extremes — certainty and despair — were misreads.",
        },
      ],
    },
  ],
};

const pressure: Level = {
  id: "pressure",
  name: "Turnaround Under Fire",
  tier: "Level 02",
  difficulty: "Hard",
  blurb:
    "Series B logistics, ₹3.2 crore monthly burn, five months of runway and a board that has lost patience. Save it or wind it down.",
  company: {
    name: "Verdant Freight",
    stage: "Series B",
    sector: "Logistics · Cold-chain networks",
    founded: "2019",
    location: "Pune, IN",
    mandate:
      "You were brought in to stop the bleeding. Nobody agrees on where the wound is.",
    dossier: [
      "Verdant runs cold-chain freight for pharma and perishables across four states.",
      "Growth was bought with subsidised pricing. 38% of routes lose money on every run.",
      "The previous CEO left in month two of a nine-month plan.",
      "Two board members want a wind-down. One wants a doubling. All three vote.",
    ],
  },
  start: {
    cash: 1200,
    revenue: 210,
    customers: 860,
    employees: 180,
    morale: 54,
    share: 11,
    trust: 48,
    burn: 320,
  },
  quarters: [
    {
      id: "p-q1",
      index: 1,
      label: "Quarter 1",
      headline: "Five months of runway and four opinions.",
      brief: [
        "Quarter 1 opens on crisis footing.",
        "At current burn you have 3.7 months of runway.",
        "Thirty-eight percent of routes run at negative contribution.",
        "CRITICAL: payroll clears in eleven days.",
      ],
      situation:
        "Verdant is net-burning ₹3.2 crore every month on ₹2.1 crore of revenue. Thirty-eight percent of routes lose money on every single run. Cutting them frees cash and breaks contracts with your two largest pharma clients.",
      signals: [
        { label: "Runway", value: "3.7 months", tone: "down" },
        { label: "Loss-making routes", value: "38%", tone: "down" },
        { label: "Client concentration", value: "Top 2 = 44%", tone: "down" },
        { label: "On-time delivery", value: "91%", tone: "up" },
      ],
      hidden: [
        "Your largest pharma client had already budgeted for a 12% price increase.",
        "Six of the loss-making routes were one contract renegotiation away from profitable.",
      ],
      blocks: [
        {
          kind: "select",
          id: "p-q1-triage",
          title: "Triage decision",
          prompt: "You cannot save everything this quarter. Choose what survives.",
          severity: "critical",
          owner: "You · CEO",
          options: [
            {
              id: "cut",
              label: "Cut all loss-making routes",
              hint: "Immediate cash relief. Contractual fallout.",
              effects: { burn: -70, revenue: -55, customers: -180, trust: -12, morale: -8 },
              scores: { strategy: 11, judgment: 10, risk: 13, adaptability: 12, leadership: 8, uncertainty: 10 },
              consequence:
                "Burn drops ₹70 lakh a month. Both pharma clients open competitive tenders the same week.",
              delayed:
                "One pharma client returns with a smaller, profitable contract. The other is gone for good.",
            },
            {
              id: "reprice",
              label: "Reprice before you cut",
              hint: "Test what the market will actually bear.",
              effects: { burn: -35, revenue: 18, customers: -70, trust: 4, morale: 2 },
              scores: { strategy: 18, judgment: 19, risk: 16, adaptability: 15, leadership: 16, uncertainty: 18 },
              consequence:
                "Nine of eighteen loss-making routes turn positive on price alone. You cut the remaining nine with data behind you.",
            },
            {
              id: "volume",
              label: "Grow into the fixed cost",
              hint: "Fill the trucks you are already paying for.",
              effects: { revenue: 32, burn: 24, customers: 120, morale: -6, share: 1 },
              scores: { strategy: 7, judgment: 5, risk: 4, adaptability: 11, leadership: 7, uncertainty: 6 },
              consequence:
                "Volume rises 15%. Unit economics stay negative, so the loss rises with it.",
            },
            {
              id: "flat",
              label: "Freeze everything, buy time",
              hint: "Hiring, spend and routes all on hold.",
              effects: { burn: -45, revenue: -12, morale: -14, trust: -6 },
              scores: { strategy: 9, judgment: 11, risk: 15, adaptability: 5, leadership: 6, uncertainty: 11 },
              consequence:
                "Cash steadies for a quarter. Four senior operators start interviewing elsewhere.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "p-q1-budget",
          title: "Survival budget",
          prompt:
            "₹120 lakh is all that is uncommitted this quarter. Payroll is not in this number.",
          severity: "critical",
          owner: "Karan Mehta · CFO",
          budget: 120,
          step: 10,
          channels: [
            {
              id: "ops",
              label: "Route optimisation",
              hint: "Attack the unit economics directly.",
              perUnit: { burn: -6, revenue: 2, trust: 1 },
              perUnitScores: { strategy: 3, judgment: 3 },
              saturates: 60,
            },
            {
              id: "clients",
              label: "Client retention",
              hint: "Hold the contracts you cannot replace.",
              perUnit: { customers: 30, revenue: 3, trust: 3 },
              perUnitScores: { leadership: 3, risk: 2 },
              saturates: 40,
            },
            {
              id: "people",
              label: "Key-person retention",
              hint: "The operators who know the network.",
              perUnit: { morale: 5, trust: 2, burn: 3 },
              perUnitScores: { leadership: 4, risk: 3 },
              saturates: 30,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "You are eleven days from payroll.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 5, uncertainty: 3 },
              saturates: 60,
            },
          ],
        },
        {
          kind: "confidence",
          id: "p-q1-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that your largest client stays if you raise prices 12%?",
          severity: "high",
          owner: "Reflection log",
          truth: 78,
          reveal:
            "They had already provisioned for a 12% increase. Confidence below 50% here cost Verdant a quarter of margin.",
        },
      ],
    },
    {
      id: "p-q2",
      index: 2,
      label: "Quarter 2",
      headline: "The cold-chain failure nobody logged.",
      brief: [
        "Quarter 2 — an incident escalates before the plan settles.",
        "Three shipments show a temperature excursion. One client.",
        "A pharma compliance review has been opened.",
        "CRITICAL: a journalist has the shipment logs.",
      ],
      situation:
        "Three pharma shipments broke temperature range last month. Nobody filed the incident. A journalist has the logs and will publish in 72 hours. Your compliance head found out this morning, from you.",
      signals: [
        { label: "Shipments affected", value: "3", tone: "down" },
        { label: "Disclosure window", value: "72 hours", tone: "down" },
        { label: "Regulatory exposure", value: "Open review", tone: "down" },
        { label: "Client awareness", value: "Not yet", tone: "flat" },
      ],
      hidden: [
        "The excursion was caused by a sensor firmware bug, not negligence.",
        "The affected client had a disclosure clause that rewarded voluntary reporting.",
      ],
      blocks: [
        {
          kind: "select",
          id: "p-q2-disclosure",
          title: "Disclosure decision",
          prompt:
            "Seventy-two hours. What the market learns first shapes everything after.",
          severity: "critical",
          owner: "You · CEO",
          options: [
            {
              id: "proactive",
              label: "Disclose first, fully",
              hint: "Tell the client and the regulator before the story runs.",
              effects: { trust: 14, revenue: -8, cash: -40, morale: 8, customers: -40 },
              scores: { strategy: 17, judgment: 19, risk: 18, adaptability: 15, leadership: 20, uncertainty: 16 },
              consequence:
                "The story runs with your statement in it. The client invokes the voluntary-reporting clause and stays.",
            },
            {
              id: "partial",
              label: "Disclose narrowly",
              hint: "Tell the regulator, not the press.",
              effects: { trust: 2, cash: -20, morale: -2, customers: -70 },
              scores: { strategy: 11, judgment: 10, risk: 11, adaptability: 12, leadership: 9, uncertainty: 11 },
              consequence:
                "The regulator is satisfied. The story runs anyway, and now the omission is the story.",
            },
            {
              id: "fix",
              label: "Fix quietly, say nothing",
              hint: "Patch the firmware and hope the story dies.",
              effects: { trust: -22, revenue: -26, customers: -160, morale: -12 },
              scores: { strategy: 4, judgment: 3, risk: 2, adaptability: 6, leadership: 2, uncertainty: 5 },
              consequence:
                "The story runs without you. Two clients suspend contracts inside a week.",
              delayed:
                "The undisclosed incident resurfaces during diligence and reprices the entire company.",
            },
            {
              id: "legal",
              label: "Route it through legal",
              hint: "Buy time with process.",
              effects: { trust: -8, cash: -55, morale: -5, customers: -60 },
              scores: { strategy: 8, judgment: 7, risk: 12, adaptability: 6, leadership: 5, uncertainty: 8 },
              consequence:
                "Legal delays the response by four days. The narrative is fully formed by then.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "p-q2-budget",
          title: "Incident response budget",
          prompt: "₹90 lakh. Containment, remediation, or reputation.",
          severity: "high",
          owner: "Divya Nair · Head of Operations",
          budget: 90,
          step: 10,
          channels: [
            {
              id: "root",
              label: "Root-cause remediation",
              hint: "Fix the firmware across the whole fleet.",
              perUnit: { trust: 3, burn: 1, revenue: 1 },
              perUnitScores: { judgment: 4, risk: 3 },
              saturates: 40,
            },
            {
              id: "comms",
              label: "Stakeholder communication",
              hint: "Clients, regulator, staff — in that order.",
              perUnit: { trust: 4, customers: 20 },
              perUnitScores: { leadership: 4, strategy: 1 },
              saturates: 30,
            },
            {
              id: "audit",
              label: "Independent audit",
              hint: "Credibility you did not write yourself.",
              perUnit: { trust: 5, cash: -2 },
              perUnitScores: { risk: 4, judgment: 2 },
              saturates: 30,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "There may be a second shoe.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 4, uncertainty: 3 },
              saturates: 50,
            },
          ],
        },
        {
          kind: "confidence",
          id: "p-q2-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that voluntary disclosure costs less than being exposed?",
          severity: "high",
          owner: "Reflection log",
          truth: 86,
          reveal:
            "Across comparable incidents, voluntary disclosure was cheaper 86% of the time. The instinct to conceal is almost always the expensive one.",
        },
      ],
    },
    {
      id: "p-q3",
      index: 3,
      label: "Quarter 3",
      headline: "Your network lead resigns mid-quarter.",
      brief: [
        "Quarter 3 — key-person risk stops being theoretical.",
        "The Head of Network Design has resigned.",
        "Documented processes cover thirty-one percent of the network.",
        "ALERT: two direct reports have asked about their futures.",
      ],
      situation:
        "The one person who understood how the route network actually fits together resigned on a Tuesday. Thirty-one percent of that knowledge is written down. A competitor made the offer, and two of her reports are being courted next.",
      signals: [
        { label: "Process documentation", value: "31%", tone: "down" },
        { label: "Team morale", value: "falling", tone: "down" },
        { label: "Route margin", value: "improving", tone: "up" },
        { label: "Replacement lead time", value: "14 weeks", tone: "down" },
      ],
      hidden: [
        "She would have stayed for a scope change, not more money.",
        "Her second-in-command already had 70% of the network model rebuilt privately.",
      ],
      blocks: [
        {
          kind: "select",
          id: "p-q3-people",
          title: "Key-person response",
          prompt: "Knowledge is walking out. Decide what you protect.",
          severity: "critical",
          owner: "Ananya Iyer · People & HR",
          options: [
            {
              id: "counter",
              label: "Counter the offer hard",
              hint: "Pay above market to keep her.",
              effects: { cash: -60, burn: 8, morale: -4, trust: 2 },
              scores: { strategy: 8, judgment: 7, risk: 9, adaptability: 9, leadership: 8, uncertainty: 8 },
              consequence:
                "She takes it and leaves in five months anyway. The rest of the team learns that resigning is how you get paid.",
            },
            {
              id: "promote",
              label: "Promote the second-in-command",
              hint: "Bet on the person already doing the work.",
              effects: { morale: 12, trust: 6, revenue: 6, burn: 3 },
              scores: { strategy: 17, judgment: 18, risk: 15, adaptability: 18, leadership: 20, uncertainty: 16 },
              consequence:
                "She had already rebuilt 70% of the model. Continuity holds and two retention risks resolve themselves.",
            },
            {
              id: "consultant",
              label: "Bring in consultants",
              hint: "Buy expertise while you search.",
              effects: { cash: -90, morale: -8, trust: -3, revenue: 2 },
              scores: { strategy: 9, judgment: 8, risk: 10, adaptability: 8, leadership: 5, uncertainty: 9 },
              consequence:
                "Consultants document the network competently and leave. Your team resents paying outsiders to learn their job.",
            },
            {
              id: "absorb",
              label: "Absorb it yourself",
              hint: "Take the function under your own remit.",
              effects: { morale: -6, trust: -4, revenue: -6, burn: -2 },
              scores: { strategy: 7, judgment: 6, risk: 6, adaptability: 10, leadership: 6, uncertainty: 7 },
              consequence:
                "You now run network design and the company. Both get 60% of a CEO.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "p-q3-budget",
          title: "Continuity budget",
          prompt: "₹100 lakh against the risk of institutional memory leaving.",
          severity: "high",
          owner: "Ananya Iyer · People & HR",
          budget: 100,
          step: 10,
          channels: [
            {
              id: "docs",
              label: "Knowledge documentation",
              hint: "Make the network legible to more than one person.",
              perUnit: { trust: 2, revenue: 1.5, morale: 1 },
              perUnitScores: { risk: 4, strategy: 3 },
              saturates: 40,
            },
            {
              id: "retention",
              label: "Retention for the layer below",
              hint: "The reports who are being courted next.",
              perUnit: { morale: 5, burn: 2, trust: 2 },
              perUnitScores: { leadership: 4, risk: 2 },
              saturates: 40,
            },
            {
              id: "hire",
              label: "Senior hiring",
              hint: "Fourteen weeks to a replacement.",
              perUnit: { employees: 1, burn: 4, revenue: 1 },
              perUnitScores: { adaptability: 2, strategy: 1 },
              saturates: 30,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "Runway still governs everything.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 4, uncertainty: 2 },
              saturates: 50,
            },
          ],
        },
        {
          kind: "confidence",
          id: "p-q3-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that the network can run without the person who left?",
          severity: "medium",
          owner: "Reflection log",
          truth: 68,
          reveal:
            "The second-in-command's private rebuild put real continuity near 68%. Panic and complacency were both wrong by a wide margin.",
        },
      ],
    },
    {
      id: "p-q4",
      index: 4,
      label: "Quarter 4",
      headline: "Save it, sell it, or shut it.",
      brief: [
        "Quarter 4 — the board wants a resolution, not another plan.",
        "Three strategic options sit on the table.",
        "One unsolicited, non-binding acquisition interest has arrived.",
        "CRITICAL: the board votes in fourteen days.",
      ],
      situation:
        "Three quarters of decisions have produced a company that is smaller, cleaner, and no longer bleeding. An unsolicited acquirer wants it at 1.4× revenue. One board member wants an aggressive re-expansion. The third wants a controlled wind-down. You get one recommendation.",
      signals: [
        { label: "Board vote", value: "14 days", tone: "flat" },
        { label: "Acquisition offer", value: "1.4× revenue", tone: "flat" },
        { label: "Route margin", value: "positive", tone: "up" },
        { label: "Employee confidence", value: "fragile", tone: "down" },
      ],
      hidden: [
        "The acquirer's real ceiling was 2.1× revenue with an earn-out attached.",
        "Two of your remaining clients would have signed three-year terms if asked.",
      ],
      blocks: [
        {
          kind: "select",
          id: "p-q4-endgame",
          title: "Board recommendation",
          prompt: "One recommendation. It has to survive questioning.",
          severity: "critical",
          owner: "You · CEO",
          options: [
            {
              id: "sell",
              label: "Accept the offer",
              hint: "Certainty now at a price you did not test.",
              effects: { cash: 400, trust: 4, morale: -6 },
              scores: { strategy: 10, judgment: 9, risk: 13, adaptability: 10, leadership: 9, uncertainty: 9 },
              consequence:
                "The deal closes. Six weeks later you learn the acquirer had 50% more room.",
            },
            {
              id: "negotiate",
              label: "Test the offer, then decide",
              hint: "Lock long-term contracts first, negotiate second.",
              effects: { cash: 520, revenue: 14, trust: 10, morale: 4 },
              scores: { strategy: 19, judgment: 20, risk: 17, adaptability: 17, leadership: 18, uncertainty: 19 },
              consequence:
                "Two three-year contracts signed, then the price moved to 2.1×. Same company, materially better outcome.",
            },
            {
              id: "expand",
              label: "Re-expand aggressively",
              hint: "The economics finally work. Push.",
              effects: { revenue: 46, burn: 62, employees: 22, cash: -180, morale: 6, share: 2 },
              scores: { strategy: 12, judgment: 9, risk: 6, adaptability: 14, leadership: 12, uncertainty: 10 },
              consequence:
                "Growth returns and so does the burn. You have rebuilt the machine you were hired to fix.",
            },
            {
              id: "winddown",
              label: "Controlled wind-down",
              hint: "Return capital, protect people, close cleanly.",
              effects: { cash: 240, revenue: -120, employees: -90, morale: -14, trust: 6 },
              scores: { strategy: 11, judgment: 13, risk: 16, adaptability: 8, leadership: 12, uncertainty: 12 },
              consequence:
                "Capital returns cleanly and every employee lands somewhere. A profitable business was closed to do it.",
            },
          ],
        },
        {
          kind: "allocate",
          id: "p-q4-budget",
          title: "Final quarter commitment",
          prompt: "₹110 lakh behind whichever future you just recommended.",
          severity: "high",
          owner: "Karan Mehta · CFO",
          budget: 110,
          step: 10,
          channels: [
            {
              id: "contracts",
              label: "Contract lock-in",
              hint: "Revenue the buyer or the board can count on.",
              perUnit: { revenue: 3, trust: 3, customers: 20 },
              perUnitScores: { strategy: 4, judgment: 3 },
              saturates: 40,
            },
            {
              id: "margin",
              label: "Margin discipline",
              hint: "Prove the economics hold under scrutiny.",
              perUnit: { burn: -5, cash: 4 },
              perUnitScores: { judgment: 3, risk: 3 },
              saturates: 40,
            },
            {
              id: "people",
              label: "People continuity",
              hint: "Whoever owns this next needs the team.",
              perUnit: { morale: 5, trust: 2, burn: 2 },
              perUnitScores: { leadership: 4 },
              saturates: 30,
            },
            {
              id: "reserve",
              label: "Hold in reserve",
              hint: "Deals fall through. Cash does not.",
              perUnit: { cash: 10 },
              perUnitScores: { risk: 4, uncertainty: 3 },
              saturates: 50,
            },
          ],
        },
        {
          kind: "confidence",
          id: "p-q4-confidence",
          title: "Calibration check",
          prompt:
            "How confident are you that 1.4× revenue is the acquirer's real ceiling?",
          severity: "high",
          owner: "Reflection log",
          truth: 18,
          reveal:
            "Their internal ceiling was 2.1× with an earn-out. First offers are anchors, not valuations.",
        },
      ],
    },
  ],
};

export const levels: Level[] = [foundation, pressure];

export function getLevel(id: string): Level | undefined {
  return levels.find((l) => l.id === id);
}
