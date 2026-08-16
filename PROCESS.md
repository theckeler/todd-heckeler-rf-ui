# Process log

This is a running decision log for the RainFocus UI challenge, kept as the
work happens rather than reconstructed afterward. It's a record of the
judgment calls — what got chosen, what got rejected, and why — not a
transcript.

RainFocus asked to see AI used without AI building the project. The split
here: Todd makes the calls (scope, structure, what "matches the design"
means, what's worth the extra effort); Claude scaffolds, executes, and
proposes options against those calls. Entries below are marked accordingly.

## Scope

- **Decision:** Claude scaffolds only — tooling, structure, token system,
  base shell. Todd builds out the actual implementation from there.
- **Why:** the point of the exercise (per RainFocus's brief and per Todd)
  is showing personal problem-solving, not AI output. A finished-by-AI
  page would undercut the thing being evaluated.

- **Decision:** no CSS transitions, hover/rollover states, or anything
  beyond what's explicitly sent (screens/specs), for this phase.
- **Why:** Todd is doing that layer of polish himself. Scaffolding it
  preemptively would be guessing at decisions that aren't Claude's to make.

## Responsive

- **Decision:** the Figma source is fixed-width/desktop-only, but the
  build will be responsive anyway, done as a distinct second pass after
  the static desktop layout is verified — not baked in from the start.
- **Why:** matches RainFocus's "optional extra functionality" invitation,
  and it's a natural interview talking point (source was fixed, here's how
  breakpoints were chosen and why).
- **Decision:** use Tailwind's default breakpoint scale (640 / 768 / 1024
  / 1280 / 1536) as SCSS variables, without using Tailwind itself.
- **Why:** well-tested reference points beat picking arbitrary numbers,
  and it avoids the "one breakpoint then it just breaks" problem — the
  goal is a layout that scales cleanly across the range, not a single
  mobile/desktop jump.

## Design tokens

- **Decision:** `tokens.json` is the single source of truth (color,
  spacing, type scale, radius — only categories with real values, nothing
  speculative). A small Node script (`scripts/generate-tokens.mjs`)
  generates SCSS variables from it on `predev`/`prebuild`; components only
  ever reference the generated SCSS variables, never raw hex/px.
