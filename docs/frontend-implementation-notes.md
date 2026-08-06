# Frontend Implementation Notes — Myelin

Derived from `docs/frontend-integration-guide.md`. This is not a replacement for that guide —
it's the checklist to hand Claude Code alongside it: what to build, what to name things, what
never to hardcode, and one open backend gap to flag before building the Q3 screen.

**Give Claude Code both files.** The integration guide has the payloads and the why; this file
has the build checklist and naming.

---

## 1. One rule above all others

**`legal_moves` is the only source of truth for what the UI can do.** Never hardcode "Q1 shows
these buttons, Q2 shows those." Every screen renders its available actions by checking membership
in the `legal_moves` array from the last `GET /companies/{id}/run` call. This one rule, followed
correctly, makes almost every other UI bug impossible — a stale button, an action available at
the wrong time, a race after a write.

**Re-fetch `GET .../run` after every write.** It's a cheap read, always correct, and
`legal_moves`/`endgame_preview`/`score_trajectory` can change even without a write of your own
(endgame_preview re-derives on every read). Never assume the client's cached copy is still valid
after a POST.

---

## 2. State you hold vs. state you always re-fetch

| Value | Store client-side? | Notes |
|---|---|---|
| Bearer token (`access_token`) | Yes | From login; attach to every request |
| `owner_id`, `scenario`, `seed_name`, `profile_name` | Yes | Fixed at company creation, never changes |
| A **locked** quarter's report | Yes, indefinitely | Byte-identical on every re-read — safe to cache forever once you have it |
| `legal_moves` | **No** | Always re-fetch after a write |
| `endgame_preview` | **No** | Can change between reads with no write of your own — re-derives tier live |
| In-progress allocation totals (open quarter) | **No, while open** | Every submit upserts; re-fetch if showing a running total |

Default rule when unsure: re-fetch `GET .../run`.

---

## 3. Screens to build, mapped to the flow

1. **Auth** — register/login, store `access_token`, attach as `Authorization: Bearer <token>`.
2. **Start run / dashboard** — `POST /companies`, then `GET .../run` to render the fresh state.
3. **Quarter workspace** (the core screen, reused every quarter) — six department allocation forms + submit, driven entirely by `legal_moves`. Q3 gets a 7th form (crisis response, see §5). Lock button appears only when `lock_quarter ∈ legal_moves`.
4. **Quarter report** — two visually **separate** sections (§6). Never let them touch or imply causation.
5. **Q4 endgame** — preview (tier + term-sheet menu) → decision form (path + term sheet name + reasoning) → same lock flow as any other quarter.
6. **Final report** — `run_summary` (score trajectory + final valuation + terminal status) once the run is COMPLETED/FAILED.
7. **Error handling** — one shared handler for all four refusal shapes (§7). Build this before you build any form; every submit button needs it.

---

## 4. Naming — use these exact strings

Don't invent your own names for these; they're the wire vocabulary and matching them exactly
keeps your code greppable against the API and the guide.

**`run_status`**: `active` · `distressed` · `failed` · `completed`

**Quarter `current_quarter_status`**: `in_progress` · `closed`

**`legal_moves` / `Move` values seen in the guide**: `open_next_quarter` · `submit_allocation` ·
`submit_crisis_allocation` · `lock_quarter` · `read_quarter_report` · `read_endgame_preview` ·
`submit_endgame_decision`

**Q4 `tier`**: `thriving` · `stable` · `distressed`

**Q4 `path`**: `A` · `B` · `C`

**Crisis `crisis_choice`**: `A` · `B` · `C` · `D` · `null`

**Refusal `error` values**: `not_authenticated` (401) · `not_permitted` (403) · `illegal_move`
(409) — plus plain `detail` for 404 and non-gatekeeper 409s (no `error` key on those two).

**Score `result` values** (`scored_criteria[].result`): `clearly_met` · `partially_met` ·
`not_met`

Department allocation endpoints (6, any order, any count — each is an upsert):
`marketing` · `sales` · `rnd` · `operations` · `hr` · `finance_admin` — plus `crisis`, legal only
in the crisis quarter.

---

## 5. The Q3 crisis screen — build the generic version, and flag the gap first

**There is currently no endpoint that tells the frontend which of the four crisis scenarios
(A/B/C/D) is live before the student submits.** The scenario letter only appears afterward, buried
in a report modifier's `detail` string (e.g. `"crisis_scenario=B, ..."`) — not a real field.

