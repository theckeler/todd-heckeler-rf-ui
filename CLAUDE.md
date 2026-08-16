# CLAUDE.md

Instructions for Claude Code sessions working in this repo. If you're a
future session picking this up cold: read this file, then read
[PROCESS.md](./PROCESS.md) for the full decision history before changing
anything.

## What this is

Todd Heckeler's submission for the RainFocus UI Challenge — the
Attendees/Guide admin screen, built to match a Figma design exactly. The
brief has a stated secondary goal that shapes how this repo is worked on:
document *how* AI was used throughout the build, not just ship a finished
product. PROCESS.md is a primary deliverable here, not incidental
documentation.

## Stack & hard constraints

From the challenge brief — these aren't preferences, don't deviate:

- React + Vite, plain JS (no TypeScript)
- SCSS/SASS, compiled — no Tailwind, no Bootstrap, no CSS framework
- Icons/images exported directly from Figma Dev Mode, not approximated
  or pulled from a third-party icon set
- Responsive down to a true 320px viewport, zero horizontal overflow

## Architecture

- **Design tokens:** `src/styles/tokens.json` → `scripts/generate-tokens.mjs`
  → generates `src/styles/_tokens.generated.scss` (gitignored, regenerated
  automatically by the `predev`/`prebuild` npm hooks). Edit `tokens.json`,
  never the generated file directly.
- **Breakpoints:** `src/styles/_breakpoints.scss` — Tailwind's default
  scale reused as plain Sass variables (not Tailwind itself):
  `$bp-sm:640 $bp-md:768 $bp-lg:1024 $bp-xl:1280 $bp-2xl:1536`.
- Every component `.scss` file needs its own
  `@use '../styles/tokens.generated' as *;` and
  `@use '../styles/breakpoints' as *;` — Sass `@use` is per-module, not
  global.
- **Nav (Sidebar + IconRail) is three responsive tiers, not two:**
  below `$bp-md` = floating toggle, expanding opens a fixed drawer
  (full-screen at xs, `min(360px,70vw)` panel from `$bp-sm`).
  `$bp-md`–`$bp-lg` (tablet) = toggle sits inline in its own column,
  expanding grows the sidebar in place and genuinely pushes
  `main-content` over via layout reflow — not an overlay. `$bp-lg`+
  (desktop) = always open, no toggle.

## Conventions

- **Mobile-first CSS only.** Base rules are the smallest-screen state,
  enhanced upward with `min-width` media queries. Never `max-width`,
  never mix directions in one file.
- **No dead code left in place.** Don't comment out a rule "just in
  case" — delete it, git history is the undo button. Layering an
  override on top of an earlier override instead of replacing it is how
  this file got messy enough to need a dedicated cleanup pass once —
  see PROCESS.md, "CSS cleanup pass."
- **No guessed visual values.** Every color/spacing/type value comes
  from Figma Dev Mode (`get_design_context` / `get_variable_defs`), not
  eyeballed. If Figma itself looks inconsistent (see the Open Sans
  discrepancy in PROCESS.md), match the consistent sibling pattern in
  code and document the discrepancy — don't silently reproduce a
  one-off Figma mistake, and don't silently "fix" it either.
- **Discuss before adding nontrivial JS.** Todd reviews and approves any
  new `useEffect`/state logic before it lands. Small, obviously-safe
  additions (a `matchMedia` viewport reset, for example) can just be
  implemented with a note explaining why; anything bigger gets discussed
  first.
- **Real assets only.** Icons/images come from Figma's own exports, not
  placeholders — if a placeholder is genuinely necessary short-term, say
  so explicitly and swap it before calling anything done.

## Verifying responsive/CSS changes

This codebase has been tripped up before by trusting screenshots alone —
async React render timing and browser-resize quirks below ~400px have
both produced misleading screenshots in this project. The reliable
pattern (see the `verify-responsive-css` skill in `.claude/skills/` for
the full checklist):

1. Before changing layout CSS, capture a baseline —
   `getBoundingClientRect()` + `getComputedStyle()` for every affected
   element, at xs (375px), sm (700px), md/tablet (850px), lg/desktop
   (1400px), and true 320px — for every distinct UI state involved (e.g.
   nav collapsed *and* expanded).
2. Make the change.
3. Re-measure the same elements/states and diff against the baseline
   numerically. A screenshot confirms "looks plausible"; computed styles
   confirm it actually is what you think it is.
4. Check `document.documentElement.scrollWidth > window.innerWidth` at
   true 320px explicitly.
5. Before trusting a from-memory rewrite of a file, `git diff` it against
   the last commit and read every removed line. "This looks like a
   duplicate" is not the same as confirming it — a real regression slipped
   through exactly that gap once (see PROCESS.md).

## Git workflow

- Todd owns all commits and pushes during active build sessions — Claude
  scaffolds and edits, Todd reviews and commits. Don't commit or push
  without being asked.
- Feature branches per phase, created by Todd (`main` → `tablet` →
  `mobile` → `clean-up`, etc.). Work on whatever branch is currently
  checked out; don't create new branches unprompted.
- Public repo (`todd-heckeler-rf-ui`), separate from Todd's private
  job-search repo.

## PROCESS.md

The running, honest decision log — judgment calls, mistakes caught, the
actual division of labor between Todd and Claude. Append to it after any
significant change, written as it happens, not reconstructed afterward.