- **Why:** JSON isn't tied to Sass, so the token set reads as a portable
  design-system artifact on its own, separate from the SCSS implementation.
  It also forces naming/scale discipline instead of magic numbers
  spreading through components. Tradeoff is one extra build step, which is
  cheap for a token set this small (Sass can't import JSON natively).

## Stack

- **Decision:** React + Vite, JavaScript (not TypeScript), plain `react`
  template.
- **Why:** Vite produces a true static `dist/index.html` that works
  opened directly via `file://` — set `base: './'` in `vite.config.js` —
  which is what RainFocus's delivery instructions require ("unzip, load
  the build file, see it without building"). Next.js's static export is
  more work to get behaving the same way for no benefit on a single page.
  Plain JS keeps the live-edit portion of the interview friction-free.

## Hosting

- **Decision:** new standalone public GitHub repo (`todd-heckeler-rf-ui`),
  separate from Todd's private `job-search` repo, deployed to Vercel.
  Todd owns git/push for the build phase; Claude only pushes/deploys once
  everything is verified and Todd explicitly says go.
- **Why:** this is portfolio-facing material, not job-search-repo-private
  material, and RainFocus explicitly asked for a hosted link in addition
  to the zip.
- **Revised:** original plan held the first push until final verify.
  Todd asked for an earlier checkpoint push instead — repo created,
  first commit in, before the finishing/responsive passes — rather than
  batching everything into one push at the end. Repo:
  https://github.com/theckeler/todd-heckeler-rf-ui. Also dropped
  `src/components/icons.jsx` (dead code left over from the Material
  Symbols pass, nothing imported it anymore) and kept `.claude/`
  (launch.json, skills) out of the repo — that's assistant tooling
  config, not part of the deliverable.
- **Shipped:** `clean-up` PR'd and merged into `main`
  ([#1](https://github.com/theckeler/todd-heckeler-rf-ui/pull/1)),
  linked to Vercel and deployed. Live at
  https://todd-heckeler-rf-ui.vercel.app — verified rendering and true
  320px overflow directly against the deployed site, not just the local
  dev server.

## Attendees / Guide screen — first pass

- **What:** built the static desktop layout for the Attendees/Guide screen
  (icon rail, sidebar nav with expanded Attendees sub-nav, event header,
  guide intro, and the Attendee module's three steps — base settings box,
  registration workflow cards, attendee portal card). Component split:
  `IconRail`, `Sidebar`, `MainContent`, with a shared `Card`/`AddCard` for
  the repeating step-2/step-3 card pattern.
- **Decision:** color/spacing/type values in `tokens.json` are estimated
  from the screenshot, not real Dev Mode numbers — flagged with a
  `_comment` in the file itself so it's not mistaken for final. Icons in
  `components/icons.jsx` are placeholder SVGs (simple shapes), not the
  real Figma exports.
- **Why:** matches the "bare minimum, stick to the layout" scope — closer
  fidelity is either something Todd corrects with real Dev Mode values, or
  something to revisit once real icon/asset exports are available, rather
  than guessing harder from a screenshot now.
- **Caught during self-check:** first pass put token variables
  (`$spacing-lg`, `$color-border`, etc.) directly in each component's
  `.scss` file without importing them — Sass's `@use` scoping is per-file,
  not global, so this threw "Undefined variable" errors in the dev server
  the moment each file was written. Fixed by adding
  `@use '../styles/tokens.generated' as *;` to the top of every component
  stylesheet. Caught by checking `preview_logs` before calling it done,
  not by the user hitting the error first.

## Material 3 Design Kit

- **Discovery:** the Figma file has Google's Material 3 Design Kit attached
  as a library (Manage Libraries → Material 3 Design Kit) — the components
  (buttons, FAB menu, icon buttons, cards) are instances of that kit, not
  custom-drawn.
- **Why it matters:** M3 isn't just a visual style, it's a documented
  token system — semantic color roles (primary, on-primary,
  primary-container, surface, on-surface, outline, etc.), a defined type
  scale, and a public icon set (Material Symbols). That's a real reference
  to check estimated values against, instead of only eyeballing the
  screenshot.
- **Decision:** did *not* have Claude swap the placeholder icons for
  Material Symbols approximations. Waiting for Todd to export the real
  icon SVGs straight from the Figma file (`src/assets/icons/` is
  scaffolded and waiting) instead.
- **Why:** RainFocus's brief explicitly asks for icons/images exported
  from the Figma file — real exports are strictly better than any
  approximation, even a well-matched one, so there's no reason to take the
  substitute path when the real assets are one export away.
- **Also happening:** Todd is now tuning `tokens.json` and component SCSS
  (e.g. the purple accent, the nav-dot size in `Sidebar.scss`) by hand,
  directly against the Material 3 kit in Figma — this is the "Todd fills
  in the rest after scaffolding" phase in practice, not Claude-driven.
- **Revised:** asked whether icons could be pulled from Material directly
  rather than waiting on manual Figma exports. Since the Figma kit's
  icons *are* Material Symbols — same source, not a look-alike — pulling
  the real glyphs by name is getting the actual asset, not approximating
  it. Installed `@material-symbols/svg-400` (Apache-2.0) with
  `--no-save`, copied the five needed icons (search, group,
  subdirectory_arrow_right, add_circle, computer) into
  `src/assets/icons/` as real files, wired them into `icons.jsx` as
  `fill="currentColor"` components, then uninstalled the package — it was
  only needed to extract those five files, not as a standing dependency.
  `PersonIcon` now renders the `group` glyph in solid purple rather than
  the pink/purple two-tone illustration from the original screenshot;
  worth a look once Todd has the exact icon name/color from Figma
  Dev Mode.

## Live Figma inspection

- **What changed:** Todd opened the actual Figma file in the Claude
  Browser pane, so instead of estimating values from a static screenshot,
  Claude could select layers directly and read real properties off
  Figma's Design panel.
- **Confirmed this way:** the sidebar nav title is raw (unstyled) type —
  Inter, Semi Bold (600), 14px, 18.2 line-height, 0 letter-spacing. Real
  Inter now loads via Google Fonts in `index.html` and is wired through
  `tokens.json` → `$font-family`, replacing the system-font stack
  placeholder from the first scaffold pass.
- **Where automation hit a real limit:** the main H1 uses a named text
  style ("Ag H1- Page Header") rather than raw properties, and clicking
  into a linked style's definition to see its underlying font didn't
  reliably open a flyout through browser automation (tried the style
  chip, double-click text-edit entry, ref-based clicks — Figma's panel is
  largely custom-rendered, not standard accessible DOM). Same wall hit
  trying to read exact hex values behind color styles like
  `Text/G1 Header` — the swatch click doesn't expose a picker reliably
  either.
- **Call:** rather than keep burning turns on brittle UI automation for a
  one-click lookup, asked Todd directly since he has the file open in
  front of him. Worth being honest about this boundary rather than
  guessing or pretending the automation fully worked — it reliably covers
  raw/unstyled properties and layout metrics, not linked-style internals.
- **Resolved differently than planned:** rather than pinning down the H1
  style's exact font programmatically, Todd loaded Inter as a full
  variable range (100–900, see `index.html`) and tried weights directly
  against the Figma reference by eye, landing on Thin (100). Empirical
  match beat chasing the exact style name — good enough outcome, wrong
  method assumption going in.

## Figma Dev Mode MCP

- **What changed:** Todd connected the official Figma Dev Mode MCP server
  (separate from, and a real tier above, the earlier browser-automation
  attempt). This gives `get_design_context`, `get_variable_defs`,
  `download_assets`, and related tools direct API-level access to the
  file — real code-shaped output, real hex/type/spacing values, real
  exportable assets, no UI to fight with.
- **Context worth keeping on record:** Todd is an experienced front-end
  dev but hasn't done this specific kind of hands-on
  design-token/component-scaffold work in a while, and this was his first
  time using a Figma MCP at all. Worth stating plainly rather than
  glossing over — it's an honest account of where the AI-assisted parts
  of this workflow actually added leverage versus where Todd's own
  judgment was doing the driving.
- **Applied:** pulled `get_design_context` on the exact frame
  (node `310:89`) and corrected nearly everything estimated in the first
  pass — exact hex colors (`#5C00DC` purple, `#222222`/`#393551`/`#767676`
  text tones, `#CBC6DE` borders), real type specs (H1 is Inter **Light
  300** at 32px, not the Thin 100 landed on earlier by eye; nav items are
  SemiBold 14, not Regular; sidebar is 63px + 215px, not 72px + 280px),
  4px card/button radius instead of 8px, and downloaded the real exported
  assets (the multi-layer Person Portal icon, the rf logo mark, the
  rainbow-mountain PNGs, real arrow/add/computer icons) into
  `src/assets/` in place of the Material Symbols approximations.
- **Structural correction:** the real data showed Step 2 is **two rows**
  — three "Attendee Registration" cards in row 1, then the "Add
  Registration Workflow" card plus two blank/borderless placeholder card
  slots in row 2 — not the single row of three the screenshot-based first
  pass assumed. Screenshots read as a snapshot of one state; the file
  itself is the source of truth.
- **Open Sans anomaly — found, not shipped:** one card title ("Title" in
  Step 1, item 3) is set in Open Sans Bold in the Figma file while every
  other card title is Inter Bold. First instinct was to reproduce it
  exactly since "build it as you see it" is the brief. Todd's call:
  don't ship the inconsistency — normalize that title to Inter Bold like
  its siblings, and note the discrepancy here as something to raise with
  the design team, the way you actually would on a real team rather than
  silently propagating what looks like a file mistake into the product.
- **Search hover — inferred, then corrected against the real value:**
  Todd found (by interacting with the file directly) that the sidebar
  search field has a hover state. `search_design_system` didn't surface
  it — Figma exposes it as a local component state, not something
  indexed in the library search — so a reasonable standard guess went in
  first (purple border on hover). Todd then screenshotted the actual
  Figma panel with the state selected: fill `#CCCCCC`, not a border
  change at all. Swapped the guess for the real value
  (`$color-surface-muted-hover`) once it was available. Good example of
  the right sequencing — infer to keep moving, then replace with ground
  truth the moment it's available, rather than leaving the guess in
  place uncorrected.

## Session log

Wall-clock time, but only where Todd stated it himself in the moment —
not derived from git commit timestamps. An earlier version of this table
used commit-to-commit gaps as a stand-in for session length, which is a
bad proxy: the gap between two commits is elapsed clock time, not time
spent working, and doesn't distinguish focused work from a break, a
meal, or the project just sitting untouched. That version also
misattributed the one real figure it had — see the note below the
table. Originally this also tracked a per-session token-usage
breakdown, generated via a one-off analysis tool run at the very first
session's close; that snapshot never got repeated on later sessions, so
it's dropped here too rather than faked.

| Date | Session focus | Wall-clock (self-reported) |
| --- | --- | --- |
| 2026-08-15 | Discussion → scaffold → Attendees/Guide layout (real Figma data via Dev Mode MCP) → first GitHub push | ~2hr elapsed (breakfast in the middle), ~1.25–1.5hr of actual focused work |
| 2026-08-15 | Content-area responsive pass + tablet tightening — interleaved with two of Todd's own hands-on revision passes | Two manual passes, ~30–45 min each; Claude-side session length in between not tracked |
| 2026-08-15 | Mobile-first restructure through three-tier nav (branched to `mobile`) — this is the stretch that later prompted the cleanup pass below | ~2.25hr, including one ~30 min manual pass from Todd away from the desk |
| 2026-08-15 | Dedicated CSS cleanup pass (`clean-up` branch) | Not stated at the time — not tracked here rather than guessed |
| 2026-08-15 | Todd's own pass catching the tablet-sticky bug, plus the fix, PR merge, Vercel deploy, zip, and final docs | Todd's pass: ~30 min. Rest not tracked. |

*Correction, logged rather than silently fixed: the previous version of
this table put "~2.25hr" on the cleanup-pass row and invented "~3.5hr"
for the restructure row above it, both derived from commit-timestamp
gaps. The 2.25hr figure was actually Todd's own description of the
restructure session, not the cleanup pass — moved to the correct row.
The cleanup pass never had a real stated duration, so it's marked
untracked rather than backfilled with another guess.*

## Content-area responsive pass

- **What:** after Todd spent ~30-45 minutes hand-revising the nav
  (sticky positioning already in place, toggle moved into the header,
  icon sizing tweaks), asked Claude to do a review pass plus make the
  content area (Step 1 box, Step 2/3 cards, event header, main-content
  padding) responsive down to 320px — the nav alone doesn't make the
  page usable on mobile if the content underneath doesn't reflow too.
- **Bug found in review:** moving the toggle button into
  `.sidebar__header` and gating the title behind
  `{expanded && <h1>...}` in JSX meant the title never rendered at
  desktop at all — `expanded` defaults to `false` and there's no way to
  toggle it at desktop width since the toggle button itself is
  `display:none` above the breakpoint. Fixed by always rendering the
  `<h1>` and moving the show/hide logic to CSS (matching how
  `.sidebar__content` already works) instead of JSX — consistent with
  the rest of the collapse system, not a one-off.
- **Decision:** `.attribute-box__col` gets a `min-width` guard, but
  scoped to `@media (min-width: $bp-lg)` only — desktop keeps a
  comfortable minimum column width, everything below that breakpoint
  ignores it so columns can shrink and wrap freely instead of forcing
  overflow. Combined with `flex-wrap: wrap` on the container and
  `flex: 1 1 200px` per column.
- **Decision:** `.card` (Step 2/3) changed from `flex: 1` (basis 0,
  shrinks indefinitely) to `flex: 1 1 240px`, and its row containers
  got `flex-wrap: wrap` — cards now drop to new rows as space runs out
  rather than compressing into unreadable slivers. Verified 3-up at
  desktop, 2-up at tablet (~700px), 1-up stacked at 320px.
- **Also:** `.main-content` padding scales down at `$bp-lg` and
  `$bp-md`; `.event-header` wraps (button drops below title/date on
  narrow screens) and the logo shrinks from 95px to 64px below
  `$bp-md`.

## Tablet tightening + mobile nav question

- **What:** after ~45 more minutes of Todd's own revisions (nav toggle
  relocated into the header, `.attribute-box`/`.card-row` switched from
  flex-wrap to CSS Grid `repeat(auto-fill, minmax(...))` — a cleaner
  self-adjusting pattern than the manual breakpoints Claude had used),
  reviewed the changes (nothing broken — `BlankCard` commented out
  consistently in both its export and usage) and tightened tablet-only
  spacing/type: smaller headings, tighter gaps and card padding, all
  scoped to `@media (max-width: $bp-lg) and (min-width: $bp-md)` so
  desktop stays untouched and mobile (still to come) isn't preemptively
  decided.
- **Decided, not yet implemented:** for the mobile nav/logo-column
  question, going with the pure-CSS option — drop the border between the
  collapsed sidebar and the rail and tighten the gap so the two columns
  visually read as one, no component restructuring. The state-lifting
  alternative (toggle button rendered inside `IconRail`, `Sidebar` reads
  a shared boolean) stays on the table only if the CSS trick doesn't
  actually solve it once seen at real mobile widths. To be implemented
  when the mobile pass starts, not now.
- **Fixed:** the `expanded` toggle state persisted across a resize —
  open the drawer on mobile/tablet, widen to desktop, narrow back down,
  and it was still showing expanded instead of collapsed. Added a small
  `useEffect` in `Sidebar.jsx` with a `matchMedia('(min-width: 1024px)')`
  listener that resets `expanded` to `false` the moment the viewport
  crosses back into desktop range — about 10 lines, no new dependencies,
  didn't warrant the "discuss first" gate Todd asked for on anything
  JS-heavy.

## Branching + mobile-first restructure

- **Workflow:** Todd branched `tablet` off `main` and pushed it himself,
  then had Claude branch `mobile` off `tablet` for this pass — separate
  branches per breakpoint phase, reviewable and revertible independently
  rather than one long-running responsive branch.
- **Decision:** the CSS was desktop-first (base rules = desktop values,
  `max-width` media queries override down for smaller screens) — flipped
  to mobile-first (base rules = mobile values, `min-width` queries
  enhance up through `$bp-md` tablet and `$bp-lg` desktop) across
  `Sidebar.scss`, `MainContent.scss`, and `Card.scss`. `IconRail.scss`
  and `main.scss` didn't need it — nothing in them varies by breakpoint.
  Desktop and tablet values were carried over exactly as already
  verified; this was a cascade-direction reorganization, not a redesign.
  Mobile-specific type sizes that didn't exist yet (h1, guide-intro h2,
  module h2) got real values instead of just inheriting whatever the
  desktop/tablet rules produced when squeezed down.
- **Fixed:** the collapsed-nav toggle button was 40×40px with 0.6rem
  padding and — the actual issue — its SVG icon had no explicit
  width/height at all, relying on the browser's default un-sized SVG
  behavior rather than a deliberate size. Todd flagged it as too large
  for a touch target. Shrunk the button to 32×32px and gave the icon an
  explicit 16×16px size.
- **Verified:** desktop confirmed pixel-identical post-refactor via
  computed styles (not just eyeballing a downscaled screenshot, which
  briefly looked wrong but wasn't — `getBoundingClientRect()` on the
  rail and its children matched exactly). Tablet matches prior values.
  Mobile now has deliberate spacing/type instead of leftover cascade
  artifacts. The `expanded`-state reset (previous session) still works
  correctly after the restructure.

## Mobile polish: overflow bug, option-1 merge, real button

- **Real bug caught by doing the math, not just eyeballing:** the
  browser tool couldn't be resized below ~398px in this environment (a
  tooling floor, not a page bug), so mobile testing had been happening
  at ~398px instead of the required 320px minimum. Worked out the actual
  numbers instead of trusting what the tool would show: at true 320px,
  nav columns (126px) + main-content padding leave only ~146-162px for
  the card grids — narrower than the `minmax(200px,…)` /
  `minmax(240px,…)` floors on `.attribute-box` / `.card-row`, which
  would have caused real horizontal overflow at the actual minimum
  supported width even though everything looked fine above 398px.
  Lowered the floors to 140px/160px — doesn't change tablet/desktop
  rendering (the existing max-width caps still govern the upper bound),
  fixes true 320px. Confirmed after: `scrollWidth === innerWidth` at a
  manually-forced true 320px viewport (the tool does allow exact widths
  via direct resize, just not below ~398 via the mobile preset).