This means, as shipped, you can only build a **generic crisis-response form**: the five spend
fields (`crisis_choice`, `price_match_fund`, `comparison_ads`, `retention_offers`,
`emergency_supply_fund`, `crisis_choice_d_spend`), all optional, all in ₹ lakhs, with no
scenario-specific narrative or guided choice menu. The student has to diagnose their situation
from context outside the app (this actually matches the intended design in `docs/11` — students
are meant to diagnose from their own results, not be told the answer) — but if your product wants
to *show* the crisis narrative before submission, that needs a new backend field.

**Action: send this back to Claude Code before building the Q3 screen** — either confirm the
generic form is the intended v1 experience, or request a dedicated `crisis_scenario` field
surfaced on the run-state or quarter-detail payload *before* lock. Don't guess a workaround
(e.g. don't try to infer the scenario from allocation effects client-side) — ask for the field.

Two things the crisis form must still get right regardless of that gap:
- **`crisis_choice` is scenario-relative** — Scenario A's Choice A ≠ Scenario B's Choice A. Don't
  build any client-side logic that assumes what a given letter "means."
- **Submitting nothing (`{}`) is legal, not blocked** — it's simply penalised (`crisis_ignored`,
  −4). Don't force the student to fill the crisis form to lock the quarter.

---

## 6. Rendering the report — the one rule that matters most

`outcome` (what happened) and `decision_quality` (how good the decisions were) are **structurally
independent.** A student can lose money and score well, or the reverse — this is the entire point
of the product (see the guide's Scenario D reference). Enforce this in the UI:

- Two visually separate sections/cards. Not tabs that imply sequence, not one panel with the
  score as a "grade" on the financials.
- **Never** show `unscored_criteria` as a zero or omit it. Render it as "not yet assessed" —
  15 of 21 criteria are currently JUDGMENT (no mechanical answer exists yet). A zero would read as
  a failure the student didn't earn.
- `ceo_score`/`band` are labelled as the **scoreable portion**, not the complete rubric. Show
  `mechanical_points_available` / `unscored_points` alongside the score so this is legible, not
  buried.
- Every metric in `outcome` is `{value, delta}` — `delta` is `null` on Q1 (no prior quarter,
  render nothing/dash), never `0` (which would falsely say "no change").
- `binding_constraints` can be **empty** — that's a genuinely good quarter. Don't render an empty
  state as an error or a missing section.
- `evidence` is a third, separate thing — an observation log, never a grade, never merged into
  `decision_quality`. Render as plain statements ("funded 7 of 8 channels"), not scored.

---

## 7. Error handling — build this once, use everywhere

One shared response interceptor / hook, checked in this order:

```
status 401                    → not_authenticated  → send to login
status 403                    → not_permitted       → "not your run", do not retry
status 409, body has "error"  → illegal_move        → re-fetch GET .../run, re-render from legal_moves
status 409, no "error" key    → plain detail         → same as above: re-fetch and re-render
status 404                    → plain detail         → "not found" / navigate back
```

`illegal_move`'s own `allowed_moves` field is identical to what a fresh `GET .../run` would
return in `legal_moves` at that instant — you can re-render immediately from the error body alone,
then confirm with a real fetch on next render rather than blocking on a second round-trip first.

---

## 8. Explicitly out of scope for the main flow

Don't build UI against these unless a specific reason exists:

- `GET /health` — infra only.
- The `finance`/`marketing`/`product`/`sales`/`cx` `.../decisions` and `.../state` routes — a
  separate legacy system. Nothing they write ever appears in a quarter report. Building against
  them wastes effort and produces dead UI.
- Operations and HR have no legacy routes at all — don't look for them.

---

## 9. Before you start

1. Both docs go in the frontend repo's `docs/` folder: this file + the full integration guide.
2. Point Claude Code at both and have it build the shared API client / types first (Part A below),
   before any screen — every screen depends on it.
3. Confirm the Q3 crisis-scenario gap (§5) with backend before building that specific screen; every
   other screen can be built without waiting on it.

### Suggested build order
1. Auth + API client + shared error handler (§7)
2. Run-state fetch + `legal_moves`-driven navigation shell
3. Quarter workspace: 6 department forms + lock
4. Quarter report (two-section rendering, §6)
5. Q3 crisis form (generic version, pending §5's backend answer)
6. Q4 endgame preview + decision + final report