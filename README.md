# RainFocus Summit UI Challenge

Todd Heckeler's submission for the RainFocus UI Challenge — the
Attendees/Guide admin screen, matching the provided Figma design and
responsive from a true 320px viewport through desktop.

See [PROCESS.md](./PROCESS.md) for the decision log — how this was built,
what was AI-assisted vs. hand-done, and why. See [CLAUDE.md](./CLAUDE.md)
for the working instructions this repo is built under.

## Run it

```bash
npm install
npm run dev
```

## Build it

```bash
npm run build
```

Outputs a static site to `dist/` — open `dist/index.html` directly in a
browser, no server required.

## Stack

- React + Vite
- SCSS (SASS), no CSS framework
- Design tokens: `src/styles/tokens.json` → generated SCSS variables via
  `npm run tokens` (runs automatically before dev/build)
