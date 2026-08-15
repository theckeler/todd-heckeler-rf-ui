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
  https://github.com/theckeler/todd-heckeler-rf-ui. Vercel deploy still
  pending later phases. Also dropped `src/components/icons.jsx` (dead
  code left over from the Material Symbols pass, nothing imported it
  anymore) and kept `.claude/launch.json` out of the repo — that's
  assistant tooling config, not part of the deliverable.

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

Rough wall-clock time and, where checked, token usage — kept at session
boundaries rather than per-message. Todd asked for this as a quantitative
complement to the decision log above.

| Date | Session focus | Wall-clock | Effective token spend |
| --- | --- | --- | --- |
| 2026-08-15 | Discussion → scaffold → Attendees/Guide layout (real Figma data via Dev Mode MCP) → first GitHub push | ~2hr elapsed (breakfast in the middle), ~1.25–1.5hr of actual focused work | Snapshotted via the usage-breakdown tool at session close: ~49% thinking/writing responses, ~29% file edits & terminal, ~12% browser preview & Figma inspection, ~7% recurring system-prompt/tool-list overhead, ~2% task tracking & questions, ~1% Figma Dev Mode MCP calls themselves. |

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

## Working cadence

- **Decision:** scaffold → check → verify, in phases, not one big build.
  Phase 1: static desktop layout matching Figma, bare minimum. Phase 2:
  responsive pass. Phase 3: Todd's finishing touches, with Claude looped
  in for a collaborative pass. Phase 4: final verify. Phase 5: push/deploy.
- **Why:** matches how Todd actually wants to work through this, and it's
  the thing being demonstrated — not just what got built, but the shape
  of the collaboration that built it.
