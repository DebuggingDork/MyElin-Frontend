# Frontend Audit — Phase 0

Read-only audit of the existing frontend against `docs/frontend-integration-guide.md` and
`docs/frontend-implementation-notes.md`. No component, fetch call, or data shape was changed to
produce this document.

## Headline finding

**There is no backend integration anywhere in this codebase.** A repo-wide search for `fetch(`,
`axios`, `process.env.NEXT_PUBLIC`, `localStorage`, `Authorization`, `Bearer` and `apiClient`
matches nothing outside the two new `docs/` files. `package.json` has no HTTP client, no
`swr`/`react-query`, and no `.env*` file exists. Every screen below is either static marketing
copy, hardcoded array literals, or a fully local `useState` model with zero network calls. There
is no shared API client / auth wrapper to extend — Phase 1 starts from nothing.

Separately, and more importantly: the one screen that *looks* like the real product — `/play/[slug]`
— is built around a **different game model than the real API**. It was evidently built as a mockup
before this API existed (`lib/play/data.ts` line 3: *"Mock data until the API lands"*). Its data
shapes, decision types, and scoring concept don't correspond field-for-field to anything in the
guide — see the dedicated section below. This isn't a wiring gap so much as a model mismatch that
needs a product decision before Phase 1 touches it.

---

## Audit table

