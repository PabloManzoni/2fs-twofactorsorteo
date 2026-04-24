# 2FS — Two Factor Sorteo

A playful "two-factor raffle" web app in three steps:

1. **Participants** — add between 2 and 10 names.
2. **Wheel** — a drag-to-spin roulette with ring lights picks one at random.
3. **Magic 8-ball** — shake the ball to get a **yes / no / maybe** verdict.
   - **yes** → a biblical-tone *Edicto del Destino* certificate confirms the winner.
   - **no** → the rejected name is dropped and you spin again.
   - **maybe** → ask again on the same ball.

Editorial 2FS design system (paper cream + ink + vermilion accent, Fraunces / Inter / JetBrains Mono). Spanish by default, English available.

## Stack

- Vite + React 19 + TypeScript
- `zustand` — single store (`step`, `names`, `baseNames`, `winner`, `lastRejected`, `confirmed`)
- `react-i18next` + `i18next-browser-languagedetector` — ES default, EN secondary
- `framer-motion`
- **Web Audio API** — `src/lib/audio.ts` synthesizes clicks, ding, dark rumble, and the ominous reveal chime (no sample files)

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build
npm run preview
npm run lint
```

## Design & code conventions

- Source of truth for visuals: [`./design.md`](./design.md). All tokens mirror into [`src/styles/tokens.css`](./src/styles/tokens.css). **Never hardcode** colors, spacing, radii, or fonts.
- UI copy lives in [`src/i18n/es.json`](./src/i18n/es.json) and [`src/i18n/en.json`](./src/i18n/en.json). Code, identifiers, and comments stay in English.
- See [`CLAUDE.md`](./CLAUDE.md) for the working rules used by coding agents in this repo.

## Project layout

```
src/
  App.tsx                  Masthead + conditional step page + ConfirmedModal
  i18n/                    es.json (default) + en.json + init
  store/raffleStore.ts
  lib/
    audio.ts               Web Audio synth (click / ding / rumble / reveal)
    phrases.ts             8-ball questions + answer pool
  styles/                  tokens.css · global.css · app.css
  components/
    Masthead.tsx
    LanguageSwitcher.tsx
    ConfirmedModal.tsx     Biblical "Edicto del Destino"
    Wheel/Wheel.tsx        SVG wheel + 32 lights + drag physics
    MagicBall/MagicBall.tsx
    ui/                    Button, Eyebrow, Avatar, Stamp, Wordmark, TicketPerforation
  pages/
    NamesPage.tsx          01 · La Urna
    WheelPage.tsx          02 · La Ruleta
    MagicBallPage.tsx      03 · El Segundo Factor
public/
  assets/                  logo-mark.svg, stamp-sorteo.svg
```

## Credits

Visual design handed off from Claude Design. Implementation lives here.
