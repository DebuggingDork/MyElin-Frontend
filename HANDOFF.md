# Handoff — frontend

Written 22 Aug 2026. Everything below is either in `main` or is work that was deliberately
left; nothing here is a guess about what was done.

## The design system, in one paragraph

Two surfaces, and they are not the same language. **The site** (`app/(site)/…`, wrapped in
`.ledger`) is a ruled instrument: square blocks divided by hairlines, a serif for anything
that is a heading, monospace for anything that is a number, teal for the live system and
vermilion for what a choice costs you. **The simulation** (`.simulation`) is a document —
cream in the light theme, deep green in the dark one — with its own token block. A third,
narrower surface, `.statement`, is paper in *both* themes and is used by the balance sheet
only. New work should join one of the three rather than invent a fourth.

## What changed in this session

**Structure.** Nine public routes moved into `app/(site)`, which carries the nav, the footer
and the palette once — the homepage used to wrap itself in `.ledger` and nothing else did, so
a nav click swapped the surface underneath a bar that had not moved (`ae5359e`). That group is
split again into `(marketing)` (footer) and `(account)` (no footer) — three columns of
marketing links under a settings form is a page ending in furniture (`88c6340`).

**Rebuilt on the ledger system**: manifesto, FAQ, simulations (`ab55784`), profile (`d27bf35`),
my-simulations (`e8f2721`), the play entry gate and run picker (`cef40c8`, `fb69940`), plus
mastheads on leaderboard/pricing/account so no page opens with a blank band (`2e5999c`).

**Two cascade bugs, both cross-cutting** — these are the ones to remember:

- `87e11b5` — `* { border-color: … }` and `:where(.simulation) *` sat **outside the cascade
  layers**, and an unlayered declaration outranks every layered one regardless of specificity.
  Tailwind's utilities are layered. So *every* explicit border colour in the codebase resolved
  to the default rule: crisis evidence tones, inbox severity, selected cards, `border-teal`.
  Both now live in `@layer base`.
- `e61d823` — same failure, `.tick-label`'s colour. Every toned label (LIVE, DISTRESSED,
  "Saved") rendered faint. Now in `@layer components`.

If you add a catch-all element rule, put it in a layer or it will silently beat every utility.

**Other fixes worth knowing**: the Q4 investment now shows the moment it is signed
(`0500aa6`); the account chip reads the person's name rather than their email, because the
profile was only fetched when the menu was *opened* (`959f764`); the signup name is written at
registration rather than on an abandonable second screen (`a4da73e`); degree/year are a drawn
listbox, since a native `<select>`'s open list is the platform's and Windows Chrome paints it
white (`0bbc3ad`); a recovery link that Supabase drops anywhere in the app forwards itself to
`/reset-password` with the token intact (`dd023b7`); the favicon is the Myelin mark
(`4d179e6`); a chime marks a closed quarter, with a switch in the header (`65b8ec0`).

**The balance sheet** (`3fbf301`, `c253082`, `ef4f2c8`) — Schedule III order, printed on paper
in both themes, every line present whether or not it carries a figure. It appears on the
close-the-quarter screen and on its own rail tab. `balanceCommitted()` applies the plan to the
opening sheet: capitalised spend becomes an asset, credit drawn becomes cash and a borrowing,
operating spend leaves the bank and the reserves together, so the two totals agree to the
rupee by construction. It is deliberately **not** a forecast of the close — revenue, profit and
closing cash stay sealed until the quarter locks, which is the product.

## Known, and deliberately left

1. **Above-the-fold framer entrances.** `PricingComingSoon`, `Leaderboard`, `MyRuns`,
   `AccountSecurity` and `AuthSlide` still animate hero content with `initial={{opacity:0}}` +
   `animate`. Those elements server-render at opacity 0 and stay blank until hydration. The
   homepage already solved this with the CSS `rise` class (see the comment on `.rise` in
   `globals.css`); these five were never converted. This is the most likely cause of a page
   that "feels stuck" on a slow connection, and it is the next thing to do.
2. **The run shell has not been walked signed-in.** The layout is structurally right — fixed
   frame, rail, `overflow-y-auto` document column, sticky header — but rail-open versus
   -closed at 1024/1280/1440, and the balance sheet inside that column, have not been seen
   with a live session.
3. **The light/dark audit is partial.** Every page rebuilt this session was checked in both
   themes. Leaderboard, my-runs, profile, account/security and the home sections below the
   fold have not been.

## Working notes

- **Verify in a browser, not by reasoning.** Both cascade bugs above looked correct in the
  source and were only caught by reading computed styles on a rendered page. Screens that need
  a session can be rendered from sample data through a temporary route — delete it before
  committing.
- **Screenshot twice.** The first capture after a navigation routinely catches a framer
  entrance mid-flight and reads as a broken layout.
- Next.js here is not the version in most training data; `AGENTS.md` points at
  `node_modules/next/dist/docs/`, which is worth reading before touching routing.