| Screen | Current data source | Target real endpoint(s) | Shape match / mismatch | Auth wired? | `legal_moves`-driven? | Notes |
|---|---|---|---|---|---|---|
| **Login** (`app/login/page.tsx` → `components/pages/Login.tsx`) | Local `useState` for email/password only. Form has `onSubmit={(e) => e.preventDefault()}` — submit does nothing at all, no request of any kind. | `POST /auth/login` | N/A — no request is made, so there's nothing to compare shapes against. Guide's `auth_login_response` (`access_token`, `email`, `refresh_token`, `user_id`) is entirely unhandled. | No. No token storage, no header injection, nothing persisted anywhere. | N/A | "Continue with Google" button is also inert (no handler). |
| **Signup** (`app/signup/page.tsx` → `components/pages/Signup.tsx`) | Local `useState` for name/email/password/role ("Student"/"Faculty"/"Recruiter"). Same `preventDefault()`-only submit. | `POST /auth/register` | N/A — no request made. Note: the guide's register body is only `{email, password}` — this form also collects `name` and a `role` the API doesn't ask for; that mismatch will need a product call (drop the fields, or the backend needs to accept/store them somewhere) once real wiring starts. | No. | N/A | Same inert Google button. |
| **Simulations catalogue** (`app/simulations/page.tsx` → `components/pages/Simulations.tsx`) | Hardcoded `scenarios: Scenario[]` array (6 entries — Startup Survival, M&A War Room, Crisis Comms, Turnaround, Fundraise, Product Pivot) with invented fields (`intensity`, `level`, `status: LIVE/BETA/COMING`) that don't exist in the guide at all. | Unclear — the guide has no "list of scenarios to choose from" endpoint. `POST /companies` takes a `name` only; `scenario` in the `company_create_response` is a fixed object (`scenario_id: "nadi_wear_standard"`, `crisis_quarter`, `total_quarters`) assigned server-side, not selected by the client. | **Unclear, needs product input.** Only one scenario ("Startup Survival") links anywhere real (`/play/startup-survival`); the other five are dead/`disabled` cards. Whether a multi-scenario picker is even in scope for the real API (which appears to ship exactly one scenario, `nadi_wear_standard`) is a product question, not something inferable from the guide. | No. | No — every "LIVE"/"BETA"/"COMING" status is a hardcoded literal, not derived from any run state. | This screen's entire premise (a marketplace of selectable scenarios) may not map to the real API's model (one fixed scenario per company) at all. |
| **Leaderboard** (`app/leaderboard/page.tsx` → `components/pages/Leaderboard.tsx`) | Hardcoded `rows: Entry[]` (one real-looking row "Vikas / myelinlabs / 89.1", five "slot open" placeholders) and hardcoded `boardStats`. | `GET /companies/{id}/leaderboard` | Mismatch — guide describes this as "per-quarter score rollup" for a run; nothing in the guide suggests a *global* cross-user ranked board with medallions/seasons ("S-25 cohort"). The endpoint's actual response shape isn't captured anywhere in the guide (§1 lists it only as "optional," no payload shown), so field-level comparison isn't possible from the guide alone. | No. | No. | Flag as **unclear, needs product input** — both because the payload shape for this endpoint isn't in the guide's captured examples, and because "global leaderboard across all companies" vs. "one run's per-quarter rollup" may be different concepts entirely. |
| **Play — Entry Gate** (`components/play/EntryGate.tsx`) | Renders entirely from the local hardcoded `Scenario` object (`lib/play/data.ts`'s `startupSurvival`) passed down from `app/play/[slug]/page.tsx` via `getScenario(slug)`. Four consent checkboxes gate a local `onEnter()` callback — no request. | Conceptually maps to the point after `POST /companies` + first `GET .../run` (i.e., "before Q1 opens"), but nothing here calls either. | N/A — no request. | No. | No — the "30 minutes, one sitting" framing has no server-side equivalent in the guide (no session/time-limit concept mentioned in the lifecycle). | Countdown timer (`seconds` state, SVG dial) is local-only decoration, not tied to any server session. |
| **Play — Dashboard / Command view** (`components/play/Dashboard.tsx`, `CommandView`) | 100% local: `useState<Answers>` keyed by decision id, computed via `readCompany`/`departmentProgress`/`allocationProgress` (`lib/play/insights.ts`, `lib/play/types.ts`) against the hardcoded `scenario.departments`. "Run quarter" (`runQuarter()`) just flips a local `locked` boolean — no request, no report. | `GET /companies/{id}/run` (for `legal_moves`, `current_quarter_status`, `score_trajectory`) and `POST .../quarters/{qid}/lock` (for the "run quarter" action) | **Fundamental mismatch**, not just field-level — see "Model mismatch" section below. | No. | **No — hardcoded.** `runQuarter()` decides "ready to lock" from 100%-local-answer completion (`sealedCount === departments.length`), never from `legal_moves`. The "Sealed"/lock button state is derived from a local `locked` boolean the UI itself sets, not from a server response. This is the exact anti-pattern both docs call out by name (§1 implementation notes: *"Never hardcode... a stale button, an action available at the wrong time"*). | |
| **Play — Workspace** (`components/play/Dashboard.tsx` `Workspace()`, `components/play/Slabs.tsx`) | Six departments (Finance, Marketing?, Product?, Sales?, Ops?, HR? — see model-mismatch section for exact list), each with `sections[].decisions[]` of kind `choice`/`allocate`/`priority`/`conviction`, answered into local `Answers` state, "sealed" per-department based on 100% local completion. | The six allocation endpoints (`POST .../allocations/{marketing,sales,rnd,operations,hr,finance_admin}`) | **Mismatch.** Real API: 6 upsertable money-allocation lines (any order, any count, Rs lakhs) per department, no concept of discrete "decisions" with kinds `choice`/`priority`/`conviction`. Current UI: rich per-department decision trees (multi-step "sections," ranked-priority pickers, conviction sliders, narrative choice cards) — none of which correspond to a lakhs-denominated allocation submission. See model-mismatch section. | No. | No — "desk sealed" is 100%-local-answer-completion, not `legal_moves`. | |
| **Play — Live Read / Readouts panels** (`components/play/LiveRead.tsx`, `components/play/Readouts.tsx`) | Purely derivative of the same local `Answers` state — a "4-axis Shape" (`growth`/`discipline`/`resilience`/`agility`) computed client-side in `lib/play/types.ts`'s `departmentShape()`/`readCompany()`, averaged from whichever local decisions have been answered. | `outcome` + `decision_quality` (`QuarterReportResponse`, guide §7) — but only *after* `POST .../lock`, i.e. this should not be live/predictive at all. | **Mismatch (conceptual, not just field-level).** The real score is a 7-trait CEO score computed server-side, only after lock, with an explicit mechanical-vs-judgment split (`ceo_score`/`band`, `mechanical_points_available`, `unscored_criteria` that must render as "not yet assessed"). The current UI computes and displays a live, client-side "4-axis Shape" *while the student is still deciding* — the opposite of the guide's core rule (§7 implementation notes: *"the server is the source of truth... never computes it"*, and the explicit warning against ever showing `unscored_criteria` as a completed number). | No. | No. | This is the most product-risk-bearing mismatch: the UI's entire "live feedback while deciding" mechanic contradicts the guide's design intent (crisis/scoring meant to be diagnosed *after* results, not previewed live). |
| **Quarter report / final report / Q4 endgame screens** | **Do not exist.** No component renders `outcome`, `decision_quality`, `evidence`, `endgame_preview`, term-sheet menu, or `run_summary`. Recent commit `3a1af8a` ("Remove deprecated quarter-related components") deleted prior `layout, approval, briefing, endgame, processing, report, workspace, decision card` files — confirmed via `git log`. | `GET .../quarters/{qid}/report`, `GET .../quarters/{qid}/endgame`, `POST .../quarters/{qid}/endgame` | N/A — nothing to compare. | N/A | N/A | These are the guide's screens 4–6 (§3 implementation notes) and currently have zero frontend presence. Building them is greenfield, not a rewire. |
| **Q3 crisis screen** | **Does not exist.** No `crisis`-shaped form, no 7th allocation line, nothing referencing `crisis_choice`/`price_match_fund`/etc. | `POST .../quarters/{qid}/allocations/crisis` | N/A | N/A | N/A | See dedicated flag section below — moot today since there's no crisis UI at all, but the flag stands for whoever builds it next. |
| **Home / Hero / Why / Dimensions / How / Institutions** (`app/page.tsx` + `components/home/*`) | Fully static marketing copy and hardcoded stat literals. | None — out of lifecycle scope. | N/A | N/A | N/A | No simulation data displayed; out of audit scope per the guide, included only for completeness. |
| **Faq / Pricing / Manifesto** (`components/pages/{Faq,Pricing,Manifesto}.tsx`) | Fully static marketing copy/pricing tables. | None. | N/A | N/A | N/A | Same as above — no simulation data, no action needed. |
| **Nav / Footer** (`components/layout/{Nav,Footer}.tsx`) | Static link list. "Log in"/"Sign up" always shown; no logged-in state, no user menu, no sign-out. | N/A directly, but depends on the auth layer Phase 1 builds. | N/A | **No — no session awareness of any kind.** Nav renders identically whether or not a token would exist. | N/A | Once auth exists, Nav needs a logged-in variant; currently there's no hook point for that at all. |

---

## Error handling

**No error handling exists to compare against the guide's four refusal shapes**, because no
screen makes a request that could produce any of the four (`not_authenticated` / `not_permitted`
/ `illegal_move` / plain-`detail` 404). There is no shared response interceptor, no per-screen
try/catch around a fetch, nothing. This isn't "treats all errors the same" — it's "there is no
error-handling code at all." §7 of the implementation notes explicitly says to build this *before*
any form; today there are zero forms wired to build it against.

## Shared API client / auth layer

**Does not exist in any form** — not a `lib/api.ts`, not a fetch wrapper, not an axios instance,
not a context provider. `package.json` has no HTTP client dependency at all. Phase 1 is building
this from a blank slate, not extending anything.

---

## Model mismatch: the Play/Dashboard screen vs. the real API

This needs to be called out as its own thing, separate from ordinary field mismatches, because the
gap isn't "wrong field names" — it's a different simulation model entirely:

| Real API (guide) | Current `/play` UI (`lib/play/types.ts`, `lib/play/data.ts`) |
|---|---|
| 6 departments, fixed names: `marketing`, `sales`, `rnd`, `operations`, `hr`, `finance_admin` (+ `crisis` in Q3 only) | Departments are scenario-authored data with arbitrary ids/names/owners (`data.ts`'s `startupSurvival.departments` — first one is `finance`, an "owner: Karan Mehta, CFO" narrative character) |
| Each department = a flat list of money-allocation lines, upserted independently, in ₹ lakhs | Each department = nested `sections[].decisions[]`, where a `decision` is one of 4 *kinds*: `choice` (pick one narrative option), `allocate` (split a budget across channels), `priority` (rank N of M items), `conviction` (a 0–100 slider) |
| Quarter score = server-computed 7-trait CEO score, only visible after `lock`, split into 6 MECHANICAL + 15 JUDGMENT criteria | "Score" = a client-computed 4-axis `Shape` (`growth`/`discipline`/`resilience`/`agility`), recalculated live on every keystroke as the student answers, never a real score at all |
| `legal_moves` gates every action | Nothing is gated by any server signal; "sealed"/"ready"/"locked" are all local booleans derived from 100%-local-completion |
| A locked quarter's report is immutable, cached forever | There is no "lock" concept that survives a page refresh — `locked` is `useState(false)`, lost on reload |
| One scenario shipped (`nadi_wear_standard`), fixed at company creation | Data model supports arbitrary named "Scenarios" (`Startup Survival` etc.) as if scenario-authoring were a frontend concern |

**Recommendation implied by the audit (not a decision made here):** the `/play` screen as built is
not "the real workspace with wrong field names" — it's a separate, richer decision-authoring
concept that predates this API. Wiring it isn't a rewire so much as a rebuild: either (a) keep this
UI as a distinct "practice mode" product surface unrelated to the real API, or (b) replace its
department/decision model with the API's 6-line-allocation model and drop the `choice`/`priority`/
`conviction` decision kinds, which have no server-side equivalent. This is a product decision, not
inferable from the guide.

---

## Flag: Q3 crisis-scenario assumption

**Not currently baked into any existing UI, because no Q3 crisis screen exists at all** — it was
removed along with the other quarter screens in commit `3a1af8a`. The guide's "Known gap" (§4:
no endpoint exposes the crisis scenario letter before submission) is therefore **not yet a live
problem in this codebase**, but it is a **live product decision that must be made before anyone
builds this screen**: confirm the generic crisis-response form is the intended v1 (per
implementation-notes §5's explicit instruction — *"send this back... before building the Q3
screen"*), or request the backend add a `crisis_scenario` field. Flagging this now, per the audit
instructions, even though there's no code to point at yet.

---

## Proposed wiring order

Given there is genuinely nothing wired today, the order is close to the guide's own suggested
build order (implementation-notes §9), adjusted for what's salvageable vs. what needs a product
decision first:

1. **Shared API client + auth (`lib/api/*` or similar) + error interceptor** — must go first;
   every other screen depends on it. Nothing today blocks this; it's pure greenfield.
2. **Login / Signup** — wire the existing forms to `POST /auth/login` / `POST /auth/register`,
   store `access_token`, attach as `Authorization: Bearer`. Low risk: the forms already collect
   the right fields (Signup's extra `name`/`role` fields need a product call — drop or send
   somewhere, see table above) and just need `onSubmit` replaced.
3. **Run-state fetch + `legal_moves`-driven navigation shell** — before touching `/play` at all,
   get `POST /companies` → `GET .../run` working and rendering `legal_moves` somewhere (even a
   debug panel). This is the piece every subsequent screen depends on, and it doesn't yet exist in
   any form.
4. **Resolve the Play/Dashboard model-mismatch decision** (see section above) — this blocks steps
   5–6 and needs product/design sign-off before any code changes, since it determines whether
   existing Workspace/Slabs components are adapted or replaced.
5. **Quarter workspace (6 department allocation forms) + lock**, built new per the guide, informed
   by whatever the step-4 decision was.
6. **Quarter report** (build new — currently zero presence).
7. **Q3 crisis form** — only after the product decision flagged above is resolved.
8. **Q4 endgame + final report** (build new — currently zero presence).
9. **Leaderboard** — once its target endpoint/shape is confirmed (currently unclear, see table).
10. **Simulations catalogue** — lowest priority; its very premise (multi-scenario picker) may not
    apply to a single-scenario API, pending product input.

Dependency logic: auth and the shared client must be first (everything needs a token).
`legal_moves`-driven navigation must exist before any screen that gates buttons on run state — that
is every screen except Login/Signup. The Play/Dashboard rebuild decision blocks the highest-value,
highest-risk part of the app, so it should be resolved early even though the code work for it
lands after the client/auth layer.

---

## Screens with unclear target endpoint (needs product input)

- **Simulations catalogue** — no "list of playable scenarios" endpoint exists in the guide; the
  real API assigns one fixed scenario per company at creation.
- **Leaderboard** — `GET /companies/{id}/leaderboard` is named in the guide's lifecycle (§1, step
  19) but its response shape is never shown in a captured payload, and the current UI's "global
  cross-user board with seasons" framing may not match what that endpoint actually returns (a
  single run's per-quarter rollup, per the guide's one-line description).