- **Option 1 implemented:** icon-rail and the collapsed sidebar now
  share the same 63px width and no border between them below desktop,
  so they read as one rail. Border and independent sizing come back at
  `$bp-lg`.
- **Self-caught mistake:** first pass at moving the `FL` avatar (off the
  bottom pin, per Todd's request, to sit right after the icons) applied
  `justify-content: flex-start` with no breakpoint scoping — changed
  desktop too, not just mobile/tablet. Desktop's avatar-pinned-to-bottom
  behavior was previously confirmed correct and explicitly meant to stay
  untouched. Caught it via a desktop screenshot before reporting back,
  scoped the change to below `$bp-lg`, restored `space-between` at
  desktop via `@media (min-width: $bp-lg)`.
- **Add Registration Workflow is now a real `<button>`:** `Card` takes
  an `asButton` prop that swaps the wrapping `<div>` for a
  `<button type="button">`, with a small native-button style reset
  (`font: inherit`, `cursor: pointer`, background) so it looks identical
  to the div version. Only that one card — the workflow/portal cards
  aren't actionable in this design, so they stay `<div>`.
- **Edit event button:** `width: 100%` at mobile base, `width: auto` at
  `$bp-md`+ — matches how the button already wraps onto its own row via
  `flex-wrap` on `.event-header`.
- **Font-size scale, confirmed end to end:** H1 22/26/32px, guide-intro
  H2 18/20/24px, module H2 16/18/20px across mobile/tablet/desktop. Body
  text, step labels, card type, and nav type stay constant across all
  three (16/14/13/12/14px respectively) — already small enough that
  further shrinking would hurt readability rather than help density.

## Option-1 merge reverted, mobile header experiment

- **Reverted:** the option-1 icon-rail/sidebar merge (matching 63px
  width, shared border removal) broke the expanded state — hardcoding
  `width: 63px` on the base `.sidebar` rule meant `.is-expanded` never
  got its width back, so the open drawer stayed squeezed into 63px with
  its content truncating inside it (`RainFocus Summit` rendering as
  "Ra Su", search box as "Sear"). Todd caught it immediately from his own
  testing screenshot. Reverted both files back to independent bordered
  columns — no merge for now. He's taking the mobile nav redesign himself
  from here.
- **Mobile font sizes, taken down further:** guide-intro paragraph and
  the event-header date/location text were both still using the constant
  16px body token at every breakpoint. Todd's call: too big for mobile.
  Both now 13px at mobile base, stepping up to the 16px token at `$bp-md`
  and above — unchanged from before at tablet/desktop.
- **Mobile header experiment (his idea, untested until now):** on mobile
  only, the event logo/icon goes full-width as a 140px-tall banner with
  the H1 dropping below it full-width, instead of sitting side-by-side
  with the title. Row layout (icon + title side by side) is preserved
  unchanged at `$bp-md` and up. Explicitly exploratory — Todd wants to
  see it before deciding if it stays.
- **Todd's read on the tooling constraint, worth keeping on record:**
  hand-writing every breakpoint in SCSS for this level of responsive
  fine-tuning has been noticeably slower than a utility-first approach
  (Tailwind) would have been — every spacing/type adjustment here is a
  named rule in a media query, where Tailwind would've been an inline
  class swap. RainFocus's brief explicitly disallows Tailwind/Bootstrap,
  so this was never in question, but it's a real, honest tradeoff
  observation about the cost of that constraint, not a complaint — worth
  surfacing if the interview gets into process/tooling choices.

## Tablet regression from the overflow fix

- **What broke:** Todd noticed "tablet experience was lost" after the
  true-320px overflow fix. The fix had lowered `.attribute-box` and
  `.card-row`'s grid `minmax()` floor (200px→140px, 240px→160px)
  uniformly across every breakpoint, not just true mobile. A lower floor
  means more columns fit before the grid wraps — so at tablet widths,
  Step 2's 4 cards started fitting in a single row instead of wrapping
  to two, which is what actually changed the *feel* of tablet even
  though no gap/padding/font value had moved. Didn't catch this in the
  first pass because desktop and the exact tablet screenshot both looked
  fine — the regression was in wrapping *behavior*, not in any value
  visible from a single static screenshot.
- **Fix:** kept the 140px/160px floor as the base (true mobile), restored
  the original 200px/240px floor at `$bp-md`+ so tablet (and desktop)
  wrap exactly as they did before. Confirmed: Step 2 back to 2-up at
  tablet, 4-up at desktop, still zero horizontal overflow at a real
  320px viewport.

## Header banner held to true xs, not the whole mobile range

- **Feedback:** the full-width banner header was switching to the
  side-by-side row layout at `$bp-md` (768px) — Todd's call was that's
  too early; it should hold through true `xs` (Tailwind's term for
  anything below `sm`/640px) and only switch to the row layout at `sm`
  and up, not wait for `md`.
- **Fix:** moved the whole header block's breakpoint — flex-direction,
  logo size, h1 size, date/location text size — from `$bp-md` to
  `$bp-sm` together, so the transition happens as one coordinated jump
  at 640px instead of spreading across two breakpoints (layout flips at
  one width, type sizes at another). Confirmed the boundary is exact:
  639px still shows the banner, 640px switches to the row. Didn't touch
  the Edit button's width switch (still at `$bp-md`) or anything below
  `$bp-sm` — Todd didn't flag those, and he's taking the menu itself from
  here.

## Grid column mismatch + banner logo cropping

- **What Todd caught:** his own edits (single-column grid below `$bp-sm`,
  a 140px floor at `$bp-sm`, 200px/240px at `$bp-md`) produced an
  inconsistency he spotted by comparing three widths directly: 772px
  looked right (2-up), 667px regressed to 3-up, 489px looked right
  (1-up). The 140px sm-tier floor was simply smaller than the 200px/240px
  floor that actually produces the 2-up look at tablet, so a width in
  between let a 3rd column sneak in.
- **Fix:** removed the separate 140px/160px sm-tier floor entirely.
  Column count now jumps straight from a literal single `1fr` (below
  `$bp-sm`, safe at any width with no minmax to overflow) to the real
  200px/240px tablet floor right at `$bp-sm` — one consistent transition
  point, matching where the header's own row-layout switch already
  happens. Confirmed 667px and 772px now render identically (2-up), 489px
  still 1-up, true 320px still zero overflow.
- **Also caught mid-fix:** the mobile banner logo was cropping the image
  — the `scale(1.4)` zoom on the `<img>` was tuned for the small square
  icon box (72–95px), not a 100%-wide, 140px-tall banner. Applied to the
  wide banner, the same zoom cropped far more of the circular badge than
  intended. Scoped the zoom to `$bp-sm`+ (where the logo is back to being
  a square icon) so the true-mobile banner shows the full image via plain
  `object-fit: cover`, no extra zoom.

## Drawer overlay + desktop regression from Todd's own menu rework

- **Todd's manual session:** ~30 minutes, done away from the desk
  (his words: "front of the tv"). He converted the toggle button to
  `position: fixed` (floating, independent of the sidebar's own box) —
  a real design shift from the push-open column approach, and one he
  said he's happy with.
- **What broke:** the floating toggle needed top clearance so it
  wouldn't sit on top of the icon-rail's logo, so `.icon-rail__top` got
  `padding-top: 40px`. That rule had no breakpoint scoping, so it also
  pushed the logo down at desktop — where the toggle is `display: none`
  and there's nothing to clear. Result: the rail's logo sat visibly lower
  than the sidebar title next to it. Scoped the padding to below `$bp-lg`
  only, `padding-top: 0` at desktop — confirmed pixel-aligned again.
- **New behavior, built on top of Todd's floating-toggle direction:** the
  sidebar's expanded state is now a real fixed-position drawer instead of
  pushing content over, matching Todd's request: full-screen
  (`width: 100vw`) below `$bp-sm`, a responsive `min(360px, 70vw)` panel
  from `$bp-sm` up, with a click-to-close backdrop (`rgba(0,0,0,0.3)`).
  Desktop explicitly neutralizes all of it (`position: sticky`, no
  backdrop, no shadow) regardless of any leftover `expanded` state, so
  the fixed/overlay behavior can never leak upward.
- **Verified:** desktop realigned and otherwise pixel-identical; tablet
  (850px) collapsed state and 2-up card grid untouched; xs (375px) opens
  full-screen with working backdrop close; sm (700px) opens the ~360px
  responsive drawer with a visible dimmed backdrop over the page; true
  320px still zero horizontal overflow.

## Three-tier nav: drawer on true mobile, inline on tablet

- **What Todd wanted back:** the drawer overlay built for mobile had
  applied everywhere below desktop (`$bp-lg`), which meant tablet lost
  its own earlier-approved look — hamburger inline in its own second
  column, expand pushes content over in place. Todd wanted that restored
  specifically for tablet, without losing the new drawer for true mobile.
- **Fix:** added a `@media (min-width: $bp-md)` tier in `Sidebar.scss`
  that reverts the toggle to `position: static` and the expanded state
  to `position: sticky` (no backdrop, no shadow, no fixed width) —
  sitting between the true-mobile drawer (below `$bp-md`) and the
  existing desktop tier (`$bp-lg`+). Same technique as the earlier
  desktop-alignment fix: moved `IconRail__top`'s floating-toggle
  clearance (`padding-top: 40px`) from resetting at `$bp-lg` to
  resetting at `$bp-md`, since the toggle only floats below `$bp-md` now.
- **Result — three distinct tiers, not two:** below `$bp-md` (xs/sm) =
  floating toggle + fixed drawer (full-screen at xs, responsive `sm`
  width from `$bp-sm`). `$bp-md`–`$bp-lg` (tablet) = inline toggle,
  in-place push-open, no overlay. `$bp-lg`+ (desktop) = always open, no
  toggle. Verified all three explicitly: tablet (850px) inline hamburger
  + push-open confirmed via `getBoundingClientRect`; xs (375px) and sm
  (700px) both still open as fixed drawers (`position: fixed`, widths
  100vw and 360px respectively); desktop pixel-unchanged; true 320px
  still zero horizontal overflow.

## Working cadence

- **Decision:** scaffold → check → verify, in phases, not one big build.
  Phase 1: static desktop layout matching Figma, bare minimum. Phase 2:
  responsive pass. Phase 3: Todd's finishing touches, with Claude looped
  in for a collaborative pass. Phase 4: final verify. Phase 5: push/deploy.
- **Why:** matches how Todd actually wants to work through this, and it's
  the thing being demonstrated — not just what got built, but the shape
  of the collaboration that built it.

## CSS cleanup pass (`clean-up` branch, off `mobile`)

- **Why this happened:** the prior responsive session ran ~2.25 hours and
  accumulated the normal residue of iterating live against a running
  preview — commented-out attempts left in place, one-off overrides
  layered on top of earlier overrides instead of replacing them, a couple
  of near-duplicate rules doing the same job two different ways. Todd
  called it out directly ("kinda made it a mess... spinning a bit out of
  control") and asked for a dedicated cleanup pass on a fresh branch
  before any more feature work: find dead/near-duplicate selectors, get
  the CSS clean, keep every breakpoint's rendered output identical.
- **Method:** before touching anything, captured a baseline —
  `getBoundingClientRect` + computed styles for the sidebar, icon-rail,
  and main-content, at xs (375px), sm (700px), md/tablet (850px), lg/
  desktop (1400px), plus a true-320px overflow check — for both the
  collapsed and expanded nav states. That baseline (not memory, not
  screenshots alone) is what the cleanup was verified against afterward.
- **`Sidebar.scss` (309 → 251 lines):** removed fully dead
  commented-out declarations (an old `position: sticky`, a stray
  `margin: 0 auto`, an empty `&__content {}` block that only ever held a
  comment), a no-op duplicate (`.sidebar__container` set to the same
  width twice — once at base, once at `$bp-md`, with no actual change),
  and three `.sidebar__details` per-breakpoint blocks that had decayed
  into either no-ops or pure comments.
- **Real bug found and fixed, not just tidied:** the tablet (`$bp-md`–
  `$bp-lg`) expanded state had drifted into `position: absolute` with a
  `z-index: 0` backdrop and a leftover `box-shadow` — none of which
  matched the documented intent ("push content over in place, no
  overlay, no shadow") from the session where Todd asked for that
  behavior back. The backdrop's `z-index: 0` didn't actually hide it —
  a `position: fixed` element still paints above static in-flow content
  regardless of a low z-index in an otherwise unstacked context — so
  tablet's expanded panel was visibly dimming the page behind it, which
  a side-by-side screenshot confirmed. Rewrote that tier as a genuine
  in-flow `position: sticky` push-open: `.sidebar__container` goes
  `width: auto` at `$bp-md`+ so the sidebar's own width change (not a
  hardcoded number — it falls out of its padding + toggle size, verified
  at exactly 64px collapsed) is what pushes `main-content` over. Verified
  by checking `main-content`'s own rect before/after the toggle click:
  width went from 722px to 427px and its x-offset shifted from 128 to
  423 — actual layout reflow, not a panel floating on top. No backdrop,
  no shadow, no absolute positioning left in that tier. This is a
  deliberate behavior change from what shipped before this branch, not
  a "look the same" preservation — flagged to Todd rather than silently
  folded in, since he'd only reviewed tablet's collapsed state closely,
  not the expanded interaction.
- **`IconRail.scss` (98 → 82 lines):** removed a fully dead, fully
  commented-out `&__top` block (13 lines) left over from a layout
  approach the markup no longer uses at all, a `position: relative`
  that was immediately overridden by `position: fixed` two lines later
  in the same rule (dead the moment it was written), and an unused
  `transition: height 0.2s ease` — nothing in the current markup or CSS
  ever changes the rail's height, so it had no effect either way.
- **Self-caught mistake, worth logging honestly:** on the first pass,
  two declarations got removed by mistake because they looked like
  duplicates of already-covered rules: `.sidebar__content { padding: 0 }`
  and `.sidebar__details { margin-top: $spacing-sm }`, both desktop-only.
  They weren't duplicates — they were real, desktop-specific values that
  happened to be declared through a differently-shaped selector than the
  rest of the file. The post-cleanup verification pass caught this: the
  desktop sidebar measured 32px wider than baseline (216px vs. 184px).
  Diffed the working tree against the last commit line-by-line rather
  than trusting the rewrite from memory, found exactly what was missing,
  restored both, re-verified — desktop matched baseline exactly after.
  This is the reason the verification step exists as a separate,
  explicit pass rather than "looks right, ship it."
- **`MainContent.scss` and `Card.scss`:** read closely, left untouched —
  already mobile-first with no dead code, no duplicate selectors, and
  comments only where the reasoning genuinely isn't obvious from the
  code. `Card.scss`'s `&--blank` modifier is unused by any rendered
  element right now, but it's the CSS counterpart to the `BlankCard`
  component Todd explicitly asked to keep commented rather than delete
  a couple of sessions back — left alone rather than reinterpreted as
  cleanup scope.
- **Verified:** all four breakpoints (xs/sm/md/lg) plus true 320px,
  collapsed and expanded nav states, computed-style-checked against the
  pre-cleanup baseline (not just screenshots) — everything matches
  exactly except the deliberate tablet fix above. Production build
  (`npm run build`) clean, no console errors in the running preview.

## Tablet expanded menu not sticking on scroll

- **Todd's own pass:** ~30 minutes tightening things up after the
  cleanup, including catching that `IconRail` was `position: relative`
  at tablet+ instead of `sticky` — the rail is a fixed `100dvh` tall
  element in normal flow, so without `sticky` it just scrolls away with
  the page instead of staying pinned. Fixed directly.
- **What was still broken:** the tablet *expanded* nav panel (`.sidebar`
  with `.is-expanded`, `$bp-md`+) still scrolled away, even though it's
  declared `position: sticky`. `getBoundingClientRect` after a
  `window.scrollTo` showed `top` moving in lockstep with scroll instead
  of staying pinned at 0 — sticky in name, not in behavior.
- **Cause:** the tablet tier for `.is-expanded` reset positioning with
  `inset: auto;` to cancel out the mobile drawer's `inset: 0 auto 0 0`.
  `inset` is a shorthand for all four sides at once, so it also
  overwrote `top`, and sticky positioning has nothing to pin to without
  an explicit `top`. Higher-specificity class (`.sidebar.is-expanded` vs
  plain `.sidebar`) meant this silently beat the base rule's `top: 0`.
  A one-property shorthand mistake that happened to be invisible in a
  static screenshot — this is why the verification skill checks
  scroll-position behavior with real numbers, not just layout at rest.
- **Fix:** replaced `inset: auto` with explicit `top: 0` (plus
  `right/bottom/left: auto` for the sides that do need resetting from
  the drawer tier) so sticky has the threshold it needs. Verified via
  `getBoundingClientRect` before/after a 250px scroll at tablet width —
  `top` now holds at 0 in both collapsed and expanded states. Re-checked
  xs drawer, sm drawer, and desktop for regressions — all unchanged;
  true 320px still zero overflow; production build clean.
