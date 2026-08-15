# RainFocus Summit UI Challenge

Todd Heckeler's submission for the RainFocus UI Challenge.

See [PROCESS.md](./PROCESS.md) for the decision log — how this was built,
what was AI-assisted vs. hand-done, and why.

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
